/**
 * src/lib/services/initialization/index.ts
 * Initialization services central export
 * 
 * Provides a single entry point for accessing initialization-related
 * services and functions.
 */

export {
  initializationService,
  createInitializationService,
  getInitializationState
} from './initialization.service';

// Re-export the store for direct access
export { initializationStore } from '../../stores/initialization.store';
export type { InitializationState } from '../../stores/initialization.store';