/**
 * src/lib/stores/loading.store.ts
 * Loading State Manager
 * 
 * A store that manages loading states throughout the application,
 * with support for nested operations and contextual loading.
 */

import { writable, derived, get } from 'svelte/store';

// Types for loading state
interface LoadingOperation {
  context: string;
  operation: string;
  timestamp: number;
  state: 'start' | 'end';
}

interface LoadingState {
  // Global loading state
  global: boolean;
  // Loading states for specific contexts
  contexts: Record<string, boolean>;
  // Operation history for debugging
  operations: LoadingOperation[];
  // Current operation count
  activeOperations: number;
}

// Initial state
const initialState: LoadingState = {
  global: false,
  contexts: {},
  operations: [],
  activeOperations: 0
};

// Create the loading store
function createLoadingStore() {
  const { subscribe, update, set } = writable<LoadingState>(initialState);
  
  // Get a derived store for a specific context
  const forContext = (contextName: string) => {
    return derived({ subscribe }, ($state) => {
      return $state.contexts[contextName] || false;
    });
  };
  
  // Start a loading operation
  const startLoading = (context: string = 'global', operation: string = 'default') => {
    update((state: LoadingState): LoadingState => {
      // Update the context state
      const updatedContexts = {
        ...state.contexts,
        [context]: true
      };
      
      // If this is the global context, also set the global flag
      const updatedGlobal = context === 'global' ? true : state.global;
      
      // Record the operation
      const updatedOperations: LoadingOperation[] = [
        ...state.operations,
        {
          context,
          operation,
          timestamp: Date.now(),
          state: 'start'
        }
      ];
      
      // Keep the history manageable
      if (updatedOperations.length > 100) {
        updatedOperations.shift();
      }
      
      return {
        global: updatedGlobal,
        contexts: updatedContexts,
        operations: updatedOperations,
        activeOperations: state.activeOperations + 1
      };
    });
  };
  
  // End a loading operation
  const endLoading = (context: string = 'global', operation: string = 'default') => {
    update((state: LoadingState): LoadingState => {
      // Record the operation completion
      const updatedOperations: LoadingOperation[] = [
        ...state.operations,
        {
          context,
          operation,
          timestamp: Date.now(),
          state: 'end'
        }
      ];
      
      // Keep the history manageable
      if (updatedOperations.length > 100) {
        updatedOperations.shift();
      }
      
      // Decrease active operations count
      const newActiveOperations = Math.max(0, state.activeOperations - 1);
      
      // Update contexts - only mark as not loading if there are no other
      // active operations for this context
      const activeContexts = updatedOperations
        .filter(op => op.state === 'start')
        .map(op => op.context);
      
      const contextStillActive = activeContexts.includes(context);
      
      const updatedContexts = {
        ...state.contexts,
        [context]: contextStillActive
      };
      
      // Update global loading state based on any active operations
      const updatedGlobal = newActiveOperations > 0;
      
      return {
        global: updatedGlobal,
        contexts: updatedContexts,
        operations: updatedOperations,
        activeOperations: newActiveOperations
      };
    });
  };
  
  // Utility function to run a function with loading state
  const withLoading = async <T>(
    fn: () => Promise<T>,
    context: string = 'global',
    operation: string = 'default'
  ): Promise<T> => {
    try {
      startLoading(context, operation);
      return await fn();
    } finally {
      endLoading(context, operation);
    }
  };
  
  // Reset all loading states
  const resetLoading = () => {
    set(initialState);
  };
  
  // Is any context loading?
  const isAnyLoading = (): boolean => {
    return get({ subscribe }).activeOperations > 0;
  };
  
  // Is a specific context loading?
  const isContextLoading = (context: string): boolean => {
    return get({ subscribe }).contexts[context] || false;
  };
  
  return {
    subscribe,
    startLoading,
    endLoading,
    withLoading,
    resetLoading,
    forContext,
    isAnyLoading,
    isContextLoading
  };
}

// Export the singleton instance
export const loadingStore = createLoadingStore();