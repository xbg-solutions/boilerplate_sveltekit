/**
 * src/lib/utils/app-check.ts
 * Firebase App Check Integration
 *
 * Protects your app from abuse by attesting that requests come from your authentic app.
 * App Check works with:
 * - reCAPTCHA v3 (Web)
 * - reCAPTCHA Enterprise (Web/Mobile)
 * - Play Integrity (Android)
 * - App Attest (iOS)
 * - Custom providers
 *
 * Security Benefits:
 * - Prevents API abuse from bots and automated scripts
 * - Protects backend resources (Cloud Functions, Storage, Firestore)
 * - Works seamlessly with Firebase services
 * - Minimal performance impact
 */

import { initializeAppCheck, ReCaptchaV3Provider, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import type { FirebaseApp } from 'firebase/app';
import { loggerService } from '../services/logging/logging.service';

// Create logger for App Check
const appCheckLogger = loggerService.withContext('AppCheck');

/**
 * App Check configuration
 */
export interface AppCheckConfig {
  provider: 'recaptcha-v3' | 'recaptcha-enterprise' | 'debug';
  siteKey: string;
  isTokenAutoRefreshEnabled?: boolean;
  debugToken?: string; // For local development/testing
}

/**
 * Get App Check configuration from environment
 */
function getAppCheckConfig(): AppCheckConfig | null {
  // Only enable in production by default (can be overridden)
  const enabled = import.meta.env.VITE_APP_CHECK_ENABLED === 'true' || import.meta.env.PROD;

  if (!enabled) {
    appCheckLogger.info('App Check is disabled (not in production or explicitly disabled)');
    return null;
  }

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    appCheckLogger.warn('App Check enabled but VITE_RECAPTCHA_SITE_KEY not configured');
    return null;
  }

  // Determine provider type
  const provider = import.meta.env.VITE_APP_CHECK_PROVIDER || 'recaptcha-v3';

  // Debug token for development/testing
  const debugToken = import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN;

  return {
    provider: provider as 'recaptcha-v3' | 'recaptcha-enterprise',
    siteKey,
    isTokenAutoRefreshEnabled: true,
    debugToken
  };
}

/**
 * Initialize Firebase App Check
 *
 * @param app Firebase app instance
 * @returns App Check instance or null if not configured/disabled
 */
export async function initializeFirebaseAppCheck(app: FirebaseApp) {
  const config = getAppCheckConfig();

  if (!config) {
    appCheckLogger.info('Skipping App Check initialization');
    return null;
  }

  try {
    // Enable debug mode in development
    if (import.meta.env.DEV && config.debugToken) {
      // Set debug token for local testing
      // This allows you to test App Check locally without real reCAPTCHA
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = config.debugToken;
      appCheckLogger.info('App Check debug mode enabled', {
        debugToken: config.debugToken.substring(0, 10) + '...'
      });
    }

    let provider;

    // Initialize the appropriate provider
    switch (config.provider) {
      case 'recaptcha-enterprise':
        provider = new ReCaptchaEnterpriseProvider(config.siteKey);
        appCheckLogger.info('Initializing App Check with reCAPTCHA Enterprise');
        break;

      case 'recaptcha-v3':
      default:
        provider = new ReCaptchaV3Provider(config.siteKey);
        appCheckLogger.info('Initializing App Check with reCAPTCHA v3');
        break;
    }

    // Initialize App Check
    const appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: config.isTokenAutoRefreshEnabled ?? true
    });

    appCheckLogger.info('App Check initialized successfully', {
      provider: config.provider,
      autoRefresh: config.isTokenAutoRefreshEnabled
    });

    return appCheck;
  } catch (error) {
    appCheckLogger.error(
      'Failed to initialize App Check',
      error instanceof Error ? error : new Error(String(error)),
      {
        provider: config.provider
      }
    );

    // Don't throw - allow app to continue without App Check
    // This prevents App Check issues from breaking the entire app
    return null;
  }
}

/**
 * Check if App Check is enabled
 */
export function isAppCheckEnabled(): boolean {
  const config = getAppCheckConfig();
  return config !== null;
}

/**
 * Get App Check configuration for display/debugging
 */
export function getAppCheckStatus() {
  const config = getAppCheckConfig();

  return {
    enabled: config !== null,
    provider: config?.provider || 'none',
    autoRefresh: config?.isTokenAutoRefreshEnabled ?? false,
    debugMode: import.meta.env.DEV && !!config?.debugToken
  };
}
