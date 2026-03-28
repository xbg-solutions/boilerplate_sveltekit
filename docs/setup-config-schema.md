# Setup Config Schema — `setup-config.json`

Reference for the non-interactive setup mode: `node __scripts__/setup.cjs --config setup-config.json`

This file is the platform-provided input that replaces the interactive setup wizard when an autonomous agent configures the project.

---

## Full Schema

```jsonc
{
  // ── Required: Project Identity ──────────────────────────────────────────────
  "app": {
    "name": "string",            // Display name (e.g. "Acme Dashboard")
    "shortName": "string",       // localStorage prefix, max 12 chars (e.g. "acme")
    "description": "string",     // SEO description
    "domain": "string",          // Production domain (e.g. "acme.com")
    "supportEmail": "string"     // Support contact email
  },

  // ── Required: Firebase Configuration ────────────────────────────────────────
  "firebase": {
    "projectId": "string",           // Firebase project ID
    "apiKey": "string",              // Firebase Web API key
    "authDomain": "string",          // e.g. "project-id.firebaseapp.com"
    "storageBucket": "string",       // e.g. "project-id.appspot.com"
    "messagingSenderId": "string",   // Firebase messaging sender ID
    "appId": "string",               // Firebase web app ID
    "measurementId": "string|null",  // Optional — Google Analytics measurement ID (e.g. "G-XXXXXXXXXX")
    "region": "string|null"          // Optional — Firebase region (default: "us-central1")
  },

  // ── Required: API / Backend URLs ────────────────────────────────────────────
  "api": {
    "hasCustomBackend": "boolean",   // Informational — true if using a backend other than Firebase Functions
    "devUrl": "string",              // Development API base URL
    "prodUrl": "string"              // Production API base URL
  },

  // ── Required: RBAC Configuration ────────────────────────────────────────────
  // Option A: Use default role set
  "rbac": {
    "useDefaults": true
    // Produces: user, client, consultant, admin, sysadmin
    // with full hierarchy, permissions, and JWT claim mapping
  },
  // Option B: Custom roles
  "rbac": {
    "useDefaults": false,
    "roles": [
      {
        "key": "string",          // Constant name (e.g. "ADMIN") — used as APP_CONFIG.auth.roles.ADMIN
        "value": "string",        // Role string value (e.g. "admin") — stored in JWT claims
        "claimKey": "string",     // Optional — boolean JWT claim key (e.g. "isAdmin")
        "inherits": ["string"],   // Optional — role values this role inherits from
        "permissions": ["string"] // Required — permission strings granted to this role
      }
    ]
  },

  // ── Required: Feature Flags ─────────────────────────────────────────────────
  "features": {
    "emailVerification": "boolean",  // Enable email verification flow
    "phoneVerification": "boolean",  // Enable phone/SMS authentication
    "multiTenant": "boolean",        // Enable multi-tenant support
    "realTimeUpdates": "boolean",    // Enable Firestore real-time listeners
    "analytics": "boolean",          // Enable Google Analytics
    "gaId": "string|null"            // Optional — GA Measurement ID (only if analytics: true)
  },

  // ── Optional: Custom JWT Attributes ─────────────────────────────────────────
  "customAttributes": [
    {
      "claimKey": "string",      // JWT claim key (e.g. "tenantId")
      "description": "string"    // Human-readable description
    }
  ]
}
```

---

## Validation Rules

The wizard validates on load and fails fast with clear error messages:

| Field | Rule |
|-------|------|
| `app.name` | Required, non-empty string |
| `app.shortName` | Required, non-empty string |
| `app.description` | Required, non-empty string |
| `app.domain` | Required, non-empty string |
| `app.supportEmail` | Required, non-empty string |
| `firebase.projectId` | Required, non-empty string |
| `firebase.apiKey` | Required, non-empty string |
| `firebase.authDomain` | Required, non-empty string |
| `firebase.storageBucket` | Required, non-empty string |
| `firebase.messagingSenderId` | Required, non-empty string |
| `firebase.appId` | Required, non-empty string |
| `firebase.measurementId` | Optional (defaults to `""`) |
| `firebase.region` | Optional (defaults to `"us-central1"`) |
| `api.devUrl` | Required, non-empty string |
| `api.prodUrl` | Required, non-empty string |
| `api.hasCustomBackend` | Informational only, not validated |
| `rbac.useDefaults` | If `true`, ignores `rbac.roles`. If `false`, `rbac.roles` must be a non-empty array |
| `rbac.roles[].key` | Required when custom roles |
| `rbac.roles[].value` | Required when custom roles |
| `rbac.roles[].claimKey` | Optional (empty string = no boolean claim) |
| `rbac.roles[].inherits` | Optional (defaults to `[]`) |
| `rbac.roles[].permissions` | Required when custom roles |
| `features.emailVerification` | Required, must be boolean |
| `features.phoneVerification` | Required, must be boolean |
| `features.multiTenant` | Required, must be boolean |
| `features.realTimeUpdates` | Required, must be boolean |
| `features.analytics` | Required, must be boolean |
| `features.gaId` | Optional, only used if `analytics: true` |
| `customAttributes` | Optional, defaults to `[]` |

---

## What the Wizard Writes

When the config is valid, the wizard writes these files:

| File | What it contains |
|------|-----------------|
| `.env` | All `VITE_*` environment variables (app identity, Firebase config, API URLs, auth settings, SEO defaults, feature flag IDs) |
| `.env.example` | Same as `.env` but with secrets blanked for safe sharing |
| `src/lib/config/app.config.ts` | Updates `SETUP:start:roles` and `SETUP:end:roles` blocks with RBAC config; updates `SETUP:start:features` and `SETUP:end:features` blocks with feature flags |
| `firebase.json` | Updates hosting target alias and region |
| `.firebaserc` | Updates default project ID and hosting target aliases |

---

## Default Roles (when `useDefaults: true`)

```json
{
  "roles": [
    { "key": "USER",       "value": "user" },
    { "key": "CLIENT",     "value": "client" },
    { "key": "CONSULTANT", "value": "consultant" },
    { "key": "ADMIN",      "value": "admin" },
    { "key": "SYS_ADMIN",  "value": "sysadmin" }
  ],
  "roleHierarchy": {
    "sysadmin":   ["admin", "consultant", "client", "user"],
    "admin":      ["consultant", "client", "user"],
    "consultant": ["client", "user"],
    "client":     ["user"]
  },
  "permissions": {
    "user":       ["editOwnProfile"],
    "client":     ["editOwnProfile", "viewClientDashboard"],
    "consultant": ["editOwnProfile", "viewClientDashboard", "viewConsultantDashboard", "viewClients"],
    "admin":      ["editOwnProfile", "viewClientDashboard", "viewConsultantDashboard", "viewClients", "viewAdminDashboard", "manageUsers"],
    "sysadmin":   ["editOwnProfile", "viewClientDashboard", "viewConsultantDashboard", "viewClients", "viewAdminDashboard", "manageUsers", "viewSysAdminDashboard", "manageSystem"]
  },
  "claimMap": {
    "client":     "isClient",
    "consultant": "isConsultant",
    "admin":      "isAdmin",
    "sysadmin":   "isSysAdmin"
  }
}
```

---

## Example: Minimal Config (defaults)

```json
{
  "app": {
    "name": "Acme Dashboard",
    "shortName": "acme",
    "description": "Client management platform for Acme Corp",
    "domain": "app.acme.com",
    "supportEmail": "support@acme.com"
  },
  "firebase": {
    "projectId": "acme-prod",
    "apiKey": "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "authDomain": "acme-prod.firebaseapp.com",
    "storageBucket": "acme-prod.appspot.com",
    "messagingSenderId": "123456789012",
    "appId": "1:123456789012:web:abcdef123456"
  },
  "api": {
    "hasCustomBackend": true,
    "devUrl": "http://localhost:5001/acme-prod/us-central1/api",
    "prodUrl": "https://us-central1-acme-prod.cloudfunctions.net/api"
  },
  "rbac": {
    "useDefaults": true
  },
  "features": {
    "emailVerification": true,
    "phoneVerification": false,
    "multiTenant": false,
    "realTimeUpdates": true,
    "analytics": false
  }
}
```

---

## Example: Custom Roles + Analytics + Custom Attributes

```json
{
  "app": {
    "name": "TenantHub",
    "shortName": "thub",
    "description": "Multi-tenant property management",
    "domain": "tenanthub.io",
    "supportEmail": "help@tenanthub.io"
  },
  "firebase": {
    "projectId": "tenanthub-prod",
    "apiKey": "AIzaSy...",
    "authDomain": "tenanthub-prod.firebaseapp.com",
    "storageBucket": "tenanthub-prod.appspot.com",
    "messagingSenderId": "987654321098",
    "appId": "1:987654321098:web:fedcba654321",
    "measurementId": "G-ABC123DEF4",
    "region": "europe-west1"
  },
  "api": {
    "hasCustomBackend": true,
    "devUrl": "http://localhost:8080/api",
    "prodUrl": "https://api.tenanthub.io"
  },
  "rbac": {
    "useDefaults": false,
    "roles": [
      { "key": "TENANT", "value": "tenant", "claimKey": "", "inherits": [], "permissions": ["editOwnProfile", "viewOwnProperties", "submitMaintenanceRequest"] },
      { "key": "LANDLORD", "value": "landlord", "claimKey": "isLandlord", "inherits": ["tenant"], "permissions": ["editOwnProfile", "viewOwnProperties", "submitMaintenanceRequest", "manageProperties", "viewTenants"] },
      { "key": "ADMIN", "value": "admin", "claimKey": "isAdmin", "inherits": ["landlord"], "permissions": ["editOwnProfile", "viewOwnProperties", "submitMaintenanceRequest", "manageProperties", "viewTenants", "manageUsers", "viewAnalytics"] }
    ]
  },
  "features": {
    "emailVerification": true,
    "phoneVerification": true,
    "multiTenant": true,
    "realTimeUpdates": true,
    "analytics": true,
    "gaId": "G-ABC123DEF4"
  },
  "customAttributes": [
    { "claimKey": "tenantId", "description": "Tenant organization identifier for data isolation" },
    { "claimKey": "propertyIds", "description": "Array of property IDs the user has access to" }
  ]
}
```
