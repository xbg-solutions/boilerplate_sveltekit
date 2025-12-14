# Agentic Development Guide

**A comprehensive guide for AI agents building production-ready applications with this boilerplate.**

This document provides AI agents (Claude Code, Cursor, GitHub Copilot, etc.) with the patterns, constraints, and workflows needed to build MVPs and POCs with one-shot success.

---

## Table of Contents

1. [Philosophy: Constrained by Design](#philosophy-constrained-by-design)
2. [Input Sources & Processing](#input-sources--processing)
3. [The Development Pipeline](#the-development-pipeline)
4. [Decision Trees & Guardrails](#decision-trees--guardrails)
5. [Component Composition Patterns](#component-composition-patterns)
6. [Backend Integration Patterns](#backend-integration-patterns)
7. [Testing Patterns](#testing-patterns)
8. [Common Workflows](#common-workflows)
9. [Error Handling & Recovery](#error-handling--recovery)

---

## Philosophy: Constrained by Design

### Why Constraints Enable Success

Traditional development gives infinite choices. This boilerplate intentionally **removes choices** to:

1. **Eliminate Decision Paralysis**: One right way to do things
2. **Ensure Consistency**: All code follows the same patterns
3. **Enable Prediction**: You always know where things go
4. **Accelerate Development**: Less thinking, more building
5. **Guarantee Quality**: Constraints enforce best practices

### The Opinionated Stack

```
┌─────────────────────────────────────────┐
│         INPUTS (What You Receive)        │
├─────────────────────────────────────────┤
│ • Figma designs (via Figma MCP)         │
│ • Image mockups                          │
│ • Written requirements (MoSCoW)          │
│ • User journeys & workflows              │
│ • Postman collections                    │
│ • Backend API documentation              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      CONSTRAINTS (Your Guardrails)       │
├─────────────────────────────────────────┤
│ • Single config file (app.config.ts)    │
│ • 30 SHADCN atomic components ONLY       │
│ • Predictable import patterns            │
│ • Route-based architecture               │
│ • Behavioral testing patterns            │
│ • Type-safe TypeScript (strict mode)     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       OUTPUT (What You Produce)          │
├─────────────────────────────────────────┤
│ • Production-ready code                  │
│ • Accessible components (WCAG AA)        │
│ • Behavioral tests                       │
│ • Type-safe implementations              │
│ • Deployable application                 │
└─────────────────────────────────────────┘
```

---

## Input Sources & Processing

### 1. Figma Designs (via Figma MCP)

**What You Receive:**
- Figma file URL
- Component hierarchy
- Design tokens (colors, spacing, typography)
- Layout specifications

**How to Process:**

```typescript
// Step 1: Identify SHADCN components in the design
// Look for: Button, Card, Input, Dialog, etc.

// Step 2: Map Figma components to SHADCN atoms
const componentMapping = {
  'PrimaryButton': 'Button variant="default"',
  'SecondaryButton': 'Button variant="outline"',
  'FormInput': 'Input',
  'ContentCard': 'Card',
  // etc.
};

// Step 3: Generate the Svelte component
// Use ONLY the mapped SHADCN components
// NO custom components unless absolutely necessary
```

**Example Workflow:**

```svelte
<!-- Figma: Dashboard with user stats -->
<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
  import { Button } from '$lib/components/ui';
  import { Badge } from '$lib/components/ui';

  export let data;
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  {#each data.stats as stat}
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          {stat.title}
          <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'}>
            {stat.value}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-2xl font-bold">{stat.count}</p>
      </CardContent>
    </Card>
  {/each}
</div>
```

### 2. Image Mockups

**What You Receive:**
- PNG/JPG screenshots
- Hand-drawn sketches
- Wireframes

**How to Process:**

1. **Identify UI patterns**: Forms, lists, cards, modals, etc.
2. **Map to SHADCN components**: What atoms are needed?
3. **Extract layout structure**: Grid, flex, spacing
4. **Note interactive elements**: Buttons, inputs, links
5. **Build using only SHADCN atoms**: No custom UI components

### 3. Written Requirements (MoSCoW)

**What You Receive:**

```
Feature: User Profile Management

MUST HAVE:
- View profile information
- Edit name and email
- Change password
- Profile picture upload

SHOULD HAVE:
- Email notifications toggle
- Privacy settings
- Account deletion

COULD HAVE:
- Two-factor authentication
- Login history
- Connected accounts

WON'T HAVE:
- Social media sharing
- Public profiles
```

**How to Process:**

```typescript
// 1. Start with MUST HAVE only
// 2. Create route: npm run generate:route profile --auth
// 3. Build component using SHADCN atoms
// 4. Add SHOULD HAVE if time permits
// 5. Ignore COULD/WON'T for MVP

// Example implementation checklist:
const implementation = {
  mustHave: [
    'Display user data from authService',
    'Form with Input components for name/email',
    'Password change dialog',
    'File upload for profile picture'
  ],
  shouldHave: [
    'Toggle component for notifications',
    'Privacy settings section',
    'Delete account confirmation dialog'
  ]
};
```

### 4. Postman Collections

**What You Receive:**
- JSON file with API endpoints
- Request/response examples
- Authentication requirements

**How to Process:**

```typescript
// Step 1: Generate service file
// npm run generate:service <entity-name>

// Step 2: Implement API calls using apiClient utility
import { apiClient } from '$lib/utils/api-client';
import type { User, UpdateUserRequest } from '$lib/types/user';

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/user/profile');
  },

  async updateProfile(data: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>('/user/profile', data);
  },

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<{ url: string }>('/user/avatar', formData);
  }
};
```

---

## The Development Pipeline

### Phase 1: Configuration (2 minutes)

```bash
# Update app.config.ts with project details
```

```typescript
export const APP_CONFIG = {
  app: {
    name: 'ProjectName',        // From requirements
    domain: 'project.com',      // From requirements
    supportEmail: 'support@project.com'
  },
  features: {
    authentication: true,       // Does project need auth?
    emailVerification: true,    // Based on requirements
    phoneVerification: false,   // Based on requirements
    analytics: true             // Based on requirements
  }
};
```

### Phase 2: Route Generation (1 minute per route)

```bash
# Protected route
npm run generate:route dashboard --auth --roles=user --with-load

# Public route
npm run generate:route about --public

# Admin route
npm run generate:route admin/users --auth --roles=admin --with-load
```

**Decision Tree:**

```
Does route require authentication?
├─ YES → Use --auth flag
│   └─ Does it require specific roles?
│       ├─ YES → Add --roles=role1,role2
│       └─ NO → Defaults to 'user' role
│
└─ NO → Use --public flag
```

### Phase 3: Component Building (5-10 minutes per page)

**Golden Rule:** Use ONLY SHADCN components from `$lib/components/ui`

```svelte
<script lang="ts">
  // CORRECT imports
  import { Button, Card, Input, Dialog } from '$lib/components/ui';
  import { authService } from '$lib/services/auth';
  import { APP_CONFIG } from '$lib/config/app.config';

  // INCORRECT - never create custom UI components
  // import CustomButton from './CustomButton.svelte'; // ❌
</script>

<!-- Build using ONLY SHADCN atoms -->
<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <Input label="Name" bind:value={name} />
    <Input label="Email" type="email" bind:value={email} />
    <Button on:click={handleSave}>Save Changes</Button>
  </CardContent>
</Card>
```

### Phase 4: Backend Integration (3-5 minutes per service)

```typescript
// src/lib/services/<entity>.service.ts
import { apiClient } from '$lib/utils/api-client';
import type { Entity } from '$lib/types/<entity>';

export const entityService = {
  async getAll(): Promise<Entity[]> {
    return apiClient.get<Entity[]>('/entities');
  },

  async getById(id: string): Promise<Entity> {
    return apiClient.get<Entity>(`/entities/${id}`);
  },

  async create(data: Partial<Entity>): Promise<Entity> {
    return apiClient.post<Entity>('/entities', data);
  },

  async update(id: string, data: Partial<Entity>): Promise<Entity> {
    return apiClient.put<Entity>(`/entities/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/entities/${id}`);
  }
};
```

### Phase 5: Testing (5 minutes per feature)

```typescript
// Behavioral test pattern
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import PageComponent from './+page.svelte';

describe('Feature Name', () => {
  test('user can perform action', async () => {
    // Arrange: Setup test data
    const mockData = { /* ... */ };
    render(PageComponent, { data: mockData });

    // Act: Simulate user interaction
    await userEvent.type(screen.getByLabelText('Field'), 'value');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    // Assert: Verify outcome
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });
});
```

---

## Decision Trees & Guardrails

### Routing Decision Tree

```
What type of page are you building?
│
├─ Authentication-related (login, register, reset-password)
│   └─ Place in: src/routes/(auth)/[page-name]/
│       └─ Use layout: (auth) - NO navigation, centered forms
│
├─ Protected application page (dashboard, profile, settings)
│   └─ Place in: src/routes/(app)/[page-name]/
│       └─ Use layout: (app) - WITH navigation, auth required
│       └─ Add auth guard in +page.ts:
│           export const load = routeHandler.createLoadFunction({
│             requireAuth: true,
│             requiredRoles: ['user'] // or ['admin', 'moderator']
│           });
│
├─ Public page (about, contact, landing)
│   └─ Place in: src/routes/(public)/[page-name]/
│       └─ Use layout: (public) - WITH navigation, NO auth
│
└─ API endpoint
    └─ Place in: src/routes/api/[endpoint]/
        └─ Create +server.ts with GET/POST/PUT/DELETE handlers
```

### Component Selection Decision Tree

```
What UI element do you need?
│
├─ Form element?
│   ├─ Text input → <Input />
│   ├─ Large text → <Textarea />
│   ├─ Dropdown → <Select />
│   ├─ Checkbox → <Checkbox />
│   ├─ Radio buttons → <RadioGroup />
│   └─ Submit → <Button type="submit" />
│
├─ Content container?
│   ├─ Basic card → <Card><CardContent /></Card>
│   ├─ Card with header → <Card><CardHeader><CardTitle /></CardHeader><CardContent /></Card>
│   ├─ Modal → <Dialog />
│   ├─ Side panel → <Sheet />
│   └─ Collapsible → <Accordion />
│
├─ Navigation?
│   ├─ Tabs → <Tabs />
│   ├─ Breadcrumbs → <Breadcrumb />
│   └─ Pagination → <Pagination />
│
├─ Data display?
│   ├─ Table → <Table />
│   ├─ List → <ul> with <li> + SHADCN atoms
│   ├─ Badge/tag → <Badge />
│   ├─ Avatar → <Avatar />
│   └─ Progress → <Progress />
│
├─ Feedback?
│   ├─ Alert message → <Alert />
│   ├─ Toast notification → <Toast /> (use toast() function)
│   └─ Loading state → <LoadingOverlay /> or <Skeleton />
│
└─ Button/action?
    ├─ Primary action → <Button variant="default" />
    ├─ Secondary → <Button variant="outline" />
    ├─ Danger → <Button variant="destructive" />
    └─ Link style → <Button variant="link" />
```

### Import Decision Tree

```
What do you need to import?
│
├─ UI Component?
│   └─ import { ComponentName } from '$lib/components/ui';
│       Examples: Button, Card, Input, Dialog, etc.
│
├─ Configuration?
│   └─ import { APP_CONFIG } from '$lib/config/app.config';
│
├─ Service (API calls, business logic)?
│   └─ import { serviceName } from '$lib/services/[name]';
│       Examples: authService, userService, etc.
│
├─ Store (state management)?
│   └─ import { storeName } from '$lib/stores/[name].store';
│       Examples: userStore, themeStore, etc.
│
├─ Utility function?
│   └─ import { functionName } from '$lib/utils/[category]';
│       Examples: formatDate, validateEmail, etc.
│
├─ Type definition?
│   └─ import type { TypeName } from '$lib/types/[entity]';
│       Examples: User, Product, ApiResponse, etc.
│
└─ SvelteKit feature?
    └─ import { feature } from '@sveltejs/kit' or '$app/[module]';
        Examples: goto, page, navigating, etc.
```

---

## Component Composition Patterns

### Pattern 1: Simple Form

```svelte
<script lang="ts">
  import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '$lib/components/ui';

  let formData = { name: '', email: '' };

  async function handleSubmit() {
    // Form submission logic
  }
</script>

<Card class="max-w-md mx-auto">
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
  </CardHeader>
  <CardContent>
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <Input label="Name" bind:value={formData.name} required />
      <Input label="Email" type="email" bind:value={formData.email} required />
      <Button type="submit" class="w-full">Submit</Button>
    </form>
  </CardContent>
</Card>
```

### Pattern 2: List with Actions

```svelte
<script lang="ts">
  import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '$lib/components/ui';

  export let data;
</script>

<Card>
  <CardHeader>
    <CardTitle>Items ({data.items.length})</CardTitle>
  </CardHeader>
  <CardContent>
    <div class="space-y-2">
      {#each data.items as item}
        <div class="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p class="font-medium">{item.name}</p>
            <p class="text-sm text-muted-foreground">{item.description}</p>
          </div>
          <div class="flex gap-2">
            <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
              {item.status}
            </Badge>
            <Button variant="outline" size="sm" on:click={() => handleEdit(item.id)}>
              Edit
            </Button>
          </div>
        </div>
      {/each}
    </div>
  </CardContent>
</Card>
```

### Pattern 3: Modal/Dialog Form

```svelte
<script lang="ts">
  import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from '$lib/components/ui';

  let open = false;
  let formData = { name: '' };

  async function handleSave() {
    // Save logic
    open = false;
  }
</script>

<Button on:click={() => open = true}>Open Form</Button>

<Dialog bind:open>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Form Title</DialogTitle>
    </DialogHeader>

    <div class="space-y-4 py-4">
      <Input label="Name" bind:value={formData.name} />
    </div>

    <DialogFooter>
      <Button variant="outline" on:click={() => open = false}>Cancel</Button>
      <Button on:click={handleSave}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Pattern 4: Dashboard Grid

```svelte
<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent, Badge } from '$lib/components/ui';

  export let data;
</script>

<div class="container mx-auto py-8">
  <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    {#each data.stats as stat}
      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium">{stat.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-3xl font-bold">{stat.value}</p>
          <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'} class="mt-2">
            {stat.change}
          </Badge>
        </CardContent>
      </Card>
    {/each}
  </div>

  <!-- Recent Activity -->
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        {#each data.recentActivity as activity}
          <div class="flex justify-between items-center py-2 border-b">
            <div>
              <p class="font-medium">{activity.description}</p>
              <p class="text-sm text-muted-foreground">{activity.timestamp}</p>
            </div>
            <Badge>{activity.type}</Badge>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>
</div>
```

---

## Backend Integration Patterns

### Pattern 1: Simple GET Request

```typescript
// +page.ts
import { entityService } from '$lib/services/entity.service';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const items = await entityService.getAll();

  return {
    items
  };
};
```

### Pattern 2: Protected Route with Data

```typescript
// +page.ts
import { routeHandler } from '$lib/utils/route-handler';
import { userService } from '$lib/services/user.service';
import type { PageLoad } from './$types';

export const load: PageLoad = routeHandler.createLoadFunction({
  requireAuth: true,
  requiredRoles: ['user'],
  redirectTo: '/login',

  async loadData({ params, fetch }) {
    const profile = await userService.getProfile();
    const settings = await userService.getSettings();

    return {
      profile,
      settings
    };
  }
});
```

### Pattern 3: Form Submission with Error Handling

```svelte
<script lang="ts">
  import { Button, Input, Alert } from '$lib/components/ui';
  import { userService } from '$lib/services/user.service';

  let formData = { name: '', email: '' };
  let error = '';
  let loading = false;

  async function handleSubmit() {
    error = '';
    loading = true;

    try {
      await userService.updateProfile(formData);
      // Success handling (e.g., toast notification)
    } catch (err) {
      error = err.message || 'An error occurred';
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  {#if error}
    <Alert variant="destructive">{error}</Alert>
  {/if}

  <Input label="Name" bind:value={formData.name} />
  <Input label="Email" bind:value={formData.email} />
  <Button type="submit" disabled={loading}>
    {loading ? 'Saving...' : 'Save'}
  </Button>
</form>
```

---

## Testing Patterns

### Pattern 1: Component Rendering

```typescript
import { render, screen } from '@testing-library/svelte';
import Component from './Component.svelte';

test('renders component with data', () => {
  const mockData = { title: 'Test Title' };
  render(Component, { data: mockData });

  expect(screen.getByText('Test Title')).toBeInTheDocument();
});
```

### Pattern 2: User Interaction

```typescript
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import FormComponent from './Form.svelte';

test('user can submit form', async () => {
  render(FormComponent);

  await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
  await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

  expect(screen.getByText('Success!')).toBeInTheDocument();
});
```

### Pattern 3: Service Mocking

```typescript
import { render, screen } from '@testing-library/svelte';
import { vi } from 'vitest';
import { userService } from '$lib/services/user.service';
import ProfilePage from './+page.svelte';

test('displays user profile', async () => {
  const mockUser = { name: 'John Doe', email: 'john@example.com' };
  vi.spyOn(userService, 'getProfile').mockResolvedValue(mockUser);

  render(ProfilePage, { data: { profile: mockUser } });

  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});
```

---

## Common Workflows

### Workflow 1: Add New Entity

```bash
# 1. Generate service
npm run generate:service product

# 2. Define types
# Edit: src/lib/types/product.ts

# 3. Generate CRUD routes
npm run generate:route products --auth --with-load
npm run generate:route products/[id] --auth --with-load
npm run generate:route products/new --auth

# 4. Implement list page (products/+page.svelte)
# 5. Implement detail page (products/[id]/+page.svelte)
# 6. Implement create page (products/new/+page.svelte)
# 7. Add tests for each page
```

### Workflow 2: Add Authentication Flow

```bash
# Already built-in! Just configure:
# 1. Update firebase config in app.config.ts
# 2. Enable auth methods in Firebase console
# 3. Use authService in your routes

# Protected route example:
npm run generate:route dashboard --auth --roles=user
```

### Workflow 3: Integrate Backend API

```typescript
// 1. Create service file
// src/lib/services/api.service.ts

// 2. Use apiClient utility
import { apiClient } from '$lib/utils/api-client';

export const apiService = {
  async getData() {
    return apiClient.get('/endpoint');
  }
};

// 3. Use in +page.ts
export const load = async () => {
  const data = await apiService.getData();
  return { data };
};
```

---

## Error Handling & Recovery

### Common Errors & Solutions

**Error: "Cannot find module '$lib/components/ui'"**

```bash
# Solution: Check import path
# CORRECT:
import { Button } from '$lib/components/ui';

# INCORRECT:
import { Button } from '$lib/components/ui/button';
```

**Error: "Type error in component props"**

```typescript
// Solution: Define proper types
export let data: {
  items: Item[];
  total: number;
};
```

**Error: "Auth required but no user"**

```typescript
// Solution: Add auth guard
export const load = routeHandler.createLoadFunction({
  requireAuth: true,
  redirectTo: '/login'
});
```

### Recovery Patterns

```typescript
// Always wrap API calls in try-catch
try {
  const data = await service.getData();
  return { data };
} catch (error) {
  console.error('Error loading data:', error);
  return { data: [], error: error.message };
}
```

---

## Summary: The Agent's Checklist

For every feature you build:

- [ ] Updated `app.config.ts` if needed
- [ ] Generated route with correct flags (`--auth`, `--public`, `--roles`)
- [ ] Used ONLY SHADCN components from `$lib/components/ui`
- [ ] Followed consistent import patterns
- [ ] Added type definitions for data structures
- [ ] Implemented load function if data fetching needed
- [ ] Created service file if backend integration needed
- [ ] Added behavioral tests (not implementation tests)
- [ ] Verified accessibility (proper labels, ARIA attributes)
- [ ] Checked TypeScript compiles (`npm run typecheck`)
- [ ] Ran tests (`npm test`)

**One-shot success comes from following these patterns consistently.**

---

**Built for AI-first development by [XBG Solutions](https://xbg.solutions)**
