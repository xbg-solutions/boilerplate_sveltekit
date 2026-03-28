# SvelteKit 5 AI-Compatible Boilerplate

An experiment by [XBG Solutions](https://xbg.solutions) aided by [Claude Code](https://www.claude.com/product/claude-code).

**Production-ready SvelteKit foundation distributed as npm packages, optimized for AI-assisted design-to-code workflows.**

Build and launch MVPs in **days, not months** using modern AI-assisted development patterns.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-677%20Passing-green)](./tests)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

---

## What Makes This Different

This boilerplate is specifically designed for:
- **Agentic Development**: Constrained, opinionated architecture that railroads AI agents into one-shot success
- **AI-Assisted Development**: Consistent patterns and comprehensive documentation optimized for AI code generation
- **npm Package Distribution**: Install what you need via `@xbg.solutions/*` packages -- updates propagate via `npm update`
- **Rapid MVP Development**: Interactive CLI setup and 60+ ready-to-use atomic components
- **Design-to-Code Pipeline**: Optimized for Figma -> AI -> Svelte workflows with SHADCN components
- **Production Readiness**: 677 passing tests, accessibility compliance, and deployment infrastructure
- **Backend Integration**: Works standalone or pairs with [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend) for full-stack MVPs

### The Agentic Development Workflow

```
1. Requirements Input       ->  2. Agent Development    ->  3. Deploy
   (MoSCoW + Figma/Designs)     (Constrained patterns)      (Production-ready)
   |                             |                           |
   - User journeys              - Update config             - 677 tests pass
   - Figma designs              - Build with SHADCN         - Accessibility check
   - API specs/Postman          - Connect backend           - Type-safe check
   - Feature requirements       - Generate tests            - Deploy!
```

**Designed for one-shot success**: Opinionated constraints guide AI agents to production-ready code without human intervention.

---

## Distribution Architecture

This boilerplate is distributed as **npm packages** rather than a repo you clone. Updates propagate via standard `npm update` and semver protects against breaking changes.

### Part 1: npm Packages (runtime dependencies)

| Package | Description |
|---|---|
| `@xbg.solutions/frontend-core` | Base framework -- config types, core stores, error handling, logging, layout components |
| `@xbg.solutions/test-utils-frontend` | Test utilities (devDependency) -- Firebase mocks, store mocks, async helpers |
| `@xbg.solutions/utils-firebase-auth` | Auth service, token service, auth stores, auth guard |
| `@xbg.solutions/utils-api-client` | Typed HTTP client, request/response handlers, response caching |
| `@xbg.solutions/utils-secure-storage` | Encrypted client-side storage (AES-GCM) |
| `@xbg.solutions/utils-csrf` | CSRF token generation/validation |
| `@xbg.solutions/utils-sanitizer` | Input sanitization, XSS prevention |
| `@xbg.solutions/utils-rbac` | Role hierarchy, permission checking |
| `@xbg.solutions/utils-tab-sync` | Cross-tab synchronization |
| `@xbg.solutions/utils-recaptcha` | reCAPTCHA v3 integration |
| `@xbg.solutions/utils-seo` | Meta tags, structured data, OpenGraph |
| `@xbg.solutions/utils-sse` | Server-sent events client |
| `@xbg.solutions/utils-performance` | Performance metrics, monitoring |
| `@xbg.solutions/utils-file-upload` | File handling with Firebase Storage |
| `@xbg.solutions/utils-state-manager` | Global state persistence |

> **Note:** Event bus, mutex, and pub/sub are included in `frontend-core` -- no separate package needed.

Install only what you need. Dependencies auto-resolve -- installing `@xbg.solutions/utils-firebase-auth` automatically pulls in `@xbg.solutions/utils-csrf` and `@xbg.solutions/utils-secure-storage`.

### Part 2: Local Scripts (project structure & configuration)

Setup wizard and generators handle everything that isn't a runtime import -- project structure, config files, UI components, templates, wiring code.

```bash
# Setup (interactive)
npm run setup

# Setup (non-interactive, for agents/CI)
node __scripts__/setup.cjs --config setup-config.json

# Generators
npm run generate:component -- <Name>
npm run generate:route -- <path>
npm run generate:service -- <Name>

# Validation
npm run validate
```

> **Note:** A distributable `npx @xbg.solutions/create-frontend` CLI is planned. For now, use the local scripts above.

See [distribution-architecture.md](docs/distribution-architecture.md) for the full package map and dependency graph.

---

## Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Firebase account ([Create free](https://firebase.google.com/))

### New Project Setup

```bash
git clone <repo-url> my-app
cd my-app
npm install
npm run setup          # Interactive 8-step wizard
```

The setup wizard covers:

| Step | What it configures |
|------|--------------------|
| 1 | Project identity (name, short name, domain, support email) |
| 2 | Firebase configuration (updates `firebase.json` + `.firebaserc`) |
| 3 | API base URLs (dev + prod) |
| 4 | RBAC -- roles, hierarchy, permissions, JWT claim map |
| 5 | Feature flags (phone auth, analytics, real-time, etc.) |
| 6 | Generates `.env`, `.env.example`, updates `app.config.ts` |

```bash
# Validate configuration
npm run validate

# Start developing
npm run dev
```

Visit `http://localhost:5173` -- ready to build.

### Non-Interactive Setup (agents / CI)

```bash
node __scripts__/setup.cjs --config setup-config.json
```

See the [setup skill](.claude/skills/xbg_boilerplate_sveltekit/setup/skill.md) for the full JSON config schema.

### Manual Configuration

```bash
cp .env.example .env
# Fill in all VITE_* values
```

Then edit `src/lib/config/app.config.ts` -- find the `SETUP:start:roles` and
`SETUP:start:features` marker blocks and update roles, permissions, and feature flags.

All secrets and IDs live in `.env`. Role definitions and feature flags are structural
TypeScript in `app.config.ts`. Neither file contains placeholder strings after setup.

---

## What the CLI Scaffolds (project-local, not packaged)

These files are generated into the project and owned by the project. They are not imported from packages.

- **shadcn-svelte UI components** -- Copied into `src/lib/components/ui/` per shadcn philosophy (own and customize)
- **`app.config.ts`** -- Generated by the setup wizard, uses `defineConfig()` types from `@xbg.solutions/frontend-core`
- **Project skeleton** -- Routes (`+layout.svelte`, `+layout.ts`, `+page.svelte`, `+error.svelte`), `app.html`, `app.css`
- **Build and tool config** -- `svelte.config.js`, `vite.config.ts`, `tailwind.config.cjs`, `postcss.config.cjs`, `tsconfig.json`
- **`.env` file** -- From interactive prompts
- **Generated code** -- Components, routes, and services created via generators
- **Auth components** -- `PhoneAuth`, `EmailLinkAuth` (project-local, customizable)

---

## What Changes in Project Code

Instead of relative imports from copied boilerplate files:

```typescript
// Old (clone-based)
import { AppError } from '../../utils/error-handler';
import { loadingStore } from '../../stores/loading.store';
import { apiService } from '../../services/api/api.service';
```

Projects import from packages:

```typescript
// New (npm packages)
import { AppError, loadingStore } from '@xbg.solutions/frontend-core';
import { apiService } from '@xbg.solutions/utils-api-client';
```

---

## Key Features

### Core Stack
- **SvelteKit 5**: Latest version with Svelte 5 runes syntax throughout (`$props()`, `$state()`, `$derived()`, `$effect()`, `{@render}`)
- **TypeScript**: Strict mode enabled with comprehensive type definitions
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **SHADCN-Svelte**: 60+ accessible, customizable UI components using Svelte 5 snippets
- **Firebase**: Authentication, hosting, and backend integration
- **Vitest**: Modern testing framework with 677 passing tests

### Agentic & AI-Optimized Architecture
- **Constrained by Design**: Opinionated architecture that railroads agents into best practices
- **Single Configuration File**: Edit one file (`src/lib/config/app.config.ts`) to customize everything
- **Atomic Components Only**: 30 SHADCN components for composition (no opinionated page layouts)
- **Consistent Import Patterns**: Standardized imports from `@xbg.solutions/*` packages and `$lib/components/ui`
- **AI-Optimized Skills**: `.claude/skills/` documentation for AI agent context
- **Decision Trees**: Built-in guardrails eliminate ambiguity for one-shot success
- **Predictable Structure**: SHADCN component patterns for reliable code generation
- **Backend Integration**: Accepts Postman collections or direct API access (mono-repo)

### Production Features
- **677 Passing Tests**: Comprehensive behavioral testing with @testing-library/svelte
- **Accessibility Compliance**: WCAG Level AA with all build warnings resolved
- **Performance Optimized**: Bundle analysis, code splitting, and performance monitoring
- **Security First**: CSRF protection, input sanitization, secure authentication, AES-GCM encrypted storage, CSP headers, role-based access control with hierarchy
- **Deployment Ready**: CI/CD pipelines, Docker support, multiple hosting options

---

## Core Philosophy: Constrained for Agentic Success

### Atomic Components, Not Opinionated Pages

**What We Provide:**
- **30 SHADCN atomic components**: Button, Card, Input, Dialog, etc.
- **Authentication & routing**: Firebase auth, protected routes, role-based access
- **Testing infrastructure**: Behavioral test patterns, 677 passing tests
- **Backend integration**: Postman collection import, API client utilities
- **Type-safe APIs**: Full TypeScript with strict mode
- **Deployment pipelines**: CI/CD, multiple hosting options

**What We DON'T Provide:**
- No pre-built dashboards, user profiles, admin panels
- No opinionated page structures or layouts
- No complex composed components

**Why This Constraint?**

In **agentic development workflows**, AI agents:
1. **Receive requirements** (MoSCoW, Figma designs, API specs)
2. **Compose atomic components** into features using constrained patterns
3. **Generate production code** with one-shot success

**Constraints = Guardrails = Success**

By limiting choices, we:
- Eliminate decision paralysis for agents
- Ensure consistent, maintainable code
- Enable reliable, predictable code generation
- Accelerate from requirements to production

**Pairs with [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend)** for full-stack agentic development.

```svelte
<!-- AI generates this FROM Figma designs, using YOUR 30 base components -->
<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';

  export let stats: DashboardStats;
</script>

<Card class="w-full">
  <CardHeader>
    <CardTitle class="flex items-center gap-2">
      User Analytics
      <Badge variant="outline">Live</Badge>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div class="grid gap-4">
      <div class="text-3xl font-bold">{stats.totalUsers}</div>
      <Button>View Details</Button>
    </div>
  </CardContent>
</Card>
```

---

## Project Structure

```
src/
├── lib/
│   ├── config/
│   │   └── app.config.ts          # Single source of truth - edit this file
│   ├── components/
│   │   ├── animations/            # Advanced transition components
│   │   ├── ui/                    # 30+ SHADCN components (atomic, scaffolded)
│   │   ├── auth/                  # Authentication components (scaffolded)
│   │   └── layout/                # Layout and navigation
│   ├── services/                  # Business logic and API integration
│   ├── stores/                    # Svelte stores for state management
│   ├── utils/                     # Utility functions and helpers
│   ├── types/                     # TypeScript type definitions
│   └── docs/                      # API and component documentation
├── routes/                        # SvelteKit routes
└── app.html                       # HTML template

__tests__/                         # 677 behavioral tests
.claude/skills/                    # AI-optimized documentation (6 skills)
docs/                              # Architecture and distribution docs
```

---

## UI Components

30+ production-ready SHADCN components with full TypeScript support:

```svelte
<script lang="ts">
  import { Button, Card, CardContent, CardHeader, Dialog, Input } from '$lib/components/ui';
</script>

<Card class="max-w-md">
  <CardHeader>
    <h2>User Profile</h2>
  </CardHeader>
  <CardContent>
    <Input label="Email" type="email" bind:value={email} />
    <Button class="mt-4" on:click={handleSave}>Save Changes</Button>
  </CardContent>
</Card>
```

**Available Components:**

**Form Components:**
- Button, Input, Label, Select, Checkbox, RadioGroup, Textarea

**Layout Components:**
- Card, Dialog, Sheet, Tabs, Breadcrumb, Pagination

**Data Display:**
- Table, Avatar, Badge, Progress, Skeleton

**Feedback:**
- Alert, Toast, LoadingOverlay

**Navigation:**
- HeaderNav, AuthGuard, PageTransition

See `/demo` route for live examples of all components.

---

## Authentication

Built-in Firebase authentication with multiple methods:

```typescript
import { authService } from '$lib/services/auth';

// Email/password authentication
const user = await authService.signInWithEmailAndPassword(email, password);

// Phone authentication
const user = await authService.signInWithPhoneNumber(phoneNumber);

// Email link authentication (passwordless)
await authService.sendSignInLinkToEmail(email);

// Get current user and claims
const user = authService.getUser();
const claims = authService.getUserClaims();
```

### Protected Routes

```typescript
// +page.ts
import { routeHandler } from '$lib/utils/route-handler';

export const load = routeHandler.createLoadFunction({
  requireAuth: true,
  requiredRoles: ['admin'],
  redirectTo: '/login'
});
```

---

## Testing Philosophy

**"Test WHAT, Not HOW"** - Behavioral testing principles:

```typescript
// Good - Test behavior
test('user can log in with valid credentials', async () => {
  render(LoginPage);

  await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

  expect(screen.getByText('Welcome back!')).toBeInTheDocument();
});

// Bad - Test implementation
test('signIn calls firebase.auth().signInWithEmailAndPassword', async () => {
  const spy = vi.spyOn(firebase.auth(), 'signInWithEmailAndPassword');
  await authService.signIn();
  expect(spy).toHaveBeenCalled();
});
```

### Test Commands

```bash
npm test                    # Run all 677 tests
npm run test:coverage       # Run with coverage report
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
```

---

## Configuration

### Two-Part Configuration Model

**`.env`** -- secrets and IDs (written by the CLI, never committed):
```bash
VITE_APP_NAME="Acme Dashboard"
VITE_APP_SHORT_NAME="acme"          # drives localStorage prefix
VITE_FIREBASE_PROJECT_ID="acme-prod"
VITE_FIREBASE_API_KEY="AIza..."
VITE_API_BASE_URL_DEV="http://localhost:5001/acme-prod/us-central1/api"
VITE_API_BASE_URL_PROD="https://us-central1-acme-prod.cloudfunctions.net/api"
```

**`src/lib/config/app.config.ts`** -- structural config (CLI edits the marked blocks):
```typescript
auth: {
  /* SETUP:start:roles */
  roles: { USER: 'user', ADMIN: 'admin', ... },
  roleHierarchy: { admin: ['user'], ... },
  permissions: { user: ['editOwnProfile'], admin: [...], ... },
  claimMap: { admin: 'isAdmin', ... },  // role -> JWT boolean claim key
  /* SETUP:end:roles */
},
features: {
  /* SETUP:start:features */
  emailVerification: true,
  phoneVerification: false,
  analytics: false,
  /* SETUP:end:features */
},
```

`APP_CONFIG` is the single object imported everywhere -- no duplicate config objects.

### Validation

```bash
npm run validate
```

The validator checks:
- Environment variables configured
- Firebase setup valid
- Dependencies installed
- Build succeeds
- Tests passing
- Warns about placeholder values

---

## Mono-Repo Usage

This boilerplate works both standalone and as the `frontend/` half of a
mono-repo paired with [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend).

```
my-project/
├── .claude/           <- moved here from frontend/ (see CLI setup)
├── firebase.json      <- root Firebase config (Hosting + Functions)
├── .firebaserc        <- root project + target aliases
├── firestore.rules
├── storage.rules
├── cors.json
├── frontend/          <- this boilerplate
│   ├── src/
│   ├── package.json
│   └── ...
└── functions/         <- boilerplate_backend
    ├── src/
    └── package.json
```

---

## Deployment

### Firebase Hosting (Recommended)

```bash
npm run build
firebase deploy --only hosting
```

### Other Platforms

**Vercel:**
```bash
npm run build
# Connect repository for automatic deployments
```

**Netlify:**
```bash
npm run build
# Drag and drop `build/` folder or connect repository
```

**Docker:**
```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

---

## Development Tools

```bash
# Code quality
npm run lint              # ESLint
npm run typecheck         # TypeScript check

# Testing
npm test                  # All tests
npm run test:coverage     # Coverage report
npm run test:unit         # Unit tests only

# Performance
npm run analyze           # Bundle analysis

# Build
npm run build             # Production build
npm run preview           # Preview build
```

---

## Documentation

### For Developers
- **[Distribution Architecture](docs/distribution-architecture.md)**: npm package map and dependency graph
- **[Test README](__tests__/README.md)**: Testing philosophy and architecture

### For AI Agents
- **`.claude/skills/`**: 6 comprehensive AI-optimized skills covering overview, setup, config, services, utils, and stores
- **Consistent Imports**: All packages from `@xbg.solutions/*`, components from `$lib/components/ui`, config from `$lib/config/app.config`
- **Decision Trees**: Built-in guardrails for routing, components, imports, and testing
- **Type Exports**: All interfaces exported for AI code generation
- **Predictable Structure**: Follow established patterns for reliable generation

### Backend Integration
- **[boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend)**: Companion backend boilerplate
- **Postman Integration**: Import API collections for automatic service generation
- **Mono-repo Support**: Direct backend access for full-stack development

---

## Project Status

- **677 Tests Passing**: Comprehensive behavioral test coverage
- **100% TypeScript**: Strict mode with full type safety
- **WCAG Level AA**: Accessibility compliance verified
- **Production Ready**: Deployment infrastructure complete
- **30+ Components**: Complete SHADCN atomic design system
- **npm Distribution**: Installable packages with semver updates
- **Agentic Workflows**: Built-in guardrails for AI agent development
- **Backend Compatible**: Pairs with [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend)

---

## Contributing

1. Follow existing patterns and conventions
2. Add tests for new functionality (behavioral testing principles)
3. Update documentation for any new features
4. Ensure accessibility compliance
5. Run full test suite before submitting

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

- **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/xbg-solutions/boilerplate_frontend/issues)
- **Discussions**: Community support via [GitHub Discussions](https://github.com/xbg-solutions/boilerplate_frontend/discussions)
- **Documentation**: AI skills in `.claude/skills/`, architecture docs in `docs/`
- **Website**: [https://xbg.solutions](https://xbg.solutions)

---

**Built with care by [XBG Solutions](https://xbg.solutions) for rapid MVP development and AI-assisted coding**

If this project helps you, please consider buying us a beer or two!
https://xbg.solutions/donations

---
