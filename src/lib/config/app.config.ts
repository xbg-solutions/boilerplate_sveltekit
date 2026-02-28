/**
 * Central Application Configuration
 *
 * THE single source of truth for this project.
 *
 * ─── How values get in here ─────────────────────────────────────────────────
 * • Project identity, Firebase, API URLs  →  read from .env (VITE_* vars)
 * • Auth roles, permissions, claim map    →  structural TypeScript edited by
 *                                            `npm run setup` (or manually)
 * • Routes, UI, security internals        →  structural constants — no need
 *                                            to touch these for typical projects
 *
 * Run `npm run setup` to configure everything interactively.
 * Run `npm run validate` to verify configuration is correct.
 * ────────────────────────────────────────────────────────────────────────────
 */

// Environment detection
const isDev = typeof window !== 'undefined'
  ? window.location.hostname === 'localhost'
  : process.env.NODE_ENV === 'development';

const isProd = !isDev;

// Storage/channel prefix derived from short name — avoids collisions when
// multiple projects run on the same domain/localhost.
const _shortName = (import.meta.env.VITE_APP_SHORT_NAME || 'app')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '_');

/**
 * Core application configuration
 */
export const APP_CONFIG = {
  /**
   * Project identity — all values come from .env
   */
  project: {
    name: import.meta.env.VITE_APP_NAME || 'My App',
    shortName: import.meta.env.VITE_APP_SHORT_NAME || 'App',
    description: import.meta.env.VITE_APP_DESCRIPTION || '',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    domain: import.meta.env.VITE_APP_DOMAIN || 'localhost',
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || '',
    url: isProd
      ? `https://${import.meta.env.VITE_APP_DOMAIN || 'localhost'}`
      : 'http://localhost:5173',
  },

  /**
   * Firebase — all values come from .env
   * These are passed to initializationService in +layout.ts
   */
  firebase: {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
  },

  /**
   * API endpoints — all values come from .env
   * Dev URL defaults to Firebase Functions local emulator pattern.
   */
  api: {
    baseUrl: {
      development: import.meta.env.VITE_API_BASE_URL_DEV
        || `http://localhost:5001/${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'project'}/us-central1/api`,
      production: import.meta.env.VITE_API_BASE_URL_PROD
        || `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'project'}.cloudfunctions.net/api`,
    },
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    retryCount: Number(import.meta.env.VITE_API_RETRY_COUNT) || 2,
    retryDelay: Number(import.meta.env.VITE_API_RETRY_DELAY) || 1000,
    credentials: 'include' as RequestCredentials,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },

  /**
   * Authentication & RBAC
   *
   * These are structural constants — they define your app's role model.
   * `npm run setup` writes this block; you can also edit it manually.
   *
   * The blocks between SETUP markers are replaced by the setup wizard.
   * Do not remove the markers.
   *
   * claimMap: maps role values → the boolean claim key in the Firebase JWT.
   *   Only include roles that appear as boolean flags in your custom claims.
   *   The base 'user' role typically has no boolean flag.
   */
  auth: {
    /* SETUP:start:roles */
    roles: {
      USER: 'user',
      CLIENT: 'client',
      CONSULTANT: 'consultant',
      ADMIN: 'admin',
      SYS_ADMIN: 'sysadmin',
    },

    // Higher roles inherit all permissions of the roles they list
    roleHierarchy: {
      sysadmin: ['admin', 'consultant', 'client', 'user'],
      admin: ['consultant', 'client', 'user'],
      consultant: ['client', 'user'],
      client: ['user'],
    } as Record<string, string[]>,

    permissions: {
      user: ['editOwnProfile'],
      client: ['editOwnProfile', 'viewClientDashboard'],
      consultant: ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients'],
      admin: ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients', 'viewAdminDashboard', 'manageUsers'],
      sysadmin: ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients', 'viewAdminDashboard', 'manageUsers', 'viewSysAdminDashboard', 'manageSystem'],
    } as Record<string, string[]>,

    // Maps role value → boolean JWT claim key.
    // Used by the RBAC system to resolve both roles array and legacy boolean flags.
    claimMap: {
      client: 'isClient',
      consultant: 'isConsultant',
      admin: 'isAdmin',
      sysadmin: 'isSysAdmin',
    } as Record<string, string>,
    /* SETUP:end:roles */

    // Session configuration
    tokenTTL: 3600,           // 1 hour in seconds
    refreshTokenTTL: 604800,  // 7 days in seconds
    sessionTimeout: 1800,     // 30 minutes of inactivity
  },

  /**
   * Application routes
   */
  routes: {
    public: {
      home: '/',
      signIn: '/',
      confirm: '/confirm',
      unauthorized: '/unauthorized',
    },
    protected: {
      dashboard: '/protected',
      profile: '/profile',
      settings: '/settings',
      client: '/protected/client',
      consultant: '/protected/consultant',
      admin: '/protected/admin',
      sysadmin: '/protected/sysadmin',
    },
    auth: {
      signIn: '/',
      signOut: '/',
      confirm: '/confirm',
      unauthorized: '/unauthorized',
      defaultPostLogin: '/protected',
    },
  },

  /**
   * UI / theming
   */
  ui: {
    theme: {
      defaultTheme: 'light',    // 'light' | 'dark' | 'system'
      radius: 0.5,              // Border radius in rem
    },
    layout: {
      headerHeight: '64px',
      sidebarWidth: '250px',
      maxContentWidth: '1200px',
    },
    animations: {
      enabled: true,
      duration: 200,
    },
  },

  /**
   * Feature flags
   * `npm run setup` writes this block; you can also edit it manually.
   */
  features: {
    /* SETUP:start:features */
    authentication: true,
    userProfiles: true,
    emailVerification: true,
    phoneVerification: false,
    multiTenant: false,
    realTimeUpdates: true,
    analytics: false,
    /* SETUP:end:features */
    // Auto-set from environment — don't edit these manually
    debugMode: isDev,
    showPerformanceMetrics: isDev,
  },

  /**
   * SEO — values come from .env
   */
  seo: {
    defaultTitle: import.meta.env.VITE_SEO_DEFAULT_TITLE
      || import.meta.env.VITE_APP_NAME
      || 'My App',
    defaultDescription: import.meta.env.VITE_SEO_DEFAULT_DESCRIPTION
      || import.meta.env.VITE_APP_DESCRIPTION
      || '',
    defaultImage: import.meta.env.VITE_SEO_DEFAULT_IMAGE || '/og-image.jpg',
    defaultKeywords: (import.meta.env.VITE_SEO_DEFAULT_KEYWORDS || '')
      .split(',')
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0),
    twitterHandle: import.meta.env.VITE_SEO_TWITTER_HANDLE || undefined,
    organization: {
      name: import.meta.env.VITE_APP_NAME || '',
      logo: `https://${import.meta.env.VITE_APP_DOMAIN || 'localhost'}/logo.png`,
      url: `https://${import.meta.env.VITE_APP_DOMAIN || 'localhost'}`,
      contactPoint: {
        telephone: import.meta.env.VITE_SUPPORT_PHONE || undefined,
        contactType: 'customer support',
        email: import.meta.env.VITE_SUPPORT_EMAIL || '',
      },
    },
  },

  /**
   * External services — keys come from .env
   */
  services: {
    analytics: {
      googleAnalyticsId: import.meta.env.VITE_GA_MEASUREMENT_ID || undefined,
      trackingEnabled: import.meta.env.VITE_GA_ENABLED === 'true',
    },
    sentry: {
      dsn: import.meta.env.VITE_ERROR_MONITORING_DSN || undefined,
      environment: isDev ? 'development' : 'production',
    },
    email: {
      fromAddress: import.meta.env.VITE_EMAIL_FROM_ADDRESS || '',
      supportAddress: import.meta.env.VITE_SUPPORT_EMAIL || '',
    },
  },

  /**
   * Security internals — structural, not project-specific
   */
  security: {
    csrf: {
      tokenKey: 'csrfToken',
      headerName: 'X-CSRF-Token',
      cookieName: 'csrf',
      tokenTTL: 7200,
      protectedMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
    },
    storage: {
      // Prefix derived from VITE_APP_SHORT_NAME — prevents localStorage collisions
      prefix: _shortName,
      defaultTTL: 86400,
      authTokenTTL: 3600,
      emailForSignInKey: 'emailForSignIn',
      authNamespace: 'auth',
      prefsNamespace: 'prefs',
    },
    mutex: {
      defaultTimeout: 10000,
      defaultLockExpiry: 30000,
      pollingInterval: 10,
    },
  },

  /**
   * Tab synchronisation — structural, prefixed from short name
   */
  tabSync: {
    events: {
      initialized: 'tabSync:initialized',
      primaryTabChanged: 'tabSync:primary-changed',
      authStateSynced: 'tabSync:auth-synced',
      tabJoined: 'tabSync:tab-joined',
      tabLeft: 'tabSync:tab-left',
      onlineStatusChanged: 'tabSync:online-status-changed',
      rapidAuthAttempts: 'tabSync:rapid-auth-attempts',
      error: 'tabSync:error',
      messageReceived: 'tabSync:message-received',
    },
    config: {
      heartbeatInterval: 30000,
      tabTimeout: 60000,
      storageKey: `${_shortName}_tabsync`,
      channelName: `${_shortName}_tabsync`,
      maxAuthAttempts: 5,
      authAttemptsTimeframe: 60000,
      maxOfflineQueueSize: 100,
      primaryNominationWait: 500,
    },
    messageTypes: {
      heartbeat: 'heartbeat',
      authState: 'auth_state',
      tabClosed: 'tab_closed',
      primaryNomination: 'primary_nomination',
      primaryConfirmation: 'primary_confirmation',
      syncRequest: 'sync_request',
      syncResponse: 'sync_response',
      customMessage: 'custom_message',
    },
    errorTypes: {
      initializationFailed: 'initialization_failed',
      messageSendFailed: 'message_send_failed',
      messageParsingFailed: 'message_parsing_failed',
      syncFailed: 'sync_failed',
      storageError: 'storage_error',
    },
  },
};

/**
 * Computed / derived values
 */
export const COMPUTED_CONFIG = {
  get apiBaseUrl() {
    return isDev
      ? APP_CONFIG.api.baseUrl.development
      : APP_CONFIG.api.baseUrl.production;
  },
  get environment() {
    return isDev ? 'development' : 'production';
  },
  get appUrl() {
    return APP_CONFIG.project.url;
  },
  get isDebugMode() {
    return APP_CONFIG.features.debugMode;
  },
};

// ─── TypeScript types ────────────────────────────────────────────────────────
export type AppConfig = typeof APP_CONFIG;
export type ComputedConfig = typeof COMPUTED_CONFIG;
export type UserRole = keyof typeof APP_CONFIG.auth.roles;
export type Permission = string;
export type FeatureFlag = keyof typeof APP_CONFIG.features;

// ─── Helper functions ────────────────────────────────────────────────────────
export const configHelpers = {
  /** Check if a feature flag is enabled */
  isFeatureEnabled(feature: FeatureFlag): boolean {
    return APP_CONFIG.features[feature] === true;
  },

  /** Get full API URL for an endpoint */
  getApiUrl(endpoint: string = ''): string {
    const base = COMPUTED_CONFIG.apiBaseUrl;
    return endpoint ? `${base}/${endpoint.replace(/^\//, '')}` : base;
  },

  /** Get a route path by category and key */
  getRoute(category: 'public' | 'protected' | 'auth', route: string): string {
    const routes = APP_CONFIG.routes[category] as Record<string, string>;
    return routes[route] || '/';
  },

  /** Check if user has a role (respects hierarchy) */
  userHasRole(userRoles: string[], requiredRole: string): boolean {
    if (userRoles.includes(requiredRole)) return true;
    const hierarchy = APP_CONFIG.auth.roleHierarchy;
    return userRoles.some(role => hierarchy[role]?.includes(requiredRole));
  },

  /** Collect all permissions for a set of roles */
  getUserPermissions(userRoles: string[]): string[] {
    const all = new Set<string>();
    const perms = APP_CONFIG.auth.permissions;
    userRoles.forEach(role => {
      (perms[role] || []).forEach(p => all.add(p));
    });
    return Array.from(all);
  },
};

export default APP_CONFIG;
