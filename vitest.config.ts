// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    include: ['__tests__/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    clearMocks: true,
    // Restore vi.stubGlobal() stubs after every test. Without this, a stub
    // like vi.stubGlobal('document', {}) leaks across test FILES (singleFork
    // runs them all in one process) and crashes unrelated suites at import
    // time — the source of the suite's historic order-dependent flakiness.
    unstubGlobals: true,
    setupFiles: ['./vitest.setup.ts'],
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
    dangerouslyIgnoreUnhandledErrors: true
  },
  resolve: {
    alias: {
      '$lib': resolve(__dirname, './src/lib'),
      // Mirror vite.config.ts: resolve workspace packages to their SOURCE.
      // Without these, @xbg.solutions/* imports resolve through the
      // node_modules workspace symlinks to each package's built lib/ output
      // (package.json "main") — tests would exercise stale compiled JS and
      // vi.mock() calls targeting source paths would never apply.
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