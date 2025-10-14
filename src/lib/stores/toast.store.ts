/**
 * src/lib/stores/toast.store.ts
 * Toast Notifications Store
 * 
 * A Svelte store that manages the state of toast notifications
 * and integrates with the event system.
 */

import { writable } from 'svelte/store';
import { subscribe } from '$lib/services/events';
import { browser } from '$lib/utils/browser';
import { CoreEventType, type ToastEventPayload } from '$lib/types/event.types';
import type { Subscription } from '$lib/types/event.types';

// Define the toast notification interface with an ID
export interface ToastNotification extends ToastEventPayload {
  id: string;
  createdAt: number;
}

// Define the toast store state interface
interface ToastStoreState {
  toasts: ToastNotification[];
  maxToasts: number;
}

// Create the initial store state
const initialState: ToastStoreState = {
  toasts: [],
  maxToasts: 5 // Maximum number of toasts shown at once
};

// Helper function to generate a unique ID
function generateId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create the toast store
function createToastStore() {
  const { subscribe: storeSubscribe, update } = writable<ToastStoreState>(initialState);
  
  // Subscription to event bus
  let eventSubscriptions: Subscription[] = [];
  
  // Initialize event subscriptions
  function initEventSubscriptions() {
    if (!browser) return;
    
    // Clean up any existing subscriptions
    unsubscribeFromEvents();
    
    // Subscribe to toast show events
    eventSubscriptions.push(
      subscribe(CoreEventType.TOAST_SHOW, (payload, event) => {
        try {
          console.log('[ToastStore] TOAST_SHOW event received, raw payload:', payload);
          
          // Ensure we have a payload
          if (!payload) {
            console.error('[ToastStore] Empty payload received');
            return;
          }
          
          // Create a guaranteed unique ID
          const toastId = typeof payload.id === 'string' ? payload.id : generateId();
          
          // Ensure we have valid values for required fields - IMPORTANT: validate each field
          let type = payload.type || 'info';
          
          // Validate toast type
          if (type !== 'info' && type !== 'success' && type !== 'warning' && type !== 'error') {
            console.warn(`[ToastStore] Invalid toast type: ${type}, defaulting to 'info'`);
            type = 'info';
          }
          
          const message = typeof payload.message === 'string' ? payload.message : 'Notification';
          const duration = typeof payload.duration === 'number' ? payload.duration : 5000;
          
          console.log('[ToastStore] Creating toast with validated type:', type);
          
          // Update the store
          update(state => {
            // Create toast with complete data and fallbacks - clone the payload and override specific properties
            const toast: ToastNotification = {
              ...payload,
              id: toastId,
              type, // This is the validated type
              message,
              duration,
              createdAt: Date.now()
            };
            
            console.log('[ToastStore] Final toast object:', toast);
            
            // Add toast to the list and limit to maxToasts
            const toasts = [toast, ...state.toasts].slice(0, state.maxToasts);
            return { ...state, toasts };
          });
          
          // Auto-dismiss toast if duration is set and greater than 0
          if (duration > 0) {
            setTimeout(() => {
              dismissToast(toastId);
            }, duration);
          }
        } catch (error) {
          console.error('[ToastStore] Error handling toast show event:', error);
        }
      })
    );
    
    // Subscribe to toast hide events
    eventSubscriptions.push(
      subscribe(CoreEventType.TOAST_HIDE, (event) => {
        try {
          const payload = event.payload || {};
          if (typeof payload.id === 'string') {
            dismissToast(payload.id);
          }
        } catch (error) {
          console.error('[ToastStore] Error handling toast hide event:', error);
        }
      })
    );
    
    // Subscribe to toast clear events
    eventSubscriptions.push(
      subscribe(CoreEventType.TOAST_CLEAR, () => {
        try {
          update(state => ({ ...state, toasts: [] }));
        } catch (error) {
          console.error('[ToastStore] Error handling toast clear event:', error);
        }
      })
    );
  }
  
  // Unsubscribe from all events
  function unsubscribeFromEvents() {
    eventSubscriptions.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    
    eventSubscriptions = [];
  }
  
  // Dismiss a toast by ID
  function dismissToast(id: string) {
    if (typeof id !== 'string') return;
    
    update(state => {
      const toasts = state.toasts.filter(toast => toast.id !== id);
      return { ...state, toasts };
    });
  }
  
  // Initialize if in browser
  if (browser) {
    initEventSubscriptions();
  }
  
  return {
    subscribe: storeSubscribe,
    dismiss: dismissToast,
    clear: () => {
      update(state => ({ ...state, toasts: [] }));
    },
    setMaxToasts: (max: number) => {
      update(state => {
        const maxToasts = Math.max(1, max);
        // Truncate existing toasts if necessary
        const toasts = state.toasts.slice(0, maxToasts);
        return { ...state, maxToasts, toasts };
      });
    },
    // Clean up resources
    destroy: () => {
      unsubscribeFromEvents();
    }
  };
}

// Export the store
export const toastStore = createToastStore();