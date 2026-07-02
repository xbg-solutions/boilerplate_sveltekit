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
    
    // Canonical CSP for the built app. Hash mode is required so SvelteKit can
    // hash its inline hydration script — a CSP delivered from anywhere else
    // (e.g. a hosting header) cannot know those hashes and would break the app.
    // firebase.json intentionally carries only `frame-ancestors` (a directive
    // that is ignored in <meta> CSP), everything else lives here.
    csp: {
      mode: 'hash',
      directives: {
        'default-src': ['self'],
        'script-src': ['self', 'https://www.google.com', 'https://*.google.com', 'https://www.gstatic.com', 'https://*.gstatic.com', 'https://*.googleapis.com'],
        'script-src-elem': ['self', 'https://www.google.com', 'https://*.google.com', 'https://www.gstatic.com', 'https://*.gstatic.com', 'https://*.googleapis.com'],
        'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
        'font-src': ['self', 'https://fonts.gstatic.com', 'data:'],
        'img-src': ['self', 'data:', 'blob:', 'https:'],
        'connect-src': ['self', 'https://*.googleapis.com', 'wss://*.googleapis.com', 'https://*.firebaseapp.com', 'https://*.firebaseio.com', 'wss://*.firebaseio.com', 'https://*.cloudfunctions.net', 'https://www.google.com', 'https://*.google.com', 'https://www.gstatic.com', 'https://*.gstatic.com'],
        'frame-src': ['self', 'https://www.google.com', 'https://*.google.com', 'https://*.firebaseapp.com'],
        'worker-src': ['self', 'blob:'],
        'object-src': ['none'],
        'base-uri': ['self'],
        'form-action': ['self'],
        'manifest-src': ['self'],
        'media-src': ['self']
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