/**
 *  src/lib/stores/logging.store.ts
 *  Logging Store
 */

import { writable } from 'svelte/store';
import type { LoggerState } from '../types/logging.types';

/**
 * Creates and initializes the logger store
 * @returns A writable store containing logging state
 */
function createLoggerStore() {
  const initialState: LoggerState = {
    enabled: false, // Will be determined during initialization
    timers: {}
  };
  
  return writable<LoggerState>(initialState);
}

/**
 * Singleton store instance for logger state
 */
export const loggerStore = createLoggerStore();