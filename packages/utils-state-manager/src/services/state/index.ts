/**
 * src/lib/services/state/index.ts
 * Central export file for the State Manager service
 * 
 * Provides a single import point for all state management functionality.
 */

// Import the service
import { 
  stateManagerService,
  safeCreateStore,
  safeGetStore,
  StateError
} from './state-manager.service';

// Export the service
export { 
  stateManagerService,
  safeCreateStore,
  safeGetStore,
  StateError
};

// Re-export the store for consumers that need it
export { stateManagerStore } from '../../stores/state-manager.store';

// Re-export types for convenience
export type {
  IStateManager,
  StateDomainOptions,
  StateStore,
  StateDomainMeta,
  StateOperationResult
} from '../../types/state-manager.types';

export { PersistenceStrategy } from '../../types/state-manager.types';

// Export convenience factory functions
export function createDomain<T>(
  domain: string, 
  initialState: T, 
  options: Partial<Omit<import('../../types/state-manager.types').StateDomainOptions<T>, 'initialState'>> = {}
) {
  return stateManagerService.createStore(domain, {
    initialState,
    ...options
  });
}

export function getDomain<T>(domain: string) {
  return stateManagerService.getStore<T>(domain);
}

export const resetDomain = stateManagerService.resetDomain.bind(stateManagerService);
export const clearDomain = stateManagerService.clearDomain.bind(stateManagerService);
export const persistAll = stateManagerService.persistAll.bind(stateManagerService);
export const hydrateAll = stateManagerService.hydrateAll.bind(stateManagerService);
export const resetAll = stateManagerService.resetAll.bind(stateManagerService);