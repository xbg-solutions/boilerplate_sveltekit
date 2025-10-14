/**
 * src/lib/types/token.types.ts
 * Type definitions for token utilities
 */

import type { StorageMechanism } from './storage.types';

/**
 * Common user roles in the application
 */
export type TokenRole = 
  | 'client'
  | 'consultant'
  | 'admin'
  | 'sysadmin'
  | string; // Allow for custom roles

/**
 * Options for token storage and retrieval
 */
export type TokenOptions = {
  /** Type of token (id, access, refresh, etc.) */
  tokenType?: string;
  /** Storage mechanism to use */
  mechanism?: StorageMechanism;
  /** Time to live in seconds */
  ttl?: number;
};

/**
 * Standard JWT token structure
 */
export type DecodedToken = {
  /** Subject (user ID) */
  sub?: string;
  /** User ID (Firebase specific) */
  user_id?: string;
  /** Email address */
  email?: string;
  /** Whether email is verified */
  email_verified?: boolean;
  /** User display name */
  name?: string;
  /** Phone number */
  phone_number?: string;
  /** Profile picture URL */
  picture?: string;
  /** Issuer */
  iss?: string;
  /** Audience */
  aud?: string;
  /** Authentication time */
  auth_time?: number;
  /** Issued at timestamp (seconds since epoch) */
  iat: number;
  /** Expiration timestamp (seconds since epoch) */
  exp: number;
  /** Token ID */
  jti?: string;
  /** Firebase custom claims object */
  claims?: {
    /** User roles */
    roles?: string[] | string;
    /** Whether user is a client */
    isClient?: boolean;
    /** Whether user is a consultant */
    isConsultant?: boolean;
    /** Whether user is an admin */
    isAdmin?: boolean;
    /** Whether user is a system admin */
    isSysAdmin?: boolean;
    /** Any other custom claims */
    [key: string]: any;
  };
  /** Any other standard or custom claims */
  [key: string]: any;
};

/**
 * Verification result
 */
export type TokenVerificationResult = {
  /** Whether verification was successful */
  valid: boolean;
  /** Any error that occurred during verification */
  error?: Error;
  /** Decoded token if verification was successful */
  decoded?: DecodedToken;
};

/**
 * Token refresh result
 */
export type TokenRefreshResult = {
  /** Whether refresh was successful */
  success: boolean;
  /** The new token if refresh was successful */
  token?: string;
  /** Any error that occurred during refresh */
  error?: Error;
  /** Whether the token was changed */
  changed: boolean;
};