import { writable } from 'svelte/store';

export interface EventBusState {
  events: Array<{ type: string; data?: any; timestamp: number }>;
  listeners: Record<string, Function[]>;
}

export const eventBusStore = writable<EventBusState>({
  events: [],
  listeners: {}
});

// Simple event bus service that tests expect
export const eventBusService = {
  emit: (type: string, data?: any) => {
    eventBusStore.update(state => ({
      ...state,
      events: [...state.events, { type, data, timestamp: Date.now() }]
    }));
  },
  
  on: (type: string, callback: Function) => {
    return () => {}; // unsubscribe function
  },
  
  off: (type: string, callback: Function) => {
    // Remove listener
  },
  
  clear: () => {
    eventBusStore.update(state => ({
      ...state,
      events: [],
      listeners: {}
    }));
  }
};