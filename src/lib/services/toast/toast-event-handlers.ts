/**
 * src/lib/services/toast/toast-event-handlers.ts
 * Event handlers for system events that show toast notifications
 * 
 * This file contains handlers that subscribe to system events
 * and show appropriate toast notifications in response.
 */

import { browser } from '$lib/utils/browser';
import { subscribe } from '$lib/services/events';
import { toastService } from './toast.service';
import { CoreEventType } from '$lib/types/event.types';
import type { Subscription } from '$lib/types/event.types';

/**
 * Set of active subscriptions
 */
const subscriptions: Subscription[] = [];

/**
 * Initialize all toast event listeners
 * Should be called once during application startup
 */
export function initToastEventHandlers(): void {
  if (!browser) return;
  
  // Clean up any existing subscriptions
  destroyToastEventHandlers();
  
  // Auth events
  subscriptions.push(
    subscribe(CoreEventType.AUTH_LOGIN_SUCCESS, (event) => {
      const { user } = event.payload || {};
      const displayName = user?.displayName || user?.email || 'User';
      
      // Add a unique id for this toast to prevent errors
      toastService.success(`Welcome, ${displayName}!`, {
        id: `login_success_${Date.now()}`,
        title: 'Logged In',
        duration: 5000
      });
    })
  );
  
  subscriptions.push(
    subscribe(CoreEventType.AUTH_LOGIN_FAILURE, (event) => {
      const { error } = event.payload || {};
      const message = error?.message || 'Failed to log in. Please try again.';
      
      toastService.error(message, {
        id: `login_failure_${Date.now()}`,
        title: 'Login Failed',
        duration: 7000
      });
    })
  );
  
  subscriptions.push(
    subscribe(CoreEventType.AUTH_LOGOUT, () => {
      toastService.info('You have been logged out.', {
        id: `logout_${Date.now()}`,
        duration: 5000
      });
    })
  );
  
  // Token events
  subscriptions.push(
    subscribe(CoreEventType.TOKEN_EXPIRED, () => {
      toastService.warning('Your session has expired. Please log in again.', {
        id: `token_expired_${Date.now()}`,
        title: 'Session Expired',
        duration: 8000,
        dismissible: true
      });
    })
  );
  
  // Application lifecycle events
  subscriptions.push(
    subscribe(CoreEventType.APP_INITIALIZED, () => {
      toastService.info('Application initialized successfully', {
        id: `app_init_${Date.now()}`,
        duration: 3000,
        dismissible: true
      });
    })
  );
  
  subscriptions.push(
    subscribe(CoreEventType.APP_ERROR, (event) => {
      const { error } = event.payload || {};
      const message = error?.userMessage || error?.message || 'An application error occurred.';
      
      toastService.error(message, {
        id: `app_error_${Date.now()}`,
        title: 'Application Error',
        duration: 10000,
        dismissible: true
      });
    })
  );
  
  // Navigation events - only show for errors
  subscriptions.push(
    subscribe(CoreEventType.NAVIGATION_END, (event) => {
      const { error } = event.payload || {};
      
      if (error) {
        const message = error?.message || 'Navigation failed.';
        
        toastService.error(message, {
          id: `nav_error_${Date.now()}`,
          title: 'Navigation Error',
          duration: 7000
        });
      }
    })
  );
}

/**
 * Destroy all toast event listeners
 * Should be called during application cleanup
 */
export function destroyToastEventHandlers(): void {
  subscriptions.forEach(unsubscribe => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });
  
  // Clear the subscriptions array
  subscriptions.length = 0;
}