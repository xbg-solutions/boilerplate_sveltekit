/**
 * src/lib/services/events/event-bus.ts
 * Core event bus implementation - FIXED VERSION
 */

import { writable } from 'svelte/store';
import { loggerService } from '@xbg.solutions/frontend-core';
import { mutexService } from '@xbg.solutions/utils-mutex';
import { AppError, normalizeError } from '@xbg.solutions/frontend-core';
import type { IEventBus } from '../../types/events.interfaces';
import type { 
  BaseEvent, 
  AppEvent, 
  EventHandler, 
  Subscription,
  EventDispatchOptions
} from '../../types/event.types';

// Create a context-aware logger
const eventLogger = loggerService.withContext('EventBus');

/**
 * Error class for event-related errors
 */
export class EventError extends AppError {
  public eventType?: string;

  constructor(message: string, options: {
    eventType?: string;
    [key: string]: any;
  } = {}) {
    super(message, {
      category: 'event',
      ...options
    });
    
    this.eventType = options.eventType;
  }
}

/**
 * EventBus class for managing application events
 * Implements the IEventBus interface
 */
class EventBus implements IEventBus {
  /** Map of event types to sets of handlers */
  private handlers: Map<string, Set<EventHandler>> = new Map();
  
  /** Map of prefixes to sets of handlers for pattern matching */
  private prefixHandlers: Map<string, Set<EventHandler>> = new Map();
  
  /** Whether debug mode is enabled */
  private debugMode: boolean = import.meta.env.DEV;
  
  /**
   * Subscribe to event(s)
   * 
   * @param eventType Event type string or array of event types
   * @param handler Function to be called when the event is published
   * @returns Function that can be called to unsubscribe
   */
  on<T = any>(
    eventType: string | string[],
    handler: EventHandler<T>
  ): Subscription {
    const types = Array.isArray(eventType) ? eventType : [eventType];
    
    // Log the subscription if in debug mode
    if (this.debugMode) {
      eventLogger.info(`Subscribing to event(s): ${types.join(', ')}`, {
        eventTypes: types,
        handlerFunction: handler.name || 'anonymous'
      });
    }
    
    // Add the handler to each event type's set
    types.forEach(type => {
      // Handle prefix subscriptions (e.g., "auth:*")
      if (type.endsWith('*')) {
        const prefix = type.slice(0, -1);
        
        if (!this.prefixHandlers.has(prefix)) {
          this.prefixHandlers.set(prefix, new Set());
        }
        
        this.prefixHandlers.get(prefix)!.add(handler);
      } else {
        // Regular event subscription
        if (!this.handlers.has(type)) {
          this.handlers.set(type, new Set());
        }
        
        this.handlers.get(type)!.add(handler);
      }
    });
    
    // Return unsubscribe function
    return () => {
      if (this.debugMode) {
        eventLogger.info(`Unsubscribing from event(s): ${types.join(', ')}`, {
          eventTypes: types,
          handlerFunction: handler.name || 'anonymous'
        });
      }
      
      types.forEach(type => {
        if (type.endsWith('*')) {
          const prefix = type.slice(0, -1);
          const handlers = this.prefixHandlers.get(prefix);
          
          if (handlers) {
            handlers.delete(handler);
            
            // Clean up empty sets
            if (handlers.size === 0) {
              this.prefixHandlers.delete(prefix);
            }
          }
        } else {
          const handlers = this.handlers.get(type);
          
          if (handlers) {
            handlers.delete(handler);
            
            // Clean up empty sets
            if (handlers.size === 0) {
              this.handlers.delete(type);
            }
          }
        }
      });
    };
  }
  
  /**
   * Publish an event to all subscribers
   * 
   * @param event Event object to publish
   * @param options Additional options for event dispatch
   */
  async publish<T = any>(event: AppEvent<T>, options: EventDispatchOptions = {}): Promise<void> {
    try {
      // Use mutex to ensure event publications are processed in order
      await mutexService.withLock('event-publish', async () => {
        // Defer execution to next microtask if requested
        if (options.defer) {
          await Promise.resolve();
        }
        
        // Ensure event has a timestamp
        const eventWithTime: AppEvent<T> = {
          ...event,
          timestamp: event.timestamp || Date.now()
        };
        
        // Log the event publication if in debug mode
        if (this.debugMode) {
          eventLogger.info(`Event published: ${event.type}`, {
            eventType: event.type,
            source: event.source,
            payload: event.payload
          });
        }
        
        // Get handlers for this specific event type
        const eventHandlers = this.handlers.get(event.type) || new Set<EventHandler>();
        
        // Get prefix handlers that match this event
        const matchingPrefixHandlers = new Set<EventHandler>();
        for (const [prefix, handlers] of this.prefixHandlers.entries()) {
          if (event.type.startsWith(prefix)) {
            handlers.forEach(handler => matchingPrefixHandlers.add(handler));
          }
        }
        
        // Count of handlers for metrics
        const handlersCount = eventHandlers.size + matchingPrefixHandlers.size;
        
        if (handlersCount === 0 && this.debugMode) {
          eventLogger.warn(`Event published with no subscribers: ${event.type}`, {
            eventType: event.type
          });
        }
        
        // Execute all matching handlers
        const allHandlers = [...eventHandlers, ...matchingPrefixHandlers];
        let successCount = 0;
        let errorCount = 0;
        
        for (const handler of allHandlers) {
          try {
            await handler(eventWithTime);
            successCount++;
          } catch (error) {
            errorCount++;
            const normalizedError = normalizeError(
              error,
              `Error in event handler for "${event.type}"`,
              { 
                context: { 
                  eventType: event.type,
                  source: event.source
                },
                category: 'event'
              }
            );
            
            eventLogger.error(
              `Error in event handler for "${event.type}"`,
              normalizedError,
              { 
                eventType: event.type, 
                source: event.source,
                handlerFunction: handler.name || 'anonymous'
              }
            );
          }
        }
        
        // Log metrics in debug mode
        if (this.debugMode && handlersCount > 0) {
          eventLogger.info(`Event ${event.type} processed by ${successCount} handlers (${errorCount} errors)`, {
            eventType: event.type,
            handlersCount,
            successCount,
            errorCount
          });
        }
      });
    } catch (error) {
      eventLogger.error(
        `Failed to publish event "${event.type}"`,
        error instanceof Error ? error : new Error(String(error)),
        { eventType: event.type }
      );
    }
  }
  
  /**
   * Check if there are subscribers for a given event type
   * 
   * @param eventType Event type to check
   * @returns Boolean indicating if there are subscribers
   */
  hasSubscribers(eventType: string): boolean {
    // Check direct subscribers
    if (this.handlers.has(eventType) && this.handlers.get(eventType)!.size > 0) {
      return true;
    }
    
    // Check prefix subscribers
    for (const [prefix, handlers] of this.prefixHandlers.entries()) {
      if (eventType.startsWith(prefix) && handlers.size > 0) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Enable or disable debug mode
   * 
   * @param enabled Whether debug mode should be enabled
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    eventLogger.info(`Event bus debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Get the current debug mode status
   * 
   * @returns Whether debug mode is enabled
   */
  isDebugMode(): boolean {
    return this.debugMode;
  }
  
  /**
   * Get subscription statistics
   * 
   * @returns Object with subscription counts
   */
  getStats(): { subscribers: number, eventTypes: number, prefixSubscribers: number } {
    let subscribers = 0;
    
    // Count direct subscribers
    for (const handlers of this.handlers.values()) {
      subscribers += handlers.size;
    }
    
    // Count prefix subscribers
    let prefixSubscribers = 0;
    for (const handlers of this.prefixHandlers.values()) {
      prefixSubscribers += handlers.size;
    }
    
    return {
      subscribers: subscribers + prefixSubscribers,
      eventTypes: this.handlers.size,
      prefixSubscribers
    };
  }
  
  /**
   * Clear all event subscriptions
   */
  clear(): void {
    if (this.debugMode) {
      const stats = this.getStats();
      eventLogger.warn(`Clearing all event subscriptions`, {
        eventTypes: stats.eventTypes,
        subscribers: stats.subscribers
      });
    }
    
    this.handlers.clear();
    this.prefixHandlers.clear();
  }
}

// Create a singleton instance for the event bus
export const eventBus = new EventBus();

// Create a Svelte store for backwards compatibility
export const eventBusStore = writable<IEventBus>(eventBus);

// Export a convenience function to access the eventBus for publishing events
export function publish<T = any>(
  eventType: string, 
  payload: T = {} as T, 
  source?: string
): Promise<void> {
  return eventBus.publish({
    type: eventType,
    payload,
    source,
    timestamp: Date.now() // Added timestamp to fix the TypeScript error
  });
}

// Export a convenience function to subscribe to events
export function subscribe<T = any>(
  eventType: string | string[],
  handler: EventHandler<T>
): Subscription {
  return eventBus.on(eventType, handler);
}

// Export a factory function that creates a new EventBus instance
export const createEventBus = () => new EventBus();