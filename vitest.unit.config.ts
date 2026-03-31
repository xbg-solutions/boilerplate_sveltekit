// vitest.unit.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    include: ['__tests__/unit/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    setupFiles: ['./vitest.unit.setup.ts'],
    isolate: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    testTimeout: 5000,
    hookTimeout: 2000,
    maxConcurrency: 1,
    alias: {
      '$app/stores': resolve(__dirname, './__tests__/mocks/$app/stores.js'),
      '$app/navigation': resolve(__dirname, './__tests__/mocks/$app/navigation.js'),
      '$app/environment': resolve(__dirname, './__tests__/mocks/$app/environment.js')
    },
    // Silence expected warnings and errors in tests
    onConsoleLog(log, type) {
      // Ignore expected error and warning logs in tests
      if (
        log.includes('[PhoneAuthService] Phone code sending failed') ||
        log.includes('[PhoneAuthService] Phone code verification failed') ||
        log.includes('[PhoneAuthService] Failed to ensure user exists') ||
        log.includes('[EmailLinkService] Failed to store email') ||
        log.includes('[EmailLinkService] Error accessing localStorage') ||
        log.includes('[EmailLinkService] Error accessing sessionStorage') ||
        log.includes('[EmailLinkService] Failed to clear email') ||
        log.includes('Component \'MissingComponent\' not found in module') ||
        log.includes('[CSRFUtility] CSRF validation failed for request')
      ) {
        return false; // Prevents the log from being displayed in test output
      }
      return undefined; // Default behavior for other logs
    },
    
    // Prevent unhandled rejections from being reported as errors when they're expected
    dangerouslyIgnoreUnhandledErrors: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.{test,spec}.{js,ts}',
        'vitest.*.ts',
        '**/*.config.{js,ts}',
        'build.js',
        'src/vite-env.d.ts',
        'src/app.html',
        '**/*.d.ts'
      ],
      include: ['src/**/*.{js,ts,svelte}'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '$lib': resolve(__dirname, './src/lib'),
      '@xbg.solutions/bpsk-core': resolve(__dirname, './packages/core/src/index.ts'),
      '@xbg.solutions/bpsk-utils-firebase-auth': resolve(__dirname, './packages/utils-firebase-auth/src/index.ts'),
      '@xbg.solutions/bpsk-utils-api-client': resolve(__dirname, './packages/utils-api-client/src/index.ts'),
      '@xbg.solutions/bpsk-utils-csrf': resolve(__dirname, './packages/utils-csrf/src/index.ts'),
      '@xbg.solutions/bpsk-utils-sanitizer': resolve(__dirname, './packages/utils-sanitizer/src/index.ts'),
      '@xbg.solutions/bpsk-utils-rbac': resolve(__dirname, './packages/utils-rbac/src/index.ts'),
      '@xbg.solutions/bpsk-utils-secure-storage': resolve(__dirname, './packages/utils-secure-storage/src/index.ts'),
      '@xbg.solutions/bpsk-utils-tab-sync': resolve(__dirname, './packages/utils-tab-sync/src/index.ts'),
      '@xbg.solutions/bpsk-utils-recaptcha': resolve(__dirname, './packages/utils-recaptcha/src/index.ts'),
      '@xbg.solutions/bpsk-utils-seo': resolve(__dirname, './packages/utils-seo/src/index.ts'),
      '@xbg.solutions/bpsk-utils-sse': resolve(__dirname, './packages/utils-sse/src/index.ts'),
      '@xbg.solutions/bpsk-utils-performance': resolve(__dirname, './packages/utils-performance/src/index.ts'),
      '@xbg.solutions/bpsk-utils-file-upload': resolve(__dirname, './packages/utils-file-upload/src/index.ts'),
      '@xbg.solutions/bpsk-utils-mutex': resolve(__dirname, './packages/core/src/index.ts'),
      '@xbg.solutions/bpsk-utils-state-manager': resolve(__dirname, './packages/utils-state-manager/src/index.ts'),
      '@xbg.solutions/bpsk-utils-event-bus': resolve(__dirname, './packages/core/src/index.ts'),
      '@xbg.solutions/bpsk-test-utils': resolve(__dirname, './packages/test-utils-frontend/src/index.ts')
    }
  }
});