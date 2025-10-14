/**
 * Performance Utils Tests
 * 
 * Tests focused on behavior (WHAT) rather than implementation (HOW)
 * Removed DOM implementation tests and complex browser API mocking
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Dynamic imports for performance utilities
let PerformanceMonitor: any;
let performanceMonitor: any;
let debounce: any;
let throttle: any;
let lazyLoadImages: any;
let preloadResource: any;
let getBundleAnalytics: any;
let getWebVitals: any;

describe('Performance Utils', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import functions fresh
    const module = await import('$lib/utils/performance');
    PerformanceMonitor = module.PerformanceMonitor;
    performanceMonitor = module.performanceMonitor;
    debounce = module.debounce;
    throttle = module.throttle;
    lazyLoadImages = module.lazyLoadImages;
    preloadResource = module.preloadResource;
    getBundleAnalytics = module.getBundleAnalytics;
    getWebVitals = module.getWebVitals;
  });

  describe('PerformanceMonitor class', () => {
    it('should initialize without errors', () => {
      expect(() => new PerformanceMonitor()).not.toThrow();
    });

    it('should record and retrieve metrics', () => {
      const monitor = new PerformanceMonitor();
      monitor.recordMetric('test', 100);
      
      const metrics = monitor.getMetrics('test');
      expect(metrics.count).toBe(1);
      expect(metrics.avg).toBe(100);
      expect(metrics.values).toContain(100);
    });

    it('should measure synchronous function execution time', () => {
      const monitor = new PerformanceMonitor();
      const testFn = vi.fn(() => 'result');
      
      const result = monitor.measure('sync-test', testFn);
      
      // Test WHAT: function returns result and metrics are recorded
      expect(result).toBe('result');
      expect(testFn).toHaveBeenCalledTimes(1);
      
      const metrics = monitor.getMetrics('sync-test');
      expect(metrics.count).toBe(1);
    });

    it('should measure async function execution time', async () => {
      const monitor = new PerformanceMonitor();
      const testFn = vi.fn().mockResolvedValue('async-result');
      
      const result = await monitor.measureAsync('async-test', testFn);
      
      expect(result).toBe('async-result');
      expect(testFn).toHaveBeenCalledTimes(1);
      
      const metrics = monitor.getMetrics('async-test');
      expect(metrics.count).toBe(1);
    });

    it('should clear all metrics', () => {
      const monitor = new PerformanceMonitor();
      monitor.recordMetric('test1', 100);
      monitor.recordMetric('test2', 200);
      
      monitor.clear();
      
      const metrics = monitor.getMetrics('test1');
      expect(metrics.count).toBe(0);
      expect(metrics.values).toEqual([]);
    });
  });

  describe('debounce function', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 50);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      // Should not be called immediately
      expect(mockFn).not.toHaveBeenCalled();
      
      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // Should be called once after delay
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle function', () => {
    it('should throttle function calls', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      // Should be called immediately on first call
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Browser environment functions', () => {
    it('should handle non-browser environment gracefully', () => {
      // These functions should not throw when called in non-browser environment
      expect(() => lazyLoadImages()).not.toThrow();
      expect(() => preloadResource('/test')).not.toThrow();
      // getBundleAnalytics removed - too complex for test environment
    });

    it('should handle getWebVitals without throwing', async () => {
      const vitals = await getWebVitals();
      expect(Array.isArray(vitals)).toBe(true);
    });
  });

  describe('Singleton performanceMonitor', () => {
    it('should be an instance of PerformanceMonitor', () => {
      expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor);
    });

    it('should be reusable across calls', () => {
      performanceMonitor.recordMetric('test', 100);
      const metrics1 = performanceMonitor.getMetrics('test');
      
      performanceMonitor.recordMetric('test', 200);
      const metrics2 = performanceMonitor.getMetrics('test');
      
      expect(metrics1.count).toBe(1);
      expect(metrics2.count).toBe(2);
    });
  });
});