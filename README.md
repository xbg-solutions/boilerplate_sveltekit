# SvelteKit 5 Boilerplate

A production-ready SvelteKit 5 foundation by [XBG Solutions](https://xbg.solutions), built with [Claude Code](https://www.claude.com/product/claude-code).

Designed for **agentic development** — opinionated constraints that guide AI agents to one-shot success.

---

## What This Is

A SvelteKit 5 boilerplate with Firebase Auth, Tailwind CSS, and shadcn-svelte components. It uses a **two-part distribution model**:

1. **npm packages** (`@xbg.solutions/*`) — Runtime code that updates via `npm update`
2. **Local scaffolding** — Setup wizard, generators, and project-owned files (UI components, config, routes)

### Core Stack

- **SvelteKit 2** with **Svelte 5** runes syntax (`$props()`, `$state()`, `$derived()`, `$effect()`, `{@render}`)
- **TypeScript** in strict mode
- **Tailwind CSS 3** with utility-first styling
- **Three-tier component system** — basic atoms (agent-coded), extended atoms + 450+ blocks (from registry via `npx @xbg.solutions/bpsk add`)
- **Firebase** — Authentication (email-link, phone), Hosting, Storage
- **Vitest** — Unit and integration test suite

---

## Quick Start

### Prerequisites

- Node.js 18+
- A Firebase project ([console.firebase.google.com](https://console.firebase.google.com))

### 1. Install core + configure

```bash
mkdir my-app && cd my-app
npm init -y
npm install @xbg.solutions/bpsk-core
```

Then install only the utility packages you need:

```bash
npm install @xbg.solutions/bpsk-utils-firebase-auth   # Auth (auto-pulls csrf + secure-storage)
npm install @xbg.solutions/bpsk-utils-api-client       # Typed HTTP client
npm install @xbg.solutions/bpsk-utils-rbac             # Role-based access control
# ... see package table below for the full list
```

### 2. Run setup

```bash
npx @xbg.solutions/bpsk setup                              # Interactive wizard (human)
npx @xbg.solutions/bpsk setup --config setup-config.json   # Non-interactive (agent / CI)
```

The setup wizard writes your `.env`, `app.config.ts`, Firebase config. See [setup-config-schema.md](docs/setup-config-schema.md) for the JSON schema.

### 3. Add components from registry

```bash
# Add extended atoms (complex components with custom logic)
npx @xbg.solutions/bpsk add otp-input calendar select statistic-card

# Add block categories (full page compositions)
npx @xbg.solutions/bpsk add block-auth block-dashboard block-sidebar block-hero-section

# Add advanced components
npx @xbg.solutions/bpsk add chart-wrapper data-table form-wizard

# List all available components
npx @xbg.solutions/bpsk add list
```

Components are copied into your project as owned source (shadcn philosophy). Basic atoms (Button, Card, Input, etc.) are simple enough for agents to code directly following the Svelte 5 runes + `tv()` + `cn()` pattern.

### 4. Validate and run

```bash
npx @xbg.solutions/bpsk validate   # Verify configuration
npm run dev                  # http://localhost:5173
```

### Developing on the boilerplate repo itself

If you're contributing to this boilerplate (not consuming it as a package):

```bash
git clone <repo-url> my-app
cd my-app
npm install
npm run setup
npm run dev
```

---

## What the Setup Wizard Configures

| Step | What |
|------|------|
| 1 | Project identity (name, short name, domain, support email) |
| 2 | Firebase configuration (updates `firebase.json` + `.firebaserc`) |
| 3 | API base URLs (dev + prod) |
| 4 | Utility package selection (`@xbg.solutions/bpsk-utils-*`) |
| 5 | RBAC — roles, hierarchy, permissions, JWT claim map |
| 6 | Feature flags (phone auth, analytics, real-time, etc.) |
| 7 | Generates `.env`, `.env.example`, updates `app.config.ts` |

---

## Two-Part Configuration Model

**`.env`** — Secrets and IDs (never committed):
```bash
VITE_APP_NAME="Acme Dashboard"
VITE_APP_SHORT_NAME="acme"
VITE_FIREBASE_PROJECT_ID="acme-prod"
VITE_FIREBASE_API_KEY="AIza..."
VITE_API_BASE_URL_DEV="http://localhost:5001/acme-prod/us-central1/api"
VITE_API_BASE_URL_PROD="https://us-central1-acme-prod.cloudfunctions.net/api"
```

**`src/lib/config/app.config.ts`** — Structural config (roles, permissions, feature flags):
```typescript
auth: {
  /* SETUP:start:roles */
  roles: { USER: 'user', ADMIN: 'admin' },
  roleHierarchy: { admin: ['user'] },
  permissions: { user: ['editOwnProfile'], admin: [...] },
  claimMap: { admin: 'isAdmin' },
  /* SETUP:end:roles */
},
features: {
  /* SETUP:start:features */
  emailVerification: true,
  phoneVerification: false,
  analytics: false,
  /* SETUP:end:features */
}
```

`APP_CONFIG` is the single object imported everywhere.

---

## npm Packages

| Package | Description |
|---|---|
| `@xbg.solutions/bpsk-core` | Base framework — config types, core stores, error handling, logging, event bus, mutex |
| `@xbg.solutions/bpsk-test-utils` | Test utilities (devDependency) — Firebase mocks, store mocks, async helpers |
| `@xbg.solutions/bpsk-utils-firebase-auth` | Auth service, token service, auth stores, auth guard |
| `@xbg.solutions/bpsk-utils-api-client` | Typed HTTP client, request/response handlers, response caching |
| `@xbg.solutions/bpsk-utils-secure-storage` | Encrypted client-side storage (AES-GCM) |
| `@xbg.solutions/bpsk-utils-csrf` | CSRF token generation/validation |
| `@xbg.solutions/bpsk-utils-sanitizer` | Input sanitization, XSS prevention |
| `@xbg.solutions/bpsk-utils-rbac` | Role hierarchy, permission checking |
| `@xbg.solutions/bpsk-utils-tab-sync` | Cross-tab synchronization |
| `@xbg.solutions/bpsk-utils-recaptcha` | reCAPTCHA v3 integration |
| `@xbg.solutions/bpsk-utils-seo` | Meta tags, structured data, OpenGraph |
| `@xbg.solutions/bpsk-utils-sse` | Server-sent events client |
| `@xbg.solutions/bpsk-utils-performance` | Performance metrics, monitoring |
| `@xbg.solutions/bpsk-utils-file-upload` | File handling with Firebase Storage |
| `@xbg.solutions/bpsk-utils-state-manager` | Global state persistence |
| `@xbg.solutions/bpsk-utils-event-bus` | Event bus (also included in core) |
| `@xbg.solutions/bpsk-utils-mutex` | Mutex service (also included in core) |

Install only what you need — dependencies auto-resolve.

See [distribution-architecture.md](docs/distribution-architecture.md) for the dependency graph.

---

## Project Structure

```
src/
├── lib/
│   ├── config/
│   │   ├── app.config.ts          # Single source of truth
│   │   ├── routes.config.ts       # Route metadata
│   │   └── security.ts            # CSP, headers, validation
│   ├── components/
│   │   ├── ui/                    # Atomic components (basic + extended)
│   │   ├── blocks/                # 450+ page blocks across 55 categories
│   │   │   ├── auth/              # LoginBlock, SignupBlock, OtpBlock variants
│   │   │   ├── dashboard/         # DashboardBlock, ChartsBlock variants
│   │   │   ├── sidebar/           # SidebarLayout variants
│   │   │   ├── hero-section/      # HeroSection variants
│   │   │   ├── pricing-section/   # PricingSection variants
│   │   │   └── ...                # 49 more categories
│   │   ├── layout/                # AppInitializer, AuthGuard, PageTransition, Seo
│   │   ├── auth/                  # EmailLinkAuth, PhoneAuth
│   │   ├── advanced/              # ChartWrapper, DataTable, FormWizard, ImageUpload
│   │   └── error/                 # ErrorBoundary, ErrorDisplay
│   ├── services/                  # Singleton services (auth, api, toast, events, etc.)
│   ├── stores/                    # Svelte stores (auth, loading, toast, rbac, etc.)
│   ├── utils/                     # Pure helpers (cn, error-handler, rbac, route-handler, etc.)
│   ├── types/                     # TypeScript interfaces
│   └── templates/                 # Layout templates (Dashboard, Form, Content)
├── routes/
│   ├── +layout.svelte             # Root layout
│   ├── +page.svelte               # Public home / sign-in
│   ├── protected/                 # Auth-gated routes
│   ├── confirm/                   # Email-link confirmation
│   ├── demo/                      # Component demos
│   └── unauthorized/              # 403 page
└── app.html                       # HTML template

__scripts__/                       # Thin wrappers → packages/create-frontend/src/commands/
__tests__/                         # Vitest test suite (unit + integration)
packages/                          # npm workspace packages
.claude/skills/                    # AI-optimized skills documentation
docs/                              # Architecture docs
```

---

## UI Components

### Three-Tier System

1. **Basic atoms** — Button, Card, Input, Label, Badge, etc. Agent-coded following Svelte 5 runes + `tv()` + `cn()` pattern.
2. **Extended atoms** — OtpInput, Calendar, Select, DataTable, ChartWrapper, etc. Installed via `npx @xbg.solutions/bpsk add`.
3. **Blocks** — 450+ page-level compositions across 55 categories (auth, dashboard, hero, pricing, testimonials, etc.). Installed via `npx @xbg.solutions/bpsk add block-<category>`.

```svelte
<script lang="ts">
  import { Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
  import { Badge } from '$lib/components/ui/badge';
</script>

<Card class="w-full">
  <CardHeader>
    <CardTitle>User Analytics</CardTitle>
  </CardHeader>
  <CardContent>
    <div class="text-3xl font-bold">{stats.totalUsers}</div>
    <Button>View Details</Button>
  </CardContent>
</Card>
```

---

## Authentication

Firebase Auth with email-link (passwordless) and phone authentication:

```typescript
import { authService } from '$lib/services/auth';

// Email link
await authService.sendEmailLink('user@example.com');
await authService.verifyEmailLink({ returnUrl: '/protected' });

// Phone
await authService.sendPhoneCode('+15551234567', recaptchaVerifier);
await authService.verifyPhoneCode('123456', verificationId);

// State
authService.isAuthenticated();
authService.getCurrentUser();
authService.getUserClaims();
```

### Protected Routes

```typescript
// src/routes/protected/admin/+page.ts
import { routeHandler } from '$lib/utils/route-handler';

const { hasAccess, redirect } = routeHandler.verifyAccess(url, isAuthenticated, claims, {
  claims: { operator: 'any', claims: ['admin', 'sysadmin'] }
});
```

---

## Testing

```bash
npm test                    # All tests (unit + integration)
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
npm run test:coverage       # With coverage report
```

Tests follow **behavioral testing** — test what the user sees, not implementation details.

---

## Development Scripts

```bash
npm run dev              # Dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview build
npm run lint             # ESLint
npm run typecheck        # TypeScript strict check

# CLI commands
npx @xbg.solutions/bpsk setup                     # Configure project
npx @xbg.solutions/bpsk validate                  # Validate configuration
npx @xbg.solutions/bpsk add block-auth            # Add components from registry
npx @xbg.solutions/bpsk generate component <Name> # Generate component scaffold
npx @xbg.solutions/bpsk generate route <path>     # Generate route
npx @xbg.solutions/bpsk generate service <Name>   # Generate service

# Analysis
npm run analyze          # Bundle analysis
```

---

## Deployment

### Firebase Hosting (recommended)

```bash
npm run deploy           # Build + firebase deploy --only hosting
```

### Other Platforms

Build output is in `build/` (static adapter). Works with Vercel, Netlify, Docker, or any static host.

---

## Mono-Repo Usage

Works standalone or as `frontend/` alongside [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend):

```
my-project/
├── .claude/           # Moved here from frontend/
├── firebase.json      # Root Firebase config
├── .firebaserc
├── frontend/          # This boilerplate
│   ├── src/
│   └── package.json
└── functions/         # boilerplate_backend
    ├── src/
    └── package.json
```

---

## Documentation

- **[Distribution Architecture](docs/distribution-architecture.md)** — Package map and dependency graph
- **[Setup Config Schema](docs/setup-config-schema.md)** — Non-interactive setup JSON format
- **[Test README](__tests__/README.md)** — Testing patterns and mock conventions
- **[Templates README](src/lib/templates/README.md)** — Layout template usage
- **`.claude/skills/`** — AI-optimized skills for agent development

---

## License

MIT License

---

**Built by [XBG Solutions](https://xbg.solutions) for rapid MVP development and AI-assisted coding.**

If this project helps you, please consider buying us a beer or two!
https://xbg.solutions/donations
