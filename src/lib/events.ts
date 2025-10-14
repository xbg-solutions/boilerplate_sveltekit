/**
 * src/lib/events.ts
 * Event system exports
 */

export { eventBus } from './services/events/event-bus';
export { pubSubService, pubSubStore } from './services/events/pub-sub';
export { eventBus as pubSub } from './services/events/event-bus';