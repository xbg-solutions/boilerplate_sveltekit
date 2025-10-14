// src/lib/types/tab-sync.types.ts
import type { AppError } from '../utils/error-handler';

/**
 * Information about a single tab
 */
export interface TabInfo {
  /** Timestamp of last heartbeat */
  lastSeen: number;
  /** Whether this tab has claimed primary status */
  isPrimary: boolean;
  /** Authentication state in this tab */
  isAuthenticated: boolean;
  /** Whether the tab is currently visible (not minimized or in background) */
  isVisible?: boolean;
}

/**
 * Interface for offline queued messages
 */
export interface QueuedMessage {
  /** Unique message ID */
  id: string;
  /** Message type */
  type: string;
  /** Message data */
  data: any;
  /** Timestamp when message was created */
  timestamp: number;
  /** Number of attempts to send this message */
  attempts: number;
}

/**
 * Tab sync message interface
 */
export interface TabSyncMessage {
  /** Unique message ID */
  id: string;
  /** Message type */
  type: string;
  /** Message data */
  data: any;
  /** Timestamp when message was created */
  timestamp: number;
  /** Source tab ID */
  sourceTabId: string;
}

/**
 * TabSync store state
 */
export interface TabSyncState {
  /** Whether the service has been initialized */
  isInitialized: boolean;
  /** Whether this tab is currently the primary tab */
  isPrimaryTab: boolean;
  /** ID of the current tab */
  tabId: string;
  /** Whether the user is authenticated in this tab */
  isAuthenticated: boolean;
  /** Whether the tab is currently visible */
  isVisible: boolean;
  /** Whether the browser is online */
  isOnline: boolean;
  /** Record of all known tabs */
  knownTabs: Record<string, TabInfo>;
  /** Last time this tab was active */
  lastActive: number;
  /** Last time auth state was updated */
  lastAuthStateUpdate: number;
  /** Queue of messages to process when returning online */
  offlineQueue: QueuedMessage[];
  /** Recent auth attempts (for rate limiting) */
  recentAuthAttempts: number[];
  /** Error state if something goes wrong */
  error: AppError | null;
}

/**
 * TabSync initialization options
 */
export interface TabSyncOptions {
  /** Heartbeat interval in milliseconds */
  heartbeatInterval?: number;
  /** Tab timeout in milliseconds */
  tabTimeout?: number;
  /** Maximum offline queue size */
  maxOfflineQueueSize?: number;
  /** Whether to automatically become primary if no other tabs are found */
  autoBecomePrimary?: boolean;
}

/**
 * TabSync events payload types
 */
export interface TabSyncInitializedPayload {
  tabId: string;
  isPrimary: boolean;
  timestamp: number;
}

export interface TabSyncPrimaryChangedPayload {
  tabId: string;
  isPrimary: boolean;
  timestamp: number;
}

export interface TabSyncAuthStatePayload {
  action: 'login' | 'logout' | 'refresh';
  source: 'local' | 'remote';
  timestamp: number;
}

export interface TabSyncTabJoinedPayload {
  tabId: string;
  timestamp: number;
}

export interface TabSyncTabLeftPayload {
  tabId: string;
  timestamp: number;
}

export interface TabSyncErrorPayload {
  error: AppError;
  tabId: string;
  timestamp: number;
}

/**
 * Interface for the TabSync service
 */
export interface ITabSyncService {
  /** Initialize the TabSync service */
  initialize(): Promise<boolean>;
  
  /** Destroy the TabSync service and clean up resources */
  destroy(): void;
  
  /** Check if current tab is the primary tab */
  isPrimaryTab(): boolean;
  
  /** Force synchronization of auth state */
  forceSync(): Promise<void>;
  
  /** Get information about active tabs */
  getTabsInfo(): Record<string, TabInfo>;
  
  /** Get the current tab information */
  getCurrentTabInfo(): TabInfo;
  
  /** Broadcast a custom message to other tabs */
  broadcastMessage(type: string, data: any): void;
}