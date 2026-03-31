/**
 * src/lib/stores/initialization.store.test.ts
 * Initialization Store Tests
 * 
 * Unit tests for the initialization store.
 */

import { get } from 'svelte/store';
import { describe, it, expect, beforeEach } from 'vitest';
import { initializationStore, type InitializationState } from '@xbg.solutions/bpsk-core';
import { AppError } from '@xbg.solutions/bpsk-core';

describe('Initialization Store', () => {
  // Reset the store before each test
  beforeEach(() => {
    // Reset to initial state
    initializationStore.set({
      isInitialized: false,
      isInitializing: false,
      error: null,
      services: {
        app: false,
        auth: false
      }
    });
  });

  it('should have the correct initial state', () => {
    const state = get(initializationStore);
    
    expect(state.isInitialized).toBe(false);
    expect(state.isInitializing).toBe(false);
    expect(state.error).toBeNull();
    expect(state.services.app).toBe(false);
    expect(state.services.auth).toBe(false);
  });

  it('should update initialization status correctly', () => {
    // Start initialization
    initializationStore.update(state => ({
      ...state,
      isInitializing: true
    }));
    
    let state = get(initializationStore);
    expect(state.isInitializing).toBe(true);
    expect(state.isInitialized).toBe(false);
    
    // Complete initialization
    initializationStore.update(state => ({
      ...state,
      isInitializing: false,
      isInitialized: true
    }));
    
    state = get(initializationStore);
    expect(state.isInitializing).toBe(false);
    expect(state.isInitialized).toBe(true);
  });

  it('should track service initialization correctly', () => {
    // Initialize Firebase app
    initializationStore.update(state => ({
      ...state,
      services: {
        ...state.services,
        app: true
      }
    }));
    
    let state = get(initializationStore);
    expect(state.services.app).toBe(true);
    expect(state.services.auth).toBe(false);
    
    // Initialize Firebase auth
    initializationStore.update(state => ({
      ...state,
      services: {
        ...state.services,
        auth: true
      }
    }));
    
    state = get(initializationStore);
    expect(state.services.app).toBe(true);
    expect(state.services.auth).toBe(true);
  });

  it('should handle errors correctly', () => {
    // Create an AppError with a string message (based on your implementation)
    const testError = new AppError('Test initialization error');
    
    initializationStore.update(state => ({
      ...state,
      error: testError
    }));
    
    const state = get(initializationStore);
    expect(state.error).toEqual(testError);
  });

  it('should reset state correctly', () => {
    // Set some values
    initializationStore.update(state => ({
      ...state,
      isInitialized: true,
      services: {
        app: true,
        auth: true
      }
    }));
    
    // Verify state was updated
    let state = get(initializationStore);
    expect(state.isInitialized).toBe(true);
    expect(state.services.app).toBe(true);
    
    // Reset state
    initializationStore.set({
      isInitialized: false,
      isInitializing: false,
      error: null,
      services: {
        app: false,
        auth: false
      }
    });
    
    // Verify reset
    state = get(initializationStore);
    expect(state.isInitialized).toBe(false);
    expect(state.services.app).toBe(false);
    expect(state.services.auth).toBe(false);
  });
});