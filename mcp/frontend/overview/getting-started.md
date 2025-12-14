# Getting Started with SvelteKit 5 Boilerplate

**A comprehensive guide to building production-ready MVPs with agentic development patterns.**

This guide is designed for both human developers and AI agents to quickly understand and implement features using this boilerplate's constrained, opinionated architecture.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation & Setup](#installation--setup)
3. [Understanding the Agentic Architecture](#understanding-the-agentic-architecture)
4. [Configuration](#configuration)
5. [Building Your First Feature](#building-your-first-feature)
6. [Testing Your Implementation](#testing-your-implementation)
7. [Deployment](#deployment)
8. [Next Steps](#next-steps)

---

## Prerequisites

### Required Tools

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** for version control
- **Firebase Account** ([Create free](https://firebase.google.com/))

### Optional (for enhanced workflows)

- **Figma Account** (for design-to-code workflows)
- **Postman** (for API testing with backend)
- **Claude Code or Similar AI Assistant** (for agentic development)

### Backend Integration (Optional)

This frontend boilerplate is designed to work standalone OR with the companion backend:

- **Backend Repository**: [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend)
- **Mono-repo Setup**: Can be configured for direct backend access
- **API Integration**: Accepts Postman collections for automated API integration

---

## Installation & Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/xbg-solutions/boilerplate_frontend.git
cd boilerplate_frontend

# Install dependencies
npm install
```

### Step 2: Interactive Setup Wizard

The fastest way to configure your project:

```bash
npm run setup
```

The wizard will:
- Ask 6 simple questions about your project
- Auto-detect Firebase configuration (or help you enter it)
- Generate your `.env` file automatically
- Update `app.config.ts` with your values
- Validate everything works

### Step 3: Validate Configuration

```bash
# Run validation to ensure everything is configured correctly
npm run validate

# Or for a quick validation (skips build and tests)
npm run validate:quick
```

### Step 4: Start Development

```bash
npm run dev
```

Visit `http://localhost:5173` - you're ready to build! 🎉

---

## Understanding the Agentic Architecture

### What is Agentic Development?

This boilerplate is optimized for **AI-assisted development** where AI agents (like Claude) are the primary developers. The architecture is intentionally **constrained and opinionated** to:

1. **Reduce Decision Points**: Clear patterns eliminate ambiguity
2. **Enable One-Shot Success**: Consistent structure allows reliable code generation
3. **Railroad Implementations**: Opinionated choices guide agents to best practices
4. **Accelerate MVP Development**: From concept to production in days, not months

### The Constrained Development Model

```
Input Sources (What Agents Receive)
├── Figma Designs (via Figma MCP)
├── Image Mockups
├── Written Requirements
├── MoSCoW'ed User Journeys
├── Feature Specifications
└── Postman Collections (for backend APIs)

                ↓

Agent Workflow (Constrained Pipeline)
├── 1. Update Configuration (app.config.ts)
├── 2. Build Components (using SHADCN atoms)
├── 3. Build Routes/Pages (+page.svelte)
├── 4. Connect to Backend (if applicable)
└── 5. Generate Tests (behavioral patterns)

                ↓

Output (Production-Ready Code)
├── Type-safe TypeScript
├── Accessible Components (WCAG AA)
├── Tested Features (behavioral tests)
└── Deployable Application
```

### Key Architectural Constraints

#### 1. Single Configuration File
All configuration lives in **one place**: `src/lib/config/app.config.ts`

```typescript
export const APP_CONFIG = {
  app: { name, domain, supportEmail },
  firebase: { /* Firebase config */ },
  api: { baseUrl: { development, production } },
  features: { /* Feature flags */ }
}
```

**Why?** Agents know exactly where to update configuration - no hunting, no guessing.

#### 2. Atomic Components Only
30+ SHADCN components as **building blocks**, not pre-built pages.

```svelte
<!-- Agent composes these atoms into features -->
<script>
  import { Button, Card, Input } from '$lib/components/ui';
</script>

<Card>
  <Input label="Email" type="email" />
  <Button>Submit</Button>
</Card>
```

**Why?** Agents can reliably compose atoms. Pre-built pages are too opinionated and limit flexibility.

#### 3. Consistent Import Patterns

```typescript
// Components - ALWAYS from $lib/components/ui
import { Button, Card } from '$lib/components/ui';

// Config - ALWAYS from $lib/config/app.config
import { APP_CONFIG } from '$lib/config/app.config';

// Services - ALWAYS from $lib/services/*
import { authService } from '$lib/services/auth';

// Stores - ALWAYS from $lib/stores/*
import { userStore } from '$lib/stores/user.store';
```

**Why?** Predictable imports eliminate decision-making and ensure consistency.

#### 4. Route-Based Architecture

```
src/routes/
├── (auth)/              # Authentication routes
│   ├── login/
│   └── register/
├── (app)/               # Protected app routes
│   ├── dashboard/
│   └── profile/
└── (public)/            # Public routes
    ├── about/
    └── contact/
```

**Why?** Clear routing structure with built-in auth boundaries guides agents to correct placement.

#### 5. Behavioral Testing Patterns

Test **what users do**, not **how code works**:

```typescript
// ✅ Agent generates this pattern
test('user can submit contact form', async () => {
  render(ContactPage);

  await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
  await userEvent.type(screen.getByLabelText('Message'), 'Hello');
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));

  expect(screen.getByText('Message sent!')).toBeInTheDocument();
});
```

**Why?** Behavioral tests are more maintainable and align with actual user workflows.

---

## Configuration

### For Human Developers

Edit `src/lib/config/app.config.ts` directly or use the interactive wizard:

```bash
npm run setup
```

### For AI Agents

**When you receive project requirements, follow this configuration checklist:**

1. **Update App Identity**
   ```typescript
   app: {
     name: 'ProjectName',           // From requirements
     domain: 'projectname.com',     // From requirements
     supportEmail: 'support@projectname.com'
   }
   ```

2. **Configure Firebase** (if provided)
   ```typescript
   firebase: {
     projectId: 'firebase-project-id',
     apiKey: 'AIza...',
     // ... from Firebase console
   }
   ```

3. **Set API Endpoints** (if backend exists)
   ```typescript
   api: {
     baseUrl: {
       development: 'http://localhost:5001',
       production: 'https://api.projectname.com'
     }
   }
   ```

4. **Enable Features** (based on requirements)
   ```typescript
   features: {
     authentication: true,      // Does app need auth?
     emailVerification: true,   // Email verification?
     phoneVerification: false,  // Phone auth?
     analytics: true            // Track analytics?
   }
   ```

---

## Building Your First Feature

### Input: MoSCoW Requirements Example

```
Feature: User Dashboard

MUST HAVE:
- Display user profile information
- Show recent activity (last 5 items)
- Logout button

SHOULD HAVE:
- Edit profile button
- Activity filtering

COULD HAVE:
- Real-time activity updates
- Export activity log

WON'T HAVE:
- Social sharing
- Activity charts
```

### Agent Workflow

#### Step 1: Create the Route

```bash
npm run generate:route dashboard --auth --roles=user
```

This generates:
- `src/routes/(app)/dashboard/+page.svelte`
- `src/routes/(app)/dashboard/+page.ts` (with auth guard)
- `src/routes/(app)/dashboard/+page.test.ts` (test skeleton)

#### Step 2: Build the Component (in +page.svelte)

```svelte
<script lang="ts">
  import { Button, Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
  import { authService } from '$lib/services/auth';
  import { goto } from '$app/navigation';

  // Type-safe data from load function
  export let data;

  const user = authService.getUser();

  async function handleLogout() {
    await authService.signOut();
    goto('/login');
  }
</script>

<div class="container mx-auto py-8">
  <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

  <!-- MUST: Display user profile -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle>Profile</CardTitle>
    </CardHeader>
    <CardContent>
      {#if $user}
        <p><strong>Email:</strong> {$user.email}</p>
        <p><strong>UID:</strong> {$user.uid}</p>
      {/if}
    </CardContent>
  </Card>

  <!-- MUST: Show recent activity -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent>
      {#each data.recentActivity.slice(0, 5) as activity}
        <div class="py-2 border-b">
          <p>{activity.description}</p>
          <small class="text-muted-foreground">{activity.timestamp}</small>
        </div>
      {/each}
    </CardContent>
  </Card>

  <!-- MUST: Logout button -->
  <Button on:click={handleLogout}>Logout</Button>
</div>
```

#### Step 3: Add Load Function (in +page.ts)

```typescript
import { routeHandler } from '$lib/utils/route-handler';
import type { PageLoad } from './$types';

export const load: PageLoad = routeHandler.createLoadFunction({
  requireAuth: true,
  requiredRoles: ['user'],
  redirectTo: '/login',

  async loadData({ fetch }) {
    // Fetch from backend API or use mock data
    const response = await fetch('/api/activity/recent');
    const recentActivity = await response.json();

    return {
      recentActivity
    };
  }
});
```

#### Step 4: Connect to Backend (if applicable)

If you have a Postman collection or backend access:

```typescript
// src/lib/services/activity.service.ts
import { apiClient } from '$lib/utils/api-client';
import type { Activity } from '$lib/types/activity';

export const activityService = {
  async getRecentActivity(): Promise<Activity[]> {
    return apiClient.get<Activity[]>('/activity/recent');
  },

  async getActivityById(id: string): Promise<Activity> {
    return apiClient.get<Activity>(`/activity/${id}`);
  }
};
```

#### Step 5: Generate Tests

```typescript
// src/routes/(app)/dashboard/+page.test.ts
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import DashboardPage from './+page.svelte';
import { authService } from '$lib/services/auth';

describe('Dashboard Page', () => {
  const mockUser = { email: 'test@example.com', uid: '123' };
  const mockActivity = [
    { id: '1', description: 'Logged in', timestamp: '2025-01-01' },
    { id: '2', description: 'Updated profile', timestamp: '2025-01-02' }
  ];

  beforeEach(() => {
    vi.spyOn(authService, 'getUser').mockReturnValue({ subscribe: (fn) => fn(mockUser) });
  });

  test('displays user profile information', () => {
    render(DashboardPage, { data: { recentActivity: mockActivity } });

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  test('displays recent activity (last 5 items)', () => {
    render(DashboardPage, { data: { recentActivity: mockActivity } });

    expect(screen.getByText('Logged in')).toBeInTheDocument();
    expect(screen.getByText('Updated profile')).toBeInTheDocument();
  });

  test('user can logout', async () => {
    const signOutSpy = vi.spyOn(authService, 'signOut');
    render(DashboardPage, { data: { recentActivity: mockActivity } });

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

    expect(signOutSpy).toHaveBeenCalled();
  });
});
```

---

## Testing Your Implementation

### Run Tests

```bash
# All tests
npm test

# Watch mode (during development)
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm run test -- dashboard
```

### Test Quality Checklist

- ✅ Tests describe **user behavior**, not implementation
- ✅ Tests use **accessible queries** (getByRole, getByLabelText)
- ✅ Tests verify **MUST HAVE** requirements
- ✅ Tests are **independent** and can run in any order
- ✅ Tests have **clear descriptions** matching requirements

---

## Deployment

### Pre-Deployment Validation

```bash
# Full validation (includes build and tests)
npm run validate

# Check for any warnings or errors
npm run build
npm run lint
npm run typecheck
```

### Deploy to Firebase Hosting

```bash
# Build and deploy
npm run build
firebase deploy --only hosting
```

### Deploy to Vercel

```bash
# Connect your repo to Vercel
# Automatic deployments on git push
```

### Deploy to Netlify

```bash
npm run build
# Upload build/ folder or connect repository
```

See [deployment-guide.md](./deployment-guide.md) for detailed deployment instructions.

---

## Next Steps

### For Human Developers

1. **Explore Components**: Visit `/demo` route to see all 30+ SHADCN components
2. **Read Patterns**: Check [patterns.md](./patterns.md) for best practices
3. **Review Examples**: Study existing routes in `src/routes/`
4. **Customize Styles**: Edit `src/app.css` for brand colors

### For AI Agents

1. **Review [agentic-development-guide.md](./agentic-development-guide.md)**: Detailed agent workflow patterns
2. **Understand Constraints**: Study the architectural guardrails
3. **Practice Workflows**: Try building example features from requirements
4. **Learn Testing Patterns**: Master behavioral testing approaches

### Common Next Features

```bash
# User profile management
npm run generate:route profile --auth --with-load

# Admin dashboard
npm run generate:route admin/dashboard --auth --roles=admin

# Settings page
npm run generate:route settings --auth

# Public landing page
npm run generate:route landing --public
```

---

## Troubleshooting

### Setup Issues

**Firebase configuration not detected:**
```bash
# Manually enter Firebase config in .env
# Then run validation
npm run validate:quick
```

**Dependencies won't install:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Development Issues

**TypeScript errors:**
```bash
# Run typecheck to see all errors
npm run typecheck

# Most common: missing types in app.config.ts
# Check that all FIXME comments are resolved
```

**Tests failing:**
```bash
# Run specific test to see detailed error
npm run test -- <test-name>

# Common: Mock data not matching component expectations
# Check test data structures match component props
```

### Deployment Issues

**Build fails:**
```bash
# Check for linting errors
npm run lint

# Check for type errors
npm run typecheck

# Check for test failures
npm test
```

---

## Getting Help

- **Documentation**: Check the `__docs__/` folder for comprehensive guides
- **Issues**: Report bugs at [GitHub Issues](https://github.com/xbg-solutions/boilerplate_frontend/issues)
- **Discussions**: Ask questions at [GitHub Discussions](https://github.com/xbg-solutions/boilerplate_frontend/discussions)
- **Backend Integration**: See [boilerplate_backend docs](https://github.com/xbg-solutions/boilerplate_backend)

---

**Built for rapid MVP development with AI-assisted workflows by [XBG Solutions](https://xbg.solutions)**
