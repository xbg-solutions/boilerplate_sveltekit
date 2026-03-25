/**
 * src/lib/interfaces/events.interfaces.ts
 * Event system interfaces
 * 
 * Defines the interfaces used by the event bus system, providing
 * contract definitions for the event bus and related components.
 */

import type { BaseEvent, AppEvent, EventHandler, Subscription, EventDispatchOptions } from '../types/event.types';

/**
 * Interface for the core event bus functionality
 */
export interface IEventBus {
  /**
   * Subscribe to event(s)
   * 
   * @param eventType Event type string or array of event types
   * @param handler Function to be called when the event is published
   * @returns Function that can be called to unsubscribe
   */
  on<T = any>(eventType: string | string[], handler: EventHandler<T>): Subscription;
  
  /**
   * Publish an event to all subscribers
   * 
   * @param event Event object to publish
   * @param options Additional options for event dispatch
   */
  publish<T = any>(event: AppEvent<T>, options?: EventDispatchOptions): Promise<void>;
  
  /**
   * Check if there are subscribers for a given event type
   * 
   * @param eventType Event type to check
   * @returns Boolean indicating if there are subscribers
   */
  hasSubscribers(eventType: string): boolean;
  
  /**
   * Enable or disable debug mode
   * 
   * @param enabled Whether debug mode should be enabled
   */
  setDebugMode(enabled: boolean): void;
  
  /**
   * Get the current debug mode status
   * 
   * @returns Whether debug mode is enabled
   */
  isDebugMode(): boolean;
  
  /**
   * Get subscription statistics
   * 
   * @returns Object with subscription counts
   */
  getStats(): { subscribers: number, eventTypes: number, prefixSubscribers: number };
  
  /**
   * Clear all event subscriptions
   */
  clear(): void;
}

/**
 * Interface for the pub-sub service
 */
export interface IPubSubService {
  /**
   * Publish an event to all subscribers
   * 
   * @param eventType Event type identifier
   * @param payload Event data payload
   * @param source Optional source identifier (component/service name)
   * @param options Additional options for event dispatch
   */
  publish<T = any>(eventType: string, payload: T, source?: string, options?: EventDispatchOptions): void;
  
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
  ): Subscription;
  
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
  ): Subscription;
  
  /**
   * Check if an event type has subscribers
   * 
   * @param eventType Event type to check
   * @returns Boolean indicating if there are subscribers
   */
  hasSubscribers(eventType: string): boolean;
  
  /**
   * Set the event bus debug mode
   * 
   * @param enabled Whether debug mode should be enabled
   */
  setDebugMode(enabled: boolean): void;
  
  /**
   * Clear all event subscriptions
   */
  clearAllSubscriptions(): void;
  
  /**
   * Get statistics about event subscriptions
   * 
   * @returns Object with subscription counts
   */
  getSubscriptionStats(): { subscribers: number, eventTypes: number, prefixSubscribers: number };
}

/**
 * Interface for services that can initialize and use the event system
 */
export interface IEventAwareService {
  /**
   * Registers event handlers for the service
   * @returns Subscription functions to clean up when service is destroyed
   */
  registerEvents(): Subscription[];
  
  /**
   * Cleans up event subscriptions
   */
  unregisterEvents(): void;
}

/**
 * Interface for event store capabilities
 */
export interface IEventStoreService {
  /**
   * Connects a store to the event system
   * @param storeName Name of the store for identification
   * @param eventType Event type to listen for updates
   * @returns Function to disconnect the store
   */
  connectStore(storeName: string, eventType: string): Subscription;
  
  /**
   * Broadcasts a store update as an event
   * @param storeName Name of the store
   * @param value Current value of the store
   * @param previousValue Previous value of the store (optional)
   */
  broadcastStoreUpdate(storeName: string, value: any, previousValue?: any): void;
}