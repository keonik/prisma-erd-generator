import os from 'node:os'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        setupFiles: ['./vitest.setup.mjs'],
        coverage: {
            reporter: ['json', 'text', 'lcov'],
            exclude: ['/node_modules'],
        },
        // Multi-version matrix runs take longer because they shell out to Prisma
        testTimeout: 120000,
        fileParallelism: process.platform !== 'win32',
        // Windows intermittently fails the whole run with
        // `[vitest-worker]: Timeout calling "onTaskUpdate"` even though every
        // test passed — a worker-RPC race, not a test failure. Files already
        // run serially there, so a single worker costs nothing and removes it.
        maxWorkers: process.platform === 'win32' ? 1 : os.cpus().length,
    },
})
