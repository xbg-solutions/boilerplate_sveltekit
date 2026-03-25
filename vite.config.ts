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
      '@xbg.solutions/frontend-core': resolve('./packages/core/src/index.ts'),
      '@xbg.solutions/utils-firebase-auth': resolve('./packages/utils-firebase-auth/src/index.ts'),
      '@xbg.solutions/utils-api-client': resolve('./packages/utils-api-client/src/index.ts'),
      '@xbg.solutions/utils-csrf': resolve('./packages/utils-csrf/src/index.ts'),
      '@xbg.solutions/utils-sanitizer': resolve('./packages/utils-sanitizer/src/index.ts'),
      '@xbg.solutions/utils-rbac': resolve('./packages/utils-rbac/src/index.ts'),
      '@xbg.solutions/utils-secure-storage': resolve('./packages/utils-secure-storage/src/index.ts'),
      '@xbg.solutions/utils-tab-sync': resolve('./packages/utils-tab-sync/src/index.ts'),
      '@xbg.solutions/utils-recaptcha': resolve('./packages/utils-recaptcha/src/index.ts'),
      '@xbg.solutions/utils-seo': resolve('./packages/utils-seo/src/index.ts'),
      '@xbg.solutions/utils-sse': resolve('./packages/utils-sse/src/index.ts'),
      '@xbg.solutions/utils-performance': resolve('./packages/utils-performance/src/index.ts'),
      '@xbg.solutions/utils-file-upload': resolve('./packages/utils-file-upload/src/index.ts'),
      '@xbg.solutions/utils-mutex': resolve('./packages/core/src/index.ts'),
      '@xbg.solutions/utils-state-manager': resolve('./packages/utils-state-manager/src/index.ts'),
      '@xbg.solutions/utils-event-bus': resolve('./packages/core/src/index.ts'),
      '@xbg.solutions/test-utils-frontend': resolve('./packages/test-utils-frontend/src/index.ts'),
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
  
  // Optimize development experience
  server: {
    fs: {
      strict: false
    }
  }
});