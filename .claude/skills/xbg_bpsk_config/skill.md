# XBG Boilerplate SvelteKit — Configuration

**Skill: `xbg_bpsk_config`**

How to read, extend, and customise the boilerplate's configuration system.

---

## The Single Source of Truth

**`src/lib/config/app.config.ts`** is the only file you need to edit when customising a project. Everything else reads from it.

Search for `FIXME` to find every customisation point:

```bash
grep -r "FIXME" src/lib/config/
```

---

## `APP_CONFIG` Structure

```typescript
import { APP_CONFIG, COMPUTED_CONFIG, configHelpers } from '$lib/config/app.config';

APP_CONFIG = {
  project: { name, shortName, description, version, domain, url },
  api: { baseUrl: { development, production }, timeout, retryCount, retryDelay, credentials, headers },
  firebase: { projectId, apiKey, authDomain, storageBucket, messagingSenderId, appId },
  auth: { roles, roleHierarchy, permissions, tokenTTL, refreshTokenTTL, sessionTimeout },
  routes: { public, protected, auth },
  ui: { theme, layout, animations },
  features: { authentication, userProfiles, emailVerification, phoneVerification, multiTenant, realTimeUpdates, analytics, debugMode, showPerformanceMetrics },
  seo: { defaultTitle, defaultDescription, defaultImage, defaultKeywords, twitterHandle, organization },
  services: { analytics, sentry, email },
  security: { csrf, storage, mutex },
  tabSync: { events, config, messageTypes, errorTypes }
}
```

---

## Project Identity

```typescript
// src/lib/config/app.config.ts
project: {
  name: 'Acme Dashboard',        // FIXME: shown in UI, SEO title
  shortName: 'Acme',             // FIXME: short form for icons
  description: 'Manage your...',  // FIXME: meta description
  version: '1.0.0',
  domain: 'acme.com',            // FIXME: used for canonical URLs
  url: isProd ? 'https://acme.com' : 'http://localhost:5173',
},
```

---

## Firebase Configuration

Values come from `.env`; `app.config.ts` references them:

```typescript
firebase: {
  projectId: 'acme-prod',                       // FIXME
  apiKey: 'AIzaSy...',                           // FIXME — from Firebase console
  authDomain: 'acme-prod.firebaseapp.com',      // FIXME
  storageBucket: 'acme-prod.appspot.com',       // FIXME
  messagingSenderId: '123456789',               // FIXME
  appId: '1:123456789:web:abc123',              // FIXME
},
```

In `.env`:
```bash
VITE_FIREBASE_PROJECT_ID=acme-prod
VITE_FIREBASE_API_KEY=AIzaSy...
```

---

## API Configuration

```typescript
api: {
  baseUrl: {
    development: 'http://localhost:5001/acme-prod/us-central1/api',  // FIXME
    production: 'https://us-central1-acme-prod.cloudfunctions.net/api',// FIXME
  },
  timeout: 30000,       // 30 seconds
  retryCount: 2,        // Retry failed requests 2 times
  retryDelay: 1000,     // 1 second base delay (exponential backoff applied)
  credentials: 'include',  // Sends cookies cross-origin
},
```

Access the current environment's URL:

```typescript
import { COMPUTED_CONFIG, configHelpers } from '$lib/config/app.config';

const baseUrl = COMPUTED_CONFIG.apiBaseUrl;
const usersUrl = configHelpers.getApiUrl('users');  // → baseUrl + '/users'
```

---

## Roles and RBAC

### Defining Roles

```typescript
auth: {
  roles: {
    USER: 'user',
    CLIENT: 'client',         // FIXME: add/remove roles
    CONSULTANT: 'consultant', // FIXME
    ADMIN: 'admin',           // FIXME
    SYS_ADMIN: 'sysadmin',    // FIXME
  },
```

### Role Hierarchy (Inheritance)

Higher roles automatically possess all permissions of the roles they include:

```typescript
  roleHierarchy: {
    sysadmin: ['admin', 'consultant', 'client', 'user'],
    admin:    ['consultant', 'client', 'user'],
    consultant: ['client', 'user'],
    client:   ['user'],
  },
```

### Permissions Matrix

```typescript
  permissions: {
    user:       ['editOwnProfile'],
    client:     ['editOwnProfile', 'viewClientDashboard'],
    consultant: ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients'],
    admin:      ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients', 'viewAdminDashboard', 'manageUsers'],
    sysadmin:   ['editOwnProfile', /* ... all admin... */ 'viewSysAdminDashboard', 'manageSystem'],
  },
```

### Checking Roles and Permissions in Code

```typescript
import { configHelpers } from '$lib/config/app.config';

// Check if a user has a specific role (respects hierarchy)
configHelpers.userHasRole(['admin'], 'consultant');  // → true (admin inherits consultant)

// Get all permissions for a user's roles
configHelpers.getUserPermissions(['client']);  // → ['editOwnProfile', 'viewClientDashboard']
```

---

## Routes Configuration

```typescript
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
    // FIXME: Add your protected routes here
    client:     '/protected/client',
    consultant: '/protected/consultant',
    admin:      '/protected/admin',
    sysadmin:   '/protected/sysadmin',
  },
  auth: {
    signIn: '/',
    signOut: '/',
    confirm: '/confirm',
    unauthorized: '/unauthorized',
    defaultPostLogin: '/protected',  // Where to go after sign in
  }
},
```

Get a route in code:

```typescript
import { configHelpers } from '$lib/config/app.config';

configHelpers.getRoute('protected', 'dashboard');   // → '/protected'
configHelpers.getRoute('auth', 'defaultPostLogin'); // → '/protected'
```

---

## Feature Flags

```typescript
features: {
  authentication: true,
  userProfiles: true,
  emailVerification: true,
  phoneVerification: false,  // FIXME: set true to enable phone auth UI
  multiTenant: false,        // FIXME: enable for multi-tenant apps
  realTimeUpdates: true,
  analytics: false,          // FIXME: enable + add GA4 ID
  debugMode: isDev,          // auto
  showPerformanceMetrics: isDev, // auto
},
```

Checking a feature flag:

```typescript
import { configHelpers } from '$lib/config/app.config';

if (configHelpers.isFeatureEnabled('phoneVerification')) {
  // Show phone auth option
}
```

Anti-example — don't check features ad-hoc:
```typescript
// ❌ Don't hardcode feature checks
if (true) { showPhoneAuth(); }

// ✅ Always use the flag
if (configHelpers.isFeatureEnabled('phoneVerification')) { showPhoneAuth(); }
```

---

## UI Configuration

```typescript
ui: {
  theme: {
    defaultTheme: 'light',  // FIXME: 'light' | 'dark' | 'system'
    radius: 0.5,            // FIXME: border radius in rem
  },
  layout: {
    headerHeight: '64px',
    sidebarWidth: '250px',
    maxContentWidth: '1200px',
  },
  animations: {
    enabled: true,
    duration: 200,  // ms
  }
},
```

---

## SEO Configuration

```typescript
seo: {
  defaultTitle: import.meta.env.VITE_SEO_DEFAULT_TITLE || 'Acme',
  defaultDescription: import.meta.env.VITE_SEO_DEFAULT_DESCRIPTION || '...',
  defaultImage: '/og-image.jpg',
  defaultKeywords: ['acme', 'dashboard'],
  twitterHandle: '@acme',
  organization: {
    name: import.meta.env.VITE_APP_NAME,
    logo: `${import.meta.env.VITE_APP_DOMAIN}/logo.png`,
    url: import.meta.env.VITE_APP_DOMAIN,
    contactPoint: { email: import.meta.env.VITE_SUPPORT_EMAIL, contactType: 'customer support' }
  }
},
```

Using SEO component in a route:

```svelte
<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import Seo from '$lib/components/layout/Seo.svelte';
</script>

<Seo
  title="About Us"
  description="Learn about Acme."
  type="website"
/>
```

---

## Security Configuration

Security is in `src/lib/config/security.ts` — not usually modified for typical projects.

```typescript
import { getSecurityConfig, validateFileUpload } from '$lib/config/security';

const config = getSecurityConfig(); // auto dev/prod

// Validate a file before upload
const { valid, errors } = validateFileUpload(file, config.validation);
if (!valid) {
  toastService.error(errors.join(', '));
}
```

---

## Routes Config (`routes.config.ts`)

A separate file for detailed route metadata (titles, layouts, SEO, access control). Used for navigation generation.

```typescript
import { RouteHelper } from '$lib/config/routes.config';

// Get navigation items for a user's roles
const navItems = RouteHelper.getNavigationRoutes(['admin'], ['manageUsers']);

// Generate a URL with dynamic params
const url = RouteHelper.generateUrl('user-detail', { id: '123' });
// → '/users/123'

// Check access
const canAccess = RouteHelper.hasAccess('/settings', ['admin'], ['settings:read']);

// Get SEO metadata for a page
const meta = RouteHelper.getRouteMeta('/dashboard');

// Generate breadcrumbs
const crumbs = RouteHelper.getBreadcrumbs('/users/123/edit');
// → [{ label: 'Home', href: '/' }, { label: 'Users', href: '/users' }, { label: '123', href: '/users/123' }, { label: 'Edit' }]
```

---

## `COMPUTED_CONFIG` — Derived Values

```typescript
import { COMPUTED_CONFIG } from '$lib/config/app.config';

COMPUTED_CONFIG.apiBaseUrl    // Dev or prod URL based on hostname
COMPUTED_CONFIG.environment   // 'development' | 'production'
COMPUTED_CONFIG.appUrl        // Full app URL
COMPUTED_CONFIG.isDebugMode   // Whether debug features are enabled
```

---

## Environment Detection

The config auto-detects environment using `window.location.hostname`:

```typescript
// In app.config.ts — this is already done; just understand it
const isDev = typeof window !== 'undefined'
  ? window.location.hostname === 'localhost'
  : process.env.NODE_ENV === 'development';
```

You don't need to replicate this — use `COMPUTED_CONFIG.environment` or `import { browser } from '$app/environment'`.

---

## Common Config Mistakes

```typescript
// ❌ Accessing config before it's imported
const name = APP_CONFIG.project.name; // in a non-module context

// ✅ Import and access inside a component or function
import { APP_CONFIG } from '$lib/config/app.config';
const name = APP_CONFIG.project.name;

// ❌ Hardcoding role strings
if (user.role === 'admin') { ... }

// ✅ Use the constants
import { APP_CONFIG } from '$lib/config/app.config';
if (user.role === APP_CONFIG.auth.roles.ADMIN) { ... }

// ❌ Checking features without the helper
if (APP_CONFIG.features.phoneVerification) { ... }

// ✅ Use the helper (safer, handles undefined)
import { configHelpers } from '$lib/config/app.config';
if (configHelpers.isFeatureEnabled('phoneVerification')) { ... }
```
