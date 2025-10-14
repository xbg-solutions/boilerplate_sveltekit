/**
 * src/lib/utils/error-handler-toast.ts
 * Integration between error handler and toast notifications
 * 
 * Provides utilities for showing toast notifications for errors
 */

import { normalizeError, type AppError } from './error-handler';
import { toastService } from '$lib/services/toast';
import type { ToastEventPayload } from '$lib/types/event.types';

/**
 * Options for error toast notifications
 */
export interface ErrorToastOptions extends Partial<ToastEventPayload> {
  /**
   * Whether to include technical details in the error message
   * Defaults to false in production, true in development
   */
  includeDetails?: boolean;
  
  /**
   * Error category to display in toast
   * If not provided, it will be extracted from the error
   */
  category?: string;
}

/**
 * Show a toast notification for an error
 * 
 * @param error The error to show
 * @param options Toast configuration options
 */
export function showErrorToast(error: unknown, options: ErrorToastOptions = {}): void {
  // Normalize the error
  const appError = normalizeError(error);
  
  // Determine if we should include technical details
  const includeDetails = options.includeDetails ?? import.meta.env.DEV;
  
  // Build the toast message
  const message = appError.userMessage || appError.message;
  
  // Get the error category
  const category = options.category || appError.category || 'error';
  
  // Show the toast notification with a unique ID
  toastService.error(message, {
    id: `error_toast_${Date.now()}`,
    title: `${capitalizeFirstLetter(category)} Error`,
    duration: 7000, // Longer duration for errors
    ...options
  });
}

/**
 * Show a toast notification when an operation succeeds
 * 
 * @param message Success message
 * @param options Toast configuration options
 */
export function showSuccessToast(message: string, options: Partial<ToastEventPayload> = {}): void {
  toastService.success(message, {
    id: `success_toast_${Date.now()}`,
    title: options.title || 'Success',
    duration: 5000, // Standard duration for success
    ...options
  });
}

/**
 * Show a toast notification for warnings
 * 
 * @param message Warning message
 * @param options Toast configuration options
 */
export function showWarningToast(message: string, options: Partial<ToastEventPayload> = {}): void {
  toastService.warning(message, {
    id: `warning_toast_${Date.now()}`,
    title: options.title || 'Warning',
    duration: 6000, // Slightly longer duration for warnings
    ...options
  });
}

/**
 * Show a toast notification for informational messages
 * 
 * @param message Info message
 * @param options Toast configuration options
 */
export function showInfoToast(message: string, options: Partial<ToastEventPayload> = {}): void {
  toastService.info(message, {
    id: `info_toast_${Date.now()}`,
    title: options.title || 'Information',
    duration: 4000, // Standard duration for info
    ...options
  });
}

/**
 * Create a function that executes an operation and shows a toast notification
 * on success or failure
 * 
 * @param operation Function to execute
 * @param successMessage Message to show on success
 * @param errorOptions Options for error toast
 * @returns A function that executes the operation and shows toast notifications
 */
export function withToastNotification<T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>,
  successMessage?: string,
  errorOptions: ErrorToastOptions = {}
): (...args: Args) => Promise<T | null> {
  return async (...args: Args) => {
    try {
      // Execute the operation
      const result = await operation(...args);
      
      // Show success toast if message provided
      if (successMessage) {
        showSuccessToast(successMessage);
      }
      
      return result;
    } catch (error) {
      // Show error toast
      showErrorToast(error, errorOptions);
      return null;
    }
  };
}

/**
 * Helper function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}