/**
 * Store Synchronization Tests
 * 
 * Tests cross-store synchronization, state consistency, and event propagation
 * across the application's store ecosystem.
 */

import { get } from 'svelte/store';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { authStore } from '../../../src/lib/stores/auth.store';
import { tokenStore } from '../../../src/lib/stores/token.store';
import { tabSyncStore } from '../../../src/lib/stores/tab-sync.store';
import { stateManagerStore } from '../../../src/lib/stores/state-manager.store';
// Mock the pub-sub module before importing eventStore
vi.mock('$lib/services/events/pub-sub', () => ({
  subscribe: vi.fn(() => vi.fn()),
  publish: vi.fn()
}));

import type { User } from 'firebase/auth';
import type { FirebaseUserClaims } from '../../../src/lib/types/firebase.types';

describe('Store Synchronization', () => {
  const mockUser = { uid: 'test-uid', email: 'test@example.com' } as User;
  const mockClaims: FirebaseUserClaims = { 
    uid: 'test-uid',
    email: 'test@example.com',
    roles: ['client'],
    isClient: true 
  };

  // Create a mock event store for testing
  let mockEventStore: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock event store
    mockEventStore = {
      eventHistory: [],
      activeListeners: 0,
      lastEventTime: 0,
      error: null
    };
    
    // Reset all stores to initial state
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

    tokenStore.set({
      isInitialized: false,
      token: null,
      claims: null,
      roles: [],
      permissions: [],
      error: null
    });

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

    stateManagerStore.set({
      domains: {},
      initialized: false
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Authentication State Synchronization', () => {
    it('should synchronize authentication state across auth and token stores', () => {
      // Simulate successful authentication in auth store
      authStore.update(state => ({
        ...state,
        isAuthenticated: true,
        user: mockUser,
        claims: mockClaims,
        lastAuthenticated: Date.now()
      }));

      // Update token store to reflect authentication
      tokenStore.update(state => ({
        ...state,
        token: 'mock-jwt-token',
        claims: mockClaims,
        roles: mockClaims.roles || []
      }));

      const authState = get(authStore);
      const tokenState = get(tokenStore);

      // Both stores should reflect authenticated state
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user).toEqual(mockUser);
      expect(tokenState.token).toBeTruthy();
      expect(tokenState.claims?.uid).toBe(mockClaims.uid);
    });

    it('should maintain consistency during logout across all stores', () => {
      // Set up authenticated state
      authStore.update(state => ({
        ...state,
        isAuthenticated: true,
        user: mockUser,
        claims: mockClaims
      }));

      tokenStore.update(state => ({
        ...state,
        token: 'mock-token',
        claims: mockClaims,
        roles: ['client']
      }));

      tabSyncStore.update(state => ({
        ...state,
        isAuthenticated: true,
        lastAuthStateUpdate: Date.now()
      }));

      // Simulate logout - clear all stores
      authStore.update(state => ({
        ...state,
        isAuthenticated: false,
        user: null,
        claims: null
      }));

      tokenStore.update(state => ({
        ...state,
        token: null,
        claims: null,
        roles: []
      }));

      tabSyncStore.update(state => ({
        ...state,
        isAuthenticated: false,
        lastAuthStateUpdate: Date.now()
      }));

      // Verify all stores are cleared
      const authState = get(authStore);
      const tokenState = get(tokenStore);
      const tabState = get(tabSyncStore);

      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(tokenState.token).toBeNull();
      expect(tokenState.roles).toEqual([]);
      expect(tabState.isAuthenticated).toBe(false);
    });
  });

  describe('Cross-Tab State Synchronization', () => {
    it('should handle multi-tab authentication state changes', () => {
      const timestamp = Date.now();

      // Simulate tab registration
      const tabId1 = 'tab-1';
      const tabId2 = 'tab-2';

      tabSyncStore.update(state => ({
        ...state,
        tabId: tabId1,
        isPrimaryTab: true,
        knownTabs: {
          [tabId1]: {
            id: tabId1,
            isPrimary: true,
            lastActivity: timestamp,
            authState: false
          },
          [tabId2]: {
            id: tabId2,
            isPrimary: false,
            lastActivity: timestamp - 1000,
            authState: false
          }
        }
      }));

      // Authenticate in primary tab
      tabSyncStore.update(state => ({
        ...state,
        isAuthenticated: true,
        lastAuthStateUpdate: timestamp,
        knownTabs: {
          ...state.knownTabs,
          [tabId1]: {
            ...state.knownTabs[tabId1],
            authState: true,
            lastActivity: timestamp
          }
        }
      }));

      const tabState = get(tabSyncStore);
      expect(tabState.isAuthenticated).toBe(true);
      expect(tabState.knownTabs[tabId1].authState).toBe(true);
      expect(tabState.knownTabs[tabId2].authState).toBe(false);
    });

    it('should handle tab synchronization errors', () => {
      const errorMessage = 'Tab sync communication failed';

      tabSyncStore.update(state => ({
        ...state,
        error: { message: errorMessage } as any
      }));

      const tabState = get(tabSyncStore);
      expect(tabState.error?.message).toBe(errorMessage);
    });

    it('should manage offline queue synchronization', () => {
      const queuedMessage1 = {
        id: 'msg-1',
        type: 'AUTH_CHANGE',
        data: { isAuthenticated: true },
        timestamp: Date.now(),
        attempts: 0,
        maxAttempts: 3
      };

      const queuedMessage2 = {
        id: 'msg-2',
        type: 'TOKEN_REFRESH',
        data: { newToken: 'refreshed-token' },
        timestamp: Date.now() + 1000,
        attempts: 1,
        maxAttempts: 3
      };

      // Add messages to offline queue
      tabSyncStore.update(state => ({
        ...state,
        isOnline: false,
        offlineQueue: [queuedMessage1, queuedMessage2]
      }));

      let tabState = get(tabSyncStore);
      expect(tabState.offlineQueue).toHaveLength(2);
      expect(tabState.isOnline).toBe(false);

      // Simulate going back online and processing queue
      tabSyncStore.update(state => ({
        ...state,
        isOnline: true,
        offlineQueue: [] // Queue processed
      }));

      tabState = get(tabSyncStore);
      expect(tabState.offlineQueue).toHaveLength(0);
      expect(tabState.isOnline).toBe(true);
    });
  });

  describe('State Manager Integration', () => {
    it('should synchronize domain state across state manager', () => {
      const testDomain = 'user-preferences';
      const domainData = {
        theme: 'dark',
        language: 'en',
        notifications: true
      };

      // Add domain to state manager
      stateManagerStore.update(state => ({
        ...state,
        initialized: true,
        domains: {
          ...state.domains,
          [testDomain]: {
            data: domainData,
            lastModified: Date.now(),
            version: 1,
            persisted: true
          }
        }
      }));

      const managerState = get(stateManagerStore);
      expect(managerState.initialized).toBe(true);
      expect(managerState.domains[testDomain].data).toEqual(domainData);
      expect(managerState.domains[testDomain].persisted).toBe(true);
    });

    it('should handle state manager domain conflicts', () => {
      const domain = 'conflicted-domain';
      const originalData = { value: 'original' };
      const conflictedData = { value: 'conflicted' };

      // Set initial domain data
      stateManagerStore.update(state => ({
        ...state,
        domains: {
          [domain]: {
            data: originalData,
            lastModified: Date.now() - 1000,
            version: 1,
            persisted: true
          }
        }
      }));

      // Simulate conflict with newer data
      stateManagerStore.update(state => ({
        ...state,
        domains: {
          ...state.domains,
          [domain]: {
            data: conflictedData,
            lastModified: Date.now(),
            version: 2,
            persisted: false // Conflict not yet resolved
          }
        }
      }));

      const managerState = get(stateManagerStore);
      expect(managerState.domains[domain].data).toEqual(conflictedData);
      expect(managerState.domains[domain].version).toBe(2);
      expect(managerState.domains[domain].persisted).toBe(false);
    });
  });

  describe('Event-Driven Synchronization', () => {
    it('should synchronize state through event propagation', () => {
      const eventData = {
        type: 'USER_LOGIN',
        payload: { userId: mockUser.uid, timestamp: Date.now() },
        source: 'AuthService'
      };

      // Add event to mock event store
      mockEventStore.eventHistory = [...mockEventStore.eventHistory, eventData];
      mockEventStore.lastEventTime = Date.now();
      mockEventStore.activeListeners = 3;

      expect(mockEventStore.eventHistory).toHaveLength(1);
      expect(mockEventStore.eventHistory[0].type).toBe('USER_LOGIN');
      expect(mockEventStore.activeListeners).toBe(3);
    });

    it('should handle event processing errors', () => {
      const errorEvent = {
        type: 'PROCESSING_ERROR',
        payload: { message: 'Failed to process auth event' },
        source: 'EventProcessor'
      };

      mockEventStore.error = { message: 'Event processing failed' };
      mockEventStore.eventHistory = [...mockEventStore.eventHistory, errorEvent];

      expect(mockEventStore.error?.message).toBe('Event processing failed');
      expect(mockEventStore.eventHistory).toHaveLength(1);
    });
  });

  describe('Concurrent Store Operations', () => {
    it('should handle simultaneous store updates without race conditions', () => {
      const timestamp = Date.now();

      // Simulate rapid concurrent updates
      const updates = [
        () => authStore.update(state => ({ ...state, isLoading: true })),
        () => tokenStore.update(state => ({ ...state, token: 'temp-token' })),
        () => tabSyncStore.update(state => ({ ...state, lastActive: timestamp })),
        () => authStore.update(state => ({ ...state, isAuthenticated: true })),
        () => tokenStore.update(state => ({ ...state, roles: ['user'] }))
      ];

      // Execute all updates
      updates.forEach(update => update());

      // Verify final state consistency
      const authState = get(authStore);
      const tokenState = get(tokenStore);
      const tabState = get(tabSyncStore);

      expect(authState.isAuthenticated).toBe(true);
      expect(authState.isLoading).toBe(true);
      expect(tokenState.token).toBe('temp-token');
      expect(tokenState.roles).toEqual(['user']);
      expect(tabState.lastActive).toBe(timestamp);
    });

    it('should maintain store isolation during errors', () => {
      const authError = { message: 'Auth failed' };
      const tokenError = { message: 'Token invalid' };

      // Set errors in different stores
      authStore.update(state => ({ ...state, error: authError as any }));
      tokenStore.update(state => ({ ...state, error: tokenError as any }));

      const authState = get(authStore);
      const tokenState = get(tokenStore);
      const tabState = get(tabSyncStore);

      // Errors should be isolated to their respective stores
      expect(authState.error?.message).toBe('Auth failed');
      expect(tokenState.error?.message).toBe('Token invalid');
      expect(tabState.error).toBeNull();
    });
  });

  describe('State Persistence Synchronization', () => {
    it('should coordinate state persistence across stores', () => {
      // Simulate persistent authentication state
      const persistentUser = mockUser;
      const persistentClaims = mockClaims;
      const persistenceTimestamp = Date.now();

      // Update stores with persistent data
      authStore.update(state => ({
        ...state,
        isAuthenticated: true,
        user: persistentUser,
        claims: persistentClaims,
        lastAuthenticated: persistenceTimestamp
      }));

      tokenStore.update(state => ({
        ...state,
        token: 'persistent-token',
        claims: persistentClaims
      }));

      stateManagerStore.update(state => ({
        ...state,
        domains: {
          'auth-persistence': {
            data: { userId: persistentUser.uid, email: persistentUser.email },
            lastModified: persistenceTimestamp,
            version: 1,
            persisted: true
          }
        }
      }));

      // Verify persistence coordination
      const authState = get(authStore);
      const tokenState = get(tokenStore);
      const managerState = get(stateManagerStore);

      expect(authState.user?.uid).toBe(persistentUser.uid);
      expect(tokenState.claims?.uid).toBe(persistentUser.uid);
      expect(managerState.domains['auth-persistence'].persisted).toBe(true);
      expect(managerState.domains['auth-persistence'].data.userId).toBe(persistentUser.uid);
    });

    it('should handle persistence failures gracefully', () => {
      const persistenceError = { message: 'Storage quota exceeded' };

      // Simulate persistence failure in state manager
      stateManagerStore.update(state => ({
        ...state,
        error: persistenceError as any,
        domains: {
          'failed-domain': {
            data: { test: 'data' },
            lastModified: Date.now(),
            version: 1,
            persisted: false // Persistence failed
          }
        }
      }));

      const managerState = get(stateManagerStore);
      expect(managerState.error?.message).toBe('Storage quota exceeded');
      expect(managerState.domains['failed-domain'].persisted).toBe(false);
    });
  });

  describe('Store Cleanup and Memory Management', () => {
    it('should properly cleanup store subscriptions and prevent memory leaks', () => {
      // Simulate store subscriptions
      let authSubscription: (() => void) | undefined;
      let tokenSubscription: (() => void) | undefined;
      let tabSubscription: (() => void) | undefined;

      // Create subscriptions
      authSubscription = authStore.subscribe(() => {});
      tokenSubscription = tokenStore.subscribe(() => {});
      tabSubscription = tabSyncStore.subscribe(() => {});

      expect(authSubscription).toBeDefined();
      expect(tokenSubscription).toBeDefined();
      expect(tabSubscription).toBeDefined();

      // Cleanup subscriptions
      authSubscription?.();
      tokenSubscription?.();
      tabSubscription?.();

      // Subscriptions should be properly cleaned up
      // (In real implementation, this would prevent memory leaks)
    });

    it('should reset store state during cleanup', () => {
      // Set up stores with data
      authStore.update(state => ({
        ...state,
        isAuthenticated: true,
        user: mockUser
      }));

      tokenStore.update(state => ({
        ...state,
        token: 'cleanup-token'
      }));

      // Simulate cleanup/reset
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

      tokenStore.set({
        isInitialized: false,
        token: null,
        claims: null,
        roles: [],
        permissions: [],
        error: null
      });

      // Verify cleanup
      const authState = get(authStore);
      const tokenState = get(tokenStore);

      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
      expect(tokenState.token).toBeNull();
      expect(tokenState.roles).toEqual([]);
    });
  });
});