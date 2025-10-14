/**
 * src/lib/stores/auth.store.test.ts
 * 
 * Tests for auth.store.ts
 * Tests the authentication store structure and behavior
 */

import { get } from 'svelte/store';
import { describe, it, expect, beforeEach } from 'vitest';
import { authStore } from '$lib/stores/auth.store';
import type { User } from 'firebase/auth';
import type { FirebaseUserClaims } from '$lib/types/firebase.types';
import type { AppError } from '$lib/utils/error-handler';

describe('Auth Store', () => {
  // Mock data
  const mockUser = { uid: 'test-uid', email: 'test@example.com' } as User;
  const mockClaims: FirebaseUserClaims = { 
    uid: 'test-uid',
    email: 'test@example.com',
    roles: ['client'],
    isClient: true 
  };
  const mockError = { message: 'Test error' } as AppError;
  
  // Reset store before each test
  beforeEach(() => {
    // Reset store to initial state
    authStore.set({
      isInitialized: false,
      isInitializing: false,
      isAuthenticated: false,
      isLoading: false,
      user: null,
      claims: null,
      authMethod: null,
      lastAuthenticated: null,
      error: null
    });
  });
  
  it('should have the correct initial state', () => {
    const state = get(authStore);
    
    expect(state.isInitialized).toBe(false);
    expect(state.isInitializing).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.claims).toBeNull();
    expect(state.authMethod).toBeNull();
    expect(state.lastAuthenticated).toBeNull();
    expect(state.error).toBeNull();
  });
  
  it('should update authentication status', () => {
    // Set authenticated state
    authStore.update(state => ({
      ...state,
      isAuthenticated: true,
      user: mockUser,
      claims: mockClaims,
      authMethod: 'emailLink',
      lastAuthenticated: Date.now()
    }));
    
    const state = get(authStore);
    
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.claims).toEqual(mockClaims);
    expect(state.authMethod).toBe('emailLink');
    expect(state.lastAuthenticated).toBeDefined();
  });
  
  it('should update loading state', () => {
    // Set loading state
    authStore.update(state => ({
      ...state,
      isLoading: true
    }));
    
    let state = get(authStore);
    expect(state.isLoading).toBe(true);
    
    // Update loading state
    authStore.update(state => ({
      ...state,
      isLoading: false
    }));
    
    state = get(authStore);
    expect(state.isLoading).toBe(false);
  });
  
  it('should update initialization state', () => {
    // Set initializing state
    authStore.update(state => ({
      ...state,
      isInitializing: true
    }));
    
    let state = get(authStore);
    expect(state.isInitializing).toBe(true);
    expect(state.isInitialized).toBe(false);
    
    // Update to initialized state
    authStore.update(state => ({
      ...state,
      isInitializing: false,
      isInitialized: true
    }));
    
    state = get(authStore);
    expect(state.isInitializing).toBe(false);
    expect(state.isInitialized).toBe(true);
  });
  
  it('should update error state', () => {
    // Set error state
    authStore.update(state => ({
      ...state,
      error: mockError
    }));
    
    const state = get(authStore);
    expect(state.error).toEqual(mockError);
  });
  
  it('should clear user data on logout', () => {
    // First set authenticated state
    authStore.update(state => ({
      ...state,
      isAuthenticated: true,
      user: mockUser,
      claims: mockClaims,
      authMethod: 'emailLink',
      lastAuthenticated: Date.now()
    }));
    
    // Then simulate logout
    authStore.update(state => ({
      ...state,
      isAuthenticated: false,
      user: null,
      claims: null,
      authMethod: null
    }));
    
    const state = get(authStore);
    
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.claims).toBeNull();
    expect(state.authMethod).toBeNull();
    // lastAuthenticated should still be present even after logout
    expect(state.lastAuthenticated).toBeDefined();
  });
});