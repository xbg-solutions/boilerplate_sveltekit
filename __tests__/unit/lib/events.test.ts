/**
 * events.ts exports test
 */
import { describe, it, expect, vi } from 'vitest';

// Mock the underlying services
vi.mock('$lib/services/events/event-bus', () => ({
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn()
  }
}));

vi.mock('$lib/services/events/pub-sub', () => ({
  pubSubService: {
    publish: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn()
  },
  pubSubStore: {
    subscribe: vi.fn(),
    update: vi.fn(),
    set: vi.fn()
  }
}));

describe('events.ts Exports', () => {
  it('should export eventBus from event-bus service', async () => {
    const { eventBus } = await import('$lib/events');
    
    expect(eventBus).toBeDefined();
    expect(typeof eventBus.emit).toBe('function');
    expect(typeof eventBus.on).toBe('function');
    expect(typeof eventBus.off).toBe('function');
    expect(typeof eventBus.once).toBe('function');
  });

  it('should export pubSubService from pub-sub service', async () => {
    const { pubSubService } = await import('$lib/events');
    
    expect(pubSubService).toBeDefined();
    expect(typeof pubSubService.publish).toBe('function');
    expect(typeof pubSubService.subscribe).toBe('function');
    expect(typeof pubSubService.unsubscribe).toBe('function');
  });

  it('should export pubSubStore from pub-sub service', async () => {
    const { pubSubStore } = await import('$lib/events');
    
    expect(pubSubStore).toBeDefined();
    expect(typeof pubSubStore.subscribe).toBe('function');
    expect(typeof pubSubStore.update).toBe('function');
    expect(typeof pubSubStore.set).toBe('function');
  });

  it('should export eventBus as pubSub alias', async () => {
    const { pubSub, eventBus } = await import('$lib/events');
    
    expect(pubSub).toBeDefined();
    expect(pubSub).toBe(eventBus);
  });

  it('should have all expected exports available', async () => {
    const eventsModule = await import('$lib/events');
    
    const expectedExports = ['eventBus', 'pubSubService', 'pubSubStore', 'pubSub'];
    
    for (const exportName of expectedExports) {
      expect(eventsModule).toHaveProperty(exportName);
      expect(eventsModule[exportName]).toBeDefined();
    }
  });

  it('should maintain consistent API across exports', async () => {
    const { eventBus, pubSub } = await import('$lib/events');
    
    // eventBus and pubSub should be the same reference
    expect(eventBus).toBe(pubSub);
    
    // Both should have the same methods
    const eventBusMethods = Object.getOwnPropertyNames(eventBus);
    const pubSubMethods = Object.getOwnPropertyNames(pubSub);
    
    expect(eventBusMethods).toEqual(pubSubMethods);
  });
});