/**
 * src/lib/utils/mutex.test.ts
 * Tests for mutex utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mutexService, MutexError } from '@xbg.solutions/frontend-core';
import { loggerService } from '@xbg.solutions/frontend-core';

// Mock the logger service
vi.mock('../services/logging/logging.service', () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    withContext: vi.fn()
  };
  
  // Mock the withContext function to return a similar mock
  mockLogger.withContext.mockReturnValue({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  });
  
  return {
    loggerService: mockLogger
  };
});

// Mock import.meta.env
vi.stubGlobal('import', { 
  meta: { 
    env: { 
      DEV: true 
    } 
  } 
});

// Test options with test mode enabled
const TEST_OPTIONS = { _testMode: true };

describe('Mutex Utility', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Clear any existing locks
    for (const lock of mutexService.getAllLocks()) {
      mutexService.forceRelease(lock.name);
    }
    
    // Reset timers
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  
  describe('Basic lock operations', () => {
    it('should acquire and release locks', async () => {
      const lockName = 'test-lock-1';
      
      // Acquire lock
      const release = await mutexService.acquire(lockName);
      
      // Check if lock is held
      expect(mutexService.isLocked(lockName)).toBe(true);
      
      // Release lock
      const released = release();
      
      // Lock should be released
      expect(released).toBe(true);
      expect(mutexService.isLocked(lockName)).toBe(false);
    });
    
    it('should prevent concurrent acquisition of the same lock', async () => {
      const lockName = 'test-lock-2';
      
      // Acquire first lock
      const release1 = await mutexService.acquire(lockName);
      
      // Try to acquire second lock (should fail)
      const acquirePromise = mutexService.acquire(lockName, TEST_OPTIONS);
      
      // Should fail immediately in test mode
      await expect(acquirePromise).rejects.toThrow(MutexError);
      await expect(acquirePromise).rejects.toThrow(`Failed to acquire mutex "${lockName}"`);
      
      // First lock should still be held
      expect(mutexService.isLocked(lockName)).toBe(true);
      
      // Release first lock
      release1();
      
      // Now lock should be available
      expect(mutexService.isLocked(lockName)).toBe(false);
      
      // Should be able to acquire the lock now
      const release2 = await mutexService.acquire(lockName);
      expect(mutexService.isLocked(lockName)).toBe(true);
      
      // Clean up
      release2();
    });
    
    it('should force release a lock', async () => {
      const lockName = 'test-lock-3';
      
      // Acquire lock
      await mutexService.acquire(lockName);
      
      // Check if lock is held
      expect(mutexService.isLocked(lockName)).toBe(true);
      
      // Force release
      const released = mutexService.forceRelease(lockName);
      
      // Lock should be released
      expect(released).toBe(true);
      expect(mutexService.isLocked(lockName)).toBe(false);
    });
    
    it('should return false when trying to release a non-existent lock', () => {
      const lockName = 'non-existent-lock';
      
      // Try to release a lock that doesn't exist
      const released = mutexService.release(lockName);
      
      // Should return false
      expect(released).toBe(false);
    });
  });
  
  describe('Lock expiration', () => {
    it('should auto-release expired locks', async () => {
      const lockName = 'expiring-lock';
      
      // Acquire lock with short expiry
      await mutexService.acquire(lockName, { lockExpiry: 500 });
      
      // Check if lock is held
      expect(mutexService.isLocked(lockName)).toBe(true);
      
      // Advance time but not enough for expiration
      vi.advanceTimersByTime(300);
      expect(mutexService.isLocked(lockName)).toBe(true);
      
      // Advance time past expiration
      vi.advanceTimersByTime(300);
      
      // Lock should be auto-released on the next operation
      expect(mutexService.isLocked(lockName)).toBe(false);
    });
    
    it('should allow acquisition of a previously expired lock', async () => {
      const lockName = 'expired-then-acquired';
      
      // Acquire lock with short expiry
      await mutexService.acquire(lockName, { lockExpiry: 500 });
      
      // Advance time past expiration
      vi.advanceTimersByTime(600);
      
      // Acquire lock again
      const release = await mutexService.acquire(lockName);
      
      // Should acquire successfully
      expect(mutexService.isLocked(lockName)).toBe(true);
      
      // Clean up
      release();
    });
  });
  
  describe('Lock information', () => {
    it('should return lock information', async () => {
      const lockName = 'info-lock';
      
      // Acquire lock
      const now = Date.now();
      const release = await mutexService.acquire(lockName, { lockExpiry: 1000 });
      
      // Get lock info
      const lockInfo = mutexService.getLockInfo(lockName);
      
      // Check info properties
      expect(lockInfo).not.toBeNull();
      expect(lockInfo?.name).toBe(lockName);
      expect(lockInfo?.acquiredAt).toBeGreaterThanOrEqual(now);
      expect(lockInfo?.expiresAt).toBeGreaterThan(lockInfo?.acquiredAt || 0);
      expect(lockInfo?.stack).toBeDefined(); // In DEV mode
      
      // Clean up
      release();
    });
    
    it('should return null for non-existent lock info', () => {
      const lockInfo = mutexService.getLockInfo('non-existent-lock');
      expect(lockInfo).toBeNull();
    });
    
    it('should return all active locks', async () => {
      // Ensure no locks at start
      expect(mutexService.getAllLocks().length).toBe(0);
      
      // Acquire multiple locks
      const release1 = await mutexService.acquire('lock-a');
      const release2 = await mutexService.acquire('lock-b');
      
      // Get all locks
      const locks = mutexService.getAllLocks();
      
      // Should have both locks
      expect(locks.length).toBe(2);
      expect(locks.map(l => l.name).sort()).toEqual(['lock-a', 'lock-b']);
      
      // Clean up
      release1();
      release2();
    });
  });
  
  describe('Safe operations', () => {
    it('should provide a safe version of acquire that never throws', async () => {
      const lockName = 'safe-acquire-lock';
      
      // Acquire lock first
      const release1 = await mutexService.acquire(lockName);
      
      // Try to safely acquire the same lock
      const release2 = await mutexService.safeAcquire(lockName, TEST_OPTIONS);
      
      // Safe acquire should return null instead of throwing
      expect(release2).toBeNull();
      
      // First lock should still be held
      expect(mutexService.isLocked(lockName)).toBe(true);
      
      // Clean up
      release1();
    });
    
    it('should safely execute a function with a lock', async () => {
      const lockName = 'safe-with-lock';
      const mockFn = vi.fn().mockResolvedValue('success');
      
      // Execute with lock
      const result = await mutexService.safeWithLock(lockName, mockFn);
      
      // Function should be called and return success
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      
      // Lock should be released after
      expect(mutexService.isLocked(lockName)).toBe(false);
    });
    
    it('should handle function errors in safeWithLock', async () => {
      const lockName = 'error-function-lock';
      const mockError = new Error('Function error');
      const mockFn = vi.fn().mockRejectedValue(mockError);
      
      // Execute with lock
      const result = await mutexService.safeWithLock(lockName, mockFn);
      
      // Function should be called and return failure
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      // Lock should be released despite error
      expect(mutexService.isLocked(lockName)).toBe(false);
    });
    
    it('should handle acquisition failures in safeWithLock', async () => {
      const lockName = 'acquisition-failure-lock';
      const mockFn = vi.fn().mockResolvedValue('success');
      
      // Acquire lock first to force failure
      const release = await mutexService.acquire(lockName);
      
      // Try to safely execute with the same lock
      const result = await mutexService.safeWithLock(lockName, mockFn, TEST_OPTIONS);
      
      // Function should not be called
      expect(mockFn).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toMatch(/Failed to acquire mutex/);
      
      // Clean up
      release();
    });
  });
  
  describe('Concurrent operations', () => {
    // Use real timers for these tests
    it('should execute functions with different locks concurrently', async () => {
      // Use real timers for this test
      vi.useRealTimers();
      
      // Setup test with simpler mock functions
      const mockFn1 = vi.fn().mockResolvedValue('result1');
      const mockFn2 = vi.fn().mockResolvedValue('result2');
      
      // Start both operations
      const promise1 = mutexService.withLock('concurrent-lock-1', mockFn1);
      const promise2 = mutexService.withLock('concurrent-lock-2', mockFn2);
      
      // Wait for both to complete
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      // Check results and calls
      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn2).toHaveBeenCalledTimes(1);
      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
    });
    
    it('should queue functions with the same lock', async () => {
      // Use real timers for this test
      vi.useRealTimers();
      
      // Setup test
      const lockName = 'queue-lock';
      const results: string[] = [];
      
      // Create a function that resolves after a delay
      const mockFn1 = vi.fn().mockImplementation(async () => {
        results.push('fn1-start');
        // Short delay
        await new Promise(resolve => setTimeout(resolve, 50));
        results.push('fn1-end');
        return 'result1';
      });
      
      // Immediately call the first function with the lock
      const promise1 = mutexService.withLock(lockName, mockFn1);
      
      // Give time for the first function to start
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Now first function should be called
      expect(mockFn1).toHaveBeenCalledTimes(1);
      
      // Create a second function
      const mockFn2 = vi.fn().mockImplementation(async () => {
        results.push('fn2-start');
        // Short delay
        await new Promise(resolve => setTimeout(resolve, 50));
        results.push('fn2-end');
        return 'result2';
      });
      
      // Try to call the second function with the same lock
      // This should wait until the first one is done
      const promise2 = mutexService.withLock(lockName, mockFn2);
      
      // At this point, the second function shouldn't be called yet
      expect(mockFn2).toHaveBeenCalledTimes(0);
      
      // Wait for both promises to resolve
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      // Now both functions should have been called
      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn2).toHaveBeenCalledTimes(1);
      
      // Check results
      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
      
      // Check execution order - fn1 should complete before fn2 starts
      expect(results).toEqual(['fn1-start', 'fn1-end', 'fn2-start', 'fn2-end']);
    });
  });
});