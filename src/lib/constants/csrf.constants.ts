/**
 * src/lib/constants/csrf.constants.ts
 * Constants for CSRF protection configuration
 * 
 * @deprecated This file has been consolidated into central configuration.
 * New code should import from '@/lib/config/app.config.ts' instead.
 * 
 * Legacy CSRF constants - use central config for new development.
 */

import { APP_CONFIG } from '../config/app.config';

/**
 * @deprecated Use APP_CONFIG.security.csrf instead
 * Key used for storing the CSRF token
 */
export const CSRF_TOKEN_KEY = APP_CONFIG.security.csrf.tokenKey;

/**
 * @deprecated Use APP_CONFIG.security.csrf instead
 * HTTP header name for sending the CSRF token
 */
export const CSRF_HEADER_NAME = APP_CONFIG.security.csrf.headerName;

/**
 * @deprecated Use APP_CONFIG.security.csrf instead
 * Cookie name for storing the CSRF token
 */
export const CSRF_COOKIE_NAME = APP_CONFIG.security.csrf.cookieName;

/**
 * @deprecated Use APP_CONFIG.security.csrf instead
 * Time to live for CSRF tokens in seconds (2 hours)
 */
export const CSRF_TOKEN_TTL = APP_CONFIG.security.csrf.tokenTTL;

/**
 * @deprecated Use APP_CONFIG.security.csrf instead
 * HTTP methods that require CSRF protection
 */
export const CSRF_PROTECTED_METHODS = APP_CONFIG.security.csrf.protectedMethods;

/**
 * @deprecated Use APP_CONFIG.security.storage instead
 * Re-export AUTH_NAMESPACE for use in CSRF utility
 */
export const AUTH_NAMESPACE = APP_CONFIG.security.storage.authNamespace;