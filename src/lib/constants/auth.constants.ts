/**
 * src/lib/constants/auth.constants.ts
 * Authentication Constants
 * 
 * Provides centralized constants for authentication flows and configuration.
 * This file has been updated to include role configuration constants.
 */

// Authentication event types
export const AUTH_EVENTS = {
  // Login events
  LOGIN_ATTEMPTED: 'auth:login-attempted',
  LOGIN_SUCCESS: 'auth:login-succeeded',
  LOGIN_FAILURE: 'auth:login-failed',
  
  // Logout events
  LOGOUT: 'auth:logout',
  
  // General auth state events
  STATE_CHANGED: 'auth:state-changed',
  SESSION_EXPIRED: 'auth:session-expired',
  
  // Email link authentication events
  EMAIL_LINK_SENT: 'auth:email-link-sent',
  EMAIL_LINK_VERIFICATION_START: 'auth:email-link-verification-start',
  EMAIL_LINK_VERIFICATION_SUCCESS: 'auth:email-link-verification-success',
  EMAIL_LINK_VERIFICATION_FAILURE: 'auth:email-link-verification-failure',
  
  // Phone authentication events
  PHONE_CODE_SENT: 'auth:phone-code-sent',
  PHONE_VERIFICATION_START: 'auth:phone-verification-start',
  PHONE_VERIFICATION_SUCCESS: 'auth:phone-verification-success',
  PHONE_VERIFICATION_FAILURE: 'auth:phone-verification-failure',
  
  // reCAPTCHA events
  RECAPTCHA_RENDERED: 'auth:recaptcha-rendered',
  RECAPTCHA_VERIFIED: 'auth:recaptcha-verified',
  RECAPTCHA_ERROR: 'auth:recaptcha-error',
  RECAPTCHA_EXPIRED: 'auth:recaptcha-expired'
};

// Import routes for consistency
import { ROUTES } from './routes.constants';

// Authentication routes
export const AUTH_ROUTES = {
  // Main authentication routes
  SIGN_IN: '/',
  SIGN_IN_ROUTE: '/',
  CONFIRM: '/confirm',
  SUCCESS: '/protected',
  UNAUTHORIZED: '/unauthorized',
  LOGGED_OUT: '/', // Pointing to sign-in page
  
  // Additional routes that may be needed in the future
  VERIFY_PHONE: '/verify-phone',
  RESET_PASSWORD: '/reset-password',
  
  // Auth routing behavior (migrated from routes.constants.ts)
  LOGIN_ROUTE: '/',
  UNAUTHORIZED_ROUTE: '/unauthorized',
  DEFAULT_POST_LOGIN_ROUTE: '/protected' // Avoiding circular dependency with ROUTES
};

// Authentication configuration
export const AUTH_CONFIG = {
  // Email link authentication
  DEFAULT_EMAIL_LINK_REDIRECT: '/confirm',
  EMAIL_PERSISTENCE_DURATION: 86400, // 24 hours in seconds for better cross-tab persistence
  
  // Token expiration settings
  AUTH_TOKEN_TTL: 3600, // 1 hour in seconds
  REFRESH_TOKEN_TTL: 604800, // 7 days in seconds
  
  // Session timeouts
  SESSION_TIMEOUT_WARNING: 300, // Show warning 5 minutes before expiration
  INACTIVITY_TIMEOUT: 1800, // 30 minutes of inactivity
  
  // Authentication retry settings
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 300, // 5 minutes
  
  // Other configuration
  PASSWORD_MIN_LENGTH: 8
};

// Create Auth User on First Signin configuration
// This feature has been disabled but the constant is kept for future reimplementation
export const CREATE_AUTH_USER_ON_FIRST_SIGNIN = {
  ENABLED: false, // Feature disabled - will be reimplemented differently in the future
  DEFAULT_ROLE: 'user',
  DEFAULT_ISCLIENT: true,
  DEFAULT_ISCONSULTANT: false,
  DEFAULT_ISADMIN: false,
  DEFAULT_ISYSADMIN: false
};

// =========================================
// ROLE CONFIGURATION CONSTANTS
// =========================================

// Re-exports from central config — use these constants throughout the app
// rather than importing APP_CONFIG directly in every file.
import { APP_CONFIG } from '../config/app.config';

/** Standard application roles. Prefer APP_CONFIG.auth.roles for new code. */
export const ROLES = APP_CONFIG.auth.roles;

/**
 * Maps role values → boolean JWT claim keys.
 * Single source of truth is APP_CONFIG.auth.claimMap (set by `npm run setup`).
 */
export const CLAIM_BOOLEAN_MAP: Record<string, string> = APP_CONFIG.auth.claimMap;

/** Inverse map: boolean claim key → role value. Derived from CLAIM_BOOLEAN_MAP. */
export const BOOLEAN_CLAIM_ROLE_MAP: Record<string, string> = Object.entries(CLAIM_BOOLEAN_MAP)
  .reduce((acc, [role, boolAttr]) => {
    acc[boolAttr] = role;
    return acc;
  }, {} as Record<string, string>);

/** Role-based permissions matrix. Prefer APP_CONFIG.auth.permissions for new code. */
export const ROLE_PERMISSIONS = APP_CONFIG.auth.permissions;

/** Role hierarchy. Prefer APP_CONFIG.auth.roleHierarchy for new code. */
export const ROLE_HIERARCHY = APP_CONFIG.auth.roleHierarchy;