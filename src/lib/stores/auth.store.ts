/**
 * src/lib/stores/auth.store.ts
 * Auth Store
 * 
 * A Svelte store for managing authentication state with support for:
 * - User authentication status
 * - Authentication method tracking
 * - Loading states for authentication operations
 * - Error handling for authentication failures
 */

import { writable, get } from 'svelte/store';
import type { User } from 'firebase/auth';
import type { FirebaseUserClaims } from '../types/firebase.types';
import type { AppError } from '../utils/error-handler';

/**
 * Authentication method used by the user
 */
export type AuthMethod = 'emailLink' | 'phoneNumber' | 'federation' | null;

/**
 * Auth store state
 */
export interface AuthState {
  /** Whether the auth service is initialized */
  isInitialized: boolean;
  /** Whether the auth service is initializing */
  isInitializing: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether authentication state is being loaded */
  isLoading: boolean;
  /** The current Firebase user if authenticated */
  user: User | null;
  /** User claims extracted from token */
  claims: FirebaseUserClaims | null;
  /** Authentication method used */
  authMethod: AuthMethod;
  /** Timestamp when the user last authenticated */
  lastAuthenticated: number | null;
  /** Any error that occurred during authentication */
  error: AppError | null;
}

/**
 * Initial state for the auth store
 */
const initialState: AuthState = {
  isInitialized: false,
  isInitializing: false,
  isAuthenticated: false,
  isLoading: false,
  user: null,
  claims: null,
  authMethod: null,
  lastAuthenticated: null,
  error: null
};

/**
 * Creates the auth store
 */
function createAuthStore() {
  const store = writable<AuthState>(initialState);
  
  // Add helpers to read auth state more safely
  const safeGet = (): AuthState => {
    try {
      return get(store);
    } catch (error) {
      console.error('Error accessing auth store:', error);
      return initialState;
    }
  };
  
  // Extend store with useful methods
  return {
    ...store,
    safeGet,
    getUser: () => safeGet().user,
    getClaims: () => safeGet().claims,
    isAuthenticated: () => safeGet().isAuthenticated,
    isLoading: () => safeGet().isLoading || safeGet().isInitializing,
    hasRole: (role: string) => {
      const claims = safeGet().claims;
      if (!claims || !claims.roles) return false;
      
      return Array.isArray(claims.roles)
        ? claims.roles.includes(role)
        : claims.roles === role;
    },
    reset: () => store.set(initialState)
  };
}

/**
 * Auth store singleton instance
 */
export const authStore = createAuthStore();