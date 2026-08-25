import child_process from 'node:child_process'

// Each test worker shells out to `bunx prisma@<version>`. bunx populates a
// shared cache dir per package@version, and concurrent workers racing to fill
// it fails with `ENOENT: failed copying files from cache to destination`.
// Warming each version once, serially, before any worker starts means the
// workers only ever read an already-populated cache.
export default function warmPrismaCache() {
    const versions = process.env.PRISMA_TEST_VERSIONS?.split(',')
        .map((v) => v.trim())
        .filter(Boolean) || ['5.22.0', '6.15.0', '7.0.0']

    for (const version of versions) {
        child_process.execSync(`bunx prisma@${version} --version`, {
            stdio: 'ignore',
            env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: '1' },
        })
    }
}
