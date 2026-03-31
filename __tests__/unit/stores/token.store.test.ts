/**
 * src/lib/stores/token.store.test.ts
 * 
 * Tests for token.store.ts
 * Tests the token store structure and behavior
 */

import { get } from 'svelte/store';
import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStore, type TokenState } from '@xbg.solutions/bpsk-utils-firebase-auth';
import type { DecodedToken, TokenRole } from '@xbg.solutions/bpsk-core';
import type { FirebaseUserClaims } from '@xbg.solutions/bpsk-core';
import { AppError } from '@xbg.solutions/bpsk-core';

describe('Token Store', () => {
  // Mock data
  const mockToken = 'mock.jwt.token';
  const mockDecodedToken: DecodedToken = {
    uid: 'user123',
    email: 'test@example.com',
    exp: Date.now() / 1000 + 3600, // 1 hour from now
    iat: Date.now() / 1000,
    auth_time: Date.now() / 1000,
    sub: 'user123'
  };
  const mockClaims: FirebaseUserClaims = {
    uid: 'user123',
    email: 'test@example.com',
    roles: ['user', 'admin'],
    isVerified: true
  };
  const mockRoles: TokenRole[] = ['user', 'admin'];
  const mockError = new AppError('Token validation failed');
  
  // Reset store before each test
  beforeEach(() => {
    // Reset store to initial state
    tokenStore.set({
      isInitialized: false,
      isInitializing: false,
      token: null,
      decodedToken: null,
      claims: null,
      roles: [],
      isAuthenticated: false,
      lastUpdated: null,
      error: null
    });
  });
  
  it('should have the correct initial state', () => {
    const state = get(tokenStore);
    
    expect(state.isInitialized).toBe(false);
    expect(state.isInitializing).toBe(false);
    expect(state.token).toBeNull();
    expect(state.decodedToken).toBeNull();
    expect(state.claims).toBeNull();
    expect(state.roles).toEqual([]);
    expect(state.isAuthenticated).toBe(false);
    expect(state.lastUpdated).toBeNull();
    expect(state.error).toBeNull();
  });
  
  it('should update initialization status', () => {
    // Set initializing state
    tokenStore.update(state => ({
      ...state,
      isInitializing: true
    }));
    
    let state = get(tokenStore);
    expect(state.isInitializing).toBe(true);
    expect(state.isInitialized).toBe(false);
    
    // Update to initialized state
    tokenStore.update(state => ({
      ...state,
      isInitializing: false,
      isInitialized: true
    }));
    
    state = get(tokenStore);
    expect(state.isInitializing).toBe(false);
    expect(state.isInitialized).toBe(true);
  });
  
  it('should update token and related data', () => {
    // Set token and related data
    const now = Date.now();
    
    tokenStore.update(state => ({
      ...state,
      token: mockToken,
      decodedToken: mockDecodedToken,
      claims: mockClaims,
      roles: mockRoles,
      isAuthenticated: true,
      lastUpdated: now
    }));
    
    const state = get(tokenStore);
    
    expect(state.token).toBe(mockToken);
    expect(state.decodedToken).toEqual(mockDecodedToken);
    expect(state.claims).toEqual(mockClaims);
    expect(state.roles).toEqual(mockRoles);
    expect(state.isAuthenticated).toBe(true);
    expect(state.lastUpdated).toBe(now);
  });
  
  it('should clear token data', () => {
    // First set token data
    tokenStore.update(state => ({
      ...state,
      token: mockToken,
      decodedToken: mockDecodedToken,
      claims: mockClaims,
      roles: mockRoles,
      isAuthenticated: true,
      lastUpdated: Date.now()
    }));
    
    // Then clear token data
    tokenStore.update(state => ({
      ...state,
      token: null,
      decodedToken: null,
      claims: null,
      roles: [],
      isAuthenticated: false
      // Intentionally not clearing lastUpdated
    }));
    
    const state = get(tokenStore);
    
    expect(state.token).toBeNull();
    expect(state.decodedToken).toBeNull();
    expect(state.claims).toBeNull();
    expect(state.roles).toEqual([]);
    expect(state.isAuthenticated).toBe(false);
    // lastUpdated should still be present
    expect(state.lastUpdated).not.toBeNull();
  });
  
  it('should update error state', () => {
    // Set error state
    tokenStore.update(state => ({
      ...state,
      error: mockError
    }));
    
    const state = get(tokenStore);
    expect(state.error).toEqual(mockError);
    
    // Clear error
    tokenStore.update(state => ({
      ...state,
      error: null
    }));
    
    const updatedState = get(tokenStore);
    expect(updatedState.error).toBeNull();
  });
  
  it('should update roles independently', () => {
    // Set initial roles
    tokenStore.update(state => ({
      ...state,
      roles: ['user']
    }));
    
    let state = get(tokenStore);
    expect(state.roles).toEqual(['user']);
    
    // Update roles
    tokenStore.update(state => ({
      ...state,
      roles: ['user', 'admin']
    }));
    
    state = get(tokenStore);
    expect(state.roles).toEqual(['user', 'admin']);
    
    // Clear roles
    tokenStore.update(state => ({
      ...state,
      roles: []
    }));
    
    state = get(tokenStore);
    expect(state.roles).toEqual([]);
  });
  
  it('should handle updating authentication status without token data', () => {
    // Set authenticated without token data (not typical, but should be handled)
    tokenStore.update(state => ({
      ...state,
      isAuthenticated: true
    }));
    
    const state = get(tokenStore);
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBeNull(); // Still null
  });
  
  it('should track the last update timestamp', () => {
    // Set an initial timestamp
    const initialTime = Date.now() - 1000;
    tokenStore.update(state => ({
      ...state,
      lastUpdated: initialTime
    }));
    
    let state = get(tokenStore);
    expect(state.lastUpdated).toBe(initialTime);
    
    // Update the timestamp
    const updatedTime = Date.now();
    tokenStore.update(state => ({
      ...state,
      lastUpdated: updatedTime
    }));
    
    state = get(tokenStore);
    expect(state.lastUpdated).toBe(updatedTime);
  });
});