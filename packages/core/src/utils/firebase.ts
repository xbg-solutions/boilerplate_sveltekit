/**
 * src/lib/utils/firebase.ts
 * Firebase utility for application-wide Firebase integration
 * 
 * A utility that handles Firebase initialization and provides
 * abstractions for Firebase services focused on authentication.
 * Integrates with error handler and logger for consistent patterns.
 */

import { initializeApp, type FirebaseApp, getApps, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  type Auth,
  connectAuthEmulator,
  onAuthStateChanged,
  type User,
  signOut,
  type AuthError as FirebaseAuthError,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { loggerService } from '../services/logging/logging.service';
import {
  AppError,
  handleError,
  normalizeError,
  withErrorHandling
} from './error-handler';
import { initializeFirebaseAppCheck } from './app-check';
import type { ErrorOptions } from '../types/error.types';
import type { FirebaseState } from '../types/firebase.types';

// Create a logger instance for Firebase utility
const firebaseLogger = loggerService.withContext('FirebaseUtility');

/**
 * Options for the Firebase error
 */
export type FirebaseErrorOptions = ErrorOptions & {
  /** Firebase error code */
  firebaseCode?: string;
  /** Firebase error name */
  firebaseName?: string;
  /** Firebase error action */
  action?: string;
};

/**
 * Firebase specific error class
 */
export class FirebaseError extends AppError {
  /** Original Firebase error code */
  public firebaseCode?: string;
  /** Firebase error name */
  public firebaseName?: string;
  /** Firebase action being performed */
  public action?: string;

  constructor(message: string, options: FirebaseErrorOptions = {}) {
    super(message, {
      category: 'firebase',
      // Default to 500 but auth errors are typically 401
      statusCode: options.action?.includes('auth') ? 401 : 500,
      // Firebase errors often contain sensitive info like tokens
      containsSensitiveInfo: true,
      ...options
    });

    this.firebaseCode = options.firebaseCode;
    this.firebaseName = options.firebaseName;
    this.action = options.action;
  }
}

// Initial Firebase state
const firebaseState: FirebaseState = {
  initialized: false,
  initializedAt: undefined
};

/**
 * Loads Firebase configuration from environment variables
 * 
 * @returns Firebase configuration object
 */
function loadFirebaseConfig(): FirebaseOptions {
  // Get configuration from environment variables
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
  // Optional. Only products using the Realtime Database set this; everything
  // else leaves it undefined and `initializeApp` ignores the key entirely.
  // Without it `getDatabase(app)` throws, and the message ("Can't determine
  // Firebase Database URL") does not mention the env var, so it reads as an
  // SDK fault rather than a missing config line.
  const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;

  // Validate required configuration
  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new FirebaseError('Missing Firebase configuration', {
      userMessage: 'The application is not properly configured.',
      context: { 
        hasApiKey: !!apiKey, 
        hasAuthDomain: !!authDomain, 
        hasProjectId: !!projectId, 
        hasAppId: !!appId 
      }
    });
  }

  // Return complete configuration
  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
    // Spread rather than assigned: an explicit `databaseURL: undefined` key is
    // not the same as an absent one to every consumer that enumerates config.
    ...(databaseURL ? { databaseURL } : {})
  };
}

/**
 * Checks if the code is running in a browser environment
 * @returns True if in browser, false if in server-side rendering
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Initialize Firebase if not already initialized
 * 
 * @returns Firebase state object
 */
export async function initializeFirebase(): Promise<FirebaseState> {
  // Skip if already initialized
  if (firebaseState.initialized) {
    return firebaseState;
  }

  // Skip initialization in SSR mode
  if (!isBrowser()) {
    firebaseLogger.info('Skipping Firebase initialization in SSR mode');
    return firebaseState;
  }

  try {
    const timerId = firebaseLogger.startTimer('FirebaseInitialization');
    
    // Load configuration
    const config = loadFirebaseConfig();
    
    // Initialize Firebase only if not already initialized
    const existingApps = getApps();
    let app: FirebaseApp;
    
    if (existingApps.length === 0) {
      firebaseLogger.info('Initializing Firebase app');
      app = initializeApp(config);
    } else {
      firebaseLogger.info('Using existing Firebase app');
      app = existingApps[0];
    }
    
    // Initialize auth
    const auth = getAuth(app);

    // Set persistence to LOCAL to keep user logged in across page refreshes
    try {
      // IMPORTANT: This must be done before any auth operations
      // This ensures Firebase uses localStorage for auth persistence
      // which keeps the user logged in even after page refreshes
      await setPersistence(auth, browserLocalPersistence);
      firebaseLogger.info('Firebase Auth persistence set to LOCAL', {
        success: true,
        mechanism: 'browserLocalPersistence'
      });
    } catch (persistenceError) {
      firebaseLogger.warn(
        'Failed to set Firebase Auth persistence',
        {
          error: persistenceError instanceof Error ? persistenceError.message : String(persistenceError)
        }
      );
      // Continue even if persistence setting fails
      // This might happen in incognito/private mode or if storage is restricted
    }

    // Connect to auth emulator if in development mode and emulator config provided
    if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST) {
      const emulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
      const emulatorPort = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || '9099';
      const emulatorUrl = `http://${emulatorHost}:${emulatorPort}`;

      firebaseLogger.info(`Connecting to Auth emulator at ${emulatorUrl}`);
      connectAuthEmulator(auth, emulatorUrl);
    }

    // Initialize App Check for bot protection
    // This is non-blocking - if it fails, the app will continue to work
    try {
      await initializeFirebaseAppCheck(app);
    } catch (appCheckError) {
      // Already logged in app-check.ts, just log warning here
      firebaseLogger.warn('App Check initialization failed, continuing without it', {
        error: appCheckError instanceof Error ? appCheckError.message : String(appCheckError)
      });
    }

    // Update state
    firebaseState.app = app;
    firebaseState.auth = auth;
    firebaseState.initialized = true;
    firebaseState.initializedAt = Date.now();

    firebaseLogger.endTimer(timerId);
    firebaseLogger.info('Firebase initialized successfully', { projectId: config.projectId });
    
    return firebaseState;
  } catch (error) {
    // Create a Firebase error and store it in state
    const firebaseError = error instanceof FirebaseError 
      ? error 
      : new FirebaseError(
          'Failed to initialize Firebase',
          { 
            cause: error instanceof Error ? error : undefined,
            userMessage: 'Failed to initialize the application. Please try again later.',
            action: 'initialize'
          }
        );
    
    // Log the error
    firebaseLogger.error('Firebase initialization failed', firebaseError);
    
    // Update state with error
    firebaseState.error = firebaseError;
    firebaseState.initialized = true; // Mark as initialized to prevent retries
    
    return firebaseState;
  }
}

/**
 * Processes a Firebase Auth error and converts it to a FirebaseError
 * 
 * @param error The original Firebase error
 * @param fallbackMessage Default message if error is not a Firebase error
 * @param options Additional options for the Firebase error
 * @returns A normalized Firebase error
 */
export function processFirebaseError(
  error: unknown,
  fallbackMessage = 'A Firebase error occurred',
  options: FirebaseErrorOptions = {}
): FirebaseError {
  // If already a FirebaseError, return as is
  if (error instanceof FirebaseError) {
    return error;
  }
  
  // Try to extract Firebase error details
  let firebaseCode: string | undefined;
  let firebaseName: string | undefined;
  let errorMessage = fallbackMessage;
  
  if (error && typeof error === 'object') {
    const fError = error as Record<string, any>;
    
    if (fError.code) {
      firebaseCode = String(fError.code);
    }
    
    if (fError.name) {
      firebaseName = String(fError.name);
    }
    
    if (fError.message) {
      errorMessage = String(fError.message);
    }
  }
  
  // Map Firebase error codes to user-friendly messages
  let userMessage = options.userMessage;
  if (firebaseCode && !userMessage) {
    userMessage = getUserMessageForFirebaseError(firebaseCode, options.action);
  }
  
  return new FirebaseError(errorMessage, {
    firebaseCode,
    firebaseName,
    userMessage,
    cause: error instanceof Error ? error : undefined,
    ...options
  });
}

/**
 * Maps Firebase error codes to user-friendly messages (Australian English)
 * 
 * @param code Firebase error code
 * @param action Optional action being performed
 * @returns User-friendly error message
 */
function getUserMessageForFirebaseError(code: string, action?: string): string {
  // Common auth error messages (in Australian English)
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email address is already in use.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support for assistance.',
    'auth/user-not-found': 'No account was found with this email address.',
    'auth/wrong-password': 'The password is incorrect. Please try again.',
    'auth/invalid-login-credentials': 'Your login details are incorrect. Please try again.',
    'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later.',
    'auth/network-request-failed': 'A network error occurred. Please check your internet connection and try again.',
    'auth/popup-closed-by-user': 'The login attempt was cancelled.',
    'auth/popup-blocked': 'The login popup was blocked by your browser. Please allow popups for this site.',
    'auth/cancelled-popup-request': 'The login attempt was cancelled due to multiple popup requests.',
    'auth/operation-not-allowed': 'This login method is not enabled. Please contact support.',
    'auth/weak-password': 'The password is too weak. Please choose a stronger password.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/invalid-action-code': 'This link is invalid or has already been used.',
    'auth/missing-email': 'Please provide an email address.',
    'auth/missing-phone-number': 'Please provide a phone number.',
    'auth/invalid-phone-number': 'Please enter a valid phone number.',
    'auth/quota-exceeded': 'Service quota has been exceeded. Please try again later.',
    'auth/missing-verification-code': 'Please enter the verification code.',
    'auth/invalid-verification-code': 'The verification code is invalid. Please try again.',
    
    // reCAPTCHA specific errors
    'auth/argument-error': 'There was an issue with the security verification. Please try again.',
    'auth/captcha-check-failed': 'The security verification failed. Please try again.',
    'auth/missing-recaptcha-token': 'The security verification is missing. Please complete the security check.',
    'auth/invalid-recaptcha-token': 'The security verification is invalid or expired. Please try again.',
    'auth/invalid-recaptcha-action': 'The security verification could not be completed. Please refresh and try again.',
    'auth/missing-client-type': 'The security verification failed due to a configuration issue. Please try again later.',
    'auth/recaptcha-not-enabled': 'Security verification is not enabled for this application.'
  };
  
  // Return mapped message or generic fallback
  return errorMessages[code] || getGenericErrorMessage(action);
}

/**
 * Provides a generic error message based on the action
 * 
 * @param action The authentication action being performed
 * @returns Generic error message
 */
function getGenericErrorMessage(action?: string): string {
  switch (action) {
    case 'auth/email-link-sign-in':
      return 'We couldn\'t sign you in with this link. Please request a new sign-in link.';
    case 'auth/phone-sign-in':
      return 'We couldn\'t sign you in with your phone. Please try again.';
    case 'auth/phone-code-send':
      return 'We couldn\'t send a verification code to this phone number. Please try again.';
    case 'auth/phone-code-verify':
      return 'We couldn\'t verify the phone code. Please check the code and try again.';
    case 'auth/recaptcha-create':
      return 'We couldn\'t initialize the security verification. Please try again or use a different browser.';
    case 'auth/recaptcha-verify':
      return 'Security verification failed. Please try again.';
    case 'auth/sign-out':
      return 'We couldn\'t sign you out properly. Please try again.';
    case 'auth/get-user':
      return 'We couldn\'t retrieve your account information. Please try refreshing the page.';
    default:
      return 'An authentication error occurred. Please try again later.';
  }
}

/**
 * Gets the current Firebase state
 * 
 * @returns Firebase state
 */
export function getFirebaseState(): FirebaseState {
  return firebaseState;
}

/**
 * Checks if Firebase is initialized and ready
 * 
 * @returns True if Firebase is initialized successfully
 */
export function isFirebaseInitialized(): boolean {
  return firebaseState.initialized && !firebaseState.error;
}

/**
 * Gets the Firebase app instance, initializing it if necessary
 * 
 * @returns Firebase app instance
 * @throws FirebaseError if Firebase cannot be initialized
 */
export async function getFirebaseApp(): Promise<FirebaseApp> {
  const state = await initializeFirebase();
  
  if (state.error) {
    throw state.error;
  }
  
  if (!state.app) {
    throw new FirebaseError('Firebase app not available', {
      userMessage: 'The application is not properly initialized.',
      action: 'getApp'
    });
  }
  
  return state.app;
}

/**
 * Gets the Firebase auth instance, initializing it if necessary
 * 
 * @returns Firebase auth instance
 * @throws FirebaseError if Firebase cannot be initialized
 */
export async function getFirebaseAuth(): Promise<Auth> {
  const state = await initializeFirebase();
  
  if (state.error) {
    throw state.error;
  }
  
  if (!state.auth) {
    throw new FirebaseError('Firebase auth not available', {
      userMessage: 'The authentication service is not properly initialized.',
      action: 'getAuth'
    });
  }
  
  return state.auth;
}

/**
 * Safe version of getting Firebase auth with error handling
 * 
 * @returns Object containing success flag and auth instance or error
 */
export const safeGetFirebaseAuth = withErrorHandling(getFirebaseAuth);

/**
 * Signs out the current user
 * 
 * @returns Promise that resolves when sign out is complete
 * @throws FirebaseError if sign out fails
 */
export async function signOutUser(): Promise<void> {
  try {
    const auth = await getFirebaseAuth();
    await signOut(auth);
    firebaseLogger.info('User signed out successfully');
  } catch (error) {
    throw processFirebaseError(error, 'Failed to sign out', { action: 'auth/sign-out' });
  }
}

/**
 * Safe version of sign out with error handling
 */
export const safeSignOutUser = withErrorHandling(signOutUser);

/**
 * Gets the current user
 * 
 * @returns Current Firebase user or null if not signed in
 * @throws FirebaseError if getting user fails
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const auth = await getFirebaseAuth();
    return auth.currentUser;
  } catch (error) {
    throw processFirebaseError(error, 'Failed to get current user', { action: 'auth/get-user' });
  }
}

/**
 * Safe version of getting current user with error handling
 */
export const safeGetCurrentUser = withErrorHandling(getCurrentUser);

/**
 * Subscribes to auth state changes
 * 
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 * @throws FirebaseError if subscription fails
 */
export async function subscribeToAuthChanges(callback: (user: User | null) => void): Promise<() => void> {
  try {
    const auth = await getFirebaseAuth();
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    throw processFirebaseError(error, 'Failed to subscribe to auth changes', { action: 'auth/subscribe' });
  }
}

/**
 * Safe version of subscribing to auth changes with error handling
 */
export const safeSubscribeToAuthChanges = withErrorHandling(
  async (callback: (user: User | null) => void) => subscribeToAuthChanges(callback)
);

// Re-export Firebase Auth functions
export {
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential
};

// Export as a default object for easier imports
export default {
  initialize: initializeFirebase,
  getState: getFirebaseState,
  isInitialized: isFirebaseInitialized,
  getApp: getFirebaseApp,
  getAuth: getFirebaseAuth,
  safeGetAuth: safeGetFirebaseAuth,
  signOut: signOutUser,
  safeSignOut: safeSignOutUser,
  getCurrentUser,
  safeGetCurrentUser,
  subscribeToAuthChanges,
  safeSubscribeToAuthChanges,
  processError: processFirebaseError
};