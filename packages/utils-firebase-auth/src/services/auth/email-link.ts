/**
 * src/lib/services/auth/email-link.ts
 * Email Link Authentication service
 * 
 * Provides functionality for Firebase Email Link authentication:
 * - Sending authentication links
 * - Verifying links
 * - Managing email persistence
 * - Error handling specific to email link flow
 */

import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  getAuth
} from 'firebase/auth';
import { getFirebaseAuth, getFirebaseState, processFirebaseError } from '@xbg.solutions/frontend-core';
import { secureStorage } from '@xbg.solutions/utils-secure-storage';
import { loggerService } from '@xbg.solutions/frontend-core';
import { publish } from '@xbg.solutions/frontend-core';
import { AppError, handleError, normalizeError, withErrorHandling } from '@xbg.solutions/frontend-core';
import { AUTH_EVENTS, AUTH_CONFIG, CREATE_AUTH_USER_ON_FIRST_SIGNIN } from '@xbg.solutions/frontend-core';
import { AUTH_NAMESPACE, EMAIL_FOR_SIGN_IN_KEY } from '@xbg.solutions/utils-secure-storage';
import type { EmailLinkOptions, EmailLinkVerifyOptions, AuthResult } from '@xbg.solutions/frontend-core';

// Create a context-aware logger
const emailLinkLogger = loggerService.withContext('EmailLinkService');

// Constants for verification tracking
const VERIFICATION_ATTEMPT_KEY = 'email_verification_attempt';

/**
 * Tracks a verification attempt to prevent loops and handle reloads properly
 */
function trackVerificationAttempt(oobCode: string): void {
  // Get existing attempt data if any
  const existing = secureStorage.getItem<{
    timestamp: number,
    oobCode: string,
    attempts: number
  }>(VERIFICATION_ATTEMPT_KEY, {
    namespace: AUTH_NAMESPACE,
    mechanism: 'localStorage'
  });

  if (existing && existing.oobCode === oobCode) {
    // Update attempts count for existing verification
    secureStorage.setItem(VERIFICATION_ATTEMPT_KEY, {
      timestamp: Date.now(),
      oobCode,
      attempts: existing.attempts + 1
    }, {
      namespace: AUTH_NAMESPACE,
      mechanism: 'localStorage',
      ttl: 300 // 5 minutes
    });
  } else {
    // First attempt for this verification code
    secureStorage.setItem(VERIFICATION_ATTEMPT_KEY, {
      timestamp: Date.now(),
      oobCode,
      attempts: 1
    }, {
      namespace: AUTH_NAMESPACE,
      mechanism: 'localStorage',
      ttl: 300 // 5 minutes
    });
  }
}

/**
 * Gets information about the current verification attempt
 */
function getVerificationAttempt(oobCode?: string): {
  isRepeat: boolean,
  attempts: number,
  oobCode?: string
} {
  if (!oobCode) {
    return { isRepeat: false, attempts: 0 };
  }

  const stored = secureStorage.getItem<{
    timestamp: number,
    oobCode: string,
    attempts: number
  }>(VERIFICATION_ATTEMPT_KEY, {
    namespace: AUTH_NAMESPACE,
    mechanism: 'localStorage',
    fallbackMechanisms: ['sessionStorage'] // Added fallback for backward compatibility
  });

  if (stored && stored.oobCode === oobCode) {
    return {
      isRepeat: true,
      attempts: stored.attempts,
      oobCode: stored.oobCode
    };
  }

  return { isRepeat: false, attempts: 0 };
}

/**
 * Sends an email authentication link
 * 
 * @param options Email link configuration options
 * @returns Promise resolving to success status
 */
// Helper function that will be reimplemented in the future
export async function checkUserExistsAndCreate(email: string): Promise<boolean> {
  // Feature currently disabled, always return true to continue normal flow
  emailLinkLogger.info('User creation on first sign-in is disabled');
  return true;
}

export async function sendEmailLink(options: EmailLinkOptions): Promise<AuthResult> {
  const timerId = emailLinkLogger.startTimer('sendEmailLink');
  
  try {
    emailLinkLogger.info('Sending email authentication link', { email: options.email });
    
    // Auto-creation is disabled, but we'll keep the infrastructure for future reimplementation
    // This section will be reimplemented differently in the future
    
    const auth = await getFirebaseAuth();
    
    // Prepare action code settings
    const actionCodeSettings = options.actionCodeSettings || {
      url: AUTH_CONFIG.DEFAULT_EMAIL_LINK_REDIRECT,
      handleCodeInApp: true
    };
    
    // Send the email link
    await sendSignInLinkToEmail(auth, options.email, actionCodeSettings);
    
    // Store the email if requested
    if (options.rememberEmail !== false) {
      try {
        // Use our standardized storeEmail function to ensure consistency
        const success = storeEmail(options.email);
        
        if (success) {
          emailLinkLogger.info('Successfully stored email for authentication');
        } else {
          emailLinkLogger.warn('Failed to store email using storeEmail function');
        }
      } catch (err) {
        emailLinkLogger.warn('Error storing email', err instanceof Error ? err : new Error(String(err)));
      }
    }
    
    // Publish event
    publish(AUTH_EVENTS.EMAIL_LINK_SENT, {
      email: options.email,
      context: { timestamp: Date.now() }
    }, 'EmailLinkService');
    
    emailLinkLogger.endTimer(timerId, { success: true });
    
    return {
      success: true,
      method: 'emailLink'
    };
  } catch (error) {
    emailLinkLogger.endTimer(timerId, { success: false });
    
    const processedError = processFirebaseError(
      error,
      'Failed to send email authentication link',
      { 
        action: 'auth/email-link-send',
        userMessage: 'We couldn\'t send the authentication link. Please check your email address and try again.'
      }
    );
    
    emailLinkLogger.error('Email link sending failed', processedError, {
      email: options.email
    });
    
    // Publish failure event
    publish(AUTH_EVENTS.LOGIN_FAILURE, {
      error: {
        message: processedError.message,
        code: processedError.firebaseCode
      },
      method: 'emailLink',
      context: { email: options.email }
    }, 'EmailLinkService');
    
    return {
      success: false,
      error: processedError,
      method: 'emailLink'
    };
  }
}

/**
 * Verifies an email authentication link and signs in the user
 * 
 * @param options Email link verification options
 * @returns Promise resolving to authentication result
 */
export async function verifyEmailLink(options: EmailLinkVerifyOptions = {}): Promise<AuthResult> {
  const timerId = emailLinkLogger.startTimer('verifyEmailLink');
  
  try {
    // Publish verification start event
    publish(AUTH_EVENTS.EMAIL_LINK_VERIFICATION_START, {
      context: { timestamp: Date.now() }
    }, 'EmailLinkService');
    
    const auth = await getFirebaseAuth();
    
    // Get the email link
    const link = options.link || window.location.href;
    
    // Extract oobCode from link for verification tracking
    let oobCode: string | null = null;
    try {
      const url = new URL(link);
      oobCode = url.searchParams.get('oobCode');
      
      if (oobCode) {
        // Track this verification attempt
        trackVerificationAttempt(oobCode);
        
        // Check for potential reload loops
        const verificationAttempt = getVerificationAttempt(oobCode);
        if (verificationAttempt.attempts > 5) {
          emailLinkLogger.warn('Excessive verification attempts detected', {
            attempts: verificationAttempt.attempts,
            oobCode
          });
          
          // Don't throw an error here, continue with verification
          // but log the warning
        }
      }
    } catch (e) {
      // If URL parsing fails, just continue without tracking
      emailLinkLogger.warn('Failed to extract oobCode for tracking', {
        error: e instanceof Error ? e.message : String(e)
      });
    }
    
    // Check if the link is valid
    if (!isSignInWithEmailLink(auth, link)) {
      const error = new AppError('Invalid email link', {
        category: 'auth',
        userMessage: 'The authentication link is invalid. Please request a new link.',
        context: { link }
      });
      
      emailLinkLogger.error('Email link verification failed', error);
      
      // Publish failure event
      publish(AUTH_EVENTS.EMAIL_LINK_VERIFICATION_FAILURE, {
        error: {
          message: error.message,
          code: undefined
        },
        method: 'emailLink'
      }, 'EmailLinkService');
      
      return {
        success: false,
        error,
        method: 'emailLink'
      };
    }
    
    // Get the email address
    let email = options.email;
    
    if (!email) {
      // Try to get email from secure storage - first from localStorage, then from sessionStorage
      const storedEmail = secureStorage.getItem<string>(EMAIL_FOR_SIGN_IN_KEY, {
        namespace: AUTH_NAMESPACE,
        mechanism: 'localStorage',
        fallbackMechanisms: ['sessionStorage'] // Added fallback for backward compatibility
      });
      
      // IMPORTANT: We don't accept email from URL for security reasons
      // Check for stored email
      if (!storedEmail) {
        const error = new AppError('Email not found', {
          category: 'auth',
          userMessage: 'Please provide the email address you used to request the link.',
          context: { link }
        });
        
        emailLinkLogger.error('Email link verification failed', error);
        
        // Publish failure event
        publish(AUTH_EVENTS.EMAIL_LINK_VERIFICATION_FAILURE, {
          error: {
            message: error.message,
            code: undefined
          },
          method: 'emailLink'
        }, 'EmailLinkService');
        
        return {
          success: false,
          error,
          method: 'emailLink'
        };
      }
      
      email = storedEmail;
    }
    
    emailLinkLogger.info('Verifying email link', { 
      email,
      link,
      isValid: isSignInWithEmailLink(auth, link) 
    });
    
    // Sign in with the email link
    console.log('Attempting to sign in with:', { email, link });
    const credential = await signInWithEmailLink(auth, email, link);
    const user = credential.user;
    
    // Check verification attempt count before cleaning up email
    const verificationAttempt = getVerificationAttempt(oobCode ?? undefined);
    
    // IMPORTANT: Keep email until token verification is complete
    // Don't remove the email immediately to avoid issues with session establishment
    // We'll use a short TTL as a fallback in case the token event never triggers
    
    // Keep the email temporarily to ensure token verification completes
    // NOTE: The Firebase token will be the source of truth for authentication,
    // not the email in storage. The token persists via Firebase's own mechanisms.
    try {
      // Use our standard storage mechanism for consistency
      // This is just for temporary storage until the token is established
      window.localStorage.setItem('emailForSignIn', email);
      
      // Also store in memory as a backup
      secureStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email, {
        namespace: AUTH_NAMESPACE,
        mechanism: 'memory',
        ttl: 300 // 5 minutes as fallback if token event doesn't trigger
      });
      
      emailLinkLogger.info('Keeping email in storage until token is established', {
        email,
        attempts: verificationAttempt.attempts
      });
    } catch (err) {
      emailLinkLogger.warn('Error keeping email in storage during verification', 
        err instanceof Error ? err : new Error(String(err))
      );
      // Non-fatal error, continue with verification
    }
    
    // DETERMINISTIC CLEANUP WITH MULTIPLE FALLBACKS
    
    // Approach 1: Immediate cleanup attempt as soon as we have a successful login
    // This is the primary deterministic cleanup
    try {
      // If we've already successfully signed in, we can clear immediately
      const auth = getAuth();
      if (auth && auth.currentUser) {
        emailLinkLogger.info('User already authenticated, clearing stored email immediately');
        clearStoredEmail();
      }
    } catch (e) {
      emailLinkLogger.warn('Error during immediate cleanup check', e instanceof Error ? e : new Error(String(e)));
    }
    
    // Approach 2: Delayed cleanup after token processing is complete
    // This is for cases where auth state takes a moment to propagate
    setTimeout(() => {
      try {
        const auth = getAuth();
        if (auth && auth.currentUser) {
          emailLinkLogger.info('User authenticated after delay, clearing stored email');
          clearStoredEmail();
        } else {
          emailLinkLogger.info('No authenticated user found after delay, email will be cleared by TTL');
        }
      } catch (err) {
        emailLinkLogger.warn('Error checking auth state after verification delay', 
          err instanceof Error ? err : new Error(String(err))
        );
      }
    }, 2000); // Wait 2 seconds to ensure token processing is complete
    
    // Approach 3: Subscribe to auth state changes
    // This catches auth state changes that might happen after our timeouts
    try {
      const unsubscribe = getAuth().onAuthStateChanged((user) => {
        if (user) {
          emailLinkLogger.info('Auth state changed to authenticated, clearing stored email');
          clearStoredEmail();
          // Cleanup subscription after first auth state change
          unsubscribe();
        }
      });
      
      // Ensure the subscription is cleaned up after a reasonable time
      setTimeout(() => {
        try {
          unsubscribe();
          emailLinkLogger.info('Cleaned up auth state subscription');
        } catch (e) {
          // Ignore any errors in unsubscribe
        }
      }, 5000); // 5 seconds should be more than enough time for auth to complete
    } catch (e) {
      emailLinkLogger.warn('Could not set up auth state change listener', e instanceof Error ? e : new Error(String(e)));
    }
    
    // Approach 4: TTL-based cleanup
    // The memory storage already has a TTL of 300 seconds (5 minutes)
    // For localStorage, we'll add a timestamp that our getStoredEmail function can check
    try {
      // Add expiration timestamp to localStorage
      const expiresAt = Date.now() + (300 * 1000); // 5 minutes
      window.localStorage.setItem('emailForSignIn_expiresAt', expiresAt.toString());
      emailLinkLogger.info('Added expiration timestamp to email storage as final fallback');
    } catch (e) {
      // Not critical, the other cleanup methods should work
    }
    
    // Publish success event
    publish(AUTH_EVENTS.EMAIL_LINK_VERIFICATION_SUCCESS, {
      user,
      method: 'emailLink',
      context: { email }
    }, 'EmailLinkService');
    
    emailLinkLogger.endTimer(timerId, { success: true });
    
    return {
      success: true,
      user,
      credential,
      method: 'emailLink'
    };
  } catch (error) {
    emailLinkLogger.endTimer(timerId, { success: false });
    
    const processedError = processFirebaseError(
      error,
      'Failed to verify email link',
      { 
        action: 'auth/email-link-verify',
        userMessage: 'We couldn\'t verify the authentication link. It may have expired or already been used.'
      }
    );
    
    emailLinkLogger.error('Email link verification failed', processedError);
    
    // Publish failure event
    publish(AUTH_EVENTS.EMAIL_LINK_VERIFICATION_FAILURE, {
      error: {
        message: processedError.message,
        code: processedError.firebaseCode
      },
      method: 'emailLink'
    }, 'EmailLinkService');
    
    return {
      success: false,
      error: processedError,
      method: 'emailLink'
    };
  }
}

/**
 * Safely sends an email authentication link with error handling
 */
export const safeSendEmailLink = withErrorHandling(sendEmailLink);

/**
 * Safely verifies an email authentication link with error handling
 */
export const safeVerifyEmailLink = withErrorHandling(verifyEmailLink);

/**
 * Checks if the current URL is an email sign-in link
 * 
 * @returns Promise resolving to whether the URL is an email sign-in link
 */
export async function isEmailSignInLink(): Promise<boolean> {
  try {
    const auth = await getFirebaseAuth(); // Await the Promise
    const currentUrl = window.location.href;
    
    // Log the check for debugging
    console.log('Checking if URL is email sign-in link:', currentUrl);
    
    const isValid = isSignInWithEmailLink(auth, currentUrl);
    console.log('Firebase reports URL is valid:', isValid);
    
    return isValid;
  } catch (error) {
    emailLinkLogger.error(
      'Failed to check if URL is email sign-in link',
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  }
}

/**
 * Synchronous version that can be used in places where async isn't supported
 * This uses the current auth instance if available, otherwise returns false
 */
export function isEmailSignInLinkSync(): boolean {
  try {
    // Get the current Firebase state without async initialization
    const firebaseState = getFirebaseState();
    
    // If Firebase isn't initialized or has an error, return false
    if (!firebaseState.initialized || firebaseState.error || !firebaseState.auth) {
      return false;
    }
    
    const auth = firebaseState.auth;
    const currentUrl = window.location.href;
    
    return isSignInWithEmailLink(auth, currentUrl);
  } catch (error) {
    emailLinkLogger.error(
      'Failed to check if URL is email sign-in link (sync)',
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  }
}

/**
 * Gets the stored email for sign-in
 * 
 * @returns The stored email or null if not found
 */
export function getStoredEmail(): string | null {
  try {
    let foundEmail = null;
    
    // Primary source: Firebase standard location - localStorage with key 'emailForSignIn'
    try {
      const email = window.localStorage.getItem('emailForSignIn');
      if (email) {
        // Check expiration timestamp if present
        try {
          const expiresAtStr = window.localStorage.getItem('emailForSignIn_expiresAt');
          if (expiresAtStr) {
            const expiresAt = parseInt(expiresAtStr, 10);
            if (!isNaN(expiresAt) && Date.now() > expiresAt) {
              // Email has expired, clean it up
              emailLinkLogger.info('Email in localStorage has expired, clearing it');
              window.localStorage.removeItem('emailForSignIn');
              window.localStorage.removeItem('emailForSignIn_expiresAt');
              // Continue to fallback mechanisms
            } else {
              // Email is still valid
              emailLinkLogger.info('Retrieved valid email from localStorage', { email });
              foundEmail = email;
            }
          } else {
            // No expiration timestamp, assume valid
            emailLinkLogger.info('Retrieved email from localStorage (no expiration)', { email });
            foundEmail = email;
          }
        } catch (e) {
          // Error checking expiration, assume email is valid
          emailLinkLogger.warn('Error checking email expiration', e instanceof Error ? e : new Error(String(e)));
          foundEmail = email;
        }
      }
    } catch (e) {
      emailLinkLogger.warn('Error accessing localStorage', e instanceof Error ? e : new Error(String(e)));
    }
    
    // Return if we found an email
    if (foundEmail) {
      return foundEmail;
    }
    
    // Fallback 1: Try sessionStorage
    try {
      const sessionEmail = window.sessionStorage.getItem('emailForSignIn');
      if (sessionEmail) {
        emailLinkLogger.info('Retrieved email from sessionStorage', { email: sessionEmail });
        
        // Copy to localStorage for Firebase compatibility
        try {
          window.localStorage.setItem('emailForSignIn', sessionEmail);
        } catch (e) {
          // Non-critical error
        }
        
        return sessionEmail;
      }
    } catch (e) {
      emailLinkLogger.warn('Error accessing sessionStorage', e instanceof Error ? e : new Error(String(e)));
    }
    
    // Fallback 2: Try secureStorage with sessionStorage mechanism
    try {
      const secureSessionEmail = secureStorage.getItem<string>(EMAIL_FOR_SIGN_IN_KEY, {
        namespace: AUTH_NAMESPACE,
        mechanism: 'sessionStorage'
      });
      
      if (secureSessionEmail) {
        emailLinkLogger.info('Retrieved email from secure sessionStorage', { email: secureSessionEmail });
        
        // Copy to localStorage for Firebase compatibility
        try {
          window.localStorage.setItem('emailForSignIn', secureSessionEmail);
        } catch (e) {
          // Non-critical error
        }
        
        return secureSessionEmail;
      }
    } catch (e) {
      // Non-critical error
    }
    
    // Fallback 3: Try memory storage
    try {
      const memoryEmail = secureStorage.getItem<string>(EMAIL_FOR_SIGN_IN_KEY, {
        namespace: AUTH_NAMESPACE,
        mechanism: 'memory'
      });
      
      if (memoryEmail) {
        emailLinkLogger.info('Retrieved email from memory storage', { email: memoryEmail });
        // Copy to localStorage for Firebase compatibility
        try {
          window.localStorage.setItem('emailForSignIn', memoryEmail);
        } catch (e) {
          // Non-critical error
        }
        return memoryEmail;
      }
    } catch (e) {
      // Non-critical error
    }
    
    // If we get here, we couldn't find the email anywhere
    emailLinkLogger.info('No stored email found in any storage location');
    return null;
  } catch (error) {
    emailLinkLogger.error(
      'Failed to get stored email',
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Stores an email for sign-in
 * 
 * IMPORTANT: We use localStorage WITHOUT encryption to ensure cross-tab compatibility.
 * This is a necessary security trade-off for email link authentication which requires
 * the email to be available in any tab where the user opens the verification link.
 * 
 * @param email Email to store
 * @returns Whether storage was successful
 */
export function storeEmail(email: string): boolean {
  try {
    let success = false;
    let sessionStorageSuccess = false;
    
    // IMPORTANT: Firebase's email link auth specifically looks for 'emailForSignIn'
    // in localStorage (not in secure storage). This is the standard location where
    // Firebase expects to find the email.
    try {
      // 1. Store in localStorage (Firebase's standard location)
      window.localStorage.setItem('emailForSignIn', email);
      
      // 2. Add expiration timestamp for automatic cleanup
      const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
      window.localStorage.setItem('emailForSignIn_expiresAt', expiresAt.toString());
      
      success = true;
      
      // 3. Also store in sessionStorage as backup
      try {
        window.sessionStorage.setItem('emailForSignIn', email);
        sessionStorageSuccess = true;
      } catch (e) {
        // Non-critical error
      }
      
      emailLinkLogger.info('Stored email directly in localStorage for Firebase compatibility');
    } catch (err) {
      emailLinkLogger.warn('Failed to store email in localStorage', 
        { error: err instanceof Error ? err.message : String(err) }
      );
    }
    
    // Also keep in secure storage
    const memorySuccess = secureStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email, {
      namespace: AUTH_NAMESPACE,
      mechanism: 'memory',
      ttl: AUTH_CONFIG.EMAIL_PERSISTENCE_DURATION
    });
    
    // Store in secure storage with sessionStorage mechanism too
    try {
      secureStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email, {
        namespace: AUTH_NAMESPACE,
        mechanism: 'sessionStorage',
        ttl: AUTH_CONFIG.EMAIL_PERSISTENCE_DURATION * 2 // Double the TTL for extra safety
      });
    } catch (e) {
      // Non-critical error
    }
    
    emailLinkLogger.info('Email stored for auth', { 
      directStorage: true,
      localStorage: success,
      sessionStorage: sessionStorageSuccess,
      memory: memorySuccess
    });
    
    return success;
  } catch (error) {
    emailLinkLogger.error(
      'Failed to store email',
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  }
}

/**
 * Clears the stored email for sign-in
 * 
 * @returns Whether removal was successful
 */
export function clearStoredEmail(): boolean {
  try {
    let success = false;
    let sessionSuccess = false;
    
    // Clear from localStorage (Firebase's standard location)
    try {
      window.localStorage.removeItem('emailForSignIn');
      window.localStorage.removeItem('emailForSignIn_expiresAt'); // Also clear expiration timestamp
      success = true;
      emailLinkLogger.info('Cleared email from localStorage');
    } catch (err) {
      emailLinkLogger.warn('Failed to clear email from localStorage', 
        { error: err instanceof Error ? err.message : String(err) }
      );
    }
    
    // Clear from sessionStorage
    try {
      window.sessionStorage.removeItem('emailForSignIn');
      sessionSuccess = true;
      emailLinkLogger.info('Cleared email from sessionStorage');
    } catch (err) {
      emailLinkLogger.warn('Failed to clear email from sessionStorage', 
        { error: err instanceof Error ? err.message : String(err) }
      );
    }
    
    // Clear from secure storage with various mechanisms
    let memoryResult = false;
    let secureStorageResult = false;
    
    // Memory storage
    try {
      memoryResult = secureStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY, {
        namespace: AUTH_NAMESPACE,
        mechanism: 'memory'
      });
    } catch (e) {
      // Non-critical error
    }
    
    // Session storage
    try {
      secureStorageResult = secureStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY, {
        namespace: AUTH_NAMESPACE,
        mechanism: 'sessionStorage'
      });
    } catch (e) {
      // Non-critical error
    }
    
    // Local storage mechanism
    try {
      secureStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY, {
        namespace: AUTH_NAMESPACE,
        mechanism: 'localStorage'
      });
    } catch (e) {
      // Non-critical error
    }
    
    emailLinkLogger.info('Cleared stored email from all storage mechanisms', { 
      localStorage: success, 
      sessionStorage: sessionSuccess,
      memory: memoryResult,
      secureStorage: secureStorageResult
    });
    
    return success || sessionSuccess || memoryResult || secureStorageResult;
  } catch (error) {
    emailLinkLogger.error(
      'Failed to clear stored email',
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  }
}

export default {
  sendEmailLink,
  verifyEmailLink,
  safeSendEmailLink,
  safeVerifyEmailLink,
  isEmailSignInLink,
  isEmailSignInLinkSync,
  getStoredEmail,
  storeEmail,
  clearStoredEmail,
  checkUserExistsAndCreate
};