// svelte.config.js - corrected for SvelteKit 2.20.2
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import staticAdapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  
  kit: {
    // Configuration for SvelteKit 2.x
    adapter: staticAdapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: false
    }),
    
    alias: {
      $lib: 'src/lib',
      $components: 'src/lib/components',
      // Keep your other aliases...
    },
    
    paths: {
      base: '',
      assets: ''
    },
    
    csp: {
      mode: 'hash', // Using hash mode to avoid dynamic nonces
      directives: {
        'script-src': ['self', 'https://www.google.com', 'https://*.google.com', 'https://www.gstatic.com', 'https://*.gstatic.com'],
        'script-src-elem': ['self', 'https://www.google.com', 'https://*.google.com', 'https://www.gstatic.com', 'https://*.gstatic.com'],
        'connect-src': ['self', 'https://securetoken.googleapis.com', 'https://identitytoolkit.googleapis.com', 'https://*.firebaseapp.com', 'https://www.google.com', 'https://*.google.com', 'https://www.gstatic.com', 'https://*.gstatic.com'],
        'frame-src': ['self', 'https://www.google.com', 'https://*.google.com', 'https://*.firebaseapp.com'],
        'img-src': ['self', 'data:', 'https://www.gstatic.com', 'https://*.gstatic.com', 'https://www.google.com', 'https://*.google.com']
      }
    },
    
    // Disable SvelteKit's loading indicator to prevent the browser-level rectangle
    version: {
      name: Date.now().toString(), // Ensures a unique version on each build
      pollInterval: 0 // Disable polling - which means no progress indicator
    },
    
    prerender: {
      entries: [],
      handleMissingId: 'ignore'
    }
  }
}