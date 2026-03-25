/**
 * src/lib/services/auth/auth.service.ts
 * Authentication Service
 * 
 * Core service for managing authentication state and operations:
 * - Initializing and managing auth state
 * - Integrating with Firebase Auth
 * - Connecting email link and phone authentication methods
 * - Integrating with token service
 * - Emitting auth-related events
 */

import { get } from 'svelte/store';
import { 
  getFirebaseAuth,
  safeGetCurrentUser,
  subscribeToAuthChanges,
  signOutUser,
  processFirebaseError
} from '@xbg.solutions/frontend-core';
import { loggerService } from '@xbg.solutions/frontend-core';
import { tokenService } from '../token/token.service';
import { publish, subscribe } from '@xbg.solutions/frontend-core';
import { AppError, normalizeError, withErrorHandling } from '@xbg.solutions/frontend-core';
import { authStore, type AuthMethod } from '../../stores/auth.store';
import { AUTH_EVENTS, AUTH_ROUTES_LEGACY as AUTH_ROUTES, CREATE_AUTH_USER_ON_FIRST_SIGNIN } from '@xbg.solutions/frontend-core';
import { extractClaims } from '../../utils/tokens';
import { goto } from '$app/navigation';

// Import authentication method services
import emailLinkService from './email-link';
import phoneAuthService from './phone-auth';

// Import auth types
import type { EmailLinkOptions, EmailLinkVerifyOptions, AuthResult } from '@xbg.solutions/frontend-core';

// Create a context-aware logger
const authLogger = loggerService.withContext('AuthService');

/**
 * Creates an auth service instance
 * @returns Auth service instance
 */
export function createAuthService() {
  // Auth state change unsubscribe function
  let unsubscribeFromAuthChanges: (() => void) | null = null;
  
  // Event subscriptions
  let eventSubscriptions: (() => void)[] = [];
  
  /**
   * Initializes the auth service
   * @returns A promise that resolves when initialization is complete
   */
  const initialize = async (): Promise<void> => {
    authLogger.info('Initializing auth service');
    
    // Initialize store with default state
    authStore.update(state => ({
      ...state,
      isInitialized: false,
      isInitializing: true,
      error: null
    }));
    
    try {
      // Check for an existing user
      const { success, data: currentUser } = await safeGetCurrentUser();
      
      if (success && currentUser) {
        // Get ID token from Firebase
        const idToken = await currentUser.getIdToken();
        
        // Process token through token service
        await tokenService.processToken(idToken);
        
        // Extract claims from token
        const claims = extractClaims(idToken);
        
        // Try to extract custom attributes from user object directly
        try {
          const userObj = currentUser.toJSON ? currentUser.toJSON() : currentUser;
          
          // Cast to any to access potential Firebase-specific properties 
          // that may not be in the type definition
          const userObjAny = userObj as any;
          
          // Check for customAttributes
          if (userObjAny.customAttributes) {
            const customAttrs = typeof userObjAny.customAttributes === 'string'
              ? JSON.parse(userObjAny.customAttributes)
              : userObjAny.customAttributes;
              
            Object.assign(claims, customAttrs);
            authLogger.info('Initial setup: Added custom attributes from user.customAttributes');
          }
          
          // Check for customClaims
          if (userObjAny.customClaims) {
            const customClaims = typeof userObjAny.customClaims === 'string'
              ? JSON.parse(userObjAny.customClaims)
              : userObjAny.customClaims;
              
            Object.assign(claims, customClaims);
            authLogger.info('Initial setup: Added custom claims from user.customClaims');
          }
        } catch (e) {
          authLogger.warn('Initial setup: Failed to extract additional custom attributes', {
            error: e instanceof Error ? e.message : String(e)
          });
        }
        
        // Determine auth method
        const authMethod = determineAuthMethod(currentUser);
        
        // Update auth store
        authStore.update(state => ({
          ...state,
          isAuthenticated: true,
          user: currentUser,
          claims,
          authMethod,
          lastAuthenticated: Date.now()
        }));
        
        // Emit auth state changed event
        publishAuthStateChange();
      }
      
      // Subscribe to Firebase auth state changes
      setupAuthStateListener();
      
      // Subscribe to relevant events
      registerEventListeners();
      
      // Mark as initialized
      authStore.update(state => ({
        ...state,
        isInitialized: true,
        isInitializing: false
      }));
      
      authLogger.info('Auth service initialized');
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to initialize auth service');
      
      authLogger.error('Auth service initialization failed', normalizedError);
      
      // Update store with error
      authStore.update(state => ({
        ...state,
        isInitialized: false,
        isInitializing: false,
        error: normalizedError
      }));
      
      // Re-throw error for upstream handling
      throw normalizedError;
    }
  };
  
  /**
   * Sets up listener for Firebase Auth state changes
   */
  const setupAuthStateListener = (): void => {
    // Clear any existing subscription
    if (unsubscribeFromAuthChanges) {
      unsubscribeFromAuthChanges();
      unsubscribeFromAuthChanges = null;
    }
    
    try {
      // Subscribe to auth state changes - convert to async IIFE
      (async () => {
        const unsubscribe = await subscribeToAuthChanges(async (user) => {
          authLogger.info('Auth state changed', { isAuthenticated: !!user });
          
          if (user) {
          // User is signed in
          try {
            // Get fresh ID token
            const idToken = await user.getIdToken();
            
            // Process the token through token service
            await tokenService.processToken(idToken);
            
            // Extract claims from the token
            const claims = extractClaims(idToken);
            
            // Attempt to extract custom attributes directly from the user object if available
            try {
              // Check if the user object has custom claims data we can access directly
              const userObj = user.toJSON ? user.toJSON() : user;
              
              // Cast to any to access potential Firebase-specific properties
              const userObjAny = userObj as any;
              
              // Look for customAttributes or customClaims that might be in the user object
              if (userObjAny.customAttributes) {
                const customAttrs = typeof userObjAny.customAttributes === 'string' 
                  ? JSON.parse(userObjAny.customAttributes) 
                  : userObjAny.customAttributes;
                  
                Object.assign(claims, customAttrs);
                authLogger.info('Added custom attributes from user.customAttributes');
              }
              
              // Firebase sometimes stores custom claims here too
              if (userObjAny.customClaims) {
                const customClaims = typeof userObjAny.customClaims === 'string' 
                  ? JSON.parse(userObjAny.customClaims) 
                  : userObjAny.customClaims;
                  
                Object.assign(claims, customClaims);
                authLogger.info('Added custom claims from user.customClaims');
              }
            } catch (e) {
              authLogger.warn('Failed to extract additional custom attributes', { 
                error: e instanceof Error ? e.message : String(e)
              });
            }
            
            // Determine auth method
            const authMethod = determineAuthMethod(user);
            
            // Update auth store
            authStore.update(state => ({
              ...state,
              isAuthenticated: true,
              user,
              claims,
              authMethod,
              lastAuthenticated: Date.now(),
              isLoading: false,
              error: null
            }));
            
            // Publish state change event
            publishAuthStateChange();
            
            // Publish login success event
            publish(AUTH_EVENTS.LOGIN_SUCCESS, {
              user,
              claims,
              method: authMethod
            }, 'AuthService');
          } catch (error) {
            authLogger.error(
              'Failed to process authentication token',
              error instanceof Error ? error : new Error(String(error))
            );
          }
        } else {
          // User is signed out
          // Clear token state
          tokenService.clearTokenState();
          
          // Update auth store
          authStore.update(state => ({
            ...state,
            isAuthenticated: false,
            user: null,
            claims: null,
            authMethod: null,
            isLoading: false
          }));
          
          // Publish state change event
          publishAuthStateChange();
        }
      });
        
        // Assign the unsubscribe function to our module variable
        unsubscribeFromAuthChanges = unsubscribe;
      })().catch(error => {
        authLogger.error(
          'Failed to set up auth state listener async initialization',
          error instanceof Error ? error : new Error(String(error))
        );
      });
    } catch (error) {
      authLogger.error(
        'Failed to set up auth state listener',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };
  
  /**
   * Registers event listeners for auth-related events
   */
  const registerEventListeners = (): void => {
    // Clear any existing subscriptions
    unregisterEventListeners();
    
    // Subscribe to relevant events
    eventSubscriptions = [
      // Listen for logout events to sign out from Firebase
      subscribe(AUTH_EVENTS.LOGOUT, handleLogoutEvent)
    ];
  };
  
  /**
   * Unregisters all event listeners
   */
  const unregisterEventListeners = (): void => {
    // Call all unsubscribe functions
    eventSubscriptions.forEach(unsubscribe => unsubscribe());
    eventSubscriptions = [];
  };
  
  /**
   * Handles logout events
   */
  const handleLogoutEvent = async (): Promise<void> => {
    await logout();
  };
  
  /**
   * Determines the authentication method used by a user
   * @param user Firebase user object
   * @returns The authentication method used
   */
  const determineAuthMethod = (user: any): AuthMethod => {
    if (!user) return null;
    
    // Check the providerData array to determine the auth method
    const providers = user.providerData || [];
    
    if (providers.length === 0) {
      // User authenticated with a link without a provider record
      return 'emailLink';
    }
    
    const provider = providers[0] || {};
    const providerId = provider.providerId;
    
    if (providerId === 'phone') {
      return 'phoneNumber';
    } else if (providerId === 'password' || providerId === 'email') {
      return 'emailLink';
    } else {
      // External providers (Google, Facebook, etc.)
      return 'federation';
    }
  };

  /**
   * Quick little guard to check if the error has a firebaseCode
   */
  function hasFirebaseCode(error: any): error is { firebaseCode: string } {
    return error && typeof error.firebaseCode === 'string';
  }
  
  /**
   * Publishes auth state change event
   */
  const publishAuthStateChange = (): void => {
    const state = get(authStore);
    
    publish(AUTH_EVENTS.STATE_CHANGED, {
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      claims: state.claims,
      authMethod: state.authMethod
    }, 'AuthService');
  };
  
  /**
   * Sends an authentication link to an email address
   * @param email Email address to send link to
   * @param options Additional options for email link authentication
   * @returns Promise resolving to authentication result
   */
  const sendEmailLink = async (email: string, options = {}): Promise<AuthResult> => {
    authStore.update(state => ({ ...state, isLoading: true }));
    
    try {
      const result = await emailLinkService.sendEmailLink({
        email,
        ...options,
        rememberEmail: true
      } as EmailLinkOptions);
      
      authStore.update(state => ({ ...state, isLoading: false }));
      return result;
    } catch (error) {
      authStore.update(state => ({ 
        ...state, 
        isLoading: false,
        error: normalizeError(error, 'Failed to send email link')
      }));
      throw error;
    }
  };
  
  /**
   * Verifies an email authentication link
   * @param options Options for email link verification
   * @returns Promise resolving to authentication result
   */
  const verifyEmailLink = async (options: EmailLinkVerifyOptions = {}): Promise<AuthResult> => {
    authLogger.info('Verifying email link with options', { returnUrl: options.returnUrl });
    authStore.update(state => ({ ...state, isLoading: true }));
    
    try {
      const result = await emailLinkService.verifyEmailLink(options);
      
      // Auth state will be updated by Firebase auth state change listener
      authStore.update(state => ({ ...state, isLoading: false }));
      
      // If already authenticated but got an invalid action code error,
      // it might be a reload after successful verification
      if (!result.success && 
        result.error && hasFirebaseCode(result.error) && 
        result.error.firebaseCode === 'auth/invalid-action-code' && 
        isAuthenticated()) {
        
        authLogger.info('Link already used but user is authenticated, redirecting');
        
        // Convert string-based returnUrl to a proper URL object if needed
        let targetRoute = options.returnUrl || AUTH_ROUTES.SUCCESS;
        
        // If targetRoute starts with protected, replace with protected
        if (targetRoute.startsWith('/protected')) {
          targetRoute = targetRoute.replace('/protected', '/protected');
        }
        
        // Redirect to the protected area
        setTimeout(() => {
          goto(targetRoute);
        }, 100);
        
        return {
          success: true,
          method: 'emailLink'
        };
      }
      
      // Normal success flow
      if (result.success) {
        // Convert string-based returnUrl to a proper URL object if needed
        let targetRoute = options.returnUrl || AUTH_ROUTES.SUCCESS;
        
        // If targetRoute starts with protected, replace with protected
        if (targetRoute.startsWith('/protected')) {
          targetRoute = targetRoute.replace('/protected', '/protected');
        }
        
        authLogger.info('Email link verification successful, redirecting to', { targetRoute });
        
        // Add a small delay to ensure auth state is fully processed
        setTimeout(() => {
          goto(targetRoute);
        }, 100);
      } else {
        authLogger.warn('Email link verification failed', { error: result.error });
      }
      
      return result;
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to verify email link');
      authLogger.error('Error verifying email link', normalizedError);
      
      authStore.update(state => ({
        ...state,
        isLoading: false,
        error: normalizedError
      }));
      
      // Don't redirect to unauthorized page for invalid-action-code errors if user is authenticated
      if (hasFirebaseCode(normalizedError) && 
      normalizedError.firebaseCode === 'auth/invalid-action-code' && 
      isAuthenticated()) {
        // This is likely a page reload after successful verification
        return {
          success: false,
          error: normalizedError,
          method: 'emailLink'
        };
      }
      
      // Navigate to unauthorized route on failure
      goto(AUTH_ROUTES.UNAUTHORIZED);
      
      throw error;
    }
  };
  
  /**
   * Sends a verification code to a phone number
   * @param phoneNumber Phone number to send code to
   * @param recaptchaVerifier reCAPTCHA verifier instance
   * @returns Promise resolving to object with verificationId
   */
  const sendPhoneCode = async (phoneNumber: string, recaptchaVerifier: any): Promise<any> => {
    authStore.update(state => ({ ...state, isLoading: true }));
    
    try {
      const result = await phoneAuthService.sendPhoneCode({
        phoneNumber,
        recaptchaVerifier
      });
      
      authStore.update(state => ({ ...state, isLoading: false }));
      return result;
    } catch (error) {
      authStore.update(state => ({
        ...state,
        isLoading: false,
        error: normalizeError(error, 'Failed to send phone verification code')
      }));
      throw error;
    }
  };
  
  /**
   * Verifies a phone code and signs in the user
   * @param verificationCode Verification code received by SMS
   * @param verificationId Verification ID received when sending the code
   * @returns Promise resolving to authentication result
   */
  const verifyPhoneCode = async (verificationCode: string, verificationId: string): Promise<any> => {
    authStore.update(state => ({ ...state, isLoading: true }));
    
    try {
      const result = await phoneAuthService.verifyPhoneCode({
        verificationCode,
        verificationId
      });
      
      // Auth state will be updated by Firebase auth state change listener
      authStore.update(state => ({ ...state, isLoading: false }));
      
      // Navigate to success route if verification was successful
      if (result.success) {
        goto(AUTH_ROUTES.SUCCESS);
      }
      
      return result;
    } catch (error) {
      authStore.update(state => ({
        ...state,
        isLoading: false,
        error: normalizeError(error, 'Failed to verify phone code')
      }));
      
      // Navigate to unauthorized route on failure
      goto(AUTH_ROUTES.UNAUTHORIZED);
      
      throw error;
    }
  };
  
  /**
   * Logs out the current user
   * @returns Promise resolving when logout is complete
   */
  const logout = async (): Promise<void> => {
    authStore.update(state => ({ ...state, isLoading: true }));
    
    try {
      // Clear stored email before Firebase signout
      // This ensures email is cleared even if Firebase signout fails
      try {
        // Using direct import reference instead of dynamic import
        const { clearStoredEmail } = await import('../auth/email-link');
        
        // Use the consistent clearStoredEmail function that handles all storage types
        const cleared = clearStoredEmail();
        authLogger.info('Cleared stored email during logout', { success: cleared });
      } catch (err) {
        authLogger.warn('Failed to clear stored email during logout', 
          err instanceof Error ? err : new Error(String(err))
        );
      }
      
      // Publish logout event BEFORE signout
      // This ensures subscribers react before Firebase changes state
      publish(AUTH_EVENTS.LOGOUT, {}, 'AuthService');
      authLogger.info('Published logout event');
      
      // Sign out from Firebase
      await signOutUser();
      authLogger.info('Firebase signout successful');
      
      // Update auth store immediately, don't wait for listener
      // This makes the UI respond immediately
      authStore.update(state => ({ 
        ...state, 
        isLoading: false,
        isAuthenticated: false,
        user: null,
        claims: null,
        authMethod: null
      }));
      
      // Navigate to logged out page
      // Use window.location.replace for deterministic navigation
      // with a timestamp parameter to prevent caching
      authLogger.info('Redirecting to logged out page');
      
      // Force reload to ensure all state is cleared
      window.location.replace(`/?logout=true&ts=${Date.now()}`);
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to log out');
      
      authLogger.error('Logout failed', normalizedError);
      
      authStore.update(state => ({
        ...state,
        isLoading: false,
        error: normalizedError
      }));
      
      // Force navigation even after error - using replace for a full reload
      // Add error parameter to help with debugging
      window.location.replace(`/?logout=true&error=1&ts=${Date.now()}`);
      
      throw normalizedError;
    }
  };
  
  /**
   * Checks if a user is authenticated
   * @returns Whether the user is authenticated
   */
  const isAuthenticated = (): boolean => {
    return get(authStore).isAuthenticated;
  };
  
  /**
   * Gets the current user
   * @returns The current user or null if not authenticated
   */
  const getCurrentUser = () => {
    return get(authStore).user;
  };
  
  /**
   * Gets the current user claims
   * @returns The current user claims or null if not authenticated
   */
  const getUserClaims = () => {
    return get(authStore).claims;
  };
  
  /**
   * Checks if the current user has a specific role
   * @param role Role to check for
   * @returns Whether the user has the specified role
   */
  const userHasRole = (role: string): boolean => {
    const claims = getUserClaims();
    if (!claims || !claims.roles) return false;
    
    return Array.isArray(claims.roles)
      ? claims.roles.includes(role)
      : claims.roles === role;
  };
  
  /**
   * Checks if the current user has any of the specified roles
   * @param roles Roles to check for
   * @returns Whether the user has any of the specified roles
   */
  const userHasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => userHasRole(role));
  };
  
  /**
   * Destroys the auth service instance
   * This should be called when the application is shutting down
   */
  const destroy = (): void => {
    // Unsubscribe from auth changes
    if (unsubscribeFromAuthChanges) {
      unsubscribeFromAuthChanges();
      unsubscribeFromAuthChanges = null;
    }
    
    // Unregister event listeners
    unregisterEventListeners();
    
    authLogger.info('Auth service destroyed');
  };
  
  // Return the public API
  return {
    initialize,
    sendEmailLink,
    verifyEmailLink,
    sendPhoneCode,
    verifyPhoneCode,
    logout,
    isAuthenticated,
    getCurrentUser,
    getUserClaims,
    userHasRole,
    userHasAnyRole,
    destroy
  };
}

/**
 * Create a singleton instance of the auth service
 */
export const authService = createAuthService();

/**
 * Safe version of sending email link with error handling
 */
export const safeSendEmailLink = withErrorHandling(
  async (email: string, options = {}) => authService.sendEmailLink(email, options)
);

/**
 * Safe version of verifying email link with error handling
 */
export const safeVerifyEmailLink = withErrorHandling(
  async (options: EmailLinkVerifyOptions = {}) => authService.verifyEmailLink(options)
);

/**
 * Safe version of sending phone code with error handling
 */
export const safeSendPhoneCode = withErrorHandling(
  async (phoneNumber: string, recaptchaVerifier: any) => 
    authService.sendPhoneCode(phoneNumber, recaptchaVerifier)
);

/**
 * Safe version of verifying phone code with error handling
 */
export const safeVerifyPhoneCode = withErrorHandling(
  async (verificationCode: string, verificationId: string) => 
    authService.verifyPhoneCode(verificationCode, verificationId)
);

/**
 * Safe version of logout with error handling
 */
export const safeLogout = withErrorHandling(
  async () => authService.logout()
);