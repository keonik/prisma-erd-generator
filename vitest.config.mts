import { defineConfig } from 'vitest/config'
import os from 'node:os'

export default defineConfig({
    test: {
        setupFiles: ['./vitest.setup.mjs'],
        coverage: {
            reporter: ['json', 'text', 'lcov'],
            exclude: ['/node_modules'],
        },
        // Multi-version matrix runs take longer because they shell out to Prisma
        testTimeout: 120000,
        fileParallelism: true,
        maxWorkers: os.cpus().length,
    },
})
