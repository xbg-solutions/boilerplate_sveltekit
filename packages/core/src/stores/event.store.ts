/**
 * src/lib/stores/event.store.ts
 * Integrates the event system with Svelte stores
 * 
 * Provides utilities for connecting event publications to store updates,
 * and store changes to event publications, following the architecture guide's
 * principle that "events trigger workflows that may update stores."
 */

import { get, writable, derived, type Writable, type Readable } from 'svelte/store';
import { subscribe, publish } from '../services/events/pub-sub';
import type { Subscription } from '../types/event.types';

/**
 * Options for creating an event-connected store
 */
export interface EventStoreOptions<T> {
  /** Initial value for the store */
  initialValue: T;
  /** Event type to listen for updates */
  eventType: string;
  /** Function to transform event payload to store value */
  transformer?: (payload: any) => T;
  /** Whether to publish events when the store value changes */
  publishOnChange?: boolean;
  /** Event type to publish when store changes (defaults to provided eventType) */
  publishEventType?: string;
  /** Additional context to include with published events */
  eventSource?: string;
}

/**
 * Creates a writable store that automatically updates based on events
 * and optionally publishes events when the store value changes
 * 
 * @param options Configuration options for the event store
 * @returns A writable store connected to the event system
 */
export function eventStore<T>(options: EventStoreOptions<T>): Writable<T> {
  const {
    initialValue,
    eventType,
    transformer = (payload) => payload as T,
    publishOnChange = false,
    publishEventType = eventType,
    eventSource = 'eventStore'
  } = options;

  // Create a writable store with the initial value
  const store = writable<T>(initialValue);
  
  // Subscribe to the specified event type
  const unsubscribe = subscribe<any>(eventType, (payload) => {
    const newValue = transformer(payload);
    store.set(newValue);
  });
  
  // If publishOnChange is true, set up a subscription to publish events
  let storeUnsubscribe: Subscription | null = null;
  
  if (publishOnChange) {
    storeUnsubscribe = store.subscribe((value) => {
      // Don't publish on the initial value to avoid feedback loops
      if (value !== initialValue) {
        publish(publishEventType, value, eventSource);
      }
    });
  }
  
  // Extend the store to provide cleanup of event subscriptions
  const extendedStore: Writable<T> = {
    ...store,
    subscribe: store.subscribe,
    set: (value: T) => {
      store.set(value);
    },
    update: (updater: (value: T) => T) => {
      store.update(updater);
    }
  };
  
  // Add a cleanup method to the store object
  (extendedStore as any).destroy = () => {
    if (unsubscribe) {
      unsubscribe();
    }
    if (storeUnsubscribe) {
      storeUnsubscribe();
    }
  };
  
  return extendedStore;
}

/**
 * Creates a derived store that updates based on events, optionally with
 * transforms applied to the incoming event data
 * 
 * @param eventTypes Event type(s) to listen for
 * @param deriveFn Function to derive store value from event payload
 * @param initialValue Initial value for the store
 * @returns A readable store that updates based on events
 */
export function eventDerived<T, K = any>(
  eventTypes: string | string[],
  deriveFn: (payload: K, event?: any) => T,
  initialValue: T
): Readable<T> {
  // Create a writable store to hold the value
  const internalStore = writable<T>(initialValue);
  
  // Subscribe to the specified event type(s)
  const unsubscribe = subscribe<K>(eventTypes, (payload, event) => {
    const derivedValue = deriveFn(payload, event);
    internalStore.set(derivedValue);
  });
  
  // Create a readable derived store
  const readableStore = derived(internalStore, value => value);
  
  // Add a cleanup method to the store object
  (readableStore as any).destroy = () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
  
  return readableStore;
}

/**
 * Connects a store to an event type, publishing events when the store changes
 * 
 * @param store The store to connect to events
 * @param eventType The event type to publish
 * @param source Source identifier for published events
 * @returns A function to disconnect the store from events
 */
export function connectStoreToEvents<T>(
  store: Readable<T>,
  eventType: string,
  source: string = 'store'
): Subscription {
  return store.subscribe((value) => {
    publish(eventType, value, source);
  });
}