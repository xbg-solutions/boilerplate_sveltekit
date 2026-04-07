---
name: bpsk-config
description: Configuration system — what lives where and how to extend it
---

# BPSK — Configuration

**Skill: `bpsk/config`**

How the configuration system works, what lives where, and how to extend it.

---

## The Single Source of Truth

**`src/lib/config/app.config.ts`** is the primary configuration object for the app.
Everything reads from it — services, stores, utils, routes.

There are no `FIXME` placeholders. All project-specific values come from `.env`.

```bash
# Find the wizard-editable structural blocks
grep -n "SETUP:start" src/lib/config/app.config.ts
```

---

## What Lives Where

| Value type | Location | Written by |
|------------|----------|------------|
| App name, domain, support email | `.env` → `VITE_APP_*` | `npx @xbg.solutions/bpsk setup` |
| Firebase keys + IDs | `.env` → `VITE_FIREBASE_*` | `npx @xbg.solutions/bpsk setup` |
| API base URLs | `.env` → `VITE_API_BASE_URL_*` | `npx @xbg.solutions/bpsk setup` |
| GA4 / analytics IDs | `.env` → `VITE_GA_*` | `npx @xbg.solutions/bpsk setup` |
| Auth roles, hierarchy, permissions | `app.config.ts` auth block | `npx @xbg.solutions/bpsk setup` or manual |
| JWT claim boolean map | `app.config.ts` auth.claimMap | `npx @xbg.solutions/bpsk setup` or manual |
| Feature on/off flags | `app.config.ts` features block | `npx @xbg.solutions/bpsk setup` or manual |
| Routes, UI, security internals | `app.config.ts` (structural) | Manual only |
| localStorage/tabSync prefix | derived from `VITE_APP_SHORT_NAME` | automatic |

---

## `APP_CONFIG` Structure

```typescript
import { APP_CONFIG, COMPUTED_CONFIG, configHelpers } from '$lib/config/app.config';

APP_CONFIG = {
  project:  { name, shortName, description, version, domain, supportEmail, url },
  firebase: { projectId, apiKey, authDomain, storageBucket, messagingSenderId, appId, measurementId },
  api:      { baseUrl: { development, production }, timeout, retryCount, retryDelay, credentials, headers },
  auth: {
    roles, roleHierarchy, permissions,
    claimMap,        // ← role value → boolean JWT claim key
    tokenTTL, refreshTokenTTL, sessionTimeout
  },
  routes:   { public, protected, auth },
  ui:       { theme, layout, animations },
  features: { authentication, userProfiles, emailVerification, phoneVerification,
              multiTenant, realTimeUpdates, analytics, debugMode, showPerformanceMetrics },
  seo:      { defaultTitle, defaultDescription, defaultImage, defaultKeywords, twitterHandle, organization },
  services: { analytics, sentry, email },
  security: { csrf, storage, mutex },
  tabSync:  { events, config, messageTypes, errorTypes }
}
```

---

## Project Identity

All values come from `.env`:

```typescript
// app.config.ts (read-only reference — don't hardcode here)
project: {
  name:         import.meta.env.VITE_APP_NAME,
  shortName:    import.meta.env.VITE_APP_SHORT_NAME,
  description:  import.meta.env.VITE_APP_DESCRIPTION,
  domain:       import.meta.env.VITE_APP_DOMAIN,
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL,
  url:          isProd ? `https://${domain}` : 'http://localhost:5173',
},
```

In `.env`:
```bash
VITE_APP_NAME="Acme Dashboard"
VITE_APP_SHORT_NAME="acme"
VITE_APP_DOMAIN="acme.com"
```

---

## Firebase Configuration

All 6 required fields come from `.env`. `APP_CONFIG.firebase` is the **single object**
passed to `initializationService` — no duplicate inline config elsewhere.

```typescript
// app.config.ts (reference)
firebase: {
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // optional
},
```

In `+layout.ts`:
```typescript
import { APP_CONFIG } from '$lib/config/app.config';
await initializationService.initialize({ firebaseConfig: APP_CONFIG.firebase });
```

---

## API Configuration

```typescript
// app.config.ts (reference)
api: {
  baseUrl: {
    development: import.meta.env.VITE_API_BASE_URL_DEV,
    production:  import.meta.env.VITE_API_BASE_URL_PROD,
  },
  timeout:    Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  retryCount: Number(import.meta.env.VITE_API_RETRY_COUNT) || 2,
  retryDelay: Number(import.meta.env.VITE_API_RETRY_DELAY) || 1000,
  credentials: 'include',
},
```

Access the current environment's URL:
```typescript
import { COMPUTED_CONFIG, configHelpers } from '$lib/config/app.config';

const base     = COMPUTED_CONFIG.apiBaseUrl;
const usersUrl = configHelpers.getApiUrl('users');  // → base + '/users'
```

---

## Roles & RBAC

These live in `app.config.ts` as structural TypeScript (not env vars).
`npm run setup` writes them; you can also edit them manually.

### The SETUP block markers

```typescript
auth: {
  /* SETUP:start:roles */
  roles: {
    USER:       'user',
    CLIENT:     'client',
    CONSULTANT: 'consultant',
    ADMIN:      'admin',
    SYS_ADMIN:  'sysadmin',
  },
  roleHierarchy: {
    sysadmin:   ['admin', 'consultant', 'client', 'user'],
    admin:      ['consultant', 'client', 'user'],
    consultant: ['client', 'user'],
    client:     ['user'],
  },
  permissions: {
    user:       ['editOwnProfile'],
    client:     ['editOwnProfile', 'viewClientDashboard'],
    // ... etc.
  },
  // Maps role value → boolean JWT claim key set by Firebase custom claims
  claimMap: {
    client:     'isClient',
    consultant: 'isConsultant',
    admin:      'isAdmin',
    sysadmin:   'isSysAdmin',
  },
  /* SETUP:end:roles */
  tokenTTL: 3600,
```

### `claimMap` explained

Your Firebase backend can set custom claims two ways:
- **Roles array**: `{ roles: ['admin', 'user'] }`
- **Boolean flags**: `{ isAdmin: true, isClient: false, ... }`

`claimMap` bridges them — the RBAC utilities check both. Only include roles that
have boolean flags in your backend's token-minting logic.

### Checking roles in code

```typescript
import { configHelpers } from '$lib/config/app.config';
import { APP_CONFIG } from '$lib/config/app.config';

// Role check (respects hierarchy)
configHelpers.userHasRole(['admin'], 'consultant');  // → true

// Permissions for a role set
configHelpers.getUserPermissions(['client']); // → ['editOwnProfile', 'viewClientDashboard']

// Use role constants — never hardcode strings
if (user.role === APP_CONFIG.auth.roles.ADMIN) { ... }
```

---

## Feature Flags

Structural on/off switches in `app.config.ts`, written by the wizard:

```typescript
features: {
  /* SETUP:start:features */
  authentication:    true,
  userProfiles:      true,
  emailVerification: true,
  phoneVerification: false,   // set true → shows phone auth UI
  multiTenant:       false,
  realTimeUpdates:   true,
  analytics:         false,   // set true + add VITE_GA_MEASUREMENT_ID
  /* SETUP:end:features */
  debugMode:              isDev,  // auto — don't edit
  showPerformanceMetrics: isDev,  // auto
},
```

Checking a feature flag:
```typescript
import { configHelpers } from '$lib/config/app.config';

if (configHelpers.isFeatureEnabled('phoneVerification')) {
  // Show phone auth option
}
```

---

## Storage Prefix (Anti-Collision)

`VITE_APP_SHORT_NAME` is converted to a slug and used as the localStorage /
tabSync key prefix:

```
VITE_APP_SHORT_NAME="acme"  →  prefix: "acme"
  → localStorage key: "acme_auth", "acme_tabsync", ...

VITE_APP_SHORT_NAME="MySaaS"  →  prefix: "mysaas"
  → localStorage key: "mysaas_auth", ...
```

This prevents collisions when multiple projects run on the same localhost.

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
    client:    '/protected/client',
    admin:     '/protected/admin',
    // Add your protected routes here
  },
  auth: {
    signIn: '/',
    signOut: '/',
    defaultPostLogin: '/protected',
  },
},
```

Get a route in code:
```typescript
configHelpers.getRoute('protected', 'dashboard');   // → '/protected'
configHelpers.getRoute('auth', 'defaultPostLogin'); // → '/protected'
```

---

## SEO Configuration

Values come from `.env`, with fallback to app name/description:

```typescript
seo: {
  defaultTitle:       import.meta.env.VITE_SEO_DEFAULT_TITLE || VITE_APP_NAME,
  defaultDescription: import.meta.env.VITE_SEO_DEFAULT_DESCRIPTION || VITE_APP_DESCRIPTION,
  defaultImage:       import.meta.env.VITE_SEO_DEFAULT_IMAGE || '/og-image.jpg',
  defaultKeywords:    (VITE_SEO_DEFAULT_KEYWORDS || '').split(',').map(k => k.trim()),
  twitterHandle:      import.meta.env.VITE_SEO_TWITTER_HANDLE,
  organization:       { name, logo, url, contactPoint: { email } },
},
```

Using the SEO component in a route:
```svelte
<script lang="ts">
  import Seo from '$lib/components/layout/Seo.svelte';
</script>

<Seo title="Dashboard" description="Your analytics." />
```

---

## `COMPUTED_CONFIG` — Derived Values

```typescript
import { COMPUTED_CONFIG } from '$lib/config/app.config';

COMPUTED_CONFIG.apiBaseUrl    // dev or prod URL based on hostname
COMPUTED_CONFIG.environment   // 'development' | 'production'
COMPUTED_CONFIG.appUrl        // full app URL
COMPUTED_CONFIG.isDebugMode   // true in dev
```

---

## Common Config Mistakes

```typescript
// ❌ Hardcoding role strings
if (user.role === 'admin') { ... }

// ✅ Use constants
import { APP_CONFIG } from '$lib/config/app.config';
if (user.role === APP_CONFIG.auth.roles.ADMIN) { ... }

// ❌ Checking features ad-hoc
if (APP_CONFIG.features.phoneVerification) { ... }

// ✅ Use the helper (handles undefined safely)
import { configHelpers } from '$lib/config/app.config';
if (configHelpers.isFeatureEnabled('phoneVerification')) { ... }

// ❌ Creating inline firebaseConfig objects
const firebaseConfig = { apiKey: import.meta.env.VITE_FIREBASE_API_KEY, ... };

// ✅ Use APP_CONFIG.firebase
import { APP_CONFIG } from '$lib/config/app.config';
await initializationService.initialize({ firebaseConfig: APP_CONFIG.firebase });
```
