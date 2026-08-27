import child_process from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export const versionsUnderTest = () =>
    process.env.PRISMA_TEST_VERSIONS?.split(',')
        .map((version) => version.trim())
        .filter(Boolean) || ['5.22.0', '6.15.0', '7.0.0', '7.10.0']

export const prismaInstallDir = (version) =>
    path.join(rootDir, 'tmp', 'prisma-cli', `v${version.replace(/[.]/g, '_')}`)

/**
 * Path to an installed Prisma CLI entrypoint.
 *
 * Read from the package's own `bin` field rather than hardcoded: Prisma 5-7
 * ship it at `build/index.js` and Prisma 8 moved it to `dist/prisma.js`, so a
 * literal path silently breaks on the next major.
 */
export const prismaBinary = (version) => {
    const pkgDir = path.join(
        prismaInstallDir(version),
        'node_modules',
        'prisma'
    )
    const pkg = JSON.parse(
        fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')
    )
    const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.prisma
    if (!bin) {
        throw new Error(`prisma@${version} declares no bin entry`)
    }
    return path.join(pkgDir, bin)
}

/**
 * Installs each Prisma version under test into its own directory.
 *
 * The tests used to invoke `bunx prisma@<version>`, but bunx keeps ONE cache
 * directory per package@version and will re-resolve into it at will — moving
 * the existing tree aside to `.old-<hash>` and rebuilding. When several vitest
 * workers invoke the same version at once, the ones reading it get
 * `ENOENT ... /node_modules/prisma` or `could not determine executable to run`
 * partway through. Warming the cache first is not enough, because the
 * re-resolution can happen later.
 *
 * A directory we own has no such behaviour: installed once, never rewritten,
 * safe for any number of concurrent readers.
 */
export default function installPrismaVersions() {
    for (const version of versionsUnderTest()) {
        const dir = prismaInstallDir(version)
        const installed = path.join(
            dir,
            'node_modules',
            'prisma',
            'package.json'
        )

        if (fs.existsSync(installed)) continue

        fs.rmSync(dir, { recursive: true, force: true })
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(
            path.join(dir, 'package.json'),
            JSON.stringify({ name: 'prisma-cli-under-test', private: true })
        )

        child_process.execSync(`bun add --exact prisma@${version}`, {
            cwd: dir,
            stdio: 'ignore',
            env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: '1' },
        })

        if (!fs.existsSync(prismaBinary(version))) {
            throw new Error(
                `Failed to install prisma@${version} for tests: ${prismaBinary(
                    version
                )} is missing`
            )
        }
    }
}
