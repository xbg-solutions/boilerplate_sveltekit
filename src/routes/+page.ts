/**
 * src/routes/+layout.ts
 * Public Layout Loader for SPA Mode
 * 
 * Optimized for client-side rendering with careful handling of
 * initialization state and navigation.
 */

import { browser } from '$app/environment';
import { initializationService } from '@xbg.solutions/frontend-core';
import { authStore } from '@xbg.solutions/utils-firebase-auth';
import { get } from 'svelte/store';
import { AUTH_ROUTES } from '@xbg.solutions/frontend-core';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

/**
 * Flag to track initialization status across navigation events
 * This prevents repeated initialization during client-side navigation
 */
let hasInitialized = false;

export const load: LayoutLoad = async ({ url }) => {
  try {
    // Only run initialization once in browser context
    if (browser && !hasInitialized) {
      try {
        await initializationService.initialize({
          firebaseConfig,
          useEmulators: import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true'
        });
        
        // Mark as initialized to prevent repeat initializations
        hasInitialized = true;
      } catch (error) {
        console.error('Initialization error:', error);
        // Continue with navigation even if initialization fails
        // The app will attempt to recover through error boundaries
      }
    }
    
    // Check authentication state for redirection
    // Only redirect if we're on the home/login page
    if (browser && url.pathname === '/') {
      const authState = get(authStore);
      
      if (authState?.isAuthenticated) {
        throw redirect(302, AUTH_ROUTES.DEFAULT_POST_LOGIN_ROUTE);
      }
    }
    
    // Return data for the route
    return {
      pathname: url.pathname
    };
  } catch (error) {
    // Don't catch redirects
    if (error && (error as any).status === 302) {
      throw error;
    }
    
    console.error('Error in public layout loader:', error);
    return {
      error: {
        message: 'Failed to initialize application'
      }
    };
  }
};