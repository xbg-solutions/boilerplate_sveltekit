/**
 * Toast Index Export Tests
 * Tests for the toast service exports
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the underlying modules
vi.mock('$lib/services/toast/toast.service', () => ({
  toastService: {
    show: vi.fn(),
    hide: vi.fn(),
    clear: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('$lib/services/toast/toast-event-handlers', () => ({
  initToastEventHandlers: vi.fn(),
  destroyToastEventHandlers: vi.fn()
}));

describe('Toast Index Exports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Toast Service Exports', () => {
    it('should export toastService with all expected methods', async () => {
      const { toastService } = await import('$lib/services/toast/index');
      
      expect(toastService).toBeDefined();
      expect(typeof toastService.show).toBe('function');
      expect(typeof toastService.hide).toBe('function');
      expect(typeof toastService.clear).toBe('function');
      expect(typeof toastService.info).toBe('function');
      expect(typeof toastService.success).toBe('function');
      expect(typeof toastService.warning).toBe('function');
      expect(typeof toastService.error).toBe('function');
    });

    it('should export toast alias for toastService', async () => {
      const { toast, toastService } = await import('$lib/services/toast/index');
      
      expect(toast).toBeDefined();
      expect(toast).toBe(toastService);
    });
  });

  describe('Event Handler Exports', () => {
    it('should export initToastEventHandlers function', async () => {
      const { initToastEventHandlers } = await import('$lib/services/toast/index');
      
      expect(initToastEventHandlers).toBeDefined();
      expect(typeof initToastEventHandlers).toBe('function');
    });

    it('should export destroyToastEventHandlers function', async () => {
      const { destroyToastEventHandlers } = await import('$lib/services/toast/index');
      
      expect(destroyToastEventHandlers).toBeDefined();
      expect(typeof destroyToastEventHandlers).toBe('function');
    });
  });

  describe('Complete API Surface', () => {
    it('should export all expected functions and objects', async () => {
      const toastModule = await import('$lib/services/toast/index');
      
      const expectedExports = [
        'toastService',
        'toast',
        'initToastEventHandlers', 
        'destroyToastEventHandlers'
      ];
      
      for (const exportName of expectedExports) {
        expect(toastModule).toHaveProperty(exportName);
        expect(toastModule[exportName]).toBeDefined();
      }
    });

    it('should provide consistent API across different import methods', async () => {
      // Import the whole module
      const toastModule = await import('$lib/services/toast/index');
      
      // Import specific exports
      const { toastService, toast, initToastEventHandlers } = await import('$lib/services/toast/index');
      
      expect(toastModule.toastService).toBe(toastService);
      expect(toastModule.toast).toBe(toast);
      expect(toastModule.initToastEventHandlers).toBe(initToastEventHandlers);
    });
  });

  describe('Functional Integration', () => {
    it('should allow calling toastService methods through both exports', async () => {
      const { toastService, toast } = await import('$lib/services/toast/index');
      
      // Test that both references work
      toastService.info('Test message 1');
      toast.success('Test message 2');
      
      expect(toastService.info).toHaveBeenCalledWith('Test message 1');
      expect(toastService.success).toHaveBeenCalledWith('Test message 2');
    });

    it('should allow calling event handler functions', async () => {
      const { initToastEventHandlers, destroyToastEventHandlers } = await import('$lib/services/toast/index');
      
      initToastEventHandlers();
      destroyToastEventHandlers();
      
      const mockInit = vi.mocked(initToastEventHandlers);
      const mockDestroy = vi.mocked(destroyToastEventHandlers);
      
      expect(mockInit).toHaveBeenCalledTimes(1);
      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for toastService methods', async () => {
      const { toastService } = await import('$lib/services/toast/index');
      
      // These should be callable with proper types
      expect(() => toastService.show).not.toThrow();
      expect(() => toastService.info).not.toThrow();
      expect(() => toastService.success).not.toThrow();
      expect(() => toastService.warning).not.toThrow();
      expect(() => toastService.error).not.toThrow();
      expect(() => toastService.hide).not.toThrow();
      expect(() => toastService.clear).not.toThrow();
    });

    it('should maintain type safety for event handler functions', async () => {
      const { initToastEventHandlers, destroyToastEventHandlers } = await import('$lib/services/toast/index');
      
      // These should be callable
      expect(() => initToastEventHandlers).not.toThrow();
      expect(() => destroyToastEventHandlers).not.toThrow();
    });
  });
});