/**
 * PubSub Service Tests
 * Tests for the higher-level pub-sub API
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the event bus
const mockEventBus = {
  on: vi.fn(),
  publish: vi.fn(),
  hasSubscribers: vi.fn(),
  setDebugMode: vi.fn(),
  clear: vi.fn(),
  getStats: vi.fn()
};

vi.mock('$lib/services/events/event-bus', () => ({
  eventBus: mockEventBus,
  eventBusStore: {
    subscribe: vi.fn(),
    update: vi.fn()
  }
}));

describe('PubSub Service', () => {
  let pubSubService: any;
  let pubSubStore: any;
  let publish: any;
  let subscribe: any;
  let once: any;
  let hasSubscribers: any;
  let setDebugMode: any;
  let clear: any;
  let getSubscriptionStats: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import fresh instances
    const module = await import('$lib/services/events/pub-sub');
    pubSubService = module.pubSubService;
    pubSubStore = module.pubSubStore;
    publish = module.publish;
    subscribe = module.subscribe;
    once = module.once;
    hasSubscribers = module.hasSubscribers;
    setDebugMode = module.setDebugMode;
    clear = module.clear;
    getSubscriptionStats = module.getSubscriptionStats;
  });

  describe('PubSubService Class', () => {
    it('should publish events with correct format', () => {
      const payload = { userId: 123, action: 'login' };
      
      pubSubService.publish('user:login', payload, 'auth-service');
      
      expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user:login',
          payload: payload,
          source: 'auth-service',
          timestamp: expect.any(Number)
        }),
        undefined
      );
    });

    it('should publish events with options', () => {
      const payload = { data: 'test' };
      const options = { defer: true };
      
      pubSubService.publish('test:event', payload, 'test-source', options);
      
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          payload: payload,
          source: 'test-source'
        }),
        options
      );
    });

    it('should subscribe to events with payload extraction', () => {
      const handler = vi.fn();
      const mockUnsubscribe = vi.fn();
      mockEventBus.on.mockReturnValue(mockUnsubscribe);
      
      const unsubscribe = pubSubService.subscribe('test:event', handler);
      
      expect(mockEventBus.on).toHaveBeenCalledTimes(1);
      expect(mockEventBus.on).toHaveBeenCalledWith('test:event', expect.any(Function));
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle payload extraction in subscription handler', () => {
      const handler = vi.fn();
      let wrappedHandler: any;
      
      mockEventBus.on.mockImplementation((eventType, handlerFn) => {
        wrappedHandler = handlerFn;
        return vi.fn();
      });
      
      pubSubService.subscribe('test:event', handler);
      
      const mockEvent = {
        type: 'test:event',
        payload: { data: 'test' },
        source: 'test-source',
        timestamp: Date.now()
      };
      
      wrappedHandler(mockEvent);
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ data: 'test' }, mockEvent);
    });

    it('should subscribe to multiple event types', () => {
      const handler = vi.fn();
      const eventTypes = ['event1', 'event2'];
      
      pubSubService.subscribe(eventTypes, handler);
      
      expect(mockEventBus.on).toHaveBeenCalledWith(eventTypes, expect.any(Function));
    });

    it('should handle context binding in subscriptions', () => {
      const handler = vi.fn();
      const context = { name: 'test-context' };
      let wrappedHandler: any;
      
      mockEventBus.on.mockImplementation((eventType, handlerFn) => {
        wrappedHandler = handlerFn;
        return vi.fn();
      });
      
      pubSubService.subscribe('test:event', handler, context);
      
      const mockEvent = {
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: Date.now()
      };
      
      wrappedHandler(mockEvent);
      
      expect(handler).toHaveBeenCalledWith({ data: 'test' }, mockEvent);
    });

    it('should implement once subscription correctly', () => {
      const handler = vi.fn();
      let wrappedHandler: any;
      let unsubscribeFn: any;
      
      mockEventBus.on.mockImplementation((eventType, handlerFn) => {
        wrappedHandler = handlerFn;
        unsubscribeFn = vi.fn();
        return unsubscribeFn;
      });
      
      const earlyUnsubscribe = pubSubService.once('test:event', handler);
      
      const mockEvent = {
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: Date.now()
      };
      
      // Simulate event firing
      wrappedHandler(mockEvent);
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(unsubscribeFn).toHaveBeenCalledTimes(1);
      
      // Test early unsubscribe
      expect(typeof earlyUnsubscribe).toBe('function');
    });

    it('should handle early unsubscribe in once subscription', () => {
      const handler = vi.fn();
      let unsubscribeFn: any;
      
      mockEventBus.on.mockImplementation(() => {
        unsubscribeFn = vi.fn();
        return unsubscribeFn;
      });
      
      const earlyUnsubscribe = pubSubService.once('test:event', handler);
      
      // Call early unsubscribe
      earlyUnsubscribe();
      
      expect(unsubscribeFn).toHaveBeenCalledTimes(1);
    });

    it('should handle context binding in once subscriptions', () => {
      const handler = vi.fn();
      const context = { name: 'test-context' };
      let wrappedHandler: any;
      
      mockEventBus.on.mockImplementation((eventType, handlerFn) => {
        wrappedHandler = handlerFn;
        return vi.fn();
      });
      
      pubSubService.once('test:event', handler, context);
      
      const mockEvent = {
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: Date.now()
      };
      
      wrappedHandler(mockEvent);
      
      expect(handler).toHaveBeenCalledWith({ data: 'test' }, mockEvent);
    });

    it('should check for subscribers correctly', () => {
      mockEventBus.hasSubscribers.mockReturnValue(true);
      
      const result = pubSubService.hasSubscribers('test:event');
      
      expect(mockEventBus.hasSubscribers).toHaveBeenCalledWith('test:event');
      expect(result).toBe(true);
    });

    it('should set debug mode correctly', () => {
      pubSubService.setDebugMode(true);
      
      expect(mockEventBus.setDebugMode).toHaveBeenCalledWith(true);
    });

    it('should clear subscriptions correctly', () => {
      pubSubService.clearAllSubscriptions();
      
      expect(mockEventBus.clear).toHaveBeenCalledTimes(1);
    });

    it('should get subscription stats correctly', () => {
      const mockStats = { subscribers: 5, eventTypes: 3, prefixSubscribers: 1 };
      mockEventBus.getStats.mockReturnValue(mockStats);
      
      const result = pubSubService.getSubscriptionStats();
      
      expect(mockEventBus.getStats).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStats);
    });
  });

  describe('Convenience Functions', () => {
    it('should provide standalone publish function', () => {
      const payload = { data: 'test' };
      
      publish('test:event', payload, 'test-source');
      
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          payload: payload,
          source: 'test-source',
          timestamp: expect.any(Number)
        }),
        undefined
      );
    });

    it('should provide standalone subscribe function', () => {
      const handler = vi.fn();
      const mockUnsubscribe = vi.fn();
      mockEventBus.on.mockReturnValue(mockUnsubscribe);
      
      const result = subscribe('test:event', handler);
      
      expect(mockEventBus.on).toHaveBeenCalledWith('test:event', expect.any(Function));
      expect(result).toBe(mockUnsubscribe);
    });

    it('should provide standalone once function', () => {
      const handler = vi.fn();
      mockEventBus.on.mockReturnValue(vi.fn());
      
      const result = once('test:event', handler);
      
      expect(mockEventBus.on).toHaveBeenCalledTimes(1);
      expect(typeof result).toBe('function');
    });

    it('should provide standalone hasSubscribers function', () => {
      mockEventBus.hasSubscribers.mockReturnValue(false);
      
      const result = hasSubscribers('test:event');
      
      expect(mockEventBus.hasSubscribers).toHaveBeenCalledWith('test:event');
      expect(result).toBe(false);
    });

    it('should provide standalone setDebugMode function', () => {
      setDebugMode(false);
      
      expect(mockEventBus.setDebugMode).toHaveBeenCalledWith(false);
    });

    it('should provide standalone clear function', () => {
      clear();
      
      expect(mockEventBus.clear).toHaveBeenCalledTimes(1);
    });

    it('should provide standalone getSubscriptionStats function', () => {
      const mockStats = { subscribers: 2, eventTypes: 1, prefixSubscribers: 0 };
      mockEventBus.getStats.mockReturnValue(mockStats);
      
      const result = getSubscriptionStats();
      
      expect(mockEventBus.getStats).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStats);
    });
  });

  describe('Store Integration', () => {
    it('should provide pubSubStore with correct interface', () => {
      expect(pubSubStore).toBeDefined();
      expect(pubSubStore.subscribe).toBeDefined();
      expect(pubSubStore.update).toBeDefined();
    });

    it('should create PubSub service factory', async () => {
      const { createPubSubService } = await import('$lib/services/events/pub-sub');
      
      const newService = createPubSubService();
      
      expect(newService).toBeDefined();
      expect(typeof newService.publish).toBe('function');
      expect(typeof newService.subscribe).toBe('function');
      expect(typeof newService.once).toBe('function');
    });
  });

  describe('Payload Handling', () => {
    it('should handle undefined payload gracefully', () => {
      pubSubService.publish('test:event');
      
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          payload: undefined
        }),
        undefined
      );
    });

    it('should handle null payload gracefully', () => {
      pubSubService.publish('test:event', null);
      
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          payload: null
        }),
        undefined
      );
    });

    it('should handle complex payloads', () => {
      const complexPayload = {
        user: { id: 1, name: 'John' },
        metadata: { timestamp: Date.now() },
        nested: { deep: { value: 'test' } }
      };
      
      pubSubService.publish('user:complex', complexPayload);
      
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user:complex',
          payload: complexPayload
        }),
        undefined
      );
    });
  });

  describe('Error Scenarios', () => {
    it('should handle publish errors gracefully', () => {
      mockEventBus.publish.mockImplementation(() => {
        throw new Error('Publish error');
      });
      
      // The error should propagate since the pubSubService doesn't catch errors
      expect(() => {
        pubSubService.publish('test:event', { data: 'test' });
      }).toThrow('Publish error');
    });

    it('should handle subscription errors gracefully', () => {
      mockEventBus.on.mockImplementation(() => {
        throw new Error('Subscribe error');
      });
      
      expect(() => {
        pubSubService.subscribe('test:event', vi.fn());
      }).toThrow('Subscribe error');
    });
  });
});