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
    browser: {
      enabled: true,
      headless: true,
    },
    environment: 'node',
    
  },
})