/**
 * src/lib/services/logging/logging.service.ts
 * Logger service implementation
 * 
 * A singleton service for application-wide logging with support for:
 * - Multiple log levels (info, warn, error)
 * - Environment-specific behavior (dev/prod)
 * - Runtime configuration via URL parameters
 * - Performance timing
 * - Contextual logging with service identifiers
 * 
 * Uses a Svelte store for state management to track enabled status
 * and handle timer information.
 */

import { get } from 'svelte/store';
import { loggerStore } from '../../stores/logging.store';
import type { ILoggerService, LogContext } from '../../types/logging.interfaces';
import type { LogLevel } from '../../types/logging.types';

/**
 * Creates the logger service instance
 * @returns Implementation of the ILoggerService interface
 */
function createLoggerService(): ILoggerService {
  // Initialize logging configuration based on environment and URL parameters
  const initializeLogging = () => {
    if (typeof window === 'undefined') {
      // Server-side rendering - no logging
      loggerStore.update(state => ({
        ...state,
        enabled: false
      }));
      return;
    }

    const isDev = import.meta.env.DEV;
    const urlParams = new URLSearchParams(window.location.search);
    // Only honour URL-based logging toggles in dev builds to prevent
    // production users from enabling verbose logging via query params.
    const hasVerboseLogging = isDev && urlParams.get('verboseLogging') === '1';
    const hasDevLogsOff = isDev && urlParams.get('devLogsOff') === '1';

    const enabled = (isDev && !hasDevLogsOff) || hasVerboseLogging;
    
    loggerStore.update(state => ({
      ...state,
      enabled
    }));
  };

  // Initialize on service creation
  initializeLogging();
  
  /**
   * Core logging implementation
   * @param level Log level
   * @param message Message to log
   * @param error Optional error object for error logs
   * @param context Additional context
   */
  const log = (level: LogLevel, message: string, error?: Error, context?: LogContext) => {
    // Always log errors, only log info/warn if enabled
    if (level !== 'error' && !get(loggerStore).enabled) return;
    
    const timestamp = new Date().toISOString();
    const serviceTag = context?.serviceKey ? `[${context.serviceKey}]` : '';
    const formattedMessage = `[${level.toUpperCase()}] [${timestamp}] ${serviceTag} ${message}`;
    
    const contextObj = context || {};
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, contextObj);
        break;
      case 'info':
        console.info(formattedMessage, contextObj);
        break;
      case 'warn':
        console.warn(formattedMessage, contextObj);
        break;
      case 'error':
        console.error(formattedMessage, error, contextObj);
        break;
    }
  };

  /**
   * Log a debug message (only when enabled)
   * @param message Debug message to log
   * @param context Additional context
   */
  const debug = (message: string, context?: LogContext) => {
    log('debug', message, undefined, context);
  };

  /**
   * Log an informational message
   * @param message Message to log
   * @param context Additional context
   */
  const info = (message: string, context?: LogContext) => {
    log('info', message, undefined, context);
  };
  
  /**
   * Log a warning message
   * @param message Warning message to log
   * @param context Additional context
   */
  const warn = (message: string, context?: LogContext) => {
    log('warn', message, undefined, context);
  };
  
  /**
   * Log an error message
   * @param message Error message to log
   * @param error Optional Error object
   * @param context Additional context
   */
  const error = (message: string, error?: Error, context?: LogContext) => {
    log('error', message, error, context);
  };
  
  /**
   * Start a performance timer
   * @param label Descriptive label for the operation
   * @returns Timer ID to be used with endTimer
   */
  const startTimer = (label: string): string => {
    if (!get(loggerStore).enabled) return label;
    
    const timerId = `${label}_${Date.now()}`;
    
    loggerStore.update(state => ({
      ...state,
      timers: {
        ...state.timers,
        [timerId]: {
          startTime: performance.now(),
          label
        }
      }
    }));
    
    info(`Timer started: ${label}`, { serviceKey: 'LoggerService', timerId });
    return timerId;
  };
  
  /**
   * End a performance timer and log the duration
   * @param timerId Timer ID from startTimer
   * @param context Additional context information
   */
  const endTimer = (timerId: string, context?: LogContext) => {
    if (!get(loggerStore).enabled) return;
    
    const state = get(loggerStore);
    const timer = state.timers[timerId];
    
    if (!timer) {
      warn(`Timer with ID ${timerId} not found`, { serviceKey: 'LoggerService', ...context });
      return;
    }
    
    const endTime = performance.now();
    const duration = endTime - timer.startTime;
    
    info(`${timer.label} completed in ${duration.toFixed(2)}ms`, {
      serviceKey: context?.serviceKey || 'LoggerService',
      duration,
      ...context
    });
    
    loggerStore.update(state => {
      const { [timerId]: _, ...remainingTimers } = state.timers;
      return {
        ...state,
        timers: remainingTimers
      };
    });
  };
  
  /**
   * Create a logger instance with a predefined context
   * @param serviceKey Service identifier to include with all logs
   * @returns Logger instance with context preset
   */
  const withContext = (serviceKey: string) => {
    return {
      debug: (message: string, context?: LogContext) => debug(message, { serviceKey, ...context }),
      info: (message: string, context?: LogContext) => info(message, { serviceKey, ...context }),
      warn: (message: string, context?: LogContext) => warn(message, { serviceKey, ...context }),
      error: (message: string, err?: Error, context?: LogContext) => error(message, err, { serviceKey, ...context }),
      startTimer: (label: string) => startTimer(`${serviceKey}:${label}`),
      endTimer: (timerId: string, context?: LogContext) => endTimer(timerId, { serviceKey, ...context })
    };
  };

  /**
   * Check if logging is currently enabled
   * @returns True if logging is enabled
   */
  const isEnabled = () => get(loggerStore).enabled;

  return {
    debug,
    info,
    warn,
    error,
    startTimer,
    endTimer,
    withContext,
    isEnabled
  };
}

/**
 * Singleton instance of the logger service
 */
export const loggerService = createLoggerService();