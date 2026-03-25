// Firebase auth package barrel exports

// Services - auth.service exports the canonical safe* wrappers
export * from './services/auth/auth.service';

// Services - email-link (exclude duplicates already in auth.service)
export {
  sendEmailLink,
  verifyEmailLink,
  safeSendEmailLink as safeSendEmailLinkDirect,
  safeVerifyEmailLink as safeVerifyEmailLinkDirect,
  checkUserExistsAndCreate as checkEmailUserExistsAndCreate,
  isEmailSignInLink,
  isEmailSignInLinkSync,
  getStoredEmail,
  storeEmail,
  clearStoredEmail
} from './services/auth/email-link';

// Services - phone-auth (exclude duplicates already in auth.service)
export {
  sendPhoneCode,
  verifyPhoneCode,
  safeSendPhoneCode as safeSendPhoneCodeDirect,
  safeVerifyPhoneCode as safeVerifyPhoneCodeDirect,
  checkUserExistsAndCreate as checkPhoneUserExistsAndCreate
} from './services/auth/phone-auth';

// Services - user-creation
export {
  ensureUserExists as ensureServiceUserExists
} from './services/auth/user-creation';

export * from './services/token/token.service';

// Stores
export * from './stores/auth.service';
export * from './stores/auth.store';
export * from './stores/token.store';
export * from './stores/user-creation';

// Utils
export * from './utils/auth-guard';
export * from './utils/signout';
export * from './utils/tokens';
