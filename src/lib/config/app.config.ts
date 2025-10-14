/**
 * Central Application Configuration
 * 
 * This is THE primary configuration file for the boilerplate.
 * 
 * FOR NEW PROJECTS: Search for "FIXME" to find all customization points.
 * Update these values to customize the application for your specific project.
 * 
 * AI SYSTEMS: This file contains all configuration patterns that should be
 * modified when generating new projects. Follow the FIXME comments for
 * customization points.
 */

// Environment detection
const isDev = typeof window !== 'undefined' 
  ? window.location.hostname === 'localhost'
  : process.env.NODE_ENV === 'development';

const isProd = typeof window !== 'undefined'
  ? window.location.hostname !== 'localhost'
  : process.env.NODE_ENV === 'production';

/**
 * Core application configuration
 * AI SYSTEMS: These are the primary values to update for new projects
 */
export const APP_CONFIG = {
  /**
   * Project identification and branding
   * FIXME: Update these values for your project
   */
  project: {
    name: 'Your App Name',                    // FIXME: Application display name
    shortName: 'YourApp',                     // FIXME: Short name for icons/titles  
    description: 'Your app description',      // FIXME: App description for SEO
    version: '1.0.0',                        // FIXME: Current version
    domain: 'yourapp.com',                   // FIXME: Production domain
    url: isProd ? 'https://yourapp.com' : 'http://localhost:5173', // FIXME: Update domain
  },

  /**
   * API configuration for different environments
   * FIXME: Update Firebase project ID and API endpoints
   */
  api: {
    baseUrl: {
      development: 'http://localhost:5001/your-project-id/us-central1/api', // FIXME: Update project ID
      production: 'https://us-central1-your-project-id.cloudfunctions.net/api', // FIXME: Update project ID
    },
    timeout: 30000,
    retryCount: 2,
    retryDelay: 1000,
    credentials: 'include' as RequestCredentials,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  },

  /**
   * Firebase configuration
   * FIXME: Update with your Firebase project configuration
   */
  firebase: {
    projectId: 'your-project-id',             // FIXME: Firebase project ID
    apiKey: 'your-api-key',                   // FIXME: Firebase API key  
    authDomain: 'your-project-id.firebaseapp.com', // FIXME: Firebase auth domain
    storageBucket: 'your-project-id.appspot.com',  // FIXME: Firebase storage bucket
    messagingSenderId: '123456789',           // FIXME: Firebase messaging sender ID
    appId: 'your-app-id',                     // FIXME: Firebase app ID
  },

  /**
   * Authentication and authorization configuration
   * FIXME: Define your application's roles and permissions
   */
  auth: {
    // Available user roles in your application
    roles: {
      USER: 'user',           // Default user role
      CLIENT: 'client',       // FIXME: Add/remove roles as needed
      CONSULTANT: 'consultant', // FIXME: Add/remove roles as needed  
      ADMIN: 'admin',         // FIXME: Add/remove roles as needed
      SYS_ADMIN: 'sysadmin',  // FIXME: Add/remove roles as needed
    },
    
    // Role hierarchy (higher roles inherit lower role permissions)
    roleHierarchy: {
      sysadmin: ['admin', 'consultant', 'client', 'user'],
      admin: ['consultant', 'client', 'user'],
      consultant: ['client', 'user'],
      client: ['user'],
    },

    // Basic permissions matrix - customize as needed
    permissions: {
      user: ['editOwnProfile'],
      client: ['editOwnProfile', 'viewClientDashboard'],
      consultant: ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients'],
      admin: ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients', 'viewAdminDashboard', 'manageUsers'],
      sysadmin: ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients', 'viewAdminDashboard', 'manageUsers', 'viewSysAdminDashboard', 'manageSystem'],
    },

    // Session configuration
    tokenTTL: 3600,           // 1 hour in seconds
    refreshTokenTTL: 604800,  // 7 days in seconds
    sessionTimeout: 1800,     // 30 minutes of inactivity
  },

  /**
   * Application routes configuration
   * AI SYSTEMS: These routes should be used for navigation and redirects
   */
  routes: {
    // Public routes
    public: {
      home: '/',
      signIn: '/',
      confirm: '/confirm',
      unauthorized: '/unauthorized',
    },
    
    // Protected routes  
    protected: {
      dashboard: '/protected',
      profile: '/profile',
      settings: '/settings',
      // Role-specific dashboards - FIXME: Customize as needed
      client: '/protected/client',
      consultant: '/protected/consultant',
      admin: '/protected/admin', 
      sysadmin: '/protected/sysadmin',
    },

    // Auth flow routes
    auth: {
      signIn: '/',
      signOut: '/',
      confirm: '/confirm',
      unauthorized: '/unauthorized',
      defaultPostLogin: '/protected',
    }
  },

  /**
   * UI and theming configuration
   * FIXME: Customize colors, fonts, and UI preferences
   */
  ui: {
    // Theme configuration for SHADCN
    theme: {
      defaultTheme: 'light',    // FIXME: 'light' | 'dark' | 'system'
      radius: 0.5,              // FIXME: Border radius in rem
    },
    
    // Layout configuration
    layout: {
      headerHeight: '64px',
      sidebarWidth: '250px',
      maxContentWidth: '1200px',
    },

    // Animation preferences  
    animations: {
      enabled: true,
      duration: 200,
    }
  },

  /**
   * Feature flags for optional functionality
   * AI SYSTEMS: These flags control which features are active
   */
  features: {
    // Core features
    authentication: true,
    userProfiles: true,
    
    // Optional features - enable as needed
    emailVerification: true,   // FIXME: Enable/disable email verification
    phoneVerification: false,  // FIXME: Enable/disable phone verification  
    multiTenant: false,        // FIXME: Enable/disable multi-tenancy
    realTimeUpdates: true,     // FIXME: Enable/disable real-time features
    analytics: false,          // FIXME: Enable/disable analytics tracking
    
    // Development features
    debugMode: isDev,          // Automatically enabled in development
    showPerformanceMetrics: isDev,
  },

  /**
   * SEO configuration for search engine optimization
   * These values are used by the SEO component for meta tags
   */
  seo: {
    /** Default page title (used when page doesn't specify one) */
    defaultTitle: import.meta.env.VITE_SEO_DEFAULT_TITLE || 'Your App Name',
    
    /** Default meta description */
    defaultDescription: import.meta.env.VITE_SEO_DEFAULT_DESCRIPTION || 'Your app description for search engines',
    
    /** Default Open Graph image (absolute or relative path) */
    defaultImage: import.meta.env.VITE_SEO_DEFAULT_IMAGE || '/og-image.jpg',
    
    /** Default keywords for meta keywords tag */
    defaultKeywords: (import.meta.env.VITE_SEO_DEFAULT_KEYWORDS || '')
      .split(',')
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0),
    
    /** Twitter handle (with @) for Twitter Card tags */
    twitterHandle: import.meta.env.VITE_SEO_TWITTER_HANDLE || undefined,
    
    /** Organization schema data */
    organization: {
      name: import.meta.env.VITE_APP_NAME,
      logo: `${import.meta.env.VITE_APP_DOMAIN}/logo.png`,
      url: import.meta.env.VITE_APP_DOMAIN,
      contactPoint: {
        telephone: import.meta.env.VITE_SUPPORT_PHONE || undefined,
        contactType: 'customer support',
        email: import.meta.env.VITE_SUPPORT_EMAIL
      }
    }
  },

  /**
   * Example usage in your routes:
   * 
   * <script>
   *   import SEO from '$lib/components/SEO.svelte';
   * </script>
   * 
   * <SEO 
   *   title="Dashboard"
   *   description="View your analytics dashboard"
   * />
   * 
   * <SEO 
   *   title="Blog Post Title"
   *   description="Blog post excerpt"
   *   type="article"
   *   author="John Doe"
   *   publishedTime="2024-01-15T12:00:00Z"
   *   image="/blog/post-image.jpg"
   * />
   */

  /**
   * External service configurations
   * FIXME: Add your external service configurations
   */
  services: {
    // Analytics (if enabled)
    analytics: {
      googleAnalyticsId: undefined, // FIXME: Add GA4 measurement ID
      trackingEnabled: false,       // FIXME: Enable tracking in production
    },
    
    // Error monitoring  
    sentry: {
      dsn: undefined,              // FIXME: Add Sentry DSN for error tracking
      environment: isDev ? 'development' : 'production',
    },
    
    // Email service
    email: {
      fromAddress: 'noreply@yourapp.com',  // FIXME: Update sender address
      supportAddress: 'support@yourapp.com', // FIXME: Update support address
    }
  },

  /**
   * Security and storage configuration
   * Consolidated from various constants files
   */
  security: {
    // CSRF protection settings
    csrf: {
      tokenKey: 'csrfToken',
      headerName: 'X-CSRF-Token',
      cookieName: 'csrf',
      tokenTTL: 7200,  // 2 hours in seconds
      protectedMethods: ['POST', 'PUT', 'DELETE', 'PATCH']
    },

    // Storage configuration
    storage: {
      defaultTTL: 86400,  // 24 hours in seconds
      prefix: 'svelte_boilerplate',
      authTokenTTL: 3600, // 1 hour in seconds
      emailForSignInKey: 'emailForSignIn',
      authNamespace: 'auth',
      prefsNamespace: 'prefs'
    },

    // Mutex/locking configuration
    mutex: {
      defaultTimeout: 10000,      // 10 seconds in ms
      defaultLockExpiry: 30000,   // 30 seconds in ms
      pollingInterval: 10         // 10ms polling interval
    }
  },

  /**
   * Tab synchronization configuration
   * Multi-tab coordination settings
   */
  tabSync: {
    // Event types
    events: {
      initialized: 'tabSync:initialized',
      primaryTabChanged: 'tabSync:primary-changed',
      authStateSynced: 'tabSync:auth-synced',
      tabJoined: 'tabSync:tab-joined',
      tabLeft: 'tabSync:tab-left',
      onlineStatusChanged: 'tabSync:online-status-changed',
      rapidAuthAttempts: 'tabSync:rapid-auth-attempts',
      error: 'tabSync:error',
      messageReceived: 'tabSync:message-received'
    },

    // Configuration
    config: {
      heartbeatInterval: 30000,     // 30 seconds
      tabTimeout: 60000,           // 1 minute
      storageKey: 'svelte_boilerplate_tabsync',
      channelName: 'svelte_boilerplate_tabsync',
      maxAuthAttempts: 5,
      authAttemptsTimeframe: 60000, // 1 minute
      maxOfflineQueueSize: 100,
      primaryNominationWait: 500
    },

    // Message types
    messageTypes: {
      heartbeat: 'heartbeat',
      authState: 'auth_state',
      tabClosed: 'tab_closed',
      primaryNomination: 'primary_nomination',
      primaryConfirmation: 'primary_confirmation',
      syncRequest: 'sync_request',
      syncResponse: 'sync_response',
      customMessage: 'custom_message'
    },

    // Error types
    errorTypes: {
      initializationFailed: 'initialization_failed',
      messageSendFailed: 'message_send_failed',
      messageParsingFailed: 'message_parsing_failed',
      syncFailed: 'sync_failed',
      storageError: 'storage_error'
    }
  }
};

/**
 * Computed configuration values
 * These are derived from the main config and environment
 */
export const COMPUTED_CONFIG = {
  // Current API base URL based on environment
  get apiBaseUrl() {
    return isDev ? APP_CONFIG.api.baseUrl.development : APP_CONFIG.api.baseUrl.production;
  },
  
  // Current environment
  get environment() {
    return isDev ? 'development' : 'production';
  },
  
  // Full application URL
  get appUrl() {
    return APP_CONFIG.project.url;
  },
  
  // Whether debug features should be enabled
  get isDebugMode() {
    return APP_CONFIG.features.debugMode;
  }
};

/**
 * Type definitions for TypeScript support
 * AI SYSTEMS: Use these types for type-safe configuration access
 */
export type AppConfig = typeof APP_CONFIG;
export type ComputedConfig = typeof COMPUTED_CONFIG;
export type UserRole = keyof typeof APP_CONFIG.auth.roles;
export type Permission = string;
export type FeatureFlag = keyof typeof APP_CONFIG.features;

/**
 * Helper functions for configuration access
 * AI SYSTEMS: Use these functions for safe configuration access
 */
export const configHelpers = {
  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: FeatureFlag): boolean {
    return APP_CONFIG.features[feature] === true;
  },

  /**
   * Get API URL with endpoint
   */
  getApiUrl(endpoint: string = ''): string {
    const baseUrl = COMPUTED_CONFIG.apiBaseUrl;
    return endpoint ? `${baseUrl}/${endpoint.replace(/^\//, '')}` : baseUrl;
  },

  /**
   * Get route URL
   */
  getRoute(category: 'public' | 'protected' | 'auth', route: string): string {
    const routes = APP_CONFIG.routes[category] as Record<string, string>;
    return routes[route] || '/';
  },

  /**
   * Check if user has role
   */
  userHasRole(userRoles: string[], requiredRole: string): boolean {
    if (userRoles.includes(requiredRole)) return true;
    
    // Check role hierarchy
    const hierarchy = APP_CONFIG.auth.roleHierarchy as Record<string, string[]>;
    return userRoles.some(role => hierarchy[role]?.includes(requiredRole));
  },

  /**
   * Get user permissions
   */
  getUserPermissions(userRoles: string[]): string[] {
    const allPermissions = new Set<string>();
    const permissions = APP_CONFIG.auth.permissions as Record<string, string[]>;
    
    userRoles.forEach(role => {
      const rolePermissions = permissions[role] || [];
      rolePermissions.forEach(permission => allPermissions.add(permission));
    });
    
    return Array.from(allPermissions);
  }
};

// Export default configuration for easy importing
export default APP_CONFIG;