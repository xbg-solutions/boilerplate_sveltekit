/**
 * src/lib/types/mutex.types.ts
 * Type definitions for mutex utility
 */

/**
 * Options for mutex operations
 */
export type MutexOptions = {
  /** Maximum time to wait for lock acquisition (ms) */
  timeout?: number;
  
  /** Maximum time a lock can be held (ms) */
  lockExpiry?: number;
  
  /** Whether to track detailed acquisition info (stack traces etc.) */
  debug?: boolean;
  
  /** Internal testing flag - not for general use */
  _testMode?: boolean;
};

/**
 * Information about a held mutex lock
 */
export type MutexLockInfo = {
  /** Name of the lock */
  name: string;
  
  /** Timestamp when the lock was acquired */
  acquiredAt: number;
  
  /** Timestamp when the lock will expire */
  expiresAt: number;
  
  /** Stack trace from when the lock was acquired (only in debug mode) */
  stack?: string;
};

/**
 * Result type for safe mutex operations
 */
export type MutexResult<T> = {
  /** Whether the operation succeeded */
  success: boolean;
  
  /** Result of the operation if successful */
  result?: T;
  
  /** Error if operation failed */
  error?: Error;
};