/**
 * src/lib/utils/tokens.ts
 * Token Utilities
 * 
 * Utilities for working with JWT tokens, including:
 * - Decoding and parsing tokens
 * - Extracting claims and roles
 * - Token validation and expiration checking
 * - Token storage and retrieval
 * 
 * NOTE: The key improvements here are in the extractClaims function,
 * which now properly handles Firebase's JWT format and ensures
 * boolean values are correctly interpreted.
 */

import { loggerService } from '../services/logging/logging.service';
import { secureStorage } from './secure-storage';
import { AUTH_NAMESPACE, AUTH_TOKEN_TTL } from '../constants/secure-storage.constants';
import { AppError } from './error-handler';
import { getAuth } from 'firebase/auth';
import type { DecodedToken, TokenOptions, TokenRole, TokenVerificationResult, TokenRefreshResult } from '../types/token.types';
import type { FirebaseUserClaims } from '../types/firebase.types';

// Create a context-aware logger
const logger = loggerService.withContext('TokenUtils');

/**
 * Token-related error class
 */
export class TokenError extends AppError {
  token?: string;
  
  constructor(message: string, options: any = {}) {
    super(message, {
      category: 'token',
      ...options
    });
    
    if (options.token) {
      // Store only the first few characters of the token for debugging
      this.token = options.token.substring(0, 10) + '...';
    }
  }
}

/**
 * Decodes a JWT token without verifying its signature
 * @param token JWT token string or previously decoded token
 * @returns Decoded token payload
 */
export function decodeToken(token: string | DecodedToken): DecodedToken {
  // If already decoded, return as is
  if (typeof token !== 'string') {
    return token;
  }
  
  try {
    // Split the JWT into parts
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new TokenError('Invalid token format', { token });
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    return decoded;
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }
    
    throw new TokenError(
      `Failed to decode token: ${error instanceof Error ? error.message : String(error)}`,
      { token, originalError: error }
    );
  }
}

/**
 * Extracts user claims from a token
 * @param token JWT token string or previously decoded token
 * @returns User claims object
 */
export function extractClaims(token: string | DecodedToken): FirebaseUserClaims {
  try {
    // Decode the token if it's a string
    const decoded = typeof token === 'string' ? decodeToken(token) : token;
    
    // Firebase puts custom claims in different places depending on the token type
    // This is the key fix: handle all possible claim locations and formats
    let claims: FirebaseUserClaims = {};
    
    // Get the user ID from various possible locations
    const uid = decoded.sub || decoded.user_id || decoded.uid;
    if (uid) {
      claims.uid = uid;
    }
    
    // Get email from claims
    if (decoded.email) {
      claims.email = decoded.email;
    }
    
    // Get email verified status if available
    if (decoded.email_verified !== undefined) {
      claims.emailVerified = decoded.email_verified;
    }
    
    // Get name/display name if available
    if (decoded.name) {
      claims.name = decoded.name;
    }
    
    // Handle custom claims - they might be in different locations
    // Option 1: Firebase Auth tokens typically put custom claims in a 'claims' property
    if (decoded.claims) {
      // Copy the custom claims to the top level
      Object.entries(decoded.claims).forEach(([key, value]) => {
        // Ensure boolean values are properly converted
        if (value === 'true' || value === '1' || value === 1) {
          claims[key] = true;
        } else if (value === 'false' || value === '0' || value === 0) {
          claims[key] = false;
        } else {
          claims[key] = value;
        }
      });
    }
    
    // Option 2: Some Firebase tokens might have claims directly at top level 
    // Check for common boolean flags directly
    ['isClient', 'isConsultant', 'isAdmin', 'isSysAdmin'].forEach(flag => {
      if (decoded[flag] !== undefined && claims[flag] === undefined) {
        // Ensure boolean values are properly converted
        if (decoded[flag] === 'true' || decoded[flag] === '1' || decoded[flag] === 1) {
          claims[flag] = true;
        } else if (decoded[flag] === 'false' || decoded[flag] === '0' || decoded[flag] === 0) {
          claims[flag] = false;
        } else {
          claims[flag] = !!decoded[flag];
        }
      }
    });
    
    // Option 3: Some systems might put roles directly in the token
    if (decoded.roles && !claims.roles) {
      claims.roles = decoded.roles;
    }
    
    // Log detailed debug info to help troubleshoot claim extraction issues
    logger.info('Extracted claims from token', { 
      uid: claims.uid,
      hasRoles: !!claims.roles,
      booleanFlags: {
        isClient: claims.isClient,
        isConsultant: claims.isConsultant, 
        isAdmin: claims.isAdmin,
        isSysAdmin: claims.isSysAdmin
      }
    });
    
    return claims;
  } catch (error) {
    throw new TokenError(
      `Failed to extract claims: ${error instanceof Error ? error.message : String(error)}`,
      { originalError: error }
    );
  }
}

/**
 * Gets user roles from claims
 * @param claims User claims or token
 * @returns Array of user roles
 */
export function getUserRoles(claims: FirebaseUserClaims | string | DecodedToken): TokenRole[] {
  try {
    // Extract claims if token was provided
    let userClaims: FirebaseUserClaims;
    
    if (typeof claims === 'string') {
      userClaims = extractClaims(claims);
    } else if ('exp' in claims && typeof claims.exp === 'number') {
      userClaims = extractClaims(claims as DecodedToken);
    } else {
      userClaims = claims as FirebaseUserClaims;
    }
    
    if (!userClaims) {
      return [];
    }
    
    // Check if roles exist as an array or string
    if (userClaims.roles) {
      // Convert to array if it's a string
      if (typeof userClaims.roles === 'string') {
        // Handle comma-separated or space-separated strings
        return (userClaims.roles as string).split(/[,\s]+/).filter(Boolean);
      }
      
      // Already an array
      if (Array.isArray(userClaims.roles)) {
        return userClaims.roles;
      }
    }
    
    // If no roles found, derive from boolean flags
    const roles: TokenRole[] = [];
    
    // Map boolean flags to roles
    if (userClaims.isClient === true) roles.push('client');
    if (userClaims.isConsultant === true) roles.push('consultant');
    if (userClaims.isAdmin === true) roles.push('admin');
    if (userClaims.isSysAdmin === true) roles.push('sysadmin');
    
    return roles;
  } catch (error) {
    logger.warn('Failed to get user roles', {
      message: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}

/**
 * Checks if claims or token includes a specific role
 * @param claims User claims or token
 * @param role Role to check for
 * @returns True if user has the specified role
 */
export function hasRole(claims: FirebaseUserClaims | string | DecodedToken | null, role: string): boolean {
  if (!claims) {
    return false;
  }
  
  try {
    // Extract claims if token was provided
    let userClaims: FirebaseUserClaims;
    
    if (typeof claims === 'string') {
      userClaims = extractClaims(claims);
    } else if ('exp' in claims && typeof claims.exp === 'number') {
      userClaims = extractClaims(claims as DecodedToken);
    } else {
      userClaims = claims as FirebaseUserClaims;
    }
    
    // Check direct boolean flag first (e.g., isAdmin for 'admin' role)
    const booleanFlag = `is${role.charAt(0).toUpperCase() + role.slice(1)}`;
    if (userClaims[booleanFlag] === true) {
      return true;
    }
    
    // Then check roles array
    const roles = getUserRoles(userClaims);
    return roles.includes(role);
  } catch (error) {
    logger.warn(`Failed to check role "${role}"`, {
      message: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Checks if claims or token includes any of the specified roles
 * @param claims User claims or token
 * @param roles Roles to check for
 * @returns True if user has any of the specified roles
 */
export function hasAnyRole(claims: FirebaseUserClaims | string | DecodedToken | null, roles: string[]): boolean {
  if (!claims || !roles.length) {
    return false;
  }
  
  return roles.some(role => hasRole(claims, role));
}

/**
 * Checks if a token is expired
 * @param token Token string or decoded token
 * @param options Options for expiration check
 * @returns True if token is expired or invalid
 */
export function isTokenExpired(
  token: string | DecodedToken | null,
  options: { bufferSeconds?: number } = {}
): boolean {
  if (!token) {
    return true;
  }
  
  try {
    // Decode the token if it's a string
    const decoded = typeof token === 'string' ? decodeToken(token) : token;
    
    // Check if token has expiration
    if (!decoded.exp) {
      logger.warn('Token has no expiration claim');
      return false; // Consider non-expiring tokens as valid
    }
    
    // Get current time with buffer
    const bufferSeconds = options.bufferSeconds || 60; // Default 60 second buffer
    const now = Math.floor(Date.now() / 1000) + bufferSeconds;
    
    // Check if token is expired
    return decoded.exp < now;
  } catch (error) {
    logger.warn('Error checking token expiration', {
      message: error instanceof Error ? error.message : String(error)
    });
    return true; // Consider invalid tokens as expired
  }
}

/**
 * Validates a token
 * @param token Token string
 * @returns True if token is valid and not expired
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) {
    return false;
  }
  
  try {
    // Try to decode the token
    const decoded = decodeToken(token);
    
    // Check if token is expired
    if (isTokenExpired(decoded)) {
      return false;
    }
    
    return true;
  } catch (error) {
    logger.warn('Error validating token', {
      message: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Stores a token securely
 * @param token Token to store
 * @param options Storage options
 * @returns True if successful
 */
export function storeToken(token: string, options: TokenOptions = {}): boolean {
  try {
    const {
      tokenType = 'id',
      mechanism = 'cookie',
      ttl = AUTH_TOKEN_TTL
    } = options;
    
    const key = `${tokenType}Token`;
    
    return secureStorage.setItem(key, token, {
      namespace: AUTH_NAMESPACE,
      mechanism,
      ttl
    });
  } catch (error) {
    const logError = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to store token', logError);
    return false;
  }
}

/**
 * Retrieves a token from storage
 * @param options Retrieval options
 * @returns The token or null if not found
 */
export function retrieveToken(options: Omit<TokenOptions, 'ttl'> = {}): string | null {
  try {
    const {
      tokenType = 'id',
      mechanism = 'cookie'
    } = options;
    
    const key = `${tokenType}Token`;
    
    return secureStorage.getItem(key, {
      namespace: AUTH_NAMESPACE,
      mechanism
    });
  } catch (error) {
    const logError = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to retrieve token', logError);
    return null;
  }
}

/**
 * Clears all tokens from storage
 * @returns True if successful
 */
export function clearTokens(): boolean {
  try {
    return secureStorage.clear({
      namespace: AUTH_NAMESPACE,
      allMechanisms: true
    });
  } catch (error) {
    const logError = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to clear tokens', logError);
    return false;
  }
}

/**
 * Gets a fresh ID token from Firebase Auth
 * @param options Options for token refresh
 * @returns Promise resolving to ID token
 */
export async function getIdToken(options: { forceRefresh?: boolean } = {}): Promise<string> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new TokenError('No authenticated user');
    }
    
    const { forceRefresh = false } = options;
    
    // Get a fresh token
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    throw new TokenError(
      `Failed to get ID token: ${error instanceof Error ? error.message : String(error)}`,
      { originalError: error }
    );
  }
}

/**
 * Checks if two tokens are different
 * @param oldToken First token
 * @param newToken Second token
 * @returns True if tokens are different
 */
export function haveTokensChanged(oldToken: string | null, newToken: string | null): boolean {
  // Both null or same string
  if (oldToken === newToken) {
    return false;
  }
  
  // One is null, the other isn't
  if (!oldToken || !newToken) {
    return true;
  }
  
  // Both are strings, compare content
  try {
    // Get just the payload part for comparison
    const oldPayload = oldToken.split('.')[1];
    const newPayload = newToken.split('.')[1];
    
    // Different payloads
    if (oldPayload !== newPayload) {
      return true;
    }
    
    return false;
  } catch (error) {
    // If any error in comparison, assume they're different
    logger.warn('Error comparing tokens', {
      message: error instanceof Error ? error.message : String(error)
    });
    return true;
  }
}

/**
 * Safe version of decodeToken that does not throw
 * @param token JWT token string
 * @returns Result object with success status and data/error
 */
export async function safeDecodeToken(token: string): Promise<{
  success: boolean;
  data?: DecodedToken;
  error?: Error;
}> {
  try {
    const data = decodeToken(token);
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Safe version of extractClaims that does not throw
 * @param token JWT token string or decoded token
 * @returns Result object with success status and data/error
 */
export async function safeExtractClaims(token: string | DecodedToken): Promise<{
  success: boolean;
  data?: FirebaseUserClaims;
  error?: Error;
}> {
  try {
    const data = extractClaims(token);
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Safe version of getIdToken that does not throw
 * @param options Options for token refresh
 * @returns Result object with success status and data/error
 */
export async function safeGetIdToken(options: { forceRefresh?: boolean } = {}): Promise<{
  success: boolean;
  data?: string;
  error?: Error;
}> {
  try {
    const data = await getIdToken(options);
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}