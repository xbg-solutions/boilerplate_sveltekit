/**
 * src/lib/utils/signout.ts
 * Signout Utility
 * 
 * A utility that handles user signout process, including:
 * - Backend token revocation (when connected to a backend)
 * - Firebase authentication signout
 * - Clean state management during signout
 * 
 * IMPORTANT: This utility is designed to be extended when connecting to a backend.
 * The current implementation is for Firebase-only authentication. When connecting
 * to a backend, modify the revokeTokenOnBackend() method to call your backend's
 * token revocation endpoint.
 */

import {
  signOutUser,
  processFirebaseError,
  loggerService,
  AppError,
  normalizeError,
  withErrorHandling,
  publish,
  AUTH_EVENTS,
  AUTH_ROUTES_LEGACY as AUTH_ROUTES
} from '@xbg.solutions/bpsk-core';
import type { ErrorOptions } from '@xbg.solutions/bpsk-core';
import { tokenService } from '../services/token/token.service';
import { goto } from '$app/navigation';

// Create a logger instance for Signout utility
const signoutLogger = loggerService.withContext('SignoutUtility');

/**
 * Options for the Signout error
 */
export type SignoutErrorOptions = ErrorOptions & {
  /** Signout error source */
  source?: 'firebase' | 'backend' | 'token' | 'general';
  /** Original error for context */
  originalError?: Error;
};

/**
 * Signout specific error class
 */
export class SignoutError extends AppError {
  /** Source of the signout error */
  public source?: string;

  constructor(message: string, options: SignoutErrorOptions = {}) {
    super(message, {
      category: 'auth',
      statusCode: 401,
      ...options
    });

    this.source = options.source;
  }
}

/**
 * Signout options
 */
export interface SignoutOptions {
  /** Skip backend token revocation */
  skipBackendRevocation?: boolean;
  /** Redirect URL after signout (defaults to sign in route) */
  redirectUrl?: string;
  /** Skip redirection after signout */
  skipRedirect?: boolean;
  /** Force complete signout even if backend revocation fails (defaults to false) */
  forceCompleteSignout?: boolean;
}

/**
 * Revokes the user's token on the backend
 * 
 * IMPORTANT: This is a stub implementation that should be replaced when
 * connecting to a real backend. The real implementation should:
 * 1. Get the current authentication token
 * 2. Make an API call to the backend's token revocation endpoint
 * 3. Handle the response appropriately
 * 
 * @returns Promise resolving to true if token was successfully revoked
 */
async function revokeTokenOnBackend(): Promise<boolean> {
  signoutLogger.info('Backend token revocation requested');
  
  // IMPORTANT: REPLACE THIS IMPLEMENTATION when connecting to a backend
  // The following is a stub that simulates a successful token revocation
  
  signoutLogger.info(
    '⚠️ Using stub implementation of revokeTokenOnBackend. ' +
    'Replace this with actual backend call when connecting to a backend service.'
  );
  
  // Simulate successful token revocation
  // When implementing a real backend connection:
  // 1. Get the current ID token: const token = await tokenService.getToken();
  // 2. Call your backend API: await fetch('/api/auth/revoke', { 
  //      method: 'POST', 
  //      headers: { Authorization: `Bearer ${token}` } 
  //    });
  // 3. Handle the response and return true if successful

  // Artificial delay to simulate network request (remove in real implementation)
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return true;
}

/**
 * Signs out the current user, optionally revoking their token on the backend first
 * 
 * The signout process follows these steps:
 * 1. Revoke the token on the backend (if a backend is connected)
 * 2. Sign out from Firebase authentication
 * 3. Clear local token state
 * 4. Publish logout event
 * 5. Redirect to the sign in page (if not skipped)
 * 
 * @param options Signout options
 * @returns Promise that resolves when signout is complete
 * @throws SignoutError if signout fails
 */
export async function signout(options: SignoutOptions = {}): Promise<void> {
  const startTime = Date.now();
  signoutLogger.info('Starting signout process', { options });
  
  try {
    // Step 1: Revoke token on backend if not skipped
    if (!options.skipBackendRevocation) {
      try {
        const revoked = await revokeTokenOnBackend();
        if (!revoked && !options.forceCompleteSignout) {
          throw new SignoutError('Failed to revoke token on backend', { 
            source: 'backend',
            userMessage: 'Failed to securely sign you out. Please try again.'
          });
        }
      } catch (error) {
        // Log the backend revocation error
        signoutLogger.error('Backend token revocation failed', error instanceof Error ? error : new Error(String(error))); // Argument of type 'unknown' is not assignable to parameter of type 'Error | undefined'.
        
        // If force complete is not enabled, throw to abort the signout
        if (!options.forceCompleteSignout) {
          throw new SignoutError('Backend token revocation failed', {
            source: 'backend',
            originalError: error instanceof Error ? error : undefined,
            userMessage: 'Failed to securely sign you out. Please try again.'
          });
        }
        
        // If force complete is enabled, log warning and continue
        signoutLogger.warn(
          'Continuing signout despite backend revocation failure (force complete enabled)'
        );
      }
    }
    
    // Step 2: Sign out from Firebase
    try {
      await signOutUser();
      signoutLogger.info('Firebase signout successful');
    } catch (error) {
      // Handle Firebase signout error
      const firebaseError = processFirebaseError(
        error, 
        'Firebase signout failed', 
        { action: 'auth/sign-out' }
      );
      
      signoutLogger.error('Firebase signout failed', firebaseError);
      
      throw new SignoutError('Firebase signout failed', {
        source: 'firebase',
        originalError: firebaseError,
        userMessage: firebaseError.userMessage || 'Failed to sign you out. Please try again.'
      });
    }
    
    // Step 3: Clear local token state
    try {
      tokenService.clearTokenState();
      signoutLogger.info('Token state cleared');
    } catch (error) {
      // Log token clearing error but continue (non-fatal)
      signoutLogger.warn('Failed to clear token state', error instanceof Error ? error : new Error(String(error))); // Argument of type 'unknown' is not assignable to parameter of type 'Error | undefined'.
    }
    
    // Step 4: Publish logout event
    publish(AUTH_EVENTS.LOGOUT, {}, 'SignoutUtility');
    
    // Step 5: Redirect to logged out page (if not skipped)
    if (!options.skipRedirect) {
      const redirectUrl = options.redirectUrl || AUTH_ROUTES.LOGGED_OUT;
      signoutLogger.info('Redirecting after signout', { redirectUrl });
      
      // Use direct navigation for reliability with replace to force a full page reload
      // Add timestamp parameter to prevent caching and ensure clean state
      const separator = redirectUrl.includes('?') ? '&' : '?';
      window.location.replace(`${redirectUrl}${separator}logout=true&ts=${Date.now()}`);
    }
    
    const duration = Date.now() - startTime;
    signoutLogger.info(`Signout completed successfully in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const normalizedError = normalizeError(
      error, 
      'Signout failed', 
      {
        category: 'auth',
        userMessage: 'Failed to sign you out completely. Please try again.',
        context: { 
          durationMs: duration,
          errorSource: error instanceof SignoutError ? error.source : 'general'
        }
      }
    );
    
    signoutLogger.error(`Signout failed after ${duration}ms`, normalizedError);
    throw normalizedError;
  }
}

/**
 * Safe version of signout with error handling
 */
export const safeSignout = withErrorHandling(signout);

/**
 * Default export for convenient imports
 */
export default {
  signout,
  safeSignout
};