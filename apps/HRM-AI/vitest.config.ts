// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * LAC VIET HR - Vitest Configuration
 * Unit tests, Component tests, API tests
 */

export default defineConfig({
  plugins: [react()],

  test: {
    // ════════════════════════════════════════════════════════════════
    // GLOBAL SETTINGS
    // ════════════════════════════════════════════════════════════════
    globals: true,
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./tests/setup.tsx'],

    // Test patterns
    include: [
      'tests/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/e2e/**',
      '**/performance/**',
      '**/dist/**',
    ],

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // ════════════════════════════════════════════════════════════════
    // COVERAGE
    // ════════════════════════════════════════════════════════════════
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html', 'lcov'],
      reportsDirectory: './test-results/coverage',

      // Files to include
      include: [
        'src/**/*.{ts,tsx}',
      ],

      // Files to exclude
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
        'src/app/api/**', // API routes tested separately
        'src/components/ui/**', // shadcn components
      ],

      // Coverage thresholds
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
        // Per-file thresholds for critical modules
        'src/lib/**/*.ts': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/services/**/*.ts': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
    },

    // ════════════════════════════════════════════════════════════════
    // REPORTERS
    // ════════════════════════════════════════════════════════════════
    reporters: ['verbose', 'html', 'json'],
    outputFile: {
      html: './test-results/vitest-report/index.html',
      json: './test-results/vitest-results.json',
    },

    // ════════════════════════════════════════════════════════════════
    // POOL & ISOLATION
    // ════════════════════════════════════════════════════════════════
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
    isolate: true,

    // ════════════════════════════════════════════════════════════════
    // WATCH MODE
    // ════════════════════════════════════════════════════════════════
    watch: false,

    // ════════════════════════════════════════════════════════════════
    // SNAPSHOTS
    // ════════════════════════════════════════════════════════════════
    snapshotFormat: {
      escapeString: true,
      printBasicPrototype: true,
    },
  },

  // ════════════════════════════════════════════════════════════════
  // PATH ALIASES
  // ════════════════════════════════════════════════════════════════
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },
});
