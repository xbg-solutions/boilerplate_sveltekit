/**
 * src/lib/stores/initialization.store.ts
 * Initialization Store
 * 
 * A Svelte store for managing initialization state.
 */

import { writable } from 'svelte/store';
import type { AppError } from '../utils/error-handler';

/**
 * Initialization store state
 */
export interface InitializationState {
  /** Whether all services are initialized */
  isInitialized: boolean;
  /** Whether initialization is in progress */
  isInitializing: boolean;
  /** Any error that occurred during initialization */
  error: AppError | null;
  /** Status of individual services */
  services: {
    app: boolean;
    auth: boolean;
  }
}

/**
 * Initial state for the initialization store
 */
const initialState: InitializationState = {
  isInitialized: false,
  isInitializing: false,
  error: null,
  services: {
    app: false,
    auth: false
  }
};

/**
 * Creates the initialization store
 */
function createInitializationStore() {
  return writable<InitializationState>(initialState);
}

/**
 * Initialization store singleton instance
 */
export const initializationStore = createInitializationStore();