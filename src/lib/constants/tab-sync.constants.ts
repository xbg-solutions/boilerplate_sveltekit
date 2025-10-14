/**
 * src/lib/constants/tab-sync.constants.ts
 * Tab synchronization constants
 * 
 * @deprecated This file has been consolidated into central configuration.
 * New code should import from '@/lib/config/app.config.ts' instead.
 * 
 * Legacy tab sync constants - use central config for new development.
 */

import { APP_CONFIG } from '../config/app.config';

/**
 * @deprecated Use APP_CONFIG.tabSync.events instead
 * Event types for TabSync service
 */
export const TAB_SYNC_EVENTS = {
  INITIALIZED: APP_CONFIG.tabSync.events.initialized,
  PRIMARY_TAB_CHANGED: APP_CONFIG.tabSync.events.primaryTabChanged,
  AUTH_STATE_SYNCED: APP_CONFIG.tabSync.events.authStateSynced,
  TAB_JOINED: APP_CONFIG.tabSync.events.tabJoined,
  TAB_LEFT: APP_CONFIG.tabSync.events.tabLeft,
  ONLINE_STATUS_CHANGED: APP_CONFIG.tabSync.events.onlineStatusChanged,
  RAPID_AUTH_ATTEMPTS: APP_CONFIG.tabSync.events.rapidAuthAttempts,
  ERROR: APP_CONFIG.tabSync.events.error,
  MESSAGE_RECEIVED: APP_CONFIG.tabSync.events.messageReceived
};

/**
 * @deprecated Use APP_CONFIG.tabSync.config instead
 * Configuration for TabSync service
 */
export const TAB_SYNC_CONFIG = {
  HEARTBEAT_INTERVAL: APP_CONFIG.tabSync.config.heartbeatInterval,
  TAB_TIMEOUT: APP_CONFIG.tabSync.config.tabTimeout,
  STORAGE_KEY: APP_CONFIG.tabSync.config.storageKey,
  CHANNEL_NAME: APP_CONFIG.tabSync.config.channelName,
  MAX_AUTH_ATTEMPTS: APP_CONFIG.tabSync.config.maxAuthAttempts,
  AUTH_ATTEMPTS_TIMEFRAME: APP_CONFIG.tabSync.config.authAttemptsTimeframe,
  MAX_OFFLINE_QUEUE_SIZE: APP_CONFIG.tabSync.config.maxOfflineQueueSize,
  PRIMARY_NOMINATION_WAIT: APP_CONFIG.tabSync.config.primaryNominationWait
};

/**
 * @deprecated Use APP_CONFIG.tabSync.messageTypes instead
 * Message types for tab communication
 */
export const TAB_SYNC_MESSAGE_TYPES = {
  HEARTBEAT: APP_CONFIG.tabSync.messageTypes.heartbeat,
  AUTH_STATE: APP_CONFIG.tabSync.messageTypes.authState,
  TAB_CLOSED: APP_CONFIG.tabSync.messageTypes.tabClosed,
  PRIMARY_NOMINATION: APP_CONFIG.tabSync.messageTypes.primaryNomination,
  PRIMARY_CONFIRMATION: APP_CONFIG.tabSync.messageTypes.primaryConfirmation,
  SYNC_REQUEST: APP_CONFIG.tabSync.messageTypes.syncRequest,
  SYNC_RESPONSE: APP_CONFIG.tabSync.messageTypes.syncResponse,
  CUSTOM_MESSAGE: APP_CONFIG.tabSync.messageTypes.customMessage
};

/**
 * @deprecated Use APP_CONFIG.tabSync.errorTypes instead
 * Error types for TabSync
 */
export const TAB_SYNC_ERROR_TYPES = {
  INITIALIZATION_FAILED: APP_CONFIG.tabSync.errorTypes.initializationFailed,
  MESSAGE_SEND_FAILED: APP_CONFIG.tabSync.errorTypes.messageSendFailed,
  MESSAGE_PARSING_FAILED: APP_CONFIG.tabSync.errorTypes.messageParsingFailed,
  SYNC_FAILED: APP_CONFIG.tabSync.errorTypes.syncFailed,
  STORAGE_ERROR: APP_CONFIG.tabSync.errorTypes.storageError
};