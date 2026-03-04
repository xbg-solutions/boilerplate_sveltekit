/**
 * src/lib/types/storage.types.ts
 * Type definitions for secure storage
 */

/**
 * Available storage mechanisms
 */
export type StorageMechanism = 'localStorage' | 'sessionStorage' | 'cookie' | 'memory';

/**
 * Encryption configuration
 */
export type StorageEncryption = {
  /** Whether encryption is enabled */
  enabled: boolean;
  /** Passphrase used to derive the AES-GCM encryption key via PBKDF2 */
  key?: string;
};

/**
 * Cookie-specific options
 */
export type CookieOptions = {
  /** Whether the cookie should be secure (HTTPS only) */
  secure?: boolean;
  /** SameSite attribute for the cookie */
  sameSite?: 'strict' | 'lax' | 'none';
  /** Path for the cookie */
  path?: string;
  /** Domain for the cookie */
  domain?: string;
};

/**
 * Options for storage operations
 */
export type StorageOptions = {
  /** Storage mechanism to use */
  mechanism?: StorageMechanism;
  /** Fallback mechanisms if primary fails */
  fallbackMechanisms?: StorageMechanism[];
  /** Namespace for partitioning storage */
  namespace?: string;
  /** Encryption configuration */
  encryption?: StorageEncryption;
  /** Time to live in seconds (0 for no expiration) */
  ttl?: number;
  /** Options specific to cookie storage */
  cookieOptions?: CookieOptions;
  /** Whether to operate on all storage mechanisms */
  allMechanisms?: boolean;
};

/**
 * Stored value with metadata
 */
export type StorageValue = {
  /** The actual stored value */
  value: any;
  /** Timestamp when the value was created */
  createdAt: number;
  /** Timestamp when the value expires (0 for no expiration) */
  expiresAt: number;
  /** Schema version for potential future migrations */
  version: number;
};

/**
 * Storage adapter interface for different mechanisms
 */
export interface StorageAdapter {
  /**
   * Retrieves a value from storage
   * @param key Storage key
   * @returns The stored value or null if not found
   */
  get(key: string): string | null;
  
  /**
   * Stores a value in storage
   * @param key Storage key
   * @param value Value to store
   * @param options Additional options for specific mechanisms
   * @returns True if storage was successful
   */
  set(key: string, value: string, options?: any): boolean;
  
  /**
   * Removes a value from storage
   * @param key Storage key
   * @returns True if removal was successful
   */
  remove(key: string): boolean;
  
  /**
   * Clears storage
   * @param keyPrefix Optional prefix to only clear keys with this prefix
   * @returns True if clear was successful
   */
  clear(keyPrefix?: string): boolean;
}