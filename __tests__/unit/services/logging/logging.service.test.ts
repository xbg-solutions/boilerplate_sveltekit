/**
 * Logging Service Tests - Behavior focused
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Test real logging service
import { loggerService } from '@xbg.solutions/bpsk-core';

describe('LoggerService', () => {
  beforeEach(() => {
    // Clean state
  });

  describe('Service Availability', () => {
    it('should have logger service available', () => {
      expect(loggerService).toBeDefined();
      expect(typeof loggerService.info).toBe('function');
      expect(typeof loggerService.warn).toBe('function');
      expect(typeof loggerService.error).toBe('function');
      expect(typeof loggerService.withContext).toBe('function');
    });

    it('should support contextual logging', () => {
      const contextLogger = loggerService.withContext('test');
      expect(typeof contextLogger.info).toBe('function');
      expect(typeof contextLogger.warn).toBe('function');
      expect(typeof contextLogger.error).toBe('function');
    });
  });

  describe('Basic Logging', () => {
    it('should handle logging without throwing', () => {
      expect(() => {
        loggerService.info('Test message');
        loggerService.warn('Warning message'); 
        loggerService.error('Error message');
      }).not.toThrow();
    });

    it('should handle contextual logging without throwing', () => {
      const contextLogger = loggerService.withContext('TestContext');
      expect(() => {
        contextLogger.info('Context info');
        contextLogger.warn('Context warning');
        contextLogger.error('Context error');
      }).not.toThrow();
    });
  });
});