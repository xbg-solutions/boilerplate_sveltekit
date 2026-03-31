/**
 * src/lib/services/state/state-manager.service.ts
 * State Manager service implementation
 * 
 * The State Manager provides centralized state management with:
 * - Domain-based state organization
 * - Integration with the event system
 * - Persistence capabilities
 * - State migration and versioning
 * - Immutable update patterns
 */

import { get, writable } from 'svelte/store';
import { loggerService } from '@xbg.solutions/bpsk-core';
import { publish, subscribe } from '@xbg.solutions/bpsk-core';
import { secureStorage } from '@xbg.solutions/bpsk-utils-secure-storage';
import { AppError, normalizeError, withErrorHandling } from '@xbg.solutions/bpsk-core';
import { stateManagerStore } from '../../stores/state-manager.store';
import { PersistenceStrategy } from '../../types/state-manager.types';
import type { 
  IStateManager,
  StateDomainOptions,
  StateStore,
  StateDomainMeta,
  PersistedState,
  StateOperationResult
} from '../../types/state-manager.types';

// Create a logger instance for the state manager
const stateLogger = loggerService.withContext('StateManager');

/**
 * State Manager error class
 */
export class StateError extends AppError {
  constructor(message: string, options: Record<string, any> = {}) {
    super(message, {
      category: 'state',
      ...options
    });
  }
}

// Storage namespace for persisted state
const STATE_STORAGE_NAMESPACE = 'app_state';

/**
 * State Manager service implementation
 */
class StateManager implements IStateManager {
  /** Map of domain names to store instances */
  private stores: Map<string, StateStore<any>> = new Map();
  
  /** Map of domain names to initial state values */
  private initialStates: Map<string, any> = new Map();
  
  /** Map of domain names to domain options */
  private domainOptions: Map<string, StateDomainOptions<any>> = new Map();
  
  /**
   * Initialize the State Manager
   */
  constructor() {
    stateLogger.info('State Manager initializing');

    // Update the store to indicate initialization
    stateManagerStore.update(state => ({
      ...state,
      initialized: true
    }));
  }

  /**
   * Create a new state domain with the given configuration
   * 
   * @param domain Domain identifier
   * @param options Configuration options
   * @returns Store for the state domain
   * @throws StateError if domain already exists
   */
  createStore<T>(domain: string, options: StateDomainOptions<T>): StateStore<T> {
    if (this.stores.has(domain)) {
      throw new StateError(`Domain '${domain}' already exists`, { domain });
    }

    stateLogger.info(`Creating state domain: ${domain}`, { 
      domain, 
      version: options.version || 1,
      persistence: options.persistence || PersistenceStrategy.NONE
    });
    
    // Store the initial state for later resets
    this.initialStates.set(domain, options.initialState);
    this.domainOptions.set(domain, options);
    
    // Attempt to hydrate from persistent storage if applicable
    let initialState = options.initialState;
    if (options.persistence && options.persistence !== PersistenceStrategy.NONE) {
      const hydrated = this.hydrateDomain(domain, options);
      if (hydrated.success && hydrated.data) {
        initialState = hydrated.data;
      }
    }
    
    // Create the underlying Svelte store
    const store = writable<T>(initialState);
    
    // Create the enhanced store with additional functionality
    const stateStore: StateStore<T> = {
      subscribe: store.subscribe,
      
      set: (value: T) => {
        const oldValue = get(store);
        store.set(value);
        
        this.handleStateChange(domain, value, oldValue, options);
      },
      
      update: (updater: (value: T) => T) => {
        const oldValue = get(store);
        store.update(updater);
        const newValue = get(store);
        
        this.handleStateChange(domain, newValue, oldValue, options);
      },
      
      reset: () => {
        const oldValue = get(store);
        const initialState = this.initialStates.get(domain) as T;
        
        store.set(initialState);
        this.handleStateChange(domain, initialState, oldValue, options);
      },
      
      getValue: () => get(store),
      
      updateProperty: <K extends keyof T>(key: K, value: T[K]) => {
        const oldValue = get(store);
        const newValue = { ...oldValue, [key]: value };
        
        store.set(newValue);
        this.handleStateChange(domain, newValue, oldValue, options);
      },
      
      setProperties: (properties: Partial<T>) => {
        const oldValue = get(store);
        const newValue = { ...oldValue, ...properties };
        
        store.set(newValue);
        this.handleStateChange(domain, newValue, oldValue, options);
      },
      
      getDomain: () => domain,
      
      getVersion: () => options.version || 1
    };
    
    // Store the state store
    this.stores.set(domain, stateStore);
    
    // Update the state manager store with domain metadata
    this.updateDomainMeta(domain, options);
    
    return stateStore;
  }
  
  /**
   * Get an existing state domain
   * 
   * @param domain Domain identifier
   * @returns Store for the state domain or null if not found
   */
  getStore<T>(domain: string): StateStore<T> | null {
    const store = this.stores.get(domain) as StateStore<T> | undefined;
    return store || null;
  }
  
  /**
   * Check if a domain exists
   * 
   * @param domain Domain identifier
   * @returns Whether the domain exists
   */
  hasDomain(domain: string): boolean {
    return this.stores.has(domain);
  }
  
  /**
   * Get a list of all domains
   * 
   * @returns Array of domain identifiers
   */
  getDomains(): string[] {
    return Array.from(this.stores.keys());
  }
  
  /**
   * Get metadata for a domain
   * 
   * @param domain Domain identifier
   * @returns Domain metadata or null if not found
   */
  getDomainMeta(domain: string): StateDomainMeta | null {
    const state = get(stateManagerStore);
    return state.domains[domain] || null;
  }
  
  /**
   * Clear all data for a domain
   * 
   * @param domain Domain identifier
   * @returns Whether the operation was successful
   */
  clearDomain(domain: string): boolean {
    const store = this.stores.get(domain);
    if (!store) {
      stateLogger.warn(`Cannot clear non-existent domain: ${domain}`);
      return false;
    }
    
    const options = this.domainOptions.get(domain);
    if (!options) {
      stateLogger.warn(`Missing options for domain: ${domain}`);
      return false;
    }
    
    // Clear from persistent storage if applicable
    if (options.persistence && options.persistence !== PersistenceStrategy.NONE) {
      const storageKey = this.getStorageKey(domain, options);
      try {
        secureStorage.removeItem(storageKey, {
          namespace: STATE_STORAGE_NAMESPACE
        });
      } catch (error) {
        stateLogger.error(`Failed to clear persisted state for domain: ${domain}`, error as Error);
      }
    }
    
    // Remove from stores and metadata
    this.stores.delete(domain);
    this.initialStates.delete(domain);
    this.domainOptions.delete(domain);
    
    // Update the state manager store
    stateManagerStore.update(state => {
      const { [domain]: _, ...domains } = state.domains;
      return {
        ...state,
        domains
      };
    });
    
    stateLogger.info(`Cleared domain: ${domain}`);
    return true;
  }
  
  /**
   * Reset a domain to its initial state
   * 
   * @param domain Domain identifier
   * @returns Whether the operation was successful
   */
  resetDomain(domain: string): boolean {
    const store = this.stores.get(domain);
    if (!store) {
      stateLogger.warn(`Cannot reset non-existent domain: ${domain}`);
      return false;
    }
    
    store.reset();
    stateLogger.info(`Reset domain: ${domain}`);
    return true;
  }
  
  /**
   * Persist all domains that have persistence enabled
   * 
   * @returns Object with success/failure counts
   */
  persistAll(): { success: number; failed: number } {
    let success = 0;
    let failed = 0;
    
    for (const [domain, options] of this.domainOptions.entries()) {
      if (options.persistence && options.persistence !== PersistenceStrategy.NONE) {
        const result = this.persistDomain(domain, options);
        if (result.success) {
          success++;
        } else {
          failed++;
        }
      }
    }
    
    stateLogger.info(`Persisted all domains: ${success} succeeded, ${failed} failed`);
    return { success, failed };
  }
  
  /**
   * Hydrate all domains from persistent storage
   * 
   * @returns Object with success/failure counts
   */
  hydrateAll(): { success: number; failed: number } {
    let success = 0;
    let failed = 0;
    
    for (const [domain, options] of this.domainOptions.entries()) {
      if (options.persistence && options.persistence !== PersistenceStrategy.NONE) {
        const result = this.hydrateDomain(domain, options);
        if (result.success) {
          const store = this.stores.get(domain);
          if (store && result.data) {
            store.set(result.data);
            success++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      }
    }
    
    stateLogger.info(`Hydrated all domains: ${success} succeeded, ${failed} failed`);
    return { success, failed };
  }
  
  /**
   * Clear all domain data and reset to initial state
   */
  resetAll(): void {
    for (const domain of this.stores.keys()) {
      this.resetDomain(domain);
    }
    
    stateLogger.info('Reset all domains');
  }
  
  /**
   * Safe version of createStore that doesn't throw
   * 
   * @param domain Domain identifier
   * @param options Configuration options
   * @returns Result object with success flag
   */
  safeCreateStore<T>(
    domain: string,
    options: StateDomainOptions<T>
  ): StateOperationResult<StateStore<T>> {
    try {
      const store = this.createStore(domain, options);
      return { success: true, data: store };
    } catch (error) {
      const normalizedError = normalizeError(error);
      stateLogger.error(`Failed to create store for domain: ${domain}`, normalizedError);
      return { success: false, error: normalizedError };
    }
  }
  
  /**
   * Safe version of getStore that doesn't throw
   * 
   * @param domain Domain identifier
   * @returns Result object with success flag
   */
  safeGetStore<T>(domain: string): StateOperationResult<StateStore<T>> {
    try {
      const store = this.getStore<T>(domain);
      if (!store) {
        return {
          success: false,
          error: new StateError(`Domain '${domain}' not found`, { domain })
        };
      }
      
      return { success: true, data: store };
    } catch (error) {
      const normalizedError = normalizeError(error);
      stateLogger.error(`Failed to get store for domain: ${domain}`, normalizedError);
      return { success: false, error: normalizedError };
    }
  }
  
  /**
   * Handle state changes, including logging, events, and persistence
   * 
   * @param domain Domain identifier
   * @param newValue New state value
   * @param oldValue Previous state value
   * @param options Domain options
   */
  private handleStateChange<T>(
    domain: string,
    newValue: T,
    oldValue: T,
    options: StateDomainOptions<T>
  ): void {
    // Log the state change if enabled
    if (options.logChanges) {
      stateLogger.info(`State change in domain: ${domain}`, { 
        domain,
        oldValue,
        newValue
      });
    }
    
    // Emit an event if enabled
    if (options.emitEvents) {
      const eventType = options.eventType || `state:${domain}:changed`;
      publish(eventType, {
        domain,
        value: newValue,
        previousValue: oldValue
      }, options.eventSource || 'StateManager');
    }
    
    // Persist the state if enabled
    if (options.persistence && options.persistence !== PersistenceStrategy.NONE) {
      this.persistDomain(domain, options);
    }
    
    // Update last updated timestamp in metadata
    stateManagerStore.update(state => ({
      ...state,
      domains: {
        ...state.domains,
        [domain]: {
          ...state.domains[domain],
          lastUpdated: Date.now()
        }
      }
    }));
  }
  
  /**
   * Persist a domain's state to storage
   * 
   * @param domain Domain identifier
   * @param options Domain options
   * @returns Result of the operation
   */
  private persistDomain<T>(
    domain: string,
    options: StateDomainOptions<T>
  ): StateOperationResult<boolean> {
    try {
      const store = this.stores.get(domain);
      if (!store) {
        return {
          success: false,
          error: new StateError(`Cannot persist non-existent domain: ${domain}`, { domain })
        };
      }
      
      // Get current state
      const currentState = store.getValue();
      
      // Create persistence wrapper
      const wrapper: PersistedState<T> = {
        version: options.version || 1,
        timestamp: Date.now(),
        data: currentState
      };
      
      // Determine storage mechanism
      const mechanism = options.persistence === PersistenceStrategy.SESSION
        ? 'sessionStorage'
        : 'localStorage';
      
      // Get storage key
      const storageKey = this.getStorageKey(domain, options);
      
      // Persist to storage
      secureStorage.setItem(storageKey, wrapper, {
        namespace: STATE_STORAGE_NAMESPACE,
        mechanism
      });
      
      if (options.logChanges) {
        stateLogger.info(`Persisted state for domain: ${domain}`, { mechanism });
      }
      
      return { success: true, data: true };
    } catch (error) {
      const normalizedError = normalizeError(error);
      stateLogger.error(`Failed to persist state for domain: ${domain}`, normalizedError);
      return { success: false, error: normalizedError };
    }
  }
  
  /**
   * Hydrate a domain's state from storage
   * 
   * @param domain Domain identifier
   * @param options Domain options
   * @returns Result containing the hydrated state or error
   */
  private hydrateDomain<T>(
    domain: string,
    options: StateDomainOptions<T>
  ): StateOperationResult<T> {
    try {
      // Determine storage mechanism
      const mechanism = options.persistence === PersistenceStrategy.SESSION
        ? 'sessionStorage'
        : 'localStorage';
      
      // Get storage key
      const storageKey = this.getStorageKey(domain, options);
      
      // Retrieve from storage
      const wrapper = secureStorage.getItem<PersistedState<T>>(storageKey, {
        namespace: STATE_STORAGE_NAMESPACE,
        mechanism
      });
      
      if (!wrapper) {
        // No persisted state found, not an error
        return { success: true, data: options.initialState };
      }
      
      // Check if migration is needed
      if (wrapper.version !== (options.version || 1)) {
        if (options.migrations?.[wrapper.version]) {
          // Apply migration
          const migratedState = options.migrations[wrapper.version](wrapper.data);
          
          stateLogger.info(
            `Migrated state for domain: ${domain} from v${wrapper.version} to v${options.version || 1}`,
            { domain }
          );
          
          return { success: true, data: migratedState };
        } else {
          // No migration available, use initial state
          stateLogger.warn(
            `No migration available for domain: ${domain} from v${wrapper.version} to v${options.version || 1}`,
            { domain }
          );
          
          return { success: true, data: options.initialState };
        }
      }
      
      stateLogger.info(`Hydrated state for domain: ${domain}`, { mechanism });
      return { success: true, data: wrapper.data };
    } catch (error) {
      const normalizedError = normalizeError(error);
      stateLogger.error(`Failed to hydrate state for domain: ${domain}`, normalizedError);
      return { success: false, error: normalizedError };
    }
  }
  
  /**
   * Update domain metadata in the state manager store
   * 
   * @param domain Domain identifier
   * @param options Domain options
   */
  private updateDomainMeta<T>(domain: string, options: StateDomainOptions<T>): void {
    const meta: StateDomainMeta = {
      domain,
      version: options.version || 1,
      persistence: options.persistence || PersistenceStrategy.NONE,
      lastUpdated: Date.now()
    };
    
    stateManagerStore.update(state => ({
      ...state,
      domains: {
        ...state.domains,
        [domain]: meta
      }
    }));
  }
  
  /**
   * Get the storage key for a domain
   * 
   * @param domain Domain identifier
   * @param options Domain options
   * @returns Storage key
   */
  private getStorageKey<T>(domain: string, options: StateDomainOptions<T>): string {
    return options.storageKey || `state_${domain}`;
  }
}

// Create the StateManager instance
const stateManager = new StateManager();

// Export the StateManager instance
export const stateManagerService = stateManager;

// Export safe versions of methods
export const {
  safeCreateStore,
  safeGetStore
} = stateManager;