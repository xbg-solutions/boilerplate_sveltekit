/**
 * Events Index Export Tests
 * Tests for the central events export file
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all the underlying modules
vi.mock('$lib/services/events/event-bus', () => ({
  eventBus: { on: vi.fn(), publish: vi.fn() },
  eventBusStore: { subscribe: vi.fn() },
  createEventBus: vi.fn(),
  EventError: class extends Error {}
}));

vi.mock('$lib/services/events/pub-sub', () => ({
  pubSubService: { publish: vi.fn(), subscribe: vi.fn() },
  pubSubStore: { subscribe: vi.fn() },
  createPubSubService: vi.fn(),
  publish: vi.fn(),
  subscribe: vi.fn(),
  once: vi.fn(),
  hasSubscribers: vi.fn(),
  setDebugMode: vi.fn(),
  clear: vi.fn(),
  getSubscriptionStats: vi.fn()
}));

vi.mock('$lib/stores/event.store', () => ({
  eventStore: { subscribe: vi.fn() },
  eventDerived: vi.fn(),
  connectStoreToEvents: vi.fn()
}));

describe('Events Index Exports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Event Bus Exports', () => {
    it('should export eventBus from event-bus service', async () => {
      const { eventBus } = await import('$lib/services/events/index');
      
      expect(eventBus).toBeDefined();
      expect(typeof eventBus.on).toBe('function');
      expect(typeof eventBus.publish).toBe('function');
    });

    it('should export eventBusStore from event-bus service', async () => {
      const { eventBusStore } = await import('$lib/services/events/index');
      
      expect(eventBusStore).toBeDefined();
      expect(typeof eventBusStore.subscribe).toBe('function');
    });

    it('should export createEventBus factory function', async () => {
      const { createEventBus } = await import('$lib/services/events/index');
      
      expect(createEventBus).toBeDefined();
      expect(typeof createEventBus).toBe('function');
    });

    it('should export EventError class', async () => {
      const { EventError } = await import('$lib/services/events/index');
      
      expect(EventError).toBeDefined();
      expect(EventError.prototype).toBeInstanceOf(Error.prototype.constructor);
    });
  });

  describe('PubSub Exports', () => {
    it('should export pubSubService from pub-sub service', async () => {
      const { pubSubService } = await import('$lib/services/events/index');
      
      expect(pubSubService).toBeDefined();
      expect(typeof pubSubService.publish).toBe('function');
      expect(typeof pubSubService.subscribe).toBe('function');
    });

    it('should export pubSubStore from pub-sub service', async () => {
      const { pubSubStore } = await import('$lib/services/events/index');
      
      expect(pubSubStore).toBeDefined();
      expect(typeof pubSubStore.subscribe).toBe('function');
    });

    it('should export createPubSubService factory function', async () => {
      const { createPubSubService } = await import('$lib/services/events/index');
      
      expect(createPubSubService).toBeDefined();
      expect(typeof createPubSubService).toBe('function');
    });

    it('should export convenience functions from pub-sub', async () => {
      const { 
        publish, 
        subscribe, 
        once, 
        hasSubscribers, 
        setDebugMode, 
        clear, 
        getSubscriptionStats 
      } = await import('$lib/services/events/index');
      
      expect(typeof publish).toBe('function');
      expect(typeof subscribe).toBe('function');
      expect(typeof once).toBe('function');
      expect(typeof hasSubscribers).toBe('function');
      expect(typeof setDebugMode).toBe('function');
      expect(typeof clear).toBe('function');
      expect(typeof getSubscriptionStats).toBe('function');
    });
  });

  describe('Event Store Exports', () => {
    it('should export eventStore from event.store', async () => {
      const { eventStore } = await import('$lib/services/events/index');
      
      expect(eventStore).toBeDefined();
      expect(typeof eventStore.subscribe).toBe('function');
    });

    it('should export eventDerived function from event.store', async () => {
      const { eventDerived } = await import('$lib/services/events/index');
      
      expect(eventDerived).toBeDefined();
      expect(typeof eventDerived).toBe('function');
    });

    it('should export connectStoreToEvents function from event.store', async () => {
      const { connectStoreToEvents } = await import('$lib/services/events/index');
      
      expect(connectStoreToEvents).toBeDefined();
      expect(typeof connectStoreToEvents).toBe('function');
    });
  });

  describe('Type Exports', () => {
    it('should export CoreEventType enum', async () => {
      const { CoreEventType } = await import('$lib/services/events/index');
      
      expect(CoreEventType).toBeDefined();
      expect(typeof CoreEventType).toBe('object');
    });
  });

  describe('Complete API Surface', () => {
    it('should export all expected functions and objects', async () => {
      const eventsModule = await import('$lib/services/events/index');
      
      const expectedExports = [
        // Event Bus
        'eventBus',
        'eventBusStore',
        'createEventBus',
        'EventError',
        
        // PubSub
        'pubSubService',
        'pubSubStore',
        'createPubSubService',
        'publish',
        'subscribe',
        'once',
        'hasSubscribers',
        'setDebugMode',
        'clear',
        'getSubscriptionStats',
        
        // Event Stores
        'eventStore',
        'eventDerived',
        'connectStoreToEvents',
        
        // Types
        'CoreEventType'
      ];
      
      for (const exportName of expectedExports) {
        expect(eventsModule).toHaveProperty(exportName);
        expect(eventsModule[exportName]).toBeDefined();
      }
    });

    it('should provide consistent API across different import methods', async () => {
      // Import the whole module
      const eventsModule = await import('$lib/services/events/index');
      
      // Import specific exports
      const { eventBus, pubSubService, publish } = await import('$lib/services/events/index');
      
      expect(eventsModule.eventBus).toBe(eventBus);
      expect(eventsModule.pubSubService).toBe(pubSubService);
      expect(eventsModule.publish).toBe(publish);
    });
  });

  describe('Integration Points', () => {
    it('should maintain separation between event-bus and pub-sub', async () => {
      const { eventBus, pubSubService } = await import('$lib/services/events/index');
      
      // These should be different objects providing different APIs
      expect(eventBus).not.toBe(pubSubService);
      expect(eventBus.on).toBeDefined();
      expect(pubSubService.subscribe).toBeDefined();
    });

    it('should provide both direct and convenience access patterns', async () => {
      const { 
        eventBus, 
        pubSubService, 
        publish, 
        subscribe 
      } = await import('$lib/services/events/index');
      
      // Direct access through service objects
      expect(eventBus.publish).toBeDefined();
      expect(pubSubService.publish).toBeDefined();
      
      // Convenience access through standalone functions
      expect(publish).toBeDefined();
      expect(subscribe).toBeDefined();
    });
  });

  describe('Factory Functions', () => {
    it('should provide factory functions for creating new instances', async () => {
      const { createEventBus, createPubSubService } = await import('$lib/services/events/index');
      
      expect(typeof createEventBus).toBe('function');
      expect(typeof createPubSubService).toBe('function');
    });
  });

  describe('Store Integration', () => {
    it('should export event-connected stores', async () => {
      const { 
        eventStore, 
        eventBusStore, 
        pubSubStore 
      } = await import('$lib/services/events/index');
      
      expect(eventStore).toBeDefined();
      expect(eventBusStore).toBeDefined();
      expect(pubSubStore).toBeDefined();
    });

    it('should export store connection utilities', async () => {
      const { eventDerived, connectStoreToEvents } = await import('$lib/services/events/index');
      
      expect(typeof eventDerived).toBe('function');
      expect(typeof connectStoreToEvents).toBe('function');
    });
  });
});