// src/lib/stores/tab-sync.store.ts
import { writable } from 'svelte/store';
import type { TabSyncState } from '../types/tab-sync.types';

/**
 * Initial state for TabSync store
 */
const initialState: TabSyncState = {
  isInitialized: false,
  isPrimaryTab: false,
  tabId: '',
  isAuthenticated: false,
  isVisible: typeof document !== 'undefined' ? document.visibilityState === 'visible' : false,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  knownTabs: {},
  lastActive: 0,
  lastAuthStateUpdate: 0,
  offlineQueue: [],
  recentAuthAttempts: [],
  error: null
};

/**
 * Create the TabSync store
 * @returns A writable store with TabSync state
 */
function createTabSyncStore() {
  return writable<TabSyncState>(initialState);
}

/**
 * The TabSync store singleton
 */
export const tabSyncStore = createTabSyncStore();