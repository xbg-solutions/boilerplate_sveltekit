# XBG Boilerplate SvelteKit — Setup & Development Workflow

**Skill: `xbg_bpsk_setup`**

Everything needed to bootstrap, configure, validate, and run the boilerplate for a new or existing project.

---

## Prerequisites

- Node.js 18+
- A Firebase project ([console.firebase.google.com](https://console.firebase.google.com))
- Git

---

## Quick Start (New Project)

```bash
git clone https://github.com/xbg-solutions/boilerplate_frontend.git my-app
cd my-app
npm install

# Interactive setup wizard (recommended)
npm run setup
# Wizard asks 6 questions, generates .env, updates app.config.ts, validates

# Or manual: copy .env.example → .env and fill in values
cp .env.example .env

# Validate everything is wired correctly
npm run validate        # Full check (build + tests)
npm run validate:quick  # Skip slow checks

npm run dev             # Start dev server at http://localhost:5173
```

---

## Environment Variables

All secrets live in `.env` (gitignored). The file `.env.example` lists every variable.

Key variables:

```bash
# App identity
VITE_APP_NAME="My App"
VITE_APP_DOMAIN="myapp.com"
VITE_SUPPORT_EMAIL="support@myapp.com"

# Firebase
VITE_FIREBASE_PROJECT_ID="my-project-id"
VITE_FIREBASE_API_KEY="AIza..."
VITE_FIREBASE_AUTH_DOMAIN="my-project-id.firebaseapp.com"
VITE_FIREBASE_STORAGE_BUCKET="my-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123"

# API endpoints
VITE_API_BASE_URL_DEV="http://localhost:5001/my-project-id/us-central1/api"
VITE_API_BASE_URL_PROD="https://us-central1-my-project-id.cloudfunctions.net/api"

# SEO
VITE_SEO_DEFAULT_TITLE="My App"
VITE_SEO_DEFAULT_DESCRIPTION="My app description"
VITE_SEO_DEFAULT_IMAGE="/og-image.jpg"
VITE_SEO_DEFAULT_KEYWORDS="keyword1,keyword2"
```

> **Important:** `VITE_` prefix is required for values to be accessible client-side via `import.meta.env`.

---

## After Setting `.env` — Update `app.config.ts`

`src/lib/config/app.config.ts` is the **single source of truth**. Search for `FIXME` comments:

```typescript
// src/lib/config/app.config.ts
export const APP_CONFIG = {
  project: {
    name: 'Your App Name',       // FIXME
    domain: 'yourapp.com',       // FIXME
  },
  firebase: {
    projectId: 'your-project-id', // FIXME
    apiKey: 'your-api-key',        // FIXME
    // ...
  },
  api: {
    baseUrl: {
      development: 'http://localhost:5001/your-project-id/us-central1/api', // FIXME
      production: 'https://us-central1-your-project-id.cloudfunctions.net/api', // FIXME
    }
  }
};
```

The config file reads from `import.meta.env` so the `.env` file values automatically populate it.

---

## App Initialization Flow

The application initializes in a specific sequence. Understanding this prevents race conditions:

```
Browser load
  → +layout.svelte mounts
  → AppInitializer component calls initializationService.initialize()
  → initializationService:
      1. initializeApp(firebaseConfig)    ← Firebase SDK
      2. authService.initialize()         ← Sets up Firebase Auth listener
      3. tabSyncService.initialize()      ← Cross-tab coordination
      4. Publishes 'app:initialized'
  → initializationStore.isInitialized = true
  → UI renders (ClientOnly wrapper lifts)
```

The `ClientOnly` component in `+layout.svelte` prevents SSR hydration mismatches:

```svelte
<!-- src/routes/+layout.svelte -->
<ClientOnly>
  <!-- Everything here only renders in browser -->
  <HeaderNav {isAuthenticated} {claims} />
  <slot />
</ClientOnly>
```

---

## Firebase Auth Setup

### Enable Required Auth Methods

In Firebase Console → Authentication → Sign-in methods, enable:
- **Email/Link (passwordless)** — primary auth method
- **Phone** — optional, set `features.phoneVerification: true` in config
- **Google / others** — optional federation providers

### Firebase Emulators (Local Dev)

```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login

# Start auth emulator
firebase emulators:start --only auth

# initializationService auto-connects to emulator when useEmulators=true
# Set in your layout or entry point:
await initializationService.initialize({
  firebaseConfig: APP_CONFIG.firebase,
  useEmulators: true  // connects to localhost:9099
});
```

---

## Development Scripts

```bash
npm run dev              # Dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview production build

# Code quality
npm run lint             # ESLint
npm run typecheck        # TypeScript strict check
npm run format           # Prettier

# Testing
npm test                 # All tests (unit + integration)
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:coverage    # Coverage report
npm run test:watch       # Watch mode

# Generators
npm run generate:component UserProfile --type=feature --with-test
npm run generate:route dashboard --auth --roles=user,admin
npm run generate:service analytics

# Setup & Validation
npm run setup            # Interactive project configuration wizard
npm run validate         # Full validation (env + build + tests)
npm run validate:quick   # Skip build/test, just check env

# Performance
npm run analyze          # Bundle size analysis
npm run perf:audit       # Lighthouse audit
```

---

## Deployment

### Firebase Hosting (Recommended)

```bash
# One-time setup
firebase init hosting    # Select build/ as public dir, SPA rewrites

npm run build
firebase deploy --only hosting

# Or use the deploy script
npm run deploy
```

`firebase.json` is pre-configured for SPA routing:

```json
{
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  }
}
```

### Other Platforms

```bash
# Vercel / Netlify — connect repo, set build command:
npm run build
# Publish directory: build

# Docker
docker build -t my-app .
docker run -p 3000:3000 my-app
```

---

## Generating New Routes

```bash
# Authenticated route with role restriction
npm run generate:route admin/users --auth --roles=admin,sysadmin --with-load

# Generated files:
# src/routes/admin/users/+page.svelte
# src/routes/admin/users/+page.ts   (with guardRoute)
```

The generated `+page.ts` pattern:

```typescript
// src/routes/protected/my-feature/+page.ts
import { guardRoute } from '$lib/utils/auth-guard';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const load = async () => {
  if (!browser) return {};

  const guard = guardRoute({
    requiredAnyRoles: ['admin', 'user'],
    redirectTo: '/'
  });

  if (guard.status !== 'authorized') {
    goto(guard.redirect!);
    return {};
  }

  return {};
};
```

---

## Common Setup Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Missing `VITE_` prefix on env vars | `undefined` at runtime | Add `VITE_` prefix |
| Firebase config mismatch | Auth fails silently | Run `npm run validate` |
| Accessing stores before initialization | Empty/stale state | Wait for `initializationStore.isInitialized` |
| `goto()` in `+layout.ts` load | Navigation loops | Use `redirect()` from `@sveltejs/kit` |
| SSR rendering browser APIs | Hydration errors | Wrap in `browser` check or `ClientOnly` |
| Not running `npm run setup` for a fresh clone | Broken Firebase config | Run `npm run setup` first |
