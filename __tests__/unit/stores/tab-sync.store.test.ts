/**
 * src/lib/stores/tab-sync.store.test.ts
 * 
 * Tests for tab-sync.store.ts
 * Tests the tab sync store structure and behavior
 */

import { get } from 'svelte/store';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tabSyncStore } from '@xbg.solutions/bpsk-utils-tab-sync';
import type { TabInfo, QueuedMessage } from '@xbg.solutions/bpsk-utils-tab-sync';
import { AppError } from '@xbg.solutions/bpsk-core';

// Mock browser globals
vi.mock('../../utils/browser', () => ({
  browser: true
}));

// Pin the browser-environment properties this suite depends on.
// IMPORTANT: define the individual properties on the real jsdom objects —
// never replace global document/navigator wholesale. In singleFork mode that
// replacement leaks into every test file that runs afterwards and crashes
// their imports (modules that call document.addEventListener at load time).
Object.defineProperty(document, 'visibilityState', {
  value: 'visible',
  configurable: true
});

Object.defineProperty(navigator, 'onLine', {
  value: true,
  configurable: true
});

describe('TabSync Store', () => {
  // Reset store before each test
  beforeEach(() => {
    // Reset store to initial state
    tabSyncStore.set({
      isInitialized: false,
      isPrimaryTab: false,
      tabId: '',
      isAuthenticated: false,
      isVisible: true,
      isOnline: true,
      knownTabs: {},
      lastActive: 0,
      lastAuthStateUpdate: 0,
      offlineQueue: [],
      recentAuthAttempts: [],
      error: null
    });
  });
  
  it('should have the correct initial state', () => {
    const state = get(tabSyncStore);
    
    expect(state.isInitialized).toBe(false);
    expect(state.isPrimaryTab).toBe(false);
    expect(state.tabId).toBe('');
    expect(state.isAuthenticated).toBe(false);
    expect(state.isVisible).toBe(true); // Based on mock document
    expect(state.isOnline).toBe(true); // Based on mock navigator
    expect(state.knownTabs).toEqual({});
    expect(state.lastActive).toBe(0);
    expect(state.lastAuthStateUpdate).toBe(0);
    expect(state.offlineQueue).toEqual([]);
    expect(state.recentAuthAttempts).toEqual([]);
    expect(state.error).toBeNull();
  });
  
  it('should update initialization status', () => {
    // Set initialized state
    tabSyncStore.update(state => ({
      ...state,
      isInitialized: true,
      tabId: 'test-tab-id'
    }));
    
    const state = get(tabSyncStore);
    expect(state.isInitialized).toBe(true);
    expect(state.tabId).toBe('test-tab-id');
  });
  
  it('should update primary tab status', () => {
    // Set as primary tab
    tabSyncStore.update(state => ({
      ...state,
      isPrimaryTab: true
    }));
    
    let state = get(tabSyncStore);
    expect(state.isPrimaryTab).toBe(true);
    
    // Set as secondary tab
    tabSyncStore.update(state => ({
      ...state,
      isPrimaryTab: false
    }));
    
    state = get(tabSyncStore);
    expect(state.isPrimaryTab).toBe(false);
  });
  
  it('should update authentication status', () => {
    // Set authenticated state
    tabSyncStore.update(state => ({
      ...state,
      isAuthenticated: true,
      lastAuthStateUpdate: Date.now()
    }));
    
    const state = get(tabSyncStore);
    expect(state.isAuthenticated).toBe(true);
    expect(state.lastAuthStateUpdate).toBeGreaterThan(0);
  });
  
  it('should update visibility status', () => {
    // Set tab as hidden
    tabSyncStore.update(state => ({
      ...state,
      isVisible: false
    }));
    
    let state = get(tabSyncStore);
    expect(state.isVisible).toBe(false);
    
    // Set tab as visible
    tabSyncStore.update(state => ({
      ...state,
      isVisible: true,
      lastActive: Date.now()
    }));
    
    state = get(tabSyncStore);
    expect(state.isVisible).toBe(true);
    expect(state.lastActive).toBeGreaterThan(0);
  });
  
  it('should update online status', () => {
    // Set as offline
    tabSyncStore.update(state => ({
      ...state,
      isOnline: false
    }));
    
    let state = get(tabSyncStore);
    expect(state.isOnline).toBe(false);
    
    // Set as online
    tabSyncStore.update(state => ({
      ...state,
      isOnline: true
    }));
    
    state = get(tabSyncStore);
    expect(state.isOnline).toBe(true);
  });
  
  it('should track known tabs', () => {
    const now = Date.now();
    const tabInfo: TabInfo = {
      lastSeen: now,
      isPrimary: false,
      isAuthenticated: true,
      isVisible: true
    };
    
    // Add a known tab
    tabSyncStore.update(state => ({
      ...state,
      knownTabs: {
        ...state.knownTabs,
        'other-tab-id': tabInfo
      }
    }));
    
    let state = get(tabSyncStore);
    expect(state.knownTabs).toHaveProperty('other-tab-id');
    expect(state.knownTabs['other-tab-id']).toEqual(tabInfo);
    
    // Update a known tab
    const updatedTabInfo: TabInfo = {
      ...tabInfo,
      isPrimary: true,
      lastSeen: now + 1000
    };
    
    tabSyncStore.update(state => ({
      ...state,
      knownTabs: {
        ...state.knownTabs,
        'other-tab-id': updatedTabInfo
      }
    }));
    
    state = get(tabSyncStore);
    expect(state.knownTabs['other-tab-id']).toEqual(updatedTabInfo);
    
    // Remove a known tab
    tabSyncStore.update(state => {
      const newKnownTabs = { ...state.knownTabs };
      delete newKnownTabs['other-tab-id'];
      
      return {
        ...state,
        knownTabs: newKnownTabs
      };
    });
    
    state = get(tabSyncStore);
    expect(state.knownTabs).not.toHaveProperty('other-tab-id');
  });
  
  it('should handle offline queue', () => {
    const queuedMessage: QueuedMessage = {
      id: 'msg-1',
      type: 'testMessage',
      data: { value: 'test' },
      timestamp: Date.now(),
      attempts: 0
    };
    
    // Add a message to the queue
    tabSyncStore.update(state => ({
      ...state,
      offlineQueue: [...state.offlineQueue, queuedMessage]
    }));
    
    let state = get(tabSyncStore);
    expect(state.offlineQueue.length).toBe(1);
    expect(state.offlineQueue[0]).toEqual(queuedMessage);
    
    // Add another message
    const anotherMessage: QueuedMessage = {
      ...queuedMessage,
      id: 'msg-2',
      timestamp: Date.now() + 1000
    };
    
    tabSyncStore.update(state => ({
      ...state,
      offlineQueue: [...state.offlineQueue, anotherMessage]
    }));
    
    state = get(tabSyncStore);
    expect(state.offlineQueue.length).toBe(2);
    
    // Clear the queue
    tabSyncStore.update(state => ({
      ...state,
      offlineQueue: []
    }));
    
    state = get(tabSyncStore);
    expect(state.offlineQueue.length).toBe(0);
  });
  
  it('should track recent auth attempts', () => {
    const timestamp = Date.now();
    
    // Add auth attempts
    tabSyncStore.update(state => ({
      ...state,
      recentAuthAttempts: [timestamp - 1000, timestamp]
    }));
    
    let state = get(tabSyncStore);
    expect(state.recentAuthAttempts.length).toBe(2);
    expect(state.recentAuthAttempts).toContain(timestamp);
    
    // Add another attempt
    tabSyncStore.update(state => ({
      ...state,
      recentAuthAttempts: [...state.recentAuthAttempts, timestamp + 1000]
    }));
    
    state = get(tabSyncStore);
    expect(state.recentAuthAttempts.length).toBe(3);
    
    // Clear attempts
    tabSyncStore.update(state => ({
      ...state,
      recentAuthAttempts: []
    }));
    
    state = get(tabSyncStore);
    expect(state.recentAuthAttempts.length).toBe(0);
  });
  
  it('should handle error state', () => {
    const mockError = new AppError('Tab sync failed');
    
    // Set error state
    tabSyncStore.update(state => ({
      ...state,
      error: mockError
    }));
    
    const state = get(tabSyncStore);
    expect(state.error).toEqual(mockError);
    
    // Clear error
    tabSyncStore.update(state => ({
      ...state,
      error: null
    }));
    
    const updatedState = get(tabSyncStore);
    expect(updatedState.error).toBeNull();
  });
  
  it('should update activity timestamp', () => {
    const timestamp = Date.now();
    
    // Update last active
    tabSyncStore.update(state => ({
      ...state,
      lastActive: timestamp
    }));
    
    const state = get(tabSyncStore);
    expect(state.lastActive).toBe(timestamp);
  });
});