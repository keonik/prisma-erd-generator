import { defineConfig } from 'vitest/config'

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
  },
})