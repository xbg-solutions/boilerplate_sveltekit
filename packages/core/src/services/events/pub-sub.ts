/**
 * src/lib/services/events/pub-sub.ts
 * Higher-level API for the event bus system
 * 
 * Provides a simplified interface for publishing and subscribing
 * to events with convenient payload handling and additional features
 * such as once() for one-time subscriptions.
 */

import { writable, get } from 'svelte/store';
import { eventBus, eventBusStore } from './event-bus';
import type { IPubSubService } from '../../types/events.interfaces';
import type { AppEvent, Subscription, EventDispatchOptions } from '../../types/event.types';

/**
 * PubSub service class that implements the IPubSubService interface
 */
class PubSubService implements IPubSubService {
  /**
   * Publish an event to all subscribers
   * 
   * @param eventType Event type identifier
   * @param payload Event data payload
   * @param source Optional source identifier (component/service name)
   * @param options Additional options for event dispatch
   */
  publish<T = any>(
    eventType: string,
    payload: T,
    source?: string,
    options?: EventDispatchOptions
  ): void {
    console.log(`[PubSub] Publishing event: ${eventType}, payload:`, payload);
    eventBus.publish({
      type: eventType,
      timestamp: Date.now(),
      source,
      payload
    }, options);
  }

  /**
   * Subscribe to one or more event types
   * 
   * @param eventType Event type string or array of event types
   * @param handler Function to handle the event
   * @param context Optional 'this' context for the handler
   * @returns Function to unsubscribe
   */
  subscribe<T = any>(
    eventType: string | string[],
    handler: (payload: T, event: AppEvent<T>) => void,
    context?: any
  ): Subscription {
    // Create a wrapper that extracts the payload for convenience
    const wrappedHandler = (event: AppEvent<T>) => {
      handler.call(context, event.payload, event);
    };

    return eventBus.on(eventType, wrappedHandler);
  }

  /**
   * Subscribe to an event only for the first occurrence
   * 
   * @param eventType Event type to listen for
   * @param handler Function to handle the event
   * @param context Optional 'this' context for the handler
   * @returns Function to unsubscribe if needed before the event fires
   */
  once<T = any>(
    eventType: string,
    handler: (payload: T, event: AppEvent<T>) => void,
    context?: any
  ): Subscription {
    let unsubscribe: Subscription | null = null;
    
    // Create a self-removing handler
    const onceHandler = (event: AppEvent<T>) => {
      // Unsubscribe immediately
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      
      // Call the original handler with the payload and event
      handler.call(context, event.payload, event);
    };
    
    // Subscribe with our wrapper
    unsubscribe = eventBus.on(eventType, onceHandler);
    
    // Return a function to unsubscribe early if needed
    return () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };
  }

  /**
   * Check if an event type has subscribers
   * 
   * @param eventType Event type to check
   * @returns Boolean indicating if there are subscribers
   */
  hasSubscribers(eventType: string): boolean {
    return eventBus.hasSubscribers(eventType);
  }

  /**
   * Set the event bus debug mode
   * 
   * @param enabled Whether debug mode should be enabled
   */
  setDebugMode(enabled: boolean): void {
    eventBus.setDebugMode(enabled);
  }

  /**
   * Clear all event subscriptions
   */
  clearAllSubscriptions(): void {
    eventBus.clear();
  }

  /**
   * Get statistics about event subscriptions
   * 
   * @returns Object with subscription counts
   */
  getSubscriptionStats(): { subscribers: number, eventTypes: number, prefixSubscribers: number } {
    return eventBus.getStats();
  }
}

// Create a factory function for the PubSub service
export const createPubSubService = () => new PubSubService();

// Create a Svelte store for the PubSub service (following architectural guidelines)
export const pubSubStore = writable<IPubSubService>(createPubSubService());

// Export a convenience instance for direct use without store subscription
export const pubSubService = get(pubSubStore);

// Export individual functions for easier usage
export const { 
  publish, 
  subscribe, 
  once, 
  hasSubscribers, 
  setDebugMode, 
  clearAllSubscriptions: clear, 
  getSubscriptionStats 
} = pubSubService;