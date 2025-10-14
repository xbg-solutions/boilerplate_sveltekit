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
    }
  },
  
  // Optimize build for SPA
  build: {
    target: 'es2020',
    minify: 'terser',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
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