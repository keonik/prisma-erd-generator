import { vi } from "vitest";
import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const originalExecSync = child_process.execSync;
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".");
const tmpRoot = path.join(rootDir, "tmp", "vitest");

if (process.env.VITEST_DEBUG_SETUP) {
	// eslint-disable-next-line no-console
	console.log("[vitest.setup] loaded");
}

const defaultUrls = {
	postgresql: "postgresql://user:password@localhost:5432/exampledb",
	mysql: "mysql://user:password@localhost:3306/exampledb",
	mongodb: "mongodb://localhost:27017/exampledb",
	sqlite: "file:./dev.db",
	sqlserver:
		"sqlserver://localhost:1433;database=exampledb;user=sa;password=Your_password123",
};

function getProvider(schema) {
	const match = schema.match(
		/datasource\s+\w+\s+{[\s\S]*?provider\s*=\s*"([^"]+)"/,
	);
	return match?.[1] || "sqlite";
}

function stripDatasourceUrl(schema) {
	const lines = schema.split("\n");
	let inDatasource = false;
	return lines
		.filter((line) => {
			if (line.includes("datasource ")) inDatasource = true;
			if (inDatasource && line.includes("}")) inDatasource = false;
			if (inDatasource && line.trim().startsWith("url")) return false;
			return true;
		})
		.join("\n");
}

function updateOutputToAbsolute(schema, schemaDir) {
	return schema.replace(/output\s*=\s*"([^"]+)"/, (_, relative) => {
		return `output = "${path.resolve(schemaDir, relative).replace(/\\/g, "/")}"`;
	});
}

function prepareSchemaForVersion(schemaPath, version) {
	const schemaDir = path.dirname(schemaPath);
	const rawSchema = fs.readFileSync(schemaPath, "utf8");
	const provider = getProvider(rawSchema);
	const schemaKey = path
		.relative(rootDir, schemaPath)
		.replace(/[\\/]/g, "_")
		.replace(/\.prisma$/, "") || path.basename(schemaPath, ".prisma");

	const tmpDir = path.join(
		tmpRoot,
		`v${version.replace(/\./g, "_")}`,
		schemaKey,
	);
	fs.rmSync(tmpDir, { recursive: true, force: true });
	fs.mkdirSync(tmpDir, { recursive: true });

	const major = Number(String(version).split(".")[0]);
	let schema = updateOutputToAbsolute(rawSchema, schemaDir);
	if (Number.isFinite(major) && major >= 7) {
		schema = stripDatasourceUrl(schema);
		const configPath = path.join(tmpDir, "prisma.config.ts");
		const url = defaultUrls[provider] || defaultUrls.sqlite;
		fs.writeFileSync(
			configPath,
			`import { defineConfig } from 'prisma/config'

export default defineConfig({
    schema: './schema.prisma',
    datasource: {
        url: '${url}',
    },
})
`,
		);
	}

	const tmpSchemaPath = path.join(tmpDir, "schema.prisma");
	fs.writeFileSync(tmpSchemaPath, schema);
	return { tmpSchemaPath, provider };
}

function runPrismaGenerate(command, options) {
	const schemaMatch = command.match(/--schema\s+([^\s]+)/);
	const schemaPath = schemaMatch
		? path.resolve(rootDir, schemaMatch[1])
		: path.resolve(rootDir, "prisma/schema.prisma");

	const versions = process.env.PRISMA_TEST_VERSIONS?.split(",")
		.map((v) => v.trim())
		.filter(Boolean) || ["5.22.0", "6.15.0", "7.0.0"];

	const disableErdMatch = command.match(/DISABLE_ERD=([^\s]+)/);

	for (const version of versions) {
		const { tmpSchemaPath, provider } = prepareSchemaForVersion(
			schemaPath,
			version,
		);
		const url = defaultUrls[provider] || defaultUrls.sqlite;
		const baseEnv = {
			...process.env,
			DATABASE_URL: process.env.DATABASE_URL || url,
			PRISMA_HIDE_UPDATE_MESSAGE: "1",
			PRISMA_GENERATE_SKIP_AUTOINSTALL: "1",
		};
		if (disableErdMatch?.[1]) {
			baseEnv.DISABLE_ERD = disableErdMatch[1];
		}
		const runCmd = `pnpm dlx prisma@${version} generate --schema "${tmpSchemaPath}"`;
		originalExecSync(runCmd, {
			stdio: "inherit",
			cwd: rootDir,
			env: baseEnv,
			...options,
		});
	}

	return Buffer.from("");
}

vi.mock("node:child_process", async () => {
	const actual = await vi.importActual("node:child_process");

	return {
		...actual,
		execSync: (cmd, options) => {
			const command = cmd.toString();
			if (command.includes("prisma generate")) {
				if (process.env.VITEST_DEBUG_SETUP) {
					// eslint-disable-next-line no-console
					console.log("[vitest.setup] intercept", command);
				}
				return runPrismaGenerate(command, options);
			}
			return originalExecSync(cmd, options);
		},
	};
});

process.on("exit", () => {
	fs.rmSync(tmpRoot, { recursive: true, force: true });
	fs.rmSync(path.join(rootDir, "prisma", "debug"), {
		recursive: true,
		force: true,
	});
});
