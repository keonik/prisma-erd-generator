import fs from "node:fs";
import path from "node:path";
import type { GeneratorOptions } from "@prisma/generator-helper";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import generate from "../src/generate";

const tmpDir = path.join(__dirname, "tmp-sort-fields");

const datamodel = `
model User {
  zeta   String
  alpha  String
  id     Int    @id
  middle String
}
`;

const dmmfDatamodel = {
  enums: [],
  types: [],
  models: [
    {
      name: "User",
      dbName: "User",
      fields: [
        {
          name: "zeta",
          hasDefaultValue: false,
          isGenerated: false,
          isId: false,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
          isUpdatedAt: false,
          kind: "scalar",
          type: "String"
        },
        {
          name: "alpha",
          hasDefaultValue: false,
          isGenerated: false,
          isId: false,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
          isUpdatedAt: false,
          kind: "scalar",
          type: "String"
        },
        {
          name: "id",
          hasDefaultValue: false,
          isGenerated: false,
          isId: true,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
          isUpdatedAt: false,
          kind: "scalar",
          type: "Int"
        },
        {
          name: "middle",
          hasDefaultValue: false,
          isGenerated: false,
          isId: false,
          isList: false,
          isReadOnly: false,
          isRequired: true,
          isUnique: false,
          isUpdatedAt: false,
          kind: "scalar",
          type: "String"
        }
      ],
      idFields: [],
      uniqueFields: [],
      uniqueIndexes: [],
      isGenerated: false,
      primaryKey: {
        name: null,
        fields: ["id"]
      }
    }
  ]
};

const baseGenerator = {
  name: "erd",
  provider: { fromEnvVar: null, value: "prisma-erd-generator" },
  output: { fromEnvVar: null, value: "" },
  config: {
    disableEmoji: "true"
  },
  binaryTargets: [],
  previewFeatures: [],
  sourceFilePath: "schema.prisma"
};

const render = async (
  fileName: string,
  config: Record<string, string> = {}
) => {
  const outputFile = path.join(tmpDir, fileName);

  await generate({
    generator: {
      ...baseGenerator,
      output: { fromEnvVar: null, value: outputFile },
      config: {
        ...baseGenerator.config,
        ...config
      }
    },
    otherGenerators: [],
    schemaPath: "schema.prisma",
    dmmf: { datamodel: dmmfDatamodel },
    datasources: [],
    datamodel,
    version: "test"
  } as unknown as GeneratorOptions);

  return fs.readFileSync(outputFile, "utf8");
};

describe("sortFields", () => {
  beforeEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("preserves source field order by default", async () => {
    const output = await render("default.md");

    expect(output.indexOf("String zeta")).toBeLessThan(
      output.indexOf("String alpha")
    );
    expect(output.indexOf("String alpha")).toBeLessThan(
      output.indexOf("Int id")
    );
    expect(output.indexOf("Int id")).toBeLessThan(
      output.indexOf("String middle")
    );
  });

  it("sorts fields alphabetically when enabled", async () => {
    const output = await render("sorted.md", { sortFields: "true" });

    expect(output.indexOf("String alpha")).toBeLessThan(
      output.indexOf("Int id")
    );
    expect(output.indexOf("Int id")).toBeLessThan(
      output.indexOf("String middle")
    );
    expect(output.indexOf("String middle")).toBeLessThan(
      output.indexOf("String zeta")
    );
  });

  it("does not mutate the source field order when sorting", async () => {
    await render("sorted.md", { sortFields: "true" });

    const output = await render("default-after-sorted.md");

    expect(output.indexOf("String zeta")).toBeLessThan(
      output.indexOf("String alpha")
    );
    expect(output.indexOf("String alpha")).toBeLessThan(
      output.indexOf("Int id")
    );
    expect(output.indexOf("Int id")).toBeLessThan(
      output.indexOf("String middle")
    );
  });
});
