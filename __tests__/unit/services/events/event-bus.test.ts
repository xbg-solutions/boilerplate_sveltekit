/**
 * Event Bus Service Tests
 * Tests for the core event bus implementation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock mutex service
vi.mock('$lib/utils/mutex', () => ({
  mutexService: {
    withLock: vi.fn(async (key, callback) => await callback())
  }
}));

// Mock logger service
vi.mock('$lib/services/logging/logging.service', () => ({
  loggerService: {
    withContext: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }))
  }
}));

// Mock error handler
vi.mock('$lib/utils/error-handler', () => ({
  AppError: class extends Error {},
  normalizeError: vi.fn((error, message, options) => ({
    message: error?.message || message,
    category: options?.category || 'unknown',
    context: options?.context || {}
  }))
}));

describe('Event Bus Service', () => {
  let eventBus: any;
  let EventError: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import fresh instances
    const module = await import('$lib/services/events/event-bus');
    eventBus = module.eventBus;
    EventError = module.EventError;
    
    // Clear all subscriptions
    eventBus.clear();
  });

  afterEach(() => {
    // Clean up after each test
    eventBus.clear();
  });

  describe('EventError', () => {
    it('should create event error with correct properties', () => {
      const error = new EventError('Test error', { eventType: 'test:event' });
      
      expect(error.message).toBe('Test error');
      expect(error.eventType).toBe('test:event');
      expect(error).toBeInstanceOf(Error);
    });

    it('should inherit from AppError', () => {
      const error = new EventError('Test error');
      
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Basic Subscription and Publishing', () => {
    it('should allow subscribing to events', () => {
      const handler = vi.fn();
      
      const unsubscribe = eventBus.on('test:event', handler);
      
      expect(typeof unsubscribe).toBe('function');
      expect(eventBus.hasSubscribers('test:event')).toBe(true);
    });

    it('should call handlers when events are published', async () => {
      const handler = vi.fn();
      
      eventBus.on('test:event', handler);
      
      await eventBus.publish({
        type: 'test:event',
        payload: { data: 'test' },
        source: 'test-source',
        timestamp: Date.now()
      });
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          payload: { data: 'test' },
          source: 'test-source'
        })
      );
    });

    it('should allow unsubscribing from events', async () => {
      const handler = vi.fn();
      
      const unsubscribe = eventBus.on('test:event', handler);
      unsubscribe();
      
      await eventBus.publish({
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: Date.now()
      });
      
      expect(handler).not.toHaveBeenCalled();
      expect(eventBus.hasSubscribers('test:event')).toBe(false);
    });
  });

  describe('Multiple Subscriptions', () => {
    it('should handle multiple handlers for the same event', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('test:event', handler1);
      eventBus.on('test:event', handler2);
      
      await eventBus.publish({
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: Date.now()
      });
      
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should handle array of event types in subscription', async () => {
      const handler = vi.fn();
      
      eventBus.on(['event1', 'event2'], handler);
      
      await eventBus.publish({ type: 'event1', payload: {}, timestamp: Date.now() });
      await eventBus.publish({ type: 'event2', payload: {}, timestamp: Date.now() });
      
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should handle unsubscribing from array subscriptions', async () => {
      const handler = vi.fn();
      
      const unsubscribe = eventBus.on(['event1', 'event2'], handler);
      unsubscribe();
      
      await eventBus.publish({ type: 'event1', payload: {}, timestamp: Date.now() });
      await eventBus.publish({ type: 'event2', payload: {}, timestamp: Date.now() });
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Prefix Subscriptions', () => {
    it('should handle prefix subscriptions with wildcard', async () => {
      const handler = vi.fn();
      
      eventBus.on('auth:*', handler);
      
      await eventBus.publish({ type: 'auth:login', payload: {}, timestamp: Date.now() });
      await eventBus.publish({ type: 'auth:logout', payload: {}, timestamp: Date.now() });
      await eventBus.publish({ type: 'user:update', payload: {}, timestamp: Date.now() });
      
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should handle unsubscribing from prefix subscriptions', async () => {
      const handler = vi.fn();
      
      const unsubscribe = eventBus.on('auth:*', handler);
      unsubscribe();
      
      await eventBus.publish({ type: 'auth:login', payload: {}, timestamp: Date.now() });
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should combine exact and prefix subscriptions', async () => {
      const exactHandler = vi.fn();
      const prefixHandler = vi.fn();
      
      eventBus.on('auth:login', exactHandler);
      eventBus.on('auth:*', prefixHandler);
      
      await eventBus.publish({ type: 'auth:login', payload: {}, timestamp: Date.now() });
      
      expect(exactHandler).toHaveBeenCalledTimes(1);
      expect(prefixHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Publishing Options', () => {
    it('should add timestamp to events when not provided', async () => {
      const handler = vi.fn();
      
      eventBus.on('test:event', handler);
      
      await eventBus.publish({
        type: 'test:event',
        payload: { data: 'test' }
      });
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number)
        })
      );
    });

    it('should preserve provided timestamp', async () => {
      const handler = vi.fn();
      const customTimestamp = 1234567890;
      
      eventBus.on('test:event', handler);
      
      await eventBus.publish({
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: customTimestamp
      });
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: customTimestamp
        })
      );
    });

    it('should handle deferred publishing', async () => {
      const handler = vi.fn();
      
      eventBus.on('test:event', handler);
      
      await eventBus.publish({
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: Date.now()
      }, { defer: true });
      
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in event handlers gracefully', async () => {
      const errorHandler = vi.fn(() => { throw new Error('Handler error'); });
      const successHandler = vi.fn();
      
      eventBus.on('test:event', errorHandler);
      eventBus.on('test:event', successHandler);
      
      await eventBus.publish({
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: Date.now()
      });
      
      // Both handlers should have been called
      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(successHandler).toHaveBeenCalledTimes(1);
    });

    it('should continue processing other handlers when one fails', async () => {
      const handler1 = vi.fn(() => { throw new Error('Handler 1 error'); });
      const handler2 = vi.fn();
      const handler3 = vi.fn(() => { throw new Error('Handler 3 error'); });
      
      eventBus.on('test:event', handler1);
      eventBus.on('test:event', handler2);
      eventBus.on('test:event', handler3);
      
      await eventBus.publish({
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: Date.now()
      });
      
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });
  });

  describe('Utility Methods', () => {
    it('should correctly report hasSubscribers for exact events', () => {
      const handler = vi.fn();
      
      expect(eventBus.hasSubscribers('test:event')).toBe(false);
      
      const unsubscribe = eventBus.on('test:event', handler);
      expect(eventBus.hasSubscribers('test:event')).toBe(true);
      
      unsubscribe();
      expect(eventBus.hasSubscribers('test:event')).toBe(false);
    });

    it('should correctly report hasSubscribers for prefix events', () => {
      const handler = vi.fn();
      
      expect(eventBus.hasSubscribers('auth:login')).toBe(false);
      
      const unsubscribe = eventBus.on('auth:*', handler);
      expect(eventBus.hasSubscribers('auth:login')).toBe(true);
      
      unsubscribe();
      expect(eventBus.hasSubscribers('auth:login')).toBe(false);
    });

    it('should provide accurate subscription statistics', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      
      // Add direct subscriptions
      eventBus.on('event1', handler1);
      eventBus.on('event2', handler2);
      
      // Add prefix subscription
      eventBus.on('auth:*', handler3);
      
      const stats = eventBus.getStats();
      
      expect(stats.subscribers).toBe(3);
      expect(stats.eventTypes).toBe(2);
      expect(stats.prefixSubscribers).toBe(1);
    });

    it('should clear all subscriptions', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('event1', handler1);
      eventBus.on('auth:*', handler2);
      
      expect(eventBus.getStats().subscribers).toBe(2);
      
      eventBus.clear();
      
      expect(eventBus.getStats().subscribers).toBe(0);
      expect(eventBus.getStats().eventTypes).toBe(0);
      expect(eventBus.getStats().prefixSubscribers).toBe(0);
    });
  });

  describe('Debug Mode', () => {
    it('should allow setting debug mode', () => {
      expect(eventBus.isDebugMode()).toBe(true); // Default in test env
      
      eventBus.setDebugMode(false);
      expect(eventBus.isDebugMode()).toBe(false);
      
      eventBus.setDebugMode(true);
      expect(eventBus.isDebugMode()).toBe(true);
    });

    it('should provide debug information when enabled', async () => {
      eventBus.setDebugMode(true);
      const handler = vi.fn();
      
      eventBus.on('test:event', handler);
      
      await eventBus.publish({
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: Date.now()
      });
      
      // Debug mode should have triggered logging
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Store Integration', () => {
    it('should export eventBusStore', async () => {
      const { eventBusStore } = await import('$lib/services/events/event-bus');
      
      expect(eventBusStore).toBeDefined();
      expect(eventBusStore.subscribe).toBeDefined();
    });
  });

  describe('Convenience Functions', () => {
    it('should provide publish convenience function', async () => {
      const { publish } = await import('$lib/services/events/event-bus');
      const handler = vi.fn();
      
      eventBus.on('test:event', handler);
      
      await publish('test:event', { data: 'test' }, 'test-source');
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          payload: { data: 'test' },
          source: 'test-source'
        })
      );
    });

    it('should provide subscribe convenience function', async () => {
      const { subscribe } = await import('$lib/services/events/event-bus');
      const handler = vi.fn();
      
      const unsubscribe = subscribe('test:event', handler);
      
      await eventBus.publish({
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: Date.now()
      });
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should provide createEventBus factory function', async () => {
      const { createEventBus } = await import('$lib/services/events/event-bus');
      
      const newBus = createEventBus();
      
      expect(newBus).toBeDefined();
      expect(typeof newBus.on).toBe('function');
      expect(typeof newBus.publish).toBe('function');
    });
  });
});