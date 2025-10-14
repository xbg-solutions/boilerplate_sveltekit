import { writable } from 'svelte/store';

export interface InitializationHelper {
  isReady: boolean;
  services: string[];
  errors: string[];
}

export const initializationHelper = writable<InitializationHelper>({
  isReady: false,
  services: [],
  errors: []
});

export const createInitializationHelper = () => {
  return {
    markReady: () => {
      initializationHelper.update(state => ({ ...state, isReady: true }));
    },
    
    addService: (service: string) => {
      initializationHelper.update(state => ({
        ...state,
        services: [...state.services, service]
      }));
    },
    
    addError: (error: string) => {
      initializationHelper.update(state => ({
        ...state,
        errors: [...state.errors, error]
      }));
    },
    
    reset: () => {
      initializationHelper.set({
        isReady: false,
        services: [],
        errors: []
      });
    }
  };
};