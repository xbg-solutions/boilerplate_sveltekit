// src/lib/services/tab-sync/index.ts
/**
 * TabSync Service
 * 
 * Central export point for the TabSync service and related utilities.
 * The TabSync service synchronizes critical state across multiple browser tabs,
 * particularly authentication state.
 */

// Core service
export { 
    tabSyncService,
    TabSyncError,
    safeInitialize,
    safeForceSync,
    safeBroadcastMessage
  } from './tab-sync.service';
  
  // Re-export store for direct access
  export { tabSyncStore } from '../../stores/tab-sync.store';
  
  // Re-export types for convenience
  export type {
    TabInfo,
    QueuedMessage,
    TabSyncMessage,
    TabSyncState,
    TabSyncOptions,
    ITabSyncService,
    TabSyncInitializedPayload,
    TabSyncPrimaryChangedPayload,
    TabSyncAuthStatePayload,
    TabSyncTabJoinedPayload,
    TabSyncTabLeftPayload,
    TabSyncErrorPayload
  } from '../../types/tab-sync.types';
  
  // Re-export constants for use in other modules
  export { 
    TAB_SYNC_EVENTS,
    TAB_SYNC_CONFIG,
    TAB_SYNC_MESSAGE_TYPES,
    TAB_SYNC_ERROR_TYPES
  } from '../../constants/tab-sync.constants';