// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    sveltekit(),
    // Bundle analyzer - only when ANALYZE=true
    ...(process.env.ANALYZE ? [visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })] : [])
  ],
  
  resolve: {
    alias: {
      $lib: resolve('./src/lib'),
      $components: resolve('./src/lib/components'),
      $layouts: resolve('./src/lib/components/layouts'),
      $stores: resolve('./src/lib/stores'),
      $utils: resolve('./src/lib/utils'),
      $services: resolve('./src/lib/services'),
      $constants: resolve('./src/lib/constants'),
      $types: resolve('./src/lib/types'),
      $blocks: resolve('./src/lib/components/blocks'),
      // npm workspace packages — resolve to source for dev, lib/ for prod
      '@xbg.solutions/bpsk-core': resolve('./packages/core/src/index.ts'),
      '@xbg.solutions/bpsk-utils-firebase-auth': resolve('./packages/utils-firebase-auth/src/index.ts'),
      '@xbg.solutions/bpsk-utils-api-client': resolve('./packages/utils-api-client/src/index.ts'),
      '@xbg.solutions/bpsk-utils-csrf': resolve('./packages/utils-csrf/src/index.ts'),
      '@xbg.solutions/bpsk-utils-sanitizer': resolve('./packages/utils-sanitizer/src/index.ts'),
      '@xbg.solutions/bpsk-utils-rbac': resolve('./packages/utils-rbac/src/index.ts'),
      '@xbg.solutions/bpsk-utils-secure-storage': resolve('./packages/utils-secure-storage/src/index.ts'),
      '@xbg.solutions/bpsk-utils-tab-sync': resolve('./packages/utils-tab-sync/src/index.ts'),
      '@xbg.solutions/bpsk-utils-recaptcha': resolve('./packages/utils-recaptcha/src/index.ts'),
      '@xbg.solutions/bpsk-utils-seo': resolve('./packages/utils-seo/src/index.ts'),
      '@xbg.solutions/bpsk-utils-sse': resolve('./packages/utils-sse/src/index.ts'),
      '@xbg.solutions/bpsk-utils-performance': resolve('./packages/utils-performance/src/index.ts'),
      '@xbg.solutions/bpsk-utils-file-upload': resolve('./packages/utils-file-upload/src/index.ts'),
      '@xbg.solutions/bpsk-utils-mutex': resolve('./packages/core/src/index.ts'),
      '@xbg.solutions/bpsk-utils-state-manager': resolve('./packages/utils-state-manager/src/index.ts'),
      '@xbg.solutions/bpsk-utils-event-bus': resolve('./packages/core/src/index.ts'),
      '@xbg.solutions/bpsk-test-utils': resolve('./packages/test-utils-frontend/src/index.ts'),
    }
  },
  
  // Optimize build for SPA
  build: {
    target: 'es2020',
    minify: 'terser',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.NODE_ENV === 'development',
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('flowbite-svelte') || id.includes('lucide-svelte')) return 'ui-lib';
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('tailwind-variants')) return 'utils';
            return 'vendor';
          }
        }
      }
    }
  },
  
  // Performance optimizations
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'flowbite-svelte']
  },
  
  // Provide environment variables to the client
  define: {
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  
  // Note: do NOT set server.fs.strict:false — it disables Vite's dev-server
  // file-serving allowlist and lets any page you visit while `npm run dev` is
  // running read files outside the project root.
});