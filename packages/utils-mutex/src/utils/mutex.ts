/**
 * src/lib/utils/mutex.ts
 * Mutex utility for managing critical sections
 */

import { loggerService, AppError, normalizeError } from '@xbg.solutions/bpsk-core';
import type { MutexOptions, MutexLockInfo, MutexResult } from '../types/mutex.types';
import { 
  DEFAULT_MUTEX_TIMEOUT, 
  DEFAULT_MUTEX_LOCK_EXPIRY,
  MUTEX_POLLING_INTERVAL
} from '../constants/mutex.constants';

// Create a context-aware logger
const mutexLogger = loggerService.withContext('MutexUtility');

/**
 * Error class for mutex-specific errors
 */
export class MutexError extends AppError {
  /** Lock name that caused the error */
  public lockName?: string;
  /** Timeout duration if applicable */
  public timeout?: number;

  constructor(message: string, options: { 
    lockName?: string;
    timeout?: number;
    [key: string]: any;
  } = {}) {
    super(message, {
      category: 'mutex',
      statusCode: 423, // Locked (WebDAV status code)
      userMessage: options.userMessage || 'Resource is currently locked. Please try again later.',
      ...options
    });
    
    this.lockName = options.lockName;
    this.timeout = options.timeout;
  }
}

/**
 * Mutex implementation for managing critical sections
 */
class Mutex {
  /** Map of active locks by name */
  private locks: Map<string, MutexLockInfo> = new Map();
  
  /**
   * Acquire a named mutex lock
   * 
   * @param name Unique name of the lock
   * @param options Lock acquisition options
   * @returns Promise that resolves to a function that releases the lock
   * @throws MutexError if lock cannot be acquired within timeout
   */
  async acquire(name: string, options: MutexOptions = {}): Promise<() => boolean> {
    const timeout = options.timeout || DEFAULT_MUTEX_TIMEOUT;
    const lockExpiry = options.lockExpiry || DEFAULT_MUTEX_LOCK_EXPIRY;
    const debug = options.debug ?? import.meta.env.DEV;
    const testMode = options._testMode || false; // Private option for testing
    
    const startTime = Date.now();
    
    // Clean up any expired locks first
    this.cleanupExpiredLocks();
    
    // Try to acquire the lock
    while (this.locks.has(name)) {
      // Check if we've exceeded timeout
      if (Date.now() - startTime > timeout) {
        const existingLock = this.locks.get(name);
        
        mutexLogger.warn(`Mutex acquisition timeout for "${name}"`, { 
          timeout, 
          lockInfo: existingLock,
          acquiredAgo: existingLock ? Date.now() - existingLock.acquiredAt : null,
          timeRemaining: existingLock ? existingLock.expiresAt - Date.now() : null
        });
        
        throw new MutexError(`Failed to acquire mutex "${name}" after ${timeout}ms`, {
          lockName: name,
          timeout,
          context: {
            acquiredAt: existingLock?.acquiredAt,
            expiresAt: existingLock?.expiresAt,
            heldFor: existingLock ? Date.now() - existingLock.acquiredAt : null
          }
        });
      }
      
      // In test mode, we fail fast instead of waiting
      if (testMode) {
        throw new MutexError(`Failed to acquire mutex "${name}" (test mode)`, {
          lockName: name,
          timeout
        });
      }
      
      // Wait a bit before trying again
      await new Promise(resolve => setTimeout(resolve, MUTEX_POLLING_INTERVAL));
    }
    
    // Acquire the lock
    const now = Date.now();
    const lockInfo: MutexLockInfo = {
      name,
      acquiredAt: now,
      expiresAt: now + lockExpiry,
      stack: debug ? new Error().stack : undefined
    };
    
    this.locks.set(name, lockInfo);
    
    mutexLogger.info(`Mutex "${name}" acquired`, { 
      lockInfo,
      expiresIn: lockExpiry
    });
    
    // Return release function
    return () => this.release(name);
  }
  
  /**
   * Release a mutex lock
   * 
   * @param name Name of the lock to release
   * @returns true if lock was released, false if it wasn't held
   */
  release(name: string): boolean {
    if (!this.locks.has(name)) {
      mutexLogger.warn(`Attempted to release non-existent mutex "${name}"`);
      return false;
    }
    
    const lockInfo = this.locks.get(name);
    this.locks.delete(name);
    
    mutexLogger.info(`Mutex "${name}" released`, {
      heldFor: Date.now() - (lockInfo?.acquiredAt || 0)
    });
    
    return true;
  }
  
  /**
   * Force release a lock regardless of who holds it
   * 
   * @param name Name of the lock to force release
   * @returns true if a lock was force-released, false if it wasn't held
   */
  forceRelease(name: string): boolean {
    if (!this.locks.has(name)) {
      return false;
    }
    
    const lockInfo = this.locks.get(name);
    this.locks.delete(name);
    
    mutexLogger.warn(`Mutex "${name}" force released`, {
      lockInfo,
      heldFor: Date.now() - (lockInfo?.acquiredAt || 0)
    });
    
    return true;
  }
  
  /**
   * Check if a lock is currently held
   * 
   * @param name Name of the lock to check
   * @returns true if the lock is held, false otherwise
   */
  isLocked(name: string): boolean {
    this.cleanupExpiredLocks();
    return this.locks.has(name);
  }
  
  /**
   * Get information about a held lock
   * 
   * @param name Name of the lock
   * @returns Lock information or null if not held
   */
  getLockInfo(name: string): MutexLockInfo | null {
    this.cleanupExpiredLocks();
    return this.locks.get(name) || null;
  }
  
  /**
   * Get all currently held locks
   * 
   * @returns Array of lock information
   */
  getAllLocks(): MutexLockInfo[] {
    this.cleanupExpiredLocks();
    return Array.from(this.locks.values());
  }
  
  /**
   * Safe version of acquire that never throws
   * 
   * @param name Lock name
   * @param options Lock options
   * @returns Promise that resolves to a release function or null if acquisition failed
   */
  async safeAcquire(name: string, options: MutexOptions = {}): Promise<(() => boolean) | null> {
    try {
      return await this.acquire(name, options);
    } catch (error) {
      const normalizedError = normalizeError(error);
      
      mutexLogger.error(`Failed to safely acquire mutex "${name}"`, normalizedError, {
        options
      });
      
      return null;
    }
  }
  
  /**
   * Execute a function with a mutex lock
   * 
   * @param name Lock name
   * @param fn Function to execute with the lock
   * @param options Lock options
   * @returns Promise resolving to the function result
   * @throws Original error from the function or MutexError if lock cannot be acquired
   */
  async withLock<T>(name: string, fn: () => Promise<T>, options: MutexOptions = {}): Promise<T> {
    const release = await this.acquire(name, options);
    
    try {
      return await fn();
    } finally {
      release();
    }
  }
  
  /**
   * Safely execute a function with a mutex lock, never throws mutex errors
   * 
   * @param name Lock name
   * @param fn Function to execute with the lock
   * @param options Lock options
   * @returns Promise resolving to an object with success flag and result or error
   */
  async safeWithLock<T>(
    name: string, 
    fn: () => Promise<T>, 
    options: MutexOptions = {}
  ): Promise<MutexResult<T>> {
    try {
      const release = await this.acquire(name, options);
      
      try {
        const result = await fn();
        return { success: true, result };
      } catch (error) {
        const normalizedError = normalizeError(error);
        
        mutexLogger.error(`Operation failed while holding mutex "${name}"`, normalizedError);
        
        return { 
          success: false, 
          error: normalizedError
        };
      } finally {
        release();
      }
    } catch (error) {
      const normalizedError = normalizeError(error);
      
      mutexLogger.error(`Failed to acquire mutex "${name}" for safe operation`, normalizedError);
      
      return { 
        success: false, 
        error: normalizedError
      };
    }
  }
  
  /**
   * Clean up any expired locks
   * @private
   */
  private cleanupExpiredLocks(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [name, info] of this.locks.entries()) {
      if (info.expiresAt <= now) {
        this.locks.delete(name);
        expiredCount++;
        
        mutexLogger.warn(`Mutex "${name}" expired and auto-released`, { 
          lockInfo: info,
          heldFor: now - info.acquiredAt,
          expiredAgo: now - info.expiresAt
        });
      }
    }
    
    if (expiredCount > 0) {
      mutexLogger.info(`Cleaned up ${expiredCount} expired lock(s)`);
    }
  }
}

// Export a singleton instance
export const mutexService = new Mutex();