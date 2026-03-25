/**
 * src/lib/types/state-manager.types.ts
 * Type definitions for the State Manager
 * 
 * Defines the core types used by the state management system including
 * state structure, versioning, persistence options, and state operations.
 */

import type { Writable, Readable } from 'svelte/store';

/**
 * Persistence strategy for state
 */
export enum PersistenceStrategy {
  NONE = 'none',          // Not persisted
  SESSION = 'session',    // Persisted for the session
  PERMANENT = 'permanent' // Persisted across sessions
}

/**
 * Options for state domain configuration
 */
export interface StateDomainOptions<T> {
  /** Initial state value */
  initialState: T;
  /** Current schema version for migration purposes */
  version?: number;
  /** Persistence level for this state domain */
  persistence?: PersistenceStrategy;
  /** Storage key to use when persisting */
  storageKey?: string;
  /** Whether to emit events when state changes */
  emitEvents?: boolean;
  /** Event type to emit when state changes */
  eventType?: string;
  /** Service/component identifier for event source */
  eventSource?: string;
  /** Whether to log state changes */
  logChanges?: boolean;
  /** Custom migration handlers for version updates */
  migrations?: StateMigrations<T>;
}

/**
 * Migration handlers for state version updates
 */
export interface StateMigrations<T> {
  [fromVersion: number]: (state: any) => T;
}

/**
 * Extended Writable store with additional state management capabilities
 */
export interface StateStore<T> extends Writable<T> {
  /** Reset the store to its initial state */
  reset(): void;
  /** Get the current value without subscribing */
  getValue(): T;
  /** Update a specific property in the state */
  updateProperty<K extends keyof T>(key: K, value: T[K]): void;
  /** Set multiple properties at once */
  setProperties(properties: Partial<T>): void;
  /** Get the domain name for this store */
  getDomain(): string;
  /** Get the current schema version */
  getVersion(): number;
}

/**
 * Metadata about a state domain
 */
export interface StateDomainMeta {
  domain: string;
  version: number;
  persistence: PersistenceStrategy;
  lastUpdated?: number;
}

/**
 * Persisted state wrapper that includes metadata
 */
export interface PersistedState<T> {
  version: number;
  timestamp: number;
  data: T;
}

/**
 * Result type for state operations with error handling
 */
export interface StateOperationResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * Interface for the State Manager service
 */
export interface IStateManager {
  /**
   * Create a new state domain
   * @param domain Domain identifier
   * @param options Configuration options
   * @returns Store for the state domain
   */
  createStore<T>(domain: string, options: StateDomainOptions<T>): StateStore<T>;
  
  /**
   * Get an existing state domain
   * @param domain Domain identifier
   * @returns Store for the state domain
   */
  getStore<T>(domain: string): StateStore<T> | null;
  
  /**
   * Check if a domain exists
   * @param domain Domain identifier
   * @returns Whether the domain exists
   */
  hasDomain(domain: string): boolean;
  
  /**
   * Get a list of all domains
   * @returns Array of domain identifiers
   */
  getDomains(): string[];
  
  /**
   * Get metadata for a domain
   * @param domain Domain identifier
   * @returns Domain metadata
   */
  getDomainMeta(domain: string): StateDomainMeta | null;
  
  /**
   * Clear all data for a domain
   * @param domain Domain identifier
   * @returns Whether the operation was successful
   */
  clearDomain(domain: string): boolean;
  
  /**
   * Reset a domain to its initial state
   * @param domain Domain identifier
   * @returns Whether the operation was successful
   */
  resetDomain(domain: string): boolean;
  
  /**
   * Persist all domains that have persistence enabled
   * @returns Object with success/failure counts
   */
  persistAll(): { success: number; failed: number };
  
  /**
   * Hydrate all domains from persistent storage
   * @returns Object with success/failure counts
   */
  hydrateAll(): { success: number; failed: number };
  
  /**
   * Clear all domain data and reset to initial state
   */
  resetAll(): void;
  
  /**
   * Safe version of createStore that doesn't throw
   * @param domain Domain identifier
   * @param options Configuration options
   * @returns Result object with success flag
   */
  safeCreateStore<T>(
    domain: string, 
    options: StateDomainOptions<T>
  ): StateOperationResult<StateStore<T>>;
  
  /**
   * Safe version of getStore that doesn't throw
   * @param domain Domain identifier
   * @returns Result object with success flag
   */
  safeGetStore<T>(domain: string): StateOperationResult<StateStore<T>>;
}