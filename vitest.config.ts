import { defineConfig } from 'vitest/config'
import os from 'node:os';

export default defineConfig({
  test: {
    coverage: {
        reporter: [
            'json',
        'text',
        'lcov',
        ],
        exclude: ['/node_modules'],
    },
    testTimeout: 10000,
    fileParallelism: true,
    maxWorkers: os.cpus().length,
  },
})