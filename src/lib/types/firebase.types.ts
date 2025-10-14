/**
 * src/lib/types/firebase.types.ts
 * Types for Firebase utility
 */

import type { FirebaseApp } from 'firebase/app';
import type { Auth, User, UserCredential } from 'firebase/auth';

/**
 * Initialization state of Firebase services
 */
export type FirebaseInitState = {
  /** Whether the service has been initialized */
  initialized: boolean;
  /** Timestamp when initialization completed */
  initializedAt?: number;
  /** Any error that occurred during initialization */
  error?: Error;
};

/**
 * Firebase state containing initialized services and status
 */
export type FirebaseState = FirebaseInitState & {
  /** The Firebase app instance */
  app?: FirebaseApp;
  /** The Firebase auth instance */
  auth?: Auth;
};

/**
 * Firebase auth state
 */
export type FirebaseAuthState = {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether the auth state has been loaded */
  isLoaded: boolean;
  /** The current user, if authenticated */
  user: User | null;
  /** User roles/claims extracted from token */
  claims: FirebaseUserClaims | null;
  /** Last authentication error, if any */
  error?: Error;
};

/**
 * Standard claims that might be present in a Firebase JWT
 */
export type FirebaseUserClaims = {
  /** User ID */
  uid?: string;
  /** User email */
  email?: string;
  /** Whether the user's email is verified */
  email_verified?: boolean;
  /** User phone number */
  phone_number?: string;
  /** User display name */
  name?: string;
  /** User profile picture URL */
  picture?: string;
  /** Authentication provider (e.g., "password", "google.com") */
  provider_id?: string;
  /** When the token was issued (seconds since epoch) */
  iat?: number;
  /** When the token expires (seconds since epoch) */
  exp?: number;
  /** User roles (custom claim) */
  roles?: string[];
  /** Whether the user is a client (custom claim) */
  isClient?: boolean;
  /** Whether the user is a consultant (custom claim) */
  isConsultant?: boolean;
  /** Whether the user is an admin (custom claim) */
  isAdmin?: boolean;
  /** Whether the user is a system admin (custom claim) */
  isSysAdmin?: boolean;
  /** Any other custom claims */
  [key: string]: any;
};

/**
 * Options for email link authentication
 */
export type EmailLinkAuthOptions = {
  /** Email address to authenticate */
  email: string;
  /** URL to redirect to after authentication */
  redirectUrl?: string;
  /** Whether to force a new account even if email exists */
  forceSameDevice?: boolean;
  /** Custom handling for auth errors */
  onError?: (error: Error) => void;
};

/**
 * Options for phone number authentication
 */
export type PhoneAuthOptions = {
  /** Phone number to authenticate */
  phoneNumber: string;
  /** Recaptcha container ID or invisible recaptcha flag */
  recaptchaVerifier: any;
  /** Custom handling for auth errors */
  onError?: (error: Error) => void;
};

/**
 * Result of an authentication operation
 */
export type AuthResult = {
  /** Whether authentication was successful */
  success: boolean;
  /** User credentials if successful */
  credential?: UserCredential;
  /** User if successful */
  user?: User;
  /** Error if unsuccessful */
  error?: Error;
};