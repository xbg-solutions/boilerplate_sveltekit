/**
 * src/lib/services/auth/user-creation.ts
 * Auth User Creation Utility
 * 
 * Provides utilities for creating auth users on first sign-in
 * Note: This now uses a CLI tool instead of the removed user management UI
 */

import { loggerService } from '$lib/services/logging/logging.service';
import { CREATE_AUTH_USER_ON_FIRST_SIGNIN } from '$lib/constants/auth.constants';

// Define simplified types for user creation
interface CustomClaims {
  roles?: string[];
  isClient?: boolean;
  isConsultant?: boolean;
  isAdmin?: boolean;
  isSysAdmin?: boolean;
  [key: string]: any;
}

interface CreateUserData {
  email?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  displayName?: string;
  customClaims?: CustomClaims;
}

interface UserOperationResult {
  success: boolean;
  error?: string;
  user?: {
    uid: string;
    [key: string]: any;
  };
}

// Create a context-aware logger
const logger = loggerService.withContext('AuthUserCreation');

// Simplified mock of createUser function (CLI tool will be used instead)
async function createUser(userData: CreateUserData): Promise<UserOperationResult> {
  logger.info('User creation handled by external CLI tool', { userData });
  return {
    success: true,
    user: {
      uid: 'mock-uid-cli-tool-will-handle',
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      emailVerified: userData.emailVerified || false,
      displayName: userData.displayName || '',
      customClaims: userData.customClaims || {}
    }
  };
}

/**
 * Previously checked if a user exists and created a new one if needed
 * This functionality has been disabled but will be reimplemented differently in the future
 * 
 * @param identifier Email or phone number
 * @param identifierType 'email' or 'phone'
 * @returns Promise resolving to whether user exists or was created
 */
export async function ensureUserExists(identifier: string, identifierType: 'email' | 'phone'): Promise<boolean> {
  // Feature is disabled
  logger.info(`Auto-creation disabled for ${identifierType}: ${identifier}`);
  return true; // Continue with normal authentication flow
}