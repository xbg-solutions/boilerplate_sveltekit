/**
 * src/lib/stores/token.store.ts
 * Token Store
 * 
 * A Svelte store for managing authentication token state with support for:
 * - Token storage and retrieval
 * - Decoded token information
 * - User claims and roles
 * - Authentication state tracking
 */

import { writable } from 'svelte/store';
import type { DecodedToken, TokenRole } from '../types/token.types';
import type { FirebaseUserClaims } from '../types/firebase.types';
import type { AppError } from '../utils/error-handler';

/**
 * Token store state
 */
export interface TokenState {
  /** Whether the token service is initialized */
  isInitialized: boolean;
  /** Whether the token service is initializing */
  isInitializing: boolean;
  /** The current token */
  token: string | null;
  /** Decoded token information */
  decodedToken: DecodedToken | null;
  /** Extracted user claims */
  claims: FirebaseUserClaims | null;
  /** User roles */
  roles: TokenRole[];
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Timestamp when the token was last updated */
  lastUpdated: number | null;
  /** Any error that occurred during token operations */
  error: AppError | null;
}

/**
 * Initial state for the token store
 */
const initialState: TokenState = {
  isInitialized: false,
  isInitializing: false,
  token: null,
  decodedToken: null,
  claims: null,
  roles: [],
  isAuthenticated: false,
  lastUpdated: null,
  error: null
};

/**
 * Creates the token store
 */
function createTokenStore() {
  return writable<TokenState>(initialState);
}

/**
 * Token store singleton instance
 */
export const tokenStore = createTokenStore();