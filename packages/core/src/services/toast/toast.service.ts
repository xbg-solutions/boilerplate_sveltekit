/**
 * src/lib/services/toast/toast.service.ts
 * Toast Notification Service
 * 
 * Provides methods for showing toast notifications through the event system.
 */

import { publish } from '../events/pub-sub';
import { CoreEventType, type ToastEventPayload } from '../../types/event.types';

/**
 * Default toast options
 */
const DEFAULT_TOAST_OPTIONS: Partial<ToastEventPayload> = {
  duration: 5000,
  position: 'top-right',
  dismissible: true
};

/**
 * Service for showing toast notifications
 */
class ToastService {
  /**
   * Show a toast notification with custom options
   * 
   * @param payload The toast notification payload
   */
  show(payload: ToastEventPayload): void {
    // Create a guaranteed unique ID if one isn't provided
    const id = payload.id || `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate toast type
    let type = payload.type;
    if (type !== 'info' && type !== 'success' && type !== 'warning' && type !== 'error') {
      console.warn(`Invalid toast type: ${type}, defaulting to 'info'`);
      type = 'info';
    }
    
    // Merge with default options
    const toastPayload = {
      ...DEFAULT_TOAST_OPTIONS,
      ...payload,
      // Ensure critical properties are always set correctly
      id,
      type,
      timestamp: Date.now()
    };
    
    console.log('Sending toast notification with type:', toastPayload.type);
    
    // Publish the toast event
    publish(CoreEventType.TOAST_SHOW, toastPayload, 'ToastService');
  }

  /**
   * Hide a specific toast notification
   * 
   * @param id The ID of the toast to hide
   */
  hide(id: string): void {
    publish(CoreEventType.TOAST_HIDE, { id }, 'ToastService');
  }

  /**
   * Clear all toast notifications
   */
  clear(): void {
    publish(CoreEventType.TOAST_CLEAR, {}, 'ToastService');
  }

  /**
   * Show an info toast notification
   * 
   * @param message The message to show
   * @param options Additional options
   */
  info(message: string, options: Partial<ToastEventPayload> = {}): void {
    this.show({
      ...options,  // Move options first so it doesn't override type
      type: 'info',
      message
    });
  }

  /**
   * Show a success toast notification
   * 
   * @param message The message to show
   * @param options Additional options
   */
  success(message: string, options: Partial<ToastEventPayload> = {}): void {
    this.show({
      ...options,  // Move options first so it doesn't override type
      type: 'success',
      message
    });
  }

  /**
   * Show a warning toast notification
   * 
   * @param message The message to show
   * @param options Additional options
   */
  warning(message: string, options: Partial<ToastEventPayload> = {}): void {
    const duration = options.duration || 8000; // Longer duration for warnings
    
    this.show({
      ...options,  // Move options first so it doesn't override type
      type: 'warning',
      message,
      duration
    });
  }

  /**
   * Show an error toast notification
   * 
   * @param message The message to show
   * @param options Additional options
   */
  error(message: string, options: Partial<ToastEventPayload> = {}): void {
    const duration = options.duration || 10000; // Even longer duration for errors
    
    this.show({
      ...options,  // Move options first so it doesn't override type
      type: 'error',
      message,
      duration
    });
  }
}

// Create singleton instance
export const toastService = new ToastService();