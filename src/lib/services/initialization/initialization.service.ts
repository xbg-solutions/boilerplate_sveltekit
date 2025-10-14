/**
 * src/lib/services/initialization/initialization.service.ts
 * 
 * Centralizes the initialization of Firebase Auth service:
 * - Firebase App initialization
 * - Auth service initialization
 * 
 * Provides a single entry point for application startup
 * with error handling and initialization state tracking.
 */

import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

import { authService } from '../auth';
import { loggerService } from '../logging/logging.service';
import { AppError, normalizeError } from '../../utils/error-handler';
import { publish, subscribe } from '../events';
import { initializationStore } from '../../stores/initialization.store';
import { tabSyncService } from '../tab-sync';

// Create a context-aware logger
const initLogger = loggerService.withContext('InitializationService');

/**
 * Creates the initialization service
 * @returns Initialization service instance
 */
export function createInitializationService() {
  let firebaseApp: FirebaseApp | null = null;
  let isInitializing = false;
  
  /**
   * Initializes Firebase Auth and frontend services
   * @param options Initialization options
   * @returns Promise that resolves when initialization is complete
   */
  const initialize = async (options: {
    firebaseConfig: any;
    useEmulators?: boolean;
  }): Promise<void> => {
    // Default options
    const {
      firebaseConfig,
      useEmulators = false
    } = options;
    
    // Skip initialization if not in browser
    if (!browser) {
      initLogger.info('Skipping initialization in SSR context');
      return;
    }
    
    try {
      // Check if already initializing
      if (isInitializing || get(initializationStore).isInitializing) {
        initLogger.info('Initialization already in progress');
        return;
      }
      
      // Check if already initialized
      if (get(initializationStore).isInitialized) {
        initLogger.info('Already initialized');
        return;
      }
      
      // Set local and store initializing state
      isInitializing = true;
      initializationStore.update(state => ({
        ...state,
        isInitializing: true,
        error: null
      }));
      
      initLogger.info('Starting application initialization');
      
      // Set up event subscriptions for init events
      const unsubscribeInit = subscribe('app:initialized', (event) => {
        initLogger.info('App initialized event received', {
          source: event.source,
          timestamp: event.timestamp
        });
      });
      
      // Initialize Firebase app
      await initializeFirebaseApp(firebaseConfig);
      
      // Initialize Firebase Auth
      await initializeAuth(useEmulators);
      
      // Initialize Tab Sync service for cross-tab communication
      try {
        initLogger.info('Initializing Tab Sync service');
        await tabSyncService.initialize();
        initLogger.info('Tab Sync service initialized');
      } catch (error) {
        // Log error but continue - tab sync is non-critical
        initLogger.warn('Failed to initialize Tab Sync service, continuing without tab synchronization', 
          error instanceof Error ? error : new Error(String(error))
        );
      }
      
      // Mark initialization as complete
      initializationStore.update(state => ({
        ...state,
        isInitialized: true,
        isInitializing: false
      }));
      
      // Publish initialization complete event
      await publish('app:initialized', {}, 'InitializationService');
      
      // Clean up event subscription
      unsubscribeInit();
      
      initLogger.info('Application initialization complete');
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to initialize application');
      
      initLogger.error('Application initialization failed', normalizedError);
      
      // Update state with error
      initializationStore.update(state => ({
        ...state,
        isInitializing: false,
        error: normalizedError
      }));
      
      // Publish initialization failed event
      await publish('app:initialization-failed', { error: normalizedError }, 'InitializationService');
      
      // Re-throw the error for upstream handling
      throw normalizedError;
    } finally {
      // Reset local initializing flag
      isInitializing = false;
    }
  };
  
  /**
   * Initializes the Firebase app
   * @param firebaseConfig Firebase configuration object
   */
  const initializeFirebaseApp = async (firebaseConfig: any): Promise<void> => {
    try {
      initLogger.info('Initializing Firebase app');
      
      // Check if Firebase is already initialized
      const apps = getApps();
      
      if (apps.length === 0) {
        // Initialize new Firebase app
        firebaseApp = initializeApp(firebaseConfig);
        initLogger.info('Firebase app initialized');
      } else {
        // Use existing Firebase app
        firebaseApp = apps[0];
        initLogger.info('Using existing Firebase app');
      }
      
      // Update initialization state
      initializationStore.update(state => ({
        ...state,
        services: {
          ...state.services,
          app: true
        }
      }));
    } catch (error) {
      const appError = normalizeError(error, 'Failed to initialize Firebase app');
      initLogger.error('Firebase app initialization failed', appError);
      throw appError;
    }
  };
  
  /**
   * Initializes Firebase Auth
   * @param useEmulators Whether to use Firebase emulators
   */
  const initializeAuth = async (useEmulators: boolean): Promise<void> => {
    try {
      initLogger.info('Initializing Firebase Auth');
      
      // Connect to Auth emulator if specified
      if (useEmulators) {
        const auth = getAuth();
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        initLogger.info('Connected to Firebase Auth emulator');
      }
      
      // Initialize auth service
      await authService.initialize();
      
      // Update initialization state
      initializationStore.update(state => ({
        ...state,
        services: {
          ...state.services,
          auth: true
        }
      }));
      
      initLogger.info('Firebase Auth initialized');
    } catch (error) {
      const authError = normalizeError(error, 'Failed to initialize Firebase Auth');
      initLogger.error('Firebase Auth initialization failed', authError);
      throw authError;
    }
  };
  
  /**
   * Resets the initialization state
   * Useful for testing or recovering from initialization failures
   */
  const reset = (): void => {
    initializationStore.set({
      isInitialized: false,
      isInitializing: false,
      error: null,
      services: {
        app: false,
        auth: false
      }
    });
    
    initLogger.info('Initialization state reset');
  };
  
  /**
   * Returns the Firebase app instance
   */
  const getApp = (): FirebaseApp | null => {
    return firebaseApp;
  };
  
  /**
   * Returns a promise that resolves when initialization is complete
   * or rejects if initialization fails
   */
  const whenInitialized = (): Promise<void> => {
    const state = get(initializationStore);
    
    // Already initialized
    if (state.isInitialized) {
      return Promise.resolve();
    }
    
    // Initialization failed
    if (state.error) {
      return Promise.reject(state.error);
    }
    
    // Initialization in progress or not started
    return new Promise((resolve, reject) => {
      const unsubscribe = initializationStore.subscribe(state => {
        if (state.isInitialized) {
          unsubscribe();
          resolve();
        } else if (state.error) {
          unsubscribe();
          reject(state.error);
        }
      });
    });
  };
  
  return {
    initialize,
    reset,
    getApp,
    whenInitialized
  };
}

/**
 * Singleton instance of the initialization service
 */
export const initializationService = createInitializationService();

/**
 * Helper function to get the current initialization state
 */
export function getInitializationState() {
  return get(initializationStore);
}