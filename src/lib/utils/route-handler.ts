/**
 * src/lib/utils/route-handler.ts
 * Route Handler Utility
 * 
 * Provides utilities for handling route protection, access control,
 * and navigation in SvelteKit applications.
 * 
 * Features:
 * - Authentication-based route protection
 * - Role-based access control using token claims
 * - Redirect flows for unauthorized access
 * - Event integration for route access attempts
 */

import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { normalizeError, AppError, AuthError } from './error-handler';
import { publish } from '../services/events';
import { loggerService } from '../services/logging/logging.service';
import type { FirebaseUserClaims } from '../types/firebase.types';

// Create a logger instance for the route handler
const routeLogger = loggerService.withContext('RouteHandler');

// Import route constants
import { ROUTES } from '../constants/routes.constants';
import { AUTH_ROUTES } from '../constants/auth.constants';

// Define route event types
const ROUTE_EVENT_TYPES = {
  ACCESS_ATTEMPT: 'route:access-attempt',
  ACCESS_DENIED: 'route:access-denied',
  ACCESS_GRANTED: 'route:access-granted',
  ACCESS_ERROR: 'route:access-error'
};

// Define operators for claim checking
export type ClaimOperator = 'all' | 'any' | 'not';

// Define route config type
export interface RouteClaimConfig {
  operator: ClaimOperator;
  claims: string[];
}

export interface RouteConfig {
  claims?: RouteClaimConfig;
  unauthorizedRoute?: string;
}

/**
 * Creates the route handler utility
 */
export function createRouteHandler() {
  /**
   * Checks if a path is a protected route
   * 
   * @param path The route path to check
   * @returns Whether the route is protected
   */
  const isProtectedRoute = (path: string): boolean => {
    // Check if the path starts with /protected/ or is exactly /protected
    return path.startsWith('/protected/') || path === '/protected';
  };

  /**
   * Redirects to the login page with a returnUrl parameter
   * 
   * @param returnUrl URL to return to after login
   * @returns Redirect object for SvelteKit
   */
  const redirectToLogin = (returnUrl: string = '/'): { status: number, redirect: string } => {
    const loginRoute = AUTH_ROUTES.LOGIN_ROUTE || ROUTES.LOGIN;
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    const redirectUrl = `${loginRoute}?returnUrl=${encodedReturnUrl}`;
    
    // Log the redirect
    routeLogger.info('Redirecting unauthenticated user to login', {
      returnUrl,
      redirectUrl
    });
    
    // Return redirect object
    return {
      status: 302,
      redirect: redirectUrl
    };
  };

  /**
   * Redirects to the unauthorized page
   * 
   * @param route Optional custom unauthorized route
   * @returns Redirect object for SvelteKit
   */
  const redirectToUnauthorized = (route?: string): { status: number, redirect: string } => {
    const unauthorizedRoute = route || AUTH_ROUTES.UNAUTHORIZED_ROUTE || ROUTES.UNAUTHORIZED;
    
    // Log the redirect
    routeLogger.info('Redirecting user to unauthorized page', {
      unauthorizedRoute
    });
    
    // Return redirect object
    return {
      status: 403,
      redirect: unauthorizedRoute
    };
  };

  /**
   * Checks if a user has the required claims
   * 
   * @param userClaims The user's claims
   * @param operator Logical operator for checking claims ('all', 'any', 'not')
   * @param requiredClaims The claims required for access
   * @returns Whether the user has the required claims
   */
  const checkUserClaims = (
    userClaims: FirebaseUserClaims | null,
    operator: ClaimOperator,
    requiredClaims: string[]
  ): boolean => {
    // If no claims are required, grant access
    if (!requiredClaims || requiredClaims.length === 0) {
      return true;
    }
    
    // If no user claims, deny access
    if (!userClaims) {
      return false;
    }
    
    // Create a helper function to check if a user has a specific claim
    const hasClaim = (claim: string): boolean => {
      // Check if the claim is a role
      if (userClaims.roles && Array.isArray(userClaims.roles)) {
        if (userClaims.roles.includes(claim)) {
          return true;
        }
      }
      
      // Check if the claim is directly on the claims object
      return userClaims[claim] === true;
    };
    
    // Check claims based on the operator
    switch (operator) {
      case 'all':
        // User must have all required claims
        return requiredClaims.every(claim => hasClaim(claim));
        
      case 'any':
        // User must have at least one of the required claims
        return requiredClaims.some(claim => hasClaim(claim));
        
      case 'not':
        // User must not have any of the specified claims
        return !requiredClaims.some(claim => hasClaim(claim));
        
      default:
        // Default to requiring any claim
        return requiredClaims.some(claim => hasClaim(claim));
    }
  };

  /**
   * Verifies user access to a route
   * 
   * @param url The URL being accessed
   * @param isAuthenticated Whether the user is authenticated
   * @param userClaims The user's claims
   * @param routeConfig Optional route configuration
   * @returns An object with access status and redirect info if needed
   */
  const verifyAccess = (
    url: URL,
    isAuthenticated: boolean,
    userClaims: FirebaseUserClaims | null,
    routeConfig?: RouteConfig
  ): { hasAccess: boolean, redirect?: { status: number, redirect: string } } => {
    const pathname = url.pathname;
    
    // Publish access attempt event
    publish(ROUTE_EVENT_TYPES.ACCESS_ATTEMPT, {
      path: pathname,
      authenticated: isAuthenticated,
      hasClaims: !!userClaims,
      requestedAt: Date.now()
    }, 'RouteHandler');
    
    // If not a protected route, allow access
    if (!isProtectedRoute(pathname)) {
      return { hasAccess: true };
    }
    
    // Check authentication for protected routes
    if (!isAuthenticated) {
      // Publish access denied event
      publish(ROUTE_EVENT_TYPES.ACCESS_DENIED, {
        path: pathname,
        reason: 'not_authenticated',
        requestedAt: Date.now()
      }, 'RouteHandler');
      
      return {
        hasAccess: false,
        redirect: redirectToLogin(pathname)
      };
    }
    
    // If no claim requirements, authenticated user has access
    if (!routeConfig?.claims) {
      // Publish access granted event
      publish(ROUTE_EVENT_TYPES.ACCESS_GRANTED, {
        path: pathname,
        authenticated: true,
        requestedAt: Date.now()
      }, 'RouteHandler');
      
      return { hasAccess: true };
    }
    
    // Check if the user has the required claims
    const { operator, claims } = routeConfig.claims;
    const hasRequiredClaims = checkUserClaims(userClaims, operator, claims);
    
    if (!hasRequiredClaims) {
      // Publish access denied event
      publish(ROUTE_EVENT_TYPES.ACCESS_DENIED, {
        path: pathname,
        reason: 'insufficient_claims',
        requiredClaims: claims,
        operator,
        requestedAt: Date.now(),
        authenticated: true
      }, 'RouteHandler');
      
      return {
        hasAccess: false,
        redirect: redirectToUnauthorized(routeConfig.unauthorizedRoute)
      };
    }
    
    // Publish access granted event
    publish(ROUTE_EVENT_TYPES.ACCESS_GRANTED, {
      path: pathname,
      authenticated: true,
      claims: claims,
      requestedAt: Date.now()
    }, 'RouteHandler');
    
    return { hasAccess: true };
  };

  /**
   * Creates a load function for protected routes
   * 
   * @param getAuthState Function to get the current auth state
   * @param config Optional route configuration
   * @returns A load function for SvelteKit
   */
  const createLoadFunction = (
    getAuthState: () => { isAuthenticated: boolean, userClaims: FirebaseUserClaims | null },
    config?: RouteConfig
  ) => {
    return ({ url }: { url: URL }) => {
      const { isAuthenticated, userClaims } = getAuthState();
      
      // Verify access
      const { hasAccess, redirect } = verifyAccess(url, isAuthenticated, userClaims, config);
      
      if (!hasAccess && redirect) {
        throw new AuthError('Unauthorized access attempt', {
          action: 'authorize',
          statusCode: redirect.status,
          userMessage: 'You do not have permission to access this page.'
        });
      }
      
      // Return route configuration for child routes
      return { routeConfig: config };
    };
  };

  /**
   * Creates a client load function for protected routes
   * This is used for client-side navigation in SvelteKit
   * 
   * @param getAuthState Function to get the current auth state
   * @param config Optional route configuration
   * @returns A load function for client-side navigation
   */
  const createClientLoadFunction = (
    getAuthState: () => { isAuthenticated: boolean, userClaims: FirebaseUserClaims | null },
    config?: RouteConfig
  ) => {
    return ({ url }: { url: URL }) => {
      try {
        const { isAuthenticated, userClaims } = getAuthState();
        
        // Verify access
        const { hasAccess, redirect } = verifyAccess(url, isAuthenticated, userClaims, config);
        
        if (!hasAccess && redirect) {
          // Use goto for client-side navigation
          goto(redirect.redirect);
          // Return empty to prevent rendering until navigation completes
          return {};
        }
        
        // Return route configuration for child routes
        return { routeConfig: config };
      } catch (error) {
        // Convert unknown error to Error type for the logger
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        routeLogger.error('Client load function error', normalizedError);
        
        // Fall back to server-side handling in case of errors
        return { routeConfig: config };
      }
    };
  };

  /**
   * Handles errors in route protection
   * 
   * @param error The error to handle
   * @returns A SvelteKit-compatible error response
   */
  const handleRouteError = (error: unknown): App.Error => {
    const normalizedError = normalizeError(error, 'Route navigation error');
    
    // Log the error
    routeLogger.error(`Route error: ${normalizedError.message}`, normalizedError, {
      errorCategory: normalizedError.category
    });
    
    // Publish error event
    publish(ROUTE_EVENT_TYPES.ACCESS_ERROR, {
      error: normalizedError.message,
      category: normalizedError.category,
      timestamp: Date.now()
    }, 'RouteHandler');
    
    // Basic error response that's compatible with SvelteKit
    const errorResponse: App.Error = {
      message: normalizedError.userMessage || normalizedError.message,
      status: normalizedError.statusCode || 500
    };
    
    // Only in development mode, add the original error for debugging
    if (import.meta.env.DEV) {
      // Using type assertion to add the non-standard property
      (errorResponse as any).originalError = normalizedError;
    }
    
    return errorResponse;
  };

  /**
   * Gets the return URL from a login page URL
   * 
   * @param url The URL object from SvelteKit
   * @returns The return URL or the default post-login route
   */
  const getReturnUrl = (url: URL): string => {
    const returnUrl = url.searchParams.get('returnUrl');
    
    if (returnUrl) {
      // Validate the return URL (optional security check)
      // This prevents open redirect vulnerabilities
      if (returnUrl.startsWith('/')) {
        return returnUrl;
      }
    }
    
    // Return default post-login route if no valid return URL
    return AUTH_ROUTES.DEFAULT_POST_LOGIN_ROUTE || ROUTES.PROTECTED.HOME;
  };

  return {
    isProtectedRoute,
    redirectToLogin,
    redirectToUnauthorized,
    checkUserClaims,
    verifyAccess,
    createLoadFunction,
    createClientLoadFunction,
    handleRouteError,
    getReturnUrl
  };
}

// Create and export a singleton instance
export const routeHandler = createRouteHandler();

// Export event types for use in other modules
export const ROUTE_EVENTS = ROUTE_EVENT_TYPES;