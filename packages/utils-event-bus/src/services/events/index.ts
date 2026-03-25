/**
 * src/lib/services/events/index.ts
 * Central export file for the event system
 * 
 * Provides a single import point for all event-related functionality.
 * This follows the architectural best practice of providing a clean,
 * consistent API for the event system.
 */

// Core event bus
export { 
    eventBus, 
    eventBusStore, 
    createEventBus,
    EventError
  } from './event-bus';
  
  // PubSub service (higher-level API)
  export {
    pubSubService,
    pubSubStore,
    createPubSubService,
    publish,
    subscribe,
    once,
    hasSubscribers,
    setDebugMode,
    clear,
    getSubscriptionStats
  } from './pub-sub';
  
  // Event-connected stores
  export {
    eventStore,
    eventDerived,
    connectStoreToEvents
  } from '../../stores/event.store';
  
  // Re-export event types for convenience
  export type {
    Subscription,
    EventHandler,
    AppEvent,
    BaseEvent,
    EventDispatchOptions
  } from '../../types/event.types';
  
  export { CoreEventType } from '../../types/event.types';