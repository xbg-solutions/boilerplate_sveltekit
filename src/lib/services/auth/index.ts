/**
 * src/lib/services/auth/index.ts
 * Authentication services central export
 * 
 * Provides a single entry point for accessing auth-related services
 * and functions, improving import organization and developer experience.
 */

// Main auth service
export {
    authService,
    createAuthService,
    safeSendEmailLink,
    safeVerifyEmailLink,
    safeSendPhoneCode,
    safeVerifyPhoneCode,
    safeLogout
  } from './auth.service';
  
  // Email link authentication
  export {
    sendEmailLink,
    verifyEmailLink,
    safeSendEmailLink as safeSendEmailLinkDirect,
    safeVerifyEmailLink as safeVerifyEmailLinkDirect,
    isEmailSignInLink,
    getStoredEmail,
    storeEmail,
    clearStoredEmail
  } from './email-link';
  
  // Phone authentication
  export {
    sendPhoneCode,
    verifyPhoneCode,
    safeSendPhoneCode as safeSendPhoneCodeDirect,
    safeVerifyPhoneCode as safeVerifyPhoneCodeDirect
  } from './phone-auth';
  
  // Re-export types for convenience
  export type {
    AuthResult,
    EmailLinkOptions,
    EmailLinkVerifyOptions,
    PhoneAuthOptions,
    PhoneCodeVerifyOptions,
    AuthStateChangePayload,
    AuthEventPayload
  } from '../../types/auth.types';
  
  export type { AuthMethod } from '../../stores/auth.store';
  
  // Re-export store for direct access if needed
  export { authStore } from '../../stores/auth.store';
  
  // Re-export constants for use in other modules
  export { AUTH_EVENTS, AUTH_ROUTES, AUTH_CONFIG } from '../../constants/auth.constants';