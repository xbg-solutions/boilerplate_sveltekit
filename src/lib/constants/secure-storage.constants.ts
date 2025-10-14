/**
 * src/lib/constants/secure-storage.constants.ts
 * Constants for secure storage configuration
 * 
 * @deprecated This file has been consolidated into central configuration.
 * New code should import from '@/lib/config/app.config.ts' instead.
 * 
 * Legacy storage constants - use central config for new development.
 */

import { APP_CONFIG } from '../config/app.config';

/** 
 * @deprecated Use APP_CONFIG.security.storage instead
 * Default time to live for stored items in seconds
 */
export const STORAGE_DEFAULT_TTL = APP_CONFIG.security.storage.defaultTTL;

/**
 * @deprecated Use APP_CONFIG.security.storage instead
 * Prefix for all storage keys to prevent collisions with other applications
 */
export const STORAGE_PREFIX = APP_CONFIG.security.storage.prefix;

/**
 * @deprecated Use APP_CONFIG.security.storage instead
 * Default expiration for auth tokens in seconds
 */
export const AUTH_TOKEN_TTL = APP_CONFIG.security.storage.authTokenTTL;

/**
 * @deprecated Use APP_CONFIG.security.storage instead
 * Storage key for email link authentication
 */
export const EMAIL_FOR_SIGN_IN_KEY = APP_CONFIG.security.storage.emailForSignInKey;

/**
 * @deprecated Use APP_CONFIG.security.storage instead
 * Storage namespace for authentication
 */
export const AUTH_NAMESPACE = APP_CONFIG.security.storage.authNamespace;

/**
 * @deprecated Use APP_CONFIG.security.storage instead
 * Storage namespace for user preferences
 */
export const PREFS_NAMESPACE = APP_CONFIG.security.storage.prefsNamespace;