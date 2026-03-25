/**
 * src/lib/constants/api.constants.ts
 * API Constants
 * 
 * @deprecated This file is being phased out in favor of centralized configuration.
 * New code should import from '@/lib/config/app.config.ts' instead.
 * 
 * Legacy API constants that now reference the central configuration.
 * This file is maintained for backwards compatibility during the migration.
 */

import { APP_CONFIG, COMPUTED_CONFIG } from '../config/app.config';

/**
 * @deprecated Use APP_CONFIG.api instead
 * Legacy API constants - use central config for new development
 */
export const API_CONSTANTS = {
  // Base URLs - now sourced from central config
  BASE_URLS: APP_CONFIG.api.baseUrl,

  // Request configuration - now sourced from central config  
  REQUEST_CONFIG: {
    timeout: APP_CONFIG.api.timeout,
    retryCount: APP_CONFIG.api.retryCount,
    retryDelay: APP_CONFIG.api.retryDelay,
    credentials: APP_CONFIG.api.credentials,
    headers: APP_CONFIG.api.headers
  },

  // HTTP Status codes (keeping these as they're standard)
  STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  },

  // Event types (keeping these as they're specific to API service)
  EVENTS: {
    REQUEST_START: 'api:request-start',
    REQUEST_SUCCESS: 'api:request-success',
    REQUEST_ERROR: 'api:request-error',
    AUTH_ERROR: 'api:auth-error',
    NETWORK_ERROR: 'api:network-error'
  },
  
  // HTTP methods that require CSRF protection
  CSRF_PROTECTED_METHODS: ['POST', 'PUT', 'DELETE', 'PATCH']
};

// Helper to get current API base URL
export const getCurrentApiBaseUrl = () => COMPUTED_CONFIG.apiBaseUrl;