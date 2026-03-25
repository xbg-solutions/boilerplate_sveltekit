/**
 * src/lib/stores/state-manager.store.ts
 * State Manager store implementation
 * 
 * Provides the Svelte store for tracking state domains and metadata.
 */

import { writable } from 'svelte/store';
import type { StateDomainMeta } from '../types/state-manager.types';

/**
 * State Manager store state interface
 */
export interface StateManagerState {
  /** Map of domain metadata */
  domains: Record<string, StateDomainMeta>;
  /** Whether state manager is initialized */
  initialized: boolean;
  /** Any error that occurred during initialization */
  error?: Error;
}

/**
 * Create and initialize the state manager store
 */
function createStateManagerStore() {
  const initialState: StateManagerState = {
    domains: {},
    initialized: false
  };
  
  return writable<StateManagerState>(initialState);
}

/**
 * Singleton store instance for state manager
 */
export const stateManagerStore = createStateManagerStore();