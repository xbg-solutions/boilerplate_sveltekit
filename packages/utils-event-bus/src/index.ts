// Event bus package barrel exports
// Uses explicit re-exports to resolve naming conflicts between services and stores

// Services — event-bus (core event system)
export {
  EventError,
  eventBus,
  eventBusStore as eventBusServiceStore,
  publish,
  subscribe,
  createEventBus
} from './services/events/event-bus';

// Services — pub-sub (higher-level pub/sub)
export {
  createPubSubService,
  pubSubStore as pubSubServiceStore,
  pubSubService as pubSubServiceInstance
} from './services/events/pub-sub';

// Stores
export { type EventBusState, eventBusStore, eventBusService } from './stores/event-bus';
export * from './stores/event.store';
export { type PubSubState, pubSubStore, pubSubService } from './stores/pub-sub';

// Types
export type * from './types/event.types';
export type * from './types/events.interfaces';
