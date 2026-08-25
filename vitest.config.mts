import os from 'node:os'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        setupFiles: ['./vitest.setup.mjs'],
        globalSetup: ['./vitest.global-setup.mjs'],
        coverage: {
            reporter: ['json', 'text', 'lcov'],
            exclude: ['/node_modules'],
        },
        // Multi-version matrix runs take longer because they shell out to Prisma
        testTimeout: 120000,
        fileParallelism: process.platform !== 'win32',
        // Every test file shells out to `prisma generate`, and most then launch
        // a headless Chromium through mmdc. One worker per core thrashes on a
        // developer machine (16 cores = 16 browsers) and times out; CI only
        // escaped it by having 2-4 cores. Four is plenty to hide the I/O wait.
        //
        // Windows gets 1: it intermittently fails the whole run with
        // `[vitest-worker]: Timeout calling "onTaskUpdate"` even though every
        // test passed — a worker-RPC race, not a test failure. Files already
        // run serially there, so a single worker costs no wall-clock.
        maxWorkers:
            process.platform === 'win32' ? 1 : Math.min(4, os.cpus().length),
    },
})
