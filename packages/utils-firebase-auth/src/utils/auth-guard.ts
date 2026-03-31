/**
 * src/lib/utils/auth-guard.ts
 * Authentication Guard Utility
 * 
 * Provides route protection based on authentication state.
 * Used in +layout.ts and +page.ts files to protect routes,
 * redirecting unauthenticated users as needed.
 */

import { goto } from '$app/navigation';
import { authService } from '../services/auth';
import { AUTH_ROUTES_LEGACY as AUTH_ROUTES } from '@xbg.solutions/bpsk-core';

/**
 * Options for route guarding
 */
export type GuardOptions = {
  /** Redirect URL for unauthenticated users */
  redirectTo?: string;
  /** Whether to include the original URL as a return parameter */
  includeReturnUrl?: boolean;
  /** Required roles for access (user must have ALL these roles) */
  requiredRoles?: string[];
  /** Required any roles for access (user must have ANY of these roles) */
  requiredAnyRoles?: string[];
  /** Return parameter name (default: 'returnUrl') */
  returnUrlParam?: string;
};

/**
 * Guards a route based on authentication state
 * @param options Guard options
 * @returns An object with status, redirect, and error information
 */
export function guardRoute(options: GuardOptions = {}) {
  const {
    redirectTo = AUTH_ROUTES.SIGN_IN,
    includeReturnUrl = true,
    requiredRoles = [],
    requiredAnyRoles = [],
    returnUrlParam = 'returnUrl'
  } = options;

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // User is not authenticated - redirect to sign in
    let redirectUrl = redirectTo;

    // Add original URL as return parameter if requested
    if (includeReturnUrl) {
      const currentUrl = window.location.pathname + window.location.search;
      redirectUrl += `?${returnUrlParam}=${encodeURIComponent(currentUrl)}`;
    }

    return {
      status: 'unauthenticated',
      redirect: redirectUrl,
      error: 'User is not authenticated'
    };
  }

  // Check for required roles if specified
  if (requiredRoles.length > 0) {
    const hasAllRoles = requiredRoles.every(role => authService.userHasRole(role));

    if (!hasAllRoles) {
      return {
        status: 'unauthorized',
        redirect: AUTH_ROUTES.UNAUTHORIZED,
        error: 'User does not have all required roles'
      };
    }
  }

  // Check for any required roles if specified
  if (requiredAnyRoles.length > 0) {
    const hasAnyRole = authService.userHasAnyRole(requiredAnyRoles);

    if (!hasAnyRole) {
      return {
        status: 'unauthorized',
        redirect: AUTH_ROUTES.UNAUTHORIZED,
        error: 'User does not have any of the required roles'
      };
    }
  }

  // Access is granted
  return {
    status: 'authorized',
    redirect: null,
    error: null
  };
}

/**
 * Server-side compatible guard for SvelteKit load functions
 * 
 * @param event SvelteKit load event with url and cookies
 * @param options Guard options
 * @returns A redirect object or null if authorized
 */
export function guardRouteServer(event: any, options: GuardOptions = {}) {
  const {
    redirectTo = AUTH_ROUTES.SIGN_IN,
    includeReturnUrl = true,
    returnUrlParam = 'returnUrl'
  } = options;

  // For server-side, check for auth cookie existence
  // Note: Full validation should happen in the API middleware
  const hasAuthCookie = event.cookies.get('svelte_boilerplate_auth_idToken') !== undefined;

  if (!hasAuthCookie) {
    // User is not authenticated - redirect to sign in
    let redirectUrl = redirectTo;

    // Add original URL as return parameter if requested
    if (includeReturnUrl) {
      redirectUrl += `?${returnUrlParam}=${encodeURIComponent(event.url.pathname)}`;
    }

    return {
      status: 303,
      redirect: redirectUrl
    };
  }

  // For server-side, we can't fully check roles, but we return authorized
  // The client-side will do a full check once hydrated
  return null;
}

/**
 * Redirects to unauthorized page when access is forbidden
 */
export function redirectToUnauthorized() {
  goto(AUTH_ROUTES.UNAUTHORIZED);
}

/**
 * Redirects to sign in page
 * @param returnUrl Optional URL to return to after sign in
 */
export function redirectToSignIn(returnUrl?: string) {
  let redirectUrl = AUTH_ROUTES.SIGN_IN;
  
  if (returnUrl) {
    redirectUrl += `?returnUrl=${encodeURIComponent(returnUrl)}`;
  }
  
  goto(redirectUrl);
}