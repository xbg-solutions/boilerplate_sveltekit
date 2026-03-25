/**
 * src/lib/constants/mutex.constants.ts
 * Constants for mutex utility
 * 
 * @deprecated This file has been consolidated into central configuration.
 * New code should import from '@/lib/config/app.config.ts' instead.
 * 
 * Legacy mutex constants - use central config for new development.
 */

import { APP_CONFIG } from '@xbg.solutions/frontend-core';

/** 
 * @deprecated Use APP_CONFIG.security.mutex instead
 * Default maximum wait time for acquiring a lock (ms) 
 */
export const DEFAULT_MUTEX_TIMEOUT = APP_CONFIG.security.mutex.defaultTimeout;

/** 
 * @deprecated Use APP_CONFIG.security.mutex instead
 * Default maximum lock retention time (ms) 
 */
export const DEFAULT_MUTEX_LOCK_EXPIRY = APP_CONFIG.security.mutex.defaultLockExpiry;

/** 
 * @deprecated Use APP_CONFIG.security.mutex instead
 * Polling interval when waiting for a lock (ms) 
 */
export const MUTEX_POLLING_INTERVAL = APP_CONFIG.security.mutex.pollingInterval;