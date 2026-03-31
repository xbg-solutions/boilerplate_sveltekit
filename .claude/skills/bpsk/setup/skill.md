# BPSK — Setup & Development Workflow

**Skill: `bpsk/setup`**

Bootstrap, configure, validate, and run a project built on this boilerplate.

---

## Prerequisites

- Node.js 18+
- A Firebase project ([console.firebase.google.com](https://console.firebase.google.com))

---

## Quick Start (Agent / CI)

```bash
# 1. Install core framework
npm install @xbg.solutions/bpsk-core

# 2. Configure project (non-interactive)
npx @xbg.solutions/bpsk setup --config setup-config.json

# 3. Add components from registry
npx @xbg.solutions/bpsk add block-auth block-dashboard block-sidebar

# 4. Validate and run
npx @xbg.solutions/bpsk validate
npm run dev
```

### Interactive (human developer)

```bash
npm install @xbg.solutions/bpsk-core
npx @xbg.solutions/bpsk setup          # Interactive wizard
npx @xbg.solutions/bpsk validate
npm run dev                      # http://localhost:5173
```

### Developing on the boilerplate repo itself

```bash
git clone <repo-url> my-app
cd my-app
npm install
npm run setup
npm run dev
```

---

## What the Setup Wizard Does

| Step | What |
|------|------|
| 1 | **Project identity** — name, shortName, description, domain, support email |
| 2 | **Firebase** — project ID, API key, auth domain, etc.; updates `firebase.json` + `.firebaserc` |
| 3 | **API / Backend** — dev + prod base URLs |
| 4 | **RBAC** — roles, hierarchy, permissions, JWT claim map |
| 5 | **Feature flags** — phone auth, analytics, real-time, etc. |
| 6 | **Generate & validate** — writes `.env`, `.env.example`, generates `app.config.ts` |

---

## Setup Config Schema (Non-Interactive)

```json
{
  "app": {
    "name": "Acme Dashboard",
    "shortName": "acme",
    "description": "Project management platform",
    "domain": "acme.com",
    "supportEmail": "support@acme.com"
  },
  "firebase": {
    "projectId": "acme-prod",
    "apiKey": "AIza...",
    "authDomain": "acme-prod.firebaseapp.com",
    "storageBucket": "acme-prod.appspot.com",
    "messagingSenderId": "123456789",
    "appId": "1:123456789:web:abc123",
    "measurementId": "G-XXXXXXXXXX",
    "region": "us-central1"
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

**Required:** All `app.*`, all `firebase.*` (except `measurementId`/`region`), `api.devUrl`, `api.prodUrl`, all `features.*`.

**Custom RBAC** (`rbac.useDefaults: false`):
```json
{
  "rbac": {
    "useDefaults": false,
    "roles": [
      { "key": "USER", "value": "user", "claimKey": "", "inherits": [], "permissions": ["editOwnProfile"] },
      { "key": "ADMIN", "value": "admin", "claimKey": "isAdmin", "inherits": ["user"], "permissions": ["editOwnProfile", "manageUsers"] }
    ]
  }
}
```

See [setup-config-schema.md](docs/setup-config-schema.md) for the full schema with validation rules and examples.

---

## Two-Part Configuration Model

| Location | Contains | Written By |
|----------|----------|-----------|
| `.env` | Secrets, IDs (Firebase keys, API URLs, app name) | `npx @xbg.solutions/bpsk setup` |
| `app.config.ts` | Structural config (roles, permissions, features) | `npx @xbg.solutions/bpsk setup` or manual edit |

The wizard writes both. After setup, neither contains placeholder strings.

---

## Key Environment Variables

```bash
VITE_APP_NAME="Acme Dashboard"
VITE_APP_SHORT_NAME="acme"         # drives localStorage prefix
VITE_FIREBASE_PROJECT_ID="acme-prod"
VITE_FIREBASE_API_KEY="AIza..."
VITE_FIREBASE_AUTH_DOMAIN="acme-prod.firebaseapp.com"
VITE_FIREBASE_STORAGE_BUCKET="acme-prod.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123"
VITE_API_BASE_URL_DEV="http://localhost:5001/acme-prod/us-central1/api"
VITE_API_BASE_URL_PROD="https://us-central1-acme-prod.cloudfunctions.net/api"
```

---

## App Initialization Flow

```
Browser load
  → +layout.svelte mounts
  → initializationService.initialize({ firebaseConfig: APP_CONFIG.firebase })
      1. initializeApp(firebaseConfig)    — Firebase SDK
      2. authService.initialize()         — auth state listener
      3. tabSyncService.initialize()      — cross-tab coordination
      4. Publishes 'app:initialized'
  → initializationStore.isInitialized = true
  → UI renders
```

---

## Firebase Auth Setup

In Firebase Console → Authentication → Sign-in methods, enable:
- **Email/Link (passwordless)** — primary auth method
- **Phone** — only if `features.phoneVerification = true`

### Emulators

```bash
firebase emulators:start --only auth

# In .env:
VITE_FIREBASE_AUTH_EMULATOR_HOST="localhost"
VITE_FIREBASE_AUTH_EMULATOR_PORT="9099"
VITE_USE_EMULATORS="true"
```

---

## Mono-Repo Setup

```
my-project/
├── .claude/          # move from frontend/
├── firebase.json     # root Firebase config
├── .firebaserc
├── firestore.rules
├── storage.rules
├── frontend/         # this boilerplate
│   ├── src/
│   └── package.json
└── functions/        # boilerplate_backend
    ├── src/
    └── package.json
```

The setup wizard detects mono-repo context and generates a migration script.

---

## Development Scripts

```bash
npm run dev              # Dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview build

npm run lint             # ESLint
npm run typecheck        # TypeScript strict check

npm test                 # All tests
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:coverage    # Coverage report

npx @xbg.solutions/bpsk generate component UserProfile
npx @xbg.solutions/bpsk generate route dashboard --auth --roles=user,admin
npx @xbg.solutions/bpsk generate service AnalyticsService

npx @xbg.solutions/bpsk validate         # Full config validation
npm run analyze                    # Bundle analysis
```

---

## Deployment

### Firebase Hosting

```bash
npm run deploy           # npm run build && firebase deploy --only hosting
```

The static adapter outputs to `build/`. `firebase.json` is pre-configured for SPA routing.

### Other Platforms

Build output is static HTML in `build/`. Works with Vercel, Netlify, Docker, or any static host.

---

## Common Setup Mistakes

| Mistake | Fix |
|---|---|
| Missing `VITE_` prefix | `undefined` at runtime — add prefix |
| Firebase config mismatch | `npx @xbg.solutions/bpsk validate` |
| `VITE_APP_SHORT_NAME` not set | Generic `app_*` storage prefix — set in `.env` |
| Stores accessed before init | Wait for `initializationStore.isInitialized` |
| `goto()` in load function | Use `redirect()` from `@sveltejs/kit` |
| SSR browser API access | Wrap in `browser` check |
