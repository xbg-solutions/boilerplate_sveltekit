/**
 * src/lib/services/initialization/initialization.service.test-helper.ts
 * Test-specific version of the initialization service
 *
 * This file is a copy of initialization.service.ts but with
 * the browser import replaced with a constant for testing.
 * External services are injected via options to avoid circular deps.
 */

import { get } from 'svelte/store';
// Replace $app/environment with a constant
const browser = true;

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

import { loggerService } from '../logging/logging.service';
import { AppError, normalizeError } from '../../utils/error-handler';
import { publish } from '../events/pub-sub';
import { initializationStore } from '../../stores/initialization.store';
import type { IAuthServiceDep } from './initialization.service';

// Create a context-aware logger
const initLogger = loggerService.withContext('InitializationService');

/**
 * Creates the initialization service (test version)
 * @returns Initialization service instance
 */
export function createTestInitializationService() {
  let firebaseApp: FirebaseApp | null = null;

  /**
   * Initializes Firebase Auth and frontend services
   * @param options Initialization options
   * @returns Promise that resolves when initialization is complete
   */
  const initialize = async (options: {
    firebaseConfig: any;
    useEmulators?: boolean;
    authService?: IAuthServiceDep;
  }): Promise<void> => {
    // Default options
    const {
      firebaseConfig,
      useEmulators = false,
      authService
    } = options;

    // Skip initialization if not in browser
    if (!browser) {
      initLogger.info('Skipping initialization in SSR context');
      return;
    }

    // Check if already initializing
    if (get(initializationStore).isInitializing) {
      initLogger.info('Initialization already in progress');
      return;
    }

    // Check if already initialized
    if (get(initializationStore).isInitialized) {
      initLogger.info('Already initialized');
      return;
    }

    // Set initializing state
    initializationStore.update(state => ({
      ...state,
      isInitializing: true,
      error: null
    }));

    initLogger.info('Starting application initialization');

    try {
      // Initialize Firebase app
      await initializeFirebaseApp(firebaseConfig);

      // Initialize Firebase Auth
      await initializeAuth(useEmulators, authService);

      // Mark initialization as complete
      initializationStore.update(state => ({
        ...state,
        isInitialized: true,
        isInitializing: false
      }));

      // Publish initialization complete event
      publish('app:initialized', {}, 'InitializationService');

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
      publish('app:initialization-failed', { error: normalizedError }, 'InitializationService');

      // Re-throw the error for upstream handling
      throw normalizedError;
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
   * @param authService Optional injected auth service
   */
  const initializeAuth = async (useEmulators: boolean, authService?: IAuthServiceDep): Promise<void> => {
    try {
      initLogger.info('Initializing Firebase Auth');

      // Connect to Auth emulator if specified
      if (useEmulators) {
        const auth = getAuth();
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        initLogger.info('Connected to Firebase Auth emulator');
      }

      // Initialize auth service if provided
      if (authService) {
        await authService.initialize();
      } else {
        initLogger.warn('No auth service provided, skipping auth initialization');
      }

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
 * Test singleton instance of the initialization service
 */
export const testInitializationService = createTestInitializationService();

/**
 * Helper function to get the current initialization state
 */
export function getTestInitializationState() {
  return get(initializationStore);
}
