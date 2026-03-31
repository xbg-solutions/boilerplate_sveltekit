// src/lib/services/tab-sync/tab-sync.service.ts
import { browser } from '@xbg.solutions/bpsk-core';
import { get } from 'svelte/store';
import { publish, subscribe } from '@xbg.solutions/bpsk-core';
import { authService } from '@xbg.solutions/bpsk-utils-firebase-auth';
import { AUTH_EVENTS } from '@xbg.solutions/bpsk-core';
import { TAB_SYNC_EVENTS, TAB_SYNC_CONFIG, TAB_SYNC_MESSAGE_TYPES, TAB_SYNC_ERROR_TYPES } from '../../constants/tab-sync.constants';
import { tabSyncStore } from '../../stores/tab-sync.store';
import { loggerService } from '@xbg.solutions/bpsk-core';
import { AppError, normalizeError, withErrorHandling } from '@xbg.solutions/bpsk-core';
import type { Subscription } from '@xbg.solutions/bpsk-core';
import type { 
  TabInfo, 
  TabSyncMessage, 
  QueuedMessage,
  ITabSyncService 
} from '../../types/tab-sync.types';

// Create a logger with context
const logger = loggerService.withContext('TabSyncService');

/**
 * Error class for TabSync-related errors
 */
export class TabSyncError extends AppError {
  constructor(message: string, options: { [key: string]: any } = {}) {
    super(message, {
      category: 'tabSync',
      ...options
    });
  }
}

/**
 * TabSync Service handles synchronizing authentication state
 * and other critical data across browser tabs.
 */
class TabSyncService implements ITabSyncService {
  private initialized = false;
  private broadcastChannel: BroadcastChannel | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private processingQueue = false;
  private subscriptions: Subscription[] = [];
  private lastProcessedMessageId: string | null = null;
  private storageEventBound: ((event: StorageEvent) => void) | null = null;
  private visibilityChangeBound: (() => void) | null = null;
  private onlineBound: (() => void) | null = null;
  private offlineBound: (() => void) | null = null;
  private beforeUnloadBound: (() => void) | null = null;
  
  /**
   * Initializes the TabSync service
   * @returns Promise that resolves to true if initialization was successful
   */
  public async initialize(): Promise<boolean> {
    // Skip if already initialized
    if (this.initialized) {
      logger.info('TabSync service already initialized');
      return true;
    }
    
    // Skip if not in browser environment
    if (!browser) {
      logger.info('TabSync service not initialized (server-side)');
      return false;
    }
    
    try {
      logger.info('Initializing TabSync service');
      
      // Generate a unique ID for this tab
      const tabId = this.generateTabId();
      
      // Initialize the store state
      tabSyncStore.update(state => ({
        ...state,
        isInitialized: true,
        tabId,
        isAuthenticated: authService.isAuthenticated(),
        isVisible: document.visibilityState === 'visible',
        isOnline: navigator.onLine,
        lastActive: Date.now()
      }));
      
      // Set up communication channel
      this.setupCommunication();
      
      // Set up event handlers
      this.registerEventHandlers();
      
      // Start heartbeat interval
      this.startHeartbeat();
      
      // Start cleanup interval (for stale tabs)
      this.startCleanupInterval();
      
      // Register browser events
      this.registerBrowserEvents();
      
      // Set initialization flag
      this.initialized = true;
      
      // Perform initial actions
      this.announceTab();
      this.negotiatePrimaryTab();
      
      // Publish initialization event
      publish(TAB_SYNC_EVENTS.INITIALIZED, {
        tabId,
        isPrimary: get(tabSyncStore).isPrimaryTab,
        timestamp: Date.now()
      }, 'TabSyncService');
      
      logger.info('TabSync service initialized successfully');
      return true;
    } catch (error) {
      const normalizedError = normalizeError(
        error, 
        'Failed to initialize TabSync service',
        { category: 'tabSync' }
      );
      
      logger.error('TabSync initialization failed', normalizedError);
      
      // Update store with error
      tabSyncStore.update(state => ({
        ...state,
        isInitialized: false,
        error: normalizedError
      }));
      
      // Publish error event
      publish(TAB_SYNC_EVENTS.ERROR, {
        error: normalizedError,
        tabId: get(tabSyncStore).tabId,
        timestamp: Date.now()
      }, 'TabSyncService');
      
      return false;
    }
  }
  
  /**
   * Sets up the communication channel for cross-tab messaging
   */
  private setupCommunication(): void {
    try {
      // Try to use BroadcastChannel API (modern browsers)
      this.broadcastChannel = new BroadcastChannel(TAB_SYNC_CONFIG.CHANNEL_NAME);
      this.broadcastChannel.onmessage = this.handleIncomingMessage.bind(this);
      logger.info('Using BroadcastChannel for cross-tab communication');
    } catch (error) {
      // Fall back to localStorage for older browsers
      logger.info('BroadcastChannel not available, falling back to localStorage');
      this.storageEventBound = this.handleStorageEvent.bind(this);
      window.addEventListener('storage', this.storageEventBound);
    }
  }
  
  /**
   * Registers event handlers for various events
   */
  private registerEventHandlers(): void {
    // Clear existing subscriptions
    this.unregisterEventHandlers();
    
    // Listen for auth state changes
    this.subscriptions.push(
      subscribe(AUTH_EVENTS.STATE_CHANGED, this.handleAuthStateChanged.bind(this))
    );
    
    // Listen for login success events
    this.subscriptions.push(
      subscribe(AUTH_EVENTS.LOGIN_SUCCESS, this.handleLoginSuccess.bind(this))
    );
    
    // Listen for logout events
    this.subscriptions.push(
      subscribe(AUTH_EVENTS.LOGOUT, this.handleLogout.bind(this))
    );
  }
  
  /**
   * Unregisters all event handlers
   */
  private unregisterEventHandlers(): void {
    // Unsubscribe from all events
    this.subscriptions.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (error) {
          logger.warn('Error unsubscribing from event', error instanceof Error ? error : new Error(String(error)));
        }
      }
    });
    this.subscriptions = [];
  }
  
  /**
   * Registers browser events (visibility, online/offline, beforeunload)
   */
  private registerBrowserEvents(): void {
    // Handle visibility changes
    this.visibilityChangeBound = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.visibilityChangeBound);
    
    // Handle online/offline state
    this.onlineBound = this.handleOnlineChange.bind(this);
    this.offlineBound = this.handleOfflineChange.bind(this);
    window.addEventListener('online', this.onlineBound);
    window.addEventListener('offline', this.offlineBound);
    
    // Handle tab closing
    this.beforeUnloadBound = this.handleBeforeUnload.bind(this);
    window.addEventListener('beforeunload', this.beforeUnloadBound);
  }
  
  /**
   * Unregisters browser event listeners
   */
  private unregisterBrowserEvents(): void {
    if (this.visibilityChangeBound) {
      document.removeEventListener('visibilitychange', this.visibilityChangeBound);
      this.visibilityChangeBound = null;
    }
    
    if (this.onlineBound) {
      window.removeEventListener('online', this.onlineBound);
      this.onlineBound = null;
    }
    
    if (this.offlineBound) {
      window.removeEventListener('offline', this.offlineBound);
      this.offlineBound = null;
    }
    
    if (this.beforeUnloadBound) {
      window.removeEventListener('beforeunload', this.beforeUnloadBound);
      this.beforeUnloadBound = null;
    }
    
    if (this.storageEventBound) {
      window.removeEventListener('storage', this.storageEventBound);
      this.storageEventBound = null;
    }
  }
  
  /**
   * Starts the heartbeat interval
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, TAB_SYNC_CONFIG.HEARTBEAT_INTERVAL);
    
    // Send initial heartbeat
    this.sendHeartbeat();
  }
  
  /**
   * Starts the cleanup interval for stale tabs
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleTabs();
    }, TAB_SYNC_CONFIG.HEARTBEAT_INTERVAL);
  }
  
  /**
   * Generates a unique ID for this tab
   */
  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
  
  /**
   * Generates a unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
  
  /**
   * Sends a heartbeat message to other tabs
   */
  private sendHeartbeat(): void {
    if (!browser || !this.initialized) return;
    
    const state = get(tabSyncStore);
    
    // Update last active timestamp
    tabSyncStore.update(current => ({
      ...current,
      lastActive: Date.now()
    }));
    
    // Send heartbeat message
    this.sendMessage({
      type: TAB_SYNC_MESSAGE_TYPES.HEARTBEAT,
      data: {
        tabId: state.tabId,
        isPrimary: state.isPrimaryTab,
        isAuthenticated: state.isAuthenticated,
        isVisible: state.isVisible
      }
    });
  }
  
  /**
   * Announces this tab to other tabs
   */
  private announceTab(): void {
    const state = get(tabSyncStore);
    
    // Send sync request to all tabs
    this.sendMessage({
      type: TAB_SYNC_MESSAGE_TYPES.SYNC_REQUEST,
      data: {
        tabId: state.tabId,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Negotiates which tab should be primary
   */
  private negotiatePrimaryTab(): void {
    const state = get(tabSyncStore);
    const knownTabs = Object.keys(state.knownTabs);
    
    // If no other tabs are known, become primary
    if (knownTabs.length === 0) {
      this.becomePrimaryTab();
      return;
    }
    
    // Check if any tab is already primary
    const hasPrimaryTab = knownTabs.some(tabId => 
      state.knownTabs[tabId].isPrimary &&
      Date.now() - state.knownTabs[tabId].lastSeen < TAB_SYNC_CONFIG.TAB_TIMEOUT
    );
    
    if (!hasPrimaryTab) {
      // No primary tab, nominate self
      this.nominateAsPrimaryTab();
    }
  }
  
  /**
   * Sets this tab as the primary tab
   */
  private becomePrimaryTab(): void {
    const currentState = get(tabSyncStore);
    
    // Skip if already primary
    if (currentState.isPrimaryTab) {
      return;
    }
    
    logger.info('This tab becoming primary');
    
    // Update store
    tabSyncStore.update(state => ({
      ...state,
      isPrimaryTab: true
    }));
    
    // Announce primary status
    this.sendMessage({
      type: TAB_SYNC_MESSAGE_TYPES.PRIMARY_CONFIRMATION,
      data: {
        tabId: currentState.tabId,
        timestamp: Date.now()
      }
    });
    
    // Publish primary changed event
    publish(TAB_SYNC_EVENTS.PRIMARY_TAB_CHANGED, {
      tabId: currentState.tabId,
      isPrimary: true,
      timestamp: Date.now()
    }, 'TabSyncService');
  }
  
  /**
   * Nominates this tab as the primary tab
   */
  private nominateAsPrimaryTab(): void {
    const state = get(tabSyncStore);
    
    // Send nomination message
    this.sendMessage({
      type: TAB_SYNC_MESSAGE_TYPES.PRIMARY_NOMINATION,
      data: {
        tabId: state.tabId,
        timestamp: Date.now()
      }
    });
    
    // Wait briefly for any objections, then become primary
    setTimeout(() => {
      // Check if someone else has become primary in the meantime
      const currentState = get(tabSyncStore);
      const knownTabs = Object.keys(currentState.knownTabs);
      
      const hasPrimaryTab = knownTabs.some(tabId => 
        currentState.knownTabs[tabId].isPrimary &&
        Date.now() - currentState.knownTabs[tabId].lastSeen < TAB_SYNC_CONFIG.TAB_TIMEOUT
      );
      
      if (!hasPrimaryTab) {
        this.becomePrimaryTab();
      }
    }, TAB_SYNC_CONFIG.PRIMARY_NOMINATION_WAIT);
  }
  
  /**
   * Renounces primary tab status (becomes secondary)
   */
  private becomeSecondaryTab(): void {
    const currentState = get(tabSyncStore);
    
    // Skip if already secondary
    if (!currentState.isPrimaryTab) {
      return;
    }
    
    logger.info('This tab becoming secondary');
    
    // Update store
    tabSyncStore.update(state => ({
      ...state,
      isPrimaryTab: false
    }));
    
    // Publish primary changed event
    publish(TAB_SYNC_EVENTS.PRIMARY_TAB_CHANGED, {
      tabId: currentState.tabId,
      isPrimary: false,
      timestamp: Date.now()
    }, 'TabSyncService');
  }
  
  /**
   * Cleans up stale tabs from the known tabs list
   */
  private cleanupStaleTabs(): void {
    const currentTime = Date.now();
    let tabsRemoved = false;
    
    tabSyncStore.update(state => {
      const newKnownTabs = { ...state.knownTabs };
      
      // Remove tabs that haven't sent a heartbeat in too long
      Object.keys(newKnownTabs).forEach(tabId => {
        if (currentTime - newKnownTabs[tabId].lastSeen > TAB_SYNC_CONFIG.TAB_TIMEOUT) {
          logger.info(`Removing stale tab: ${tabId.substring(0, 8)}`);
          delete newKnownTabs[tabId];
          tabsRemoved = true;
        }
      });
      
      return {
        ...state,
        knownTabs: newKnownTabs
      };
    });
    
    // If tabs were removed, check if we need to become primary
    if (tabsRemoved) {
      this.negotiatePrimaryTab();
    }
  }
  
  /**
   * Handles incoming messages from other tabs
   */
  private handleIncomingMessage(event: MessageEvent): void {
    try {
      const message = event.data;
      
      // Skip if this is our own message (via ID)
      if (message.id === this.lastProcessedMessageId) {
        return;
      }
      
      // Store ID to prevent reprocessing
      this.lastProcessedMessageId = message.id;
      
      this.processMessage(message);
    } catch (error) {
      logger.error('Error handling incoming message', error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Handles localStorage events (fallback for BroadcastChannel)
   */
  private handleStorageEvent(event: StorageEvent): void {
    // Skip if not our storage key
    if (event.key !== TAB_SYNC_CONFIG.STORAGE_KEY || !event.newValue) {
      return;
    }
    
    try {
      const message = JSON.parse(event.newValue);
      this.processMessage(message);
    } catch (error) {
      logger.error('Error parsing storage message', error instanceof Error ? error : new Error(String(error)));
      
      // Clear the item to avoid reprocessing
      localStorage.removeItem(TAB_SYNC_CONFIG.STORAGE_KEY);
    }
  }
  
  /**
   * Processes a message from another tab
   */
  private processMessage(message: any): void {
    if (!message || !message.type) {
      logger.warn('Received invalid message format');
      return;
    }
    
    // Skip processing our own messages
    const currentState = get(tabSyncStore);
    if (message.data && message.data.tabId === currentState.tabId) {
      return;
    }
    
    logger.info(`Processing message: ${message.type}`);
    
    switch (message.type) {
      case TAB_SYNC_MESSAGE_TYPES.HEARTBEAT:
        this.handleHeartbeatMessage(message.data);
        break;
        
      case TAB_SYNC_MESSAGE_TYPES.AUTH_STATE:
        this.handleAuthStateMessage(message.data);
        break;
        
      case TAB_SYNC_MESSAGE_TYPES.TAB_CLOSED:
        this.handleTabClosedMessage(message.data);
        break;
        
      case TAB_SYNC_MESSAGE_TYPES.PRIMARY_NOMINATION:
        this.handlePrimaryNominationMessage(message.data);
        break;
        
      case TAB_SYNC_MESSAGE_TYPES.PRIMARY_CONFIRMATION:
        this.handlePrimaryConfirmationMessage(message.data);
        break;
        
      case TAB_SYNC_MESSAGE_TYPES.SYNC_REQUEST:
        this.handleSyncRequestMessage(message.data);
        break;
        
      case TAB_SYNC_MESSAGE_TYPES.SYNC_RESPONSE:
        this.handleSyncResponseMessage(message.data);
        break;
        
      case TAB_SYNC_MESSAGE_TYPES.CUSTOM_MESSAGE:
        this.handleCustomMessage(message.data);
        break;
        
      default:
        logger.warn(`Unknown message type: ${message.type}`);
    }
  }
  
  /**
   * Handles a heartbeat message from another tab
   */
  private handleHeartbeatMessage(data: any): void {
    if (!data || !data.tabId) return;
    
    // Update known tabs with heartbeat info
    this.updateKnownTab(data.tabId, {
      lastSeen: Date.now(),
      isPrimary: data.isPrimary || false,
      isAuthenticated: data.isAuthenticated || false,
      isVisible: data.isVisible
    });
  }
  
  /**
   * Handles an auth state message from another tab
   */
  private async handleAuthStateMessage(data: any): Promise<void> {
    if (!data || !data.tabId) return;
    
    logger.info('Received auth state update from another tab');
    
    // Update local auth state if needed
    const currentState = get(tabSyncStore);
    
    // Update known tab state
    this.updateKnownTab(data.tabId, {
      lastSeen: Date.now(),
      isPrimary: data.isPrimary || false,
      isAuthenticated: data.isAuthenticated || false,
      isVisible: data.isVisible
    });
    
    // If another tab logged out, we should log out too
    if (currentState.isAuthenticated && !data.isAuthenticated) {
      logger.info('Another tab logged out, synchronizing logout');
      // Trigger a logout without dispatching another sync message
      this.triggerLogout(true);
      
      // Publish auth sync event
      publish(TAB_SYNC_EVENTS.AUTH_STATE_SYNCED, {
        action: 'logout',
        source: 'remote',
        timestamp: Date.now()
      }, 'TabSyncService');
    } 
    // If another tab logged in and we're not authenticated, refresh our state
    else if (!currentState.isAuthenticated && data.isAuthenticated) {
      logger.info('Another tab logged in, refreshing auth state');
      
      // Force a refresh of the auth state
      await this.refreshAuthState();
      
      // Force a specific page reload if still not showing as authenticated
      // This ensures we get the latest Firebase auth state
      if (!authService.isAuthenticated()) {
        logger.info('Still not authenticated after refresh, forcing deeper refresh');
        try {
          const { getFirebaseAuth } = await import('@xbg.solutions/bpsk-core');
          const auth = await getFirebaseAuth();
          // Manually check current user from Firebase
          const currentUser = auth.currentUser;
          
          if (currentUser) {
            logger.info('Found Firebase user on second check, updating auth state');
            
            // Publish update manually since auth system isn't picking it up
            publish(AUTH_EVENTS.STATE_CHANGED, {
              isAuthenticated: true,
              user: currentUser,
              claims: null, 
              authMethod: 'emailLink'
            }, 'TabSyncService');
          }
        } catch (err) {
          logger.error('Error during deeper auth refresh', err instanceof Error ? err : new Error(String(err)));
        }
      }
      
      // Publish auth sync event with a slight delay to ensure auth state is updated
      setTimeout(() => {
        publish(TAB_SYNC_EVENTS.AUTH_STATE_SYNCED, {
          action: 'login',
          source: 'remote',
          timestamp: Date.now()
        }, 'TabSyncService');
      }, 100);
    }
  }
  
  /**
   * Handles a tab closed message from another tab
   */
  private handleTabClosedMessage(data: any): void {
    if (!data || !data.tabId) return;
    
    logger.info(`Tab closed: ${data.tabId.substring(0, 8)}`);
    
    // Remove tab from known tabs
    tabSyncStore.update(state => {
      const newKnownTabs = { ...state.knownTabs };
      delete newKnownTabs[data.tabId];
      
      return {
        ...state,
        knownTabs: newKnownTabs
      };
    });
    
    // Publish tab left event
    publish(TAB_SYNC_EVENTS.TAB_LEFT, {
      tabId: data.tabId,
      timestamp: Date.now()
    }, 'TabSyncService');
    
    // If it was the primary tab, negotiate a new primary
    if (data.isPrimary) {
      this.negotiatePrimaryTab();
    }
  }
  
  /**
   * Handles a primary nomination message from another tab
   */
  private handlePrimaryNominationMessage(data: any): void {
    if (!data || !data.tabId) return;
    
    const currentState = get(tabSyncStore);
    
    // If we're already primary, object to the nomination
    if (currentState.isPrimaryTab) {
      logger.info('Objecting to primary nomination, we are already primary');
      
      this.sendMessage({
        type: TAB_SYNC_MESSAGE_TYPES.PRIMARY_CONFIRMATION,
        data: {
          tabId: currentState.tabId,
          timestamp: Date.now()
        }
      });
    } 
    // Otherwise, update known tabs
    else {
      this.updateKnownTab(data.tabId, {
        lastSeen: Date.now(),
        isPrimary: false, // Not confirmed yet
        isAuthenticated: currentState.knownTabs[data.tabId]?.isAuthenticated || false,
        isVisible: currentState.knownTabs[data.tabId]?.isVisible
      });
    }
  }
  
  /**
   * Handles a primary confirmation message from another tab
   */
  private handlePrimaryConfirmationMessage(data: any): void {
    if (!data || !data.tabId) return;
    
    logger.info(`Tab ${data.tabId.substring(0, 8)} confirmed as primary`);
    
    const currentState = get(tabSyncStore);
    
    // If we thought we were primary, but another tab is claiming it,
    // check timestamps to resolve the conflict (oldest tab wins)
    if (currentState.isPrimaryTab && data.tabId !== currentState.tabId) {
      if (this.shouldDeferToPrimary(data.tabId)) {
        // We should defer to the other tab
        this.becomeSecondaryTab();
      } else {
        // We should remain primary and tell the other tab
        this.sendMessage({
          type: TAB_SYNC_MESSAGE_TYPES.PRIMARY_CONFIRMATION,
          data: {
            tabId: currentState.tabId,
            timestamp: Date.now()
          }
        });
        return;
      }
    }
    
    // Update the tab as primary in our known tabs
    this.updateKnownTab(data.tabId, {
      lastSeen: Date.now(),
      isPrimary: true,
      isAuthenticated: currentState.knownTabs[data.tabId]?.isAuthenticated || false,
      isVisible: currentState.knownTabs[data.tabId]?.isVisible
    });
  }
  
  /**
   * Handles a sync request message from another tab
   */
  private handleSyncRequestMessage(data: any): void {
    if (!data || !data.tabId) return;
    
    logger.info(`Sync request from tab: ${data.tabId.substring(0, 8)}`);
    
    const currentState = get(tabSyncStore);
    
    // Add the requesting tab to known tabs
    this.updateKnownTab(data.tabId, {
      lastSeen: Date.now(),
      isPrimary: false,
      isAuthenticated: false,
      isVisible: true
    });
    
    // Send a sync response with our current state
    this.sendMessage({
      type: TAB_SYNC_MESSAGE_TYPES.SYNC_RESPONSE,
      data: {
        tabId: currentState.tabId,
        isPrimary: currentState.isPrimaryTab,
        isAuthenticated: currentState.isAuthenticated,
        isVisible: currentState.isVisible,
        timestamp: Date.now()
      }
    });
    
    // Publish tab joined event
    publish(TAB_SYNC_EVENTS.TAB_JOINED, {
      tabId: data.tabId,
      timestamp: Date.now()
    }, 'TabSyncService');
  }
  
  /**
   * Handles a sync response message from another tab
   */
  private handleSyncResponseMessage(data: any): void {
    if (!data || !data.tabId) return;
    
    logger.info(`Sync response from tab: ${data.tabId.substring(0, 8)}`);
    
    // Update known tabs with the response data
    this.updateKnownTab(data.tabId, {
      lastSeen: Date.now(),
      isPrimary: data.isPrimary || false,
      isAuthenticated: data.isAuthenticated || false,
      isVisible: data.isVisible
    });
    
    // If the other tab is primary, we should be secondary
    if (data.isPrimary) {
      this.becomeSecondaryTab();
    }
  }
  
  /**
   * Handles a custom message from another tab
   */
  private handleCustomMessage(data: any): void {
    if (!data) return;
    
    logger.info('Received custom message from another tab');
    
    // Publish the custom message as an event for other services to handle
    publish(TAB_SYNC_EVENTS.MESSAGE_RECEIVED, {
      type: data.type,
      data: data.payload,
      sourceTabId: data.tabId,
      timestamp: Date.now()
    }, 'TabSyncService');
  }
  
  /**
   * Determines if this tab should defer to another tab for primary status
   */
  private shouldDeferToPrimary(otherTabId: string): boolean {
    const currentState = get(tabSyncStore);
    
    // If the tab ID starts with a timestamp, use that for comparison
    // (tab_[timestamp]_[random])
    try {
      const thisTabParts = currentState.tabId.split('_');
      const otherTabParts = otherTabId.split('_');
      
      if (thisTabParts.length > 1 && otherTabParts.length > 1) {
        const thisTime = parseInt(thisTabParts[1], 10);
        const otherTime = parseInt(otherTabParts[1], 10);
        
        // The older tab (smaller timestamp) should be primary
        if (!isNaN(thisTime) && !isNaN(otherTime)) {
          return thisTime > otherTime;
        }
      }
    } catch (error) {
      logger.warn('Error parsing tab IDs, falling back to string comparison');
    }
    
    // Fallback: lexicographical comparison
    return currentState.tabId > otherTabId;
  }
  
  /**
   * Updates a known tab's information
   */
  private updateKnownTab(tabId: string, info: Partial<TabInfo>): void {
    tabSyncStore.update(state => {
      const newKnownTabs = { ...state.knownTabs };
      
      // Create or update tab info
      newKnownTabs[tabId] = {
        lastSeen: info.lastSeen ?? Date.now(),
        isPrimary: info.isPrimary ?? newKnownTabs[tabId]?.isPrimary ?? false,
        isAuthenticated: info.isAuthenticated ?? newKnownTabs[tabId]?.isAuthenticated ?? false,
        isVisible: info.isVisible ?? newKnownTabs[tabId]?.isVisible
      };
      
      return {
        ...state,
        knownTabs: newKnownTabs
      };
    });
  }
  
  /**
   * Sends a message to other tabs
   */
  private sendMessage(message: { type: string; data: any }): void {
    if (!browser || !this.initialized) return;
    
    try {
      const state = get(tabSyncStore);
      
      // Create the full message with ID and source tab ID
      const fullMessage: TabSyncMessage = {
        id: this.generateMessageId(),
        type: message.type,
        data: message.data,
        timestamp: Date.now(),
        sourceTabId: state.tabId
      };
      
      // Store the message ID to prevent reprocessing if we receive our own message
      this.lastProcessedMessageId = fullMessage.id;
      
      // Check if we're online
      if (!state.isOnline) {
        // If offline, queue the message for when we're back online
        this.queueMessageForOffline(fullMessage);
        return;
      }
      
      // Send via broadcast channel if available
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage(fullMessage);
        } catch (error) {
          logger.error('Failed to send message via BroadcastChannel', error instanceof Error ? error : new Error(String(error)));
        }
      } 
      // Fall back to localStorage
      else {
        localStorage.setItem(TAB_SYNC_CONFIG.STORAGE_KEY, JSON.stringify(fullMessage));
        // Need to remove it quickly to trigger another event later
        setTimeout(() => {
          localStorage.removeItem(TAB_SYNC_CONFIG.STORAGE_KEY);
        }, 100);
      }
    } catch (error) {
      logger.error('Failed to send message', error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Queues a message to be sent when we're back online
   */
  private queueMessageForOffline(message: TabSyncMessage): void {
    // Skip heartbeat messages when offline
    if (message.type === TAB_SYNC_MESSAGE_TYPES.HEARTBEAT) {
      return;
    }
    
    tabSyncStore.update(state => {
      // Create a queued message
      const queuedMessage: QueuedMessage = {
        id: message.id,
        type: message.type,
        data: message.data,
        timestamp: message.timestamp,
        attempts: 0
      };
      
      // Add to the queue, limiting size
      const newQueue = [...state.offlineQueue, queuedMessage];
      if (newQueue.length > TAB_SYNC_CONFIG.MAX_OFFLINE_QUEUE_SIZE) {
        // Remove oldest messages if queue is too large
        newQueue.splice(0, newQueue.length - TAB_SYNC_CONFIG.MAX_OFFLINE_QUEUE_SIZE);
      }
      
      return {
        ...state,
        offlineQueue: newQueue
      };
    });
  }
  
  /**
   * Processes queued messages when returning online
   */
  private processOfflineQueue(): void {
    const state = get(tabSyncStore);
    
    // Skip if already processing or no messages
    if (this.processingQueue || state.offlineQueue.length === 0) {
      return;
    }
    
    this.processingQueue = true;
    
    logger.info(`Processing ${state.offlineQueue.length} queued messages`);
    
    tabSyncStore.update(state => {
      // Send all queued messages
      state.offlineQueue.forEach(msg => {
        this.sendMessage({
          type: msg.type,
          data: msg.data
        });
      });
      
      return {
        ...state,
        offlineQueue: []
      };
    });
    
    this.processingQueue = false;
  }
  
  /**
   * Handles auth state changes
   */
  private handleAuthStateChanged(payload: any): void {
    logger.info('Auth state changed, updating local state', { isAuthenticated: payload.isAuthenticated });
    
    // Update local store
    tabSyncStore.update(state => ({
      ...state,
      isAuthenticated: payload.isAuthenticated === true,
      lastAuthStateUpdate: Date.now()
    }));
    
    // Broadcast auth state change to other tabs
    this.sendMessage({
      type: TAB_SYNC_MESSAGE_TYPES.AUTH_STATE,
      data: {
        tabId: get(tabSyncStore).tabId,
        isAuthenticated: payload.isAuthenticated === true,
        isPrimary: get(tabSyncStore).isPrimaryTab,
        isVisible: document.visibilityState === 'visible'
      }
    });
    
    // Track auth attempts for rate limiting
    if (payload.isAuthenticated === true) {
      this.trackAuthAttempt();
    }
    
    // Only publish local sync event if this is an actual state change (becoming authenticated)
    // This prevents an infinite loop of logout events
    if (payload.isAuthenticated) {
      logger.info('Publishing local auth state sync event for login');
      setTimeout(() => {
        publish(TAB_SYNC_EVENTS.AUTH_STATE_SYNCED, {
          action: 'login',
          source: 'local',
          timestamp: Date.now()
        }, 'TabSyncService');
      }, 100);
    }
  }
  
  /**
   * Handles login success event
   */
  private handleLoginSuccess(): void {
    // Update the auth state in the store
    tabSyncStore.update(state => ({
      ...state,
      isAuthenticated: true,
      lastAuthStateUpdate: Date.now()
    }));
    
    // No need to broadcast - auth state change event will handle it
  }
  
  /**
   * Handles logout event
   */
  private handleLogout(): void {
    // Update the auth state in the store
    tabSyncStore.update(state => ({
      ...state,
      isAuthenticated: false,
      lastAuthStateUpdate: Date.now()
    }));
    
    // No need to broadcast - auth state change event will handle it
  }
  
  /**
   * Triggers a logout action
   * @param skipBroadcast Whether to skip broadcasting to other tabs
   */
  private triggerLogout(skipBroadcast = false): void {
    logger.info('Triggering logout');
    
    // Use the auth service's logout method
    try {
      // Only update local state, don't trigger auth events
      tabSyncStore.update(state => ({
        ...state,
        isAuthenticated: false,
        lastAuthStateUpdate: Date.now()
      }));
      
      // Call auth service logout if needed
      if (!skipBroadcast) {
        publish(AUTH_EVENTS.LOGOUT, {}, 'TabSyncService');
      }
    } catch (error) {
      logger.error('Error during logout', error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Refreshes auth state with the auth service
   */
  private async refreshAuthState(): Promise<void> {
    logger.info('Refreshing auth state');
    
    // Try to get fresh Firebase auth first, which might have been updated in another tab
    try {
      // Attempt to directly check Firebase auth state for latest info
      const { getFirebaseAuth } = await import('@xbg.solutions/bpsk-core');
      const firebaseAuth = await getFirebaseAuth();
      const currentUser = firebaseAuth.currentUser;
      
      if (currentUser) {
        logger.info('Firebase user found, forcing token refresh');
        // Force a token refresh to ensure we have the latest auth state
        await currentUser.getIdToken(true);
      }
    } catch (error) {
      logger.warn('Failed to force refresh from Firebase', 
        error instanceof Error ? error : new Error(String(error))
      );
    }
    
    // Now check if authService reports us as authenticated
    const isAuthenticated = authService.isAuthenticated();
    logger.info(`Current authentication state: ${isAuthenticated}`);
    
    // Update store with current auth state
    tabSyncStore.update(state => ({
      ...state,
      isAuthenticated: isAuthenticated,
      lastAuthStateUpdate: Date.now()
    }));
    
    // If we're authenticated, force a refresh by publishing AUTH_EVENTS.STATE_CHANGED
    if (isAuthenticated) {
      try {
        logger.info('Publishing auth state changed event after refresh');
        const user = authService.getCurrentUser();
        const claims = authService.getUserClaims();
        
        // Emit auth state changed event to ensure all subscribers are notified
        publish(AUTH_EVENTS.STATE_CHANGED, {
          isAuthenticated: true,
          user: user,
          claims: claims,
          authMethod: user ? 'emailLink' : null // Assume email link if we can't determine
        }, 'TabSyncService');
      } catch (error) {
        logger.error('Error publishing auth state event after refresh', 
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }
  
  /**
   * Tracks authentication attempts for rate limiting
   */
  private trackAuthAttempt(): void {
    const currentTime = Date.now();
    
    tabSyncStore.update(state => {
      // Add current time to auth attempts
      const newAttempts = [...state.recentAuthAttempts, currentTime];
      
      // Remove attempts older than the timeframe
      const validAttempts = newAttempts.filter(time => 
        currentTime - time < TAB_SYNC_CONFIG.AUTH_ATTEMPTS_TIMEFRAME
      );
      
      // Check if we've exceeded the limit
      if (validAttempts.length >= TAB_SYNC_CONFIG.MAX_AUTH_ATTEMPTS) {
        // Publish rapid auth attempts event
        publish(TAB_SYNC_EVENTS.RAPID_AUTH_ATTEMPTS, {
          count: validAttempts.length,
          timeframe: TAB_SYNC_CONFIG.AUTH_ATTEMPTS_TIMEFRAME,
          threshold: TAB_SYNC_CONFIG.MAX_AUTH_ATTEMPTS,
          timestamp: currentTime
        }, 'TabSyncService');
      }
      
      return {
        ...state,
        recentAuthAttempts: validAttempts
      };
    });
  }
  
  /**
   * Handles visibility change events
   */
  private handleVisibilityChange(): void {
    const isVisible = document.visibilityState === 'visible';
    
    logger.info(`Tab visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
    
    // Update store with visibility state
    tabSyncStore.update(state => ({
      ...state,
      isVisible,
      lastActive: isVisible ? Date.now() : state.lastActive
    }));
    
    // If tab became visible
    if (isVisible) {
      // Refresh auth state when tab becomes visible
      this.refreshAuthState();
      
      // Send heartbeat to announce we're active
      this.sendHeartbeat();
    }
  }
  
  /**
   * Handles online state change
   */
  private handleOnlineChange(): void {
    logger.info('Browser is online');
    
    // Update store
    tabSyncStore.update(state => ({
      ...state,
      isOnline: true
    }));
    
    // Process offline queue
    this.processOfflineQueue();
    
    // Publish online status event
    publish(TAB_SYNC_EVENTS.ONLINE_STATUS_CHANGED, {
      isOnline: true,
      timestamp: Date.now()
    }, 'TabSyncService');
    
    // Send heartbeat to announce we're back
    this.sendHeartbeat();
  }
  
  /**
   * Handles offline state change
   */
  private handleOfflineChange(): void {
    logger.info('Browser is offline');
    
    // Update store
    tabSyncStore.update(state => ({
      ...state,
      isOnline: false
    }));
    
    // Publish offline status event
    publish(TAB_SYNC_EVENTS.ONLINE_STATUS_CHANGED, {
      isOnline: false,
      timestamp: Date.now()
    }, 'TabSyncService');
  }
  
  /**
   * Handles before unload event (tab closing)
   */
  private handleBeforeUnload(): void {
    logger.info('Tab closing');
    
    const state = get(tabSyncStore);
    
    // Send tab closed message
    this.sendMessage({
      type: TAB_SYNC_MESSAGE_TYPES.TAB_CLOSED,
      data: {
        tabId: state.tabId,
        isPrimary: state.isPrimaryTab,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Check if current tab is the primary tab
   */
  public isPrimaryTab(): boolean {
    return get(tabSyncStore).isPrimaryTab;
  }
  
  /**
   * Force synchronization of auth state
   */
  public async forceSync(): Promise<void> {
    logger.info('Forcing auth state sync');
    
    // Refresh auth state
    this.refreshAuthState();
    
    // Broadcast current state to other tabs
    const state = get(tabSyncStore);
    
    this.sendMessage({
      type: TAB_SYNC_MESSAGE_TYPES.AUTH_STATE,
      data: {
        tabId: state.tabId,
        isPrimary: state.isPrimaryTab,
        isAuthenticated: state.isAuthenticated,
        isVisible: state.isVisible
      }
    });
  }
  
  /**
   * Broadcast a custom message to other tabs
   */
  public broadcastMessage(type: string, data: any): void {
    logger.info(`Broadcasting custom message: ${type}`);
    
    this.sendMessage({
      type: TAB_SYNC_MESSAGE_TYPES.CUSTOM_MESSAGE,
      data: {
        tabId: get(tabSyncStore).tabId,
        type,
        payload: data,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Get information about all known tabs
   */
  public getTabsInfo(): Record<string, TabInfo> {
    return get(tabSyncStore).knownTabs;
  }
  
  /**
   * Get current tab information
   */
  public getCurrentTabInfo(): TabInfo {
    const state = get(tabSyncStore);
    
    return {
      lastSeen: state.lastActive,
      isPrimary: state.isPrimaryTab,
      isAuthenticated: state.isAuthenticated,
      isVisible: state.isVisible
    };
  }
  
  /**
   * Destroy the service and clean up resources
   */
  public destroy(): void {
    if (!this.initialized) return;
    
    logger.info('Destroying TabSync service');
    
    // Unregister event handlers
    this.unregisterEventHandlers();
    this.unregisterBrowserEvents();
    
    // Clear intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Send tab closed message
    const state = get(tabSyncStore);
    this.sendMessage({
      type: TAB_SYNC_MESSAGE_TYPES.TAB_CLOSED,
      data: {
        tabId: state.tabId,
        isPrimary: state.isPrimaryTab,
        timestamp: Date.now()
      }
    });
    
    // Close broadcast channel
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    
    // Reset the store
    tabSyncStore.set({
      isInitialized: false,
      isPrimaryTab: false,
      tabId: '',
      isAuthenticated: false,
      isVisible: false,
      isOnline: true,
      knownTabs: {},
      lastActive: 0,
      lastAuthStateUpdate: 0,
      offlineQueue: [],
      recentAuthAttempts: [],
      error: null
    });
    
    this.initialized = false;
    logger.info('TabSync service destroyed');
  }
}

// Create safe versions of methods with error handling
export const safeInitialize = withErrorHandling(async () => tabSyncService.initialize());
export const safeForceSync = withErrorHandling(async () => tabSyncService.forceSync());
export const safeBroadcastMessage = withErrorHandling(
  async (type: string, data: any) => tabSyncService.broadcastMessage(type, data)
);

// Create and export the singleton instance
export const tabSyncService = new TabSyncService();