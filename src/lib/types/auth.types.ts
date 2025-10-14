/**
 * src/lib/types/auth.types.ts
 * Authentication-related Types
 * 
 * This file defines TypeScript types for authentication flows
 * and related operations.
 */

import type { User, UserCredential } from 'firebase/auth';
import type { FirebaseUserClaims } from './firebase.types';

/**
 * Options for sending email link authentication
 */
export interface EmailLinkOptions {
  email: string;
  actionCodeSettings?: {
    url: string;
    handleCodeInApp: boolean;
    iOS?: {
      bundleId: string;
    };
    android?: {
      packageName: string;
      installApp?: boolean;
      minimumVersion?: string;
    };
    dynamicLinkDomain?: string;
  };
  rememberEmail?: boolean;
}

/**
 * Options for verifying email link authentication
 */
export interface EmailLinkVerifyOptions {
  email?: string;
  link?: string;
  returnUrl?: string;
}

/**
 * Options for phone authentication
 */
export interface PhoneAuthOptions {
  phoneNumber: string;
  recaptchaVerifier: import('firebase/auth').ApplicationVerifier;
}

/**
 * Options for verifying phone code
 */
export interface PhoneCodeVerifyOptions {
  verificationCode: string;
  verificationId: string;
}

/**
 * Result of an authentication operation
 */
export interface AuthResult {
  success: boolean;
  method?: 'emailLink' | 'phoneNumber' | 'federation' | null;
  user?: User;
  credential?: UserCredential;
  error?: Error;
  verificationId?: string;
}

/**
 * Payload for authentication state changes
 */
export interface AuthStateChangePayload {
  isAuthenticated: boolean;
  user: User | null;
  claims: FirebaseUserClaims | null;
  authMethod: 'emailLink' | 'phoneNumber' | 'federation' | null;
}

/**
 * Payload for authentication events
 */
export interface AuthEventPayload {
  user?: User | null;
  error?: {
    message: string;
    code?: string;
  };
  method?: 'emailLink' | 'phoneNumber' | 'federation' | null;
  context?: {
    [key: string]: any;
  };
}