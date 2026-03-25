/**
 * src/routes/+layout.ts
 * Universal Layout Loader
 * 
 * This loader handles both public and protected routes:
 * - Initializes the auth service
 * - For public routes: redirects authenticated users to the protected area
 * - For protected routes: ensures proper authentication and role-based access
 */

import { browser } from '$app/environment';
import { initializationService } from '@xbg.solutions/frontend-core';
import { authService } from '@xbg.solutions/utils-firebase-auth';
import { AUTH_ROUTES } from '@xbg.solutions/frontend-core';
import { redirect } from '@sveltejs/kit';
import { APP_CONFIG, configHelpers } from '@xbg.solutions/frontend-core';

// For protected routes
import { authStore } from '@xbg.solutions/utils-firebase-auth';
import { get } from 'svelte/store';
import { initializationStore } from '@xbg.solutions/frontend-core';
import { goto } from '$app/navigation';
import type { LayoutLoad } from './$types';

// Universal layout loader
export const load: LayoutLoad = async ({ url, params }) => {
  // Get current pathname for determining route type and access control
  const pathname = url.pathname;
  const isProtectedRoute = pathname.includes('protected');
  
  try {
    // Only initialize on the client
    if (browser) {
      // Initialize Firebase and Auth service using APP_CONFIG.firebase as single source
      await initializationService.initialize({
        firebaseConfig: APP_CONFIG.firebase,
        useEmulators: import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true'
      });
      
      // === PUBLIC ROUTE HANDLING ===
      if (!isProtectedRoute) {
        // If user is authenticated and trying to access login page
        // redirect them to the protected area
        if (authService.isAuthenticated() && url.pathname === '/') {
          throw redirect(302, AUTH_ROUTES.DEFAULT_POST_LOGIN_ROUTE);
        }
        
        // Public route with no special handling needed
        return {
          pathname,
          isProtectedRoute: false
        };
      }
      
      // === PROTECTED ROUTE HANDLING ===
      
      // Check initialization state
      const initState = get(initializationStore);
      if (!initState?.isInitialized && !initState?.error) {
        // Return loading state, let the component handle displaying loading UI
        return {
          pathname,
          isProtectedRoute: true,
          isReady: false,
          isLoading: true
        };
      }
      
      // Get auth state
      const authState = get(authStore);
      
      // If not authenticated, redirect to login
      if (!authState?.isAuthenticated) {
        // Use client-side navigation for SPA
        goto(AUTH_ROUTES.SIGN_IN);
        
        return {
          pathname,
          isProtectedRoute: true,
          isReady: false,
          isRedirecting: true
        };
      }
      
      // Extract user roles from claims
      const userRoles = authState?.claims?.roles || [];

      // Determine required role from URL pattern using configured role values.
      // Role values come from APP_CONFIG.auth.roles (set by `npm run setup`).
      const roles = APP_CONFIG.auth.roles;
      const routeRoleMap: Record<string, string> = {
        '/admin': roles.ADMIN,
        '/client': roles.CLIENT,
        '/consultant': roles.CONSULTANT,
        '/sysadmin': roles.SYS_ADMIN,
      };

      // Find the first matching route segment
      const requiredRole = Object.entries(routeRoleMap).find(
        ([segment]) => pathname.includes(segment)
      )?.[1];

      // Check if user has the required role (respects hierarchy)
      const hasRequiredRole = !requiredRole
        || configHelpers.userHasRole(
             Array.isArray(userRoles) ? userRoles : [],
             requiredRole
           );
      
      // If user doesn't have the required role, redirect to dashboard
      if (!hasRequiredRole) {
        goto(AUTH_ROUTES.SUCCESS);
        
        return {
          pathname,
          isProtectedRoute: true,
          isReady: false,
          isRedirecting: true,
          unauthorized: true
        };
      }
      
      // Everything is good, allow access to the protected route
      return {
        pathname,
        isProtectedRoute: true,
        isReady: true,
        user: authState.user,
        claims: authState.claims,
        roles: userRoles
      };
    }
    
    // Server-side: return minimal data
    return {
      pathname,
      isProtectedRoute,
      isReady: false
    };
    
  } catch (error) {
    // Don't catch redirects
    if ((error as any).status === 302) {
      throw error;
    }
    
    console.error('Error in layout loader:', error);
    return {
      error: {
        message: 'Failed to initialize application',
      },
      pathname,
      isProtectedRoute
    };
  }
};