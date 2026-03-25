# XBG Boilerplate SvelteKit — Setup & Development Workflow

**Skill: `xbg_bpsk_setup`**

Everything needed to bootstrap, configure, validate, and run a project built on the XBG SvelteKit boilerplate.

---

## Prerequisites

- Node.js 18+
- A Firebase project ([console.firebase.google.com](https://console.firebase.google.com))

---

## Quick Start (New Project)

```bash
# Create a new project with the CLI
npx @xbg.solutions/create-frontend my-app
cd my-app

# The CLI runs interactive setup -- covers everything in one go

# Validate
npx @xbg.solutions/create-frontend validate

npm run dev             # http://localhost:5173
```

---

## What the CLI Setup Does

The CLI runs an interactive setup that covers:

| Step | What it covers |
|------|----------------|
| 1 | **Project identity** -- name, shortName, description, domain, support email |
| 2 | **Firebase** -- project ID, API key, auth domain, etc.; updates `firebase.json` + `.firebaserc` |
| 3 | **API / Backend** -- dev + prod base URLs (pre-fills Firebase Functions pattern) |
| 4 | **Utility selection** -- interactive checklist of `@xbg.solutions/utils-*` packages to install |
| 5 | **RBAC** -- define roles, hierarchy, permissions, JWT boolean claim map (if `utils-rbac` selected) |
| 6 | **Feature flags** -- phone auth, analytics, real-time updates, etc. |
| 7 | **Generate & validate** -- writes `.env`, `.env.example`, generates `app.config.ts`, installs packages |

---

## Two-Part Configuration Model

```
.env  (project-specific secrets / IDs)     app.config.ts  (structural code)
-------------------------------------      --------------------------------------
VITE_APP_NAME                              auth.roles
VITE_APP_SHORT_NAME  <- storage prefix     auth.roleHierarchy
VITE_FIREBASE_PROJECT_ID                   auth.permissions
VITE_FIREBASE_API_KEY                      auth.claimMap    <- role -> JWT bool flag
VITE_API_BASE_URL_DEV / _PROD             features.*
VITE_GA_MEASUREMENT_ID                     routes.*
...                                        ui.*, security.*, tabSync.*
```

**The CLI writes both.** After setup neither file contains placeholder strings.

---

## Environment Variables (Key Ones)

```bash
# App identity -- VITE_APP_SHORT_NAME drives localStorage/tabSync prefix
VITE_APP_NAME="Acme Dashboard"
VITE_APP_SHORT_NAME="acme"       # -> localStorage key prefix: acme_*
VITE_APP_DESCRIPTION="..."
VITE_APP_DOMAIN="acme.com"
VITE_SUPPORT_EMAIL="support@acme.com"

# Firebase -- all 6 are required
VITE_FIREBASE_PROJECT_ID="acme-prod"
VITE_FIREBASE_API_KEY="AIza..."
VITE_FIREBASE_AUTH_DOMAIN="acme-prod.firebaseapp.com"
VITE_FIREBASE_STORAGE_BUCKET="acme-prod.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123"

# API
VITE_API_BASE_URL_DEV="http://localhost:5001/acme-prod/us-central1/api"
VITE_API_BASE_URL_PROD="https://us-central1-acme-prod.cloudfunctions.net/api"

# Feature IDs (structural flags live in app.config.ts features block)
VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"   # only if analytics=true
VITE_RECAPTCHA_SITE_KEY="..."           # only if phoneVerification=true

# Emulators (uncomment for local dev)
# VITE_FIREBASE_AUTH_EMULATOR_HOST="localhost"
# VITE_FIREBASE_AUTH_EMULATOR_PORT="9099"
# VITE_USE_EMULATORS="true"
```

> `VITE_` prefix is required for client-side access via `import.meta.env`.

---

## After Setup -- `app.config.ts` Structural Sections

The CLI writes the RBAC and features blocks. To edit manually, find the `SETUP:start/end` markers:

```typescript
// src/lib/config/app.config.ts

auth: {
  /* SETUP:start:roles */
  roles: { USER: 'user', ADMIN: 'admin', ... },
  roleHierarchy: { admin: ['user'], ... },
  permissions: { user: ['editOwnProfile'], admin: [...], ... },
  claimMap: { admin: 'isAdmin', ... },   // role value -> JWT boolean claim key
  /* SETUP:end:roles */
  tokenTTL: 3600,
  ...
},

features: {
  /* SETUP:start:features */
  authentication: true,
  emailVerification: true,
  phoneVerification: false,
  analytics: false,
  ...
  /* SETUP:end:features */
  debugMode: isDev,   // auto -- don't edit
},
```

Re-running the CLI setup replaces only these marked blocks.

---

## App Initialization Flow

```
Browser load
  -> +layout.svelte mounts
  -> initializationService.initialize({ firebaseConfig: APP_CONFIG.firebase })
      1. initializeApp(firebaseConfig)    <- Firebase SDK
      2. authService.initialize()         <- auth state listener
      3. tabSyncService.initialize()      <- cross-tab coordination
      4. Publishes 'app:initialized'
  -> initializationStore.isInitialized = true
  -> UI renders
```

`APP_CONFIG.firebase` is the **single source** passed to the initialization service --
no inline `firebaseConfig` objects elsewhere.

---

## Firebase Auth Setup

In Firebase Console -> Authentication -> Sign-in methods, enable:
- **Email/Link (passwordless)** -- primary auth method
- **Phone** -- only if `features.phoneVerification = true`

### Emulators

```bash
npm install -g firebase-tools
firebase login
firebase emulators:start --only auth

# In .env:
VITE_FIREBASE_AUTH_EMULATOR_HOST="localhost"
VITE_FIREBASE_AUTH_EMULATOR_PORT="9099"
VITE_USE_EMULATORS="true"
```

---

## Mono-Repo Setup

When `boilerplate_sveltekit` lives as `frontend/` alongside `functions/` in a mono-repo:

```
my-project/
├── .claude/          <- move here from frontend/ (CLI generates migration script)
├── .gitignore        <- merge from frontend/
├── firebase.json     <- root Firebase config (Hosting + Functions)
├── .firebaserc       <- root Firebase project config
├── firestore.rules
├── storage.rules
├── cors.json
├── frontend/         <- boilerplate_sveltekit lives here
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
└── functions/        <- boilerplate_backend lives here
    ├── src/
    └── package.json
```

The CLI detects the mono-repo context and can generate a migration script to move shared files to the project root.

**What stays in `frontend/`**: `package.json`, `src/`, `vite.config.ts`, `svelte.config.js`,
`tailwind.config.js`, `tsconfig.json`, `__tests__/`, build output.

**What stays in project root**: `firebase.json`, `.firebaserc`, `firestore.rules`,
`storage.rules`, `cors.json`, root `package.json` (deploy orchestration).

---

## Updating an Existing Project

```bash
# Check for package updates and new utilities
npx @xbg.solutions/create-frontend --sync
```

Sync mode:
- Checks for updates across installed `@xbg.solutions/*` packages
- Merges updated config/scaffold files
- Offers newly available utilities not yet installed
- Updates scaffolded files (config templates, build config) if boilerplate has changed

---

## Development Scripts

```bash
npm run dev              # Dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview production build

# Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript strict check

# Testing
npm test                 # All tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:coverage    # Coverage report

# Generators
npx @xbg.solutions/create-frontend generate component UserProfile
npx @xbg.solutions/create-frontend generate route dashboard --auth --roles=user,admin
npx @xbg.solutions/create-frontend generate service analytics

# Validation
npx @xbg.solutions/create-frontend validate

# Performance
npm run analyze          # Bundle analysis
```

---

## Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting

# Or shorthand:
npm run deploy
```

`firebase.json` is pre-configured for SPA routing (`build/` directory, `/index.html` fallback).
The CLI sets the hosting target alias and region during setup.

### Other Platforms

```bash
# Vercel / Netlify -- connect repo, build: npm run build, publish: build/
# Docker
docker build -t my-app .
docker run -p 3000:3000 my-app
```

---

## Common Setup Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Missing `VITE_` prefix | `undefined` at runtime | Add `VITE_` prefix |
| Firebase config mismatch | Auth fails silently | `npx @xbg.solutions/create-frontend validate` |
| `VITE_APP_SHORT_NAME` not set | Generic storage prefix (`app_*`) | Set in `.env` or re-run CLI setup |
| Stores accessed before init | Empty/stale state | Wait for `initializationStore.isInitialized` |
| `goto()` in `+layout.ts` load | Navigation loops | Use `redirect()` from `@sveltejs/kit` |
| SSR browser API access | Hydration errors | Wrap in `browser` check or `ClientOnly` |
| `.claude/` left in `frontend/` (mono-repo) | Agent context missing at root | Run the mono-repo migration script |
