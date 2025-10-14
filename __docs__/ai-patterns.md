# AI Development Patterns

This document contains standardized patterns for AI systems to follow when generating code for this SvelteKit boilerplate.

## 🚀 Quick Start for AI Systems

### Configuration
- **Primary config file**: `src/lib/config/app.config.ts`
- **Search for customization**: Look for `FIXME:` comments
- **Import pattern**: `import { APP_CONFIG, configHelpers } from '$lib/config/app.config'`

### Component Library
- **Primary components**: SHADCN-Svelte (preferred)
- **Import pattern**: `import { Button, Card, CardContent } from '$lib/components/ui'`
- **Legacy components**: None (fully transitioned to SHADCN-Svelte)

## 📁 File Structure Patterns

```
src/
├── lib/
│   ├── config/           # THE central configuration
│   │   └── app.config.ts # Main config file - customize here
│   ├── components/       # Component library
│   │   ├── ui/          # SHADCN-Svelte components (preferred)
│   │   ├── auth/        # Authentication components
│   │   └── layout/      # Layout components
│   ├── services/        # Business logic services
│   │   ├── api/         # API communication
│   │   ├── auth/        # Authentication
│   │   └── events/      # Event system
│   ├── stores/          # Svelte stores
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript definitions
├── routes/              # SvelteKit routes
└── docs/                # Documentation
```

## 🎨 Component Patterns

### Button Usage
```typescript
// Standard button patterns
<Button>Default Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="destructive">Delete Item</Button>
<Button size="sm" loading>Processing...</Button>
```

### Card Layout Pattern
```typescript
// Standard card structure
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <!-- Main content -->
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Form Pattern
```typescript
// Standard form field pattern
<div class="space-y-2">
  <Label for="field-id">Field Label</Label>
  <Input id="field-id" placeholder="Placeholder text" bind:value />
</div>
```

## 📄 Page Patterns

### Layout Template Selection

**Choose layout based on page type:**

```
What type of page?
├─ Admin/Dashboard pages → DashboardLayout
├─ Forms/Authentication → FormLayout  
├─ Articles/Documentation → ContentLayout
└─ Simple pages → Default layout
```

### Dashboard Pages
```typescript
<script lang="ts">
  import { DashboardLayout } from '$lib/templates';
  import type { DashboardPageData } from '$lib/types/page-data';
  
  export let data: DashboardPageData;
  
  const navigation = [
    { label: 'Dashboard', href: '/dashboard', icon: 'home' },
    { label: 'Users', href: '/users', icon: 'users' }
  ];
</script>

<DashboardLayout {navigation} user={data.user}>
  <h1 slot="header">{data.title}</h1>
  
  <!-- Dashboard content -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Widgets/cards -->
  </div>
</DashboardLayout>
```

### Form Pages
```typescript
<script lang="ts">
  import { FormLayout } from '$lib/templates';
  import { Button, Input, Label } from '$lib/components/ui';
  
  let formData = { email: '', password: '' };
</script>

<FormLayout 
  title="Sign In" 
  description="Welcome back"
  showSidebar={true}
>
  <form slot="form" class="space-y-6">
    <div class="space-y-2">
      <Label for="email">Email</Label>
      <Input id="email" type="email" bind:value={formData.email} />
    </div>
    <Button type="submit" class="w-full">Sign In</Button>
  </form>
</FormLayout>
```

### Content Pages
```typescript
<script lang="ts">
  import { ContentLayout } from '$lib/templates';
  import type { ContentPageData } from '$lib/types/page-data';
  
  export let data: ContentPageData;
</script>

<ContentLayout
  title={data.title}
  subtitle={data.subtitle}
  showBreadcrumbs={true}
  showSidebar={true}
  author={data.author}
  publishDate={data.publishDate}
>
  <!-- Article content -->
  <div class="prose max-w-none">
    {@html data.content}
  </div>
</ContentLayout>
```

### Standard Page Structure (No Layout Template)
```typescript
<script lang="ts">
  // Imports
  import { Button, Card } from '$lib/components/ui';
  
  // Page data
  export let data: PageData;
  
  // Component state
  let loading = false;
  
  // Reactive statements
  $: console.log('Data updated:', data);
</script>

<svelte:head>
  <title>Page Title - {APP_CONFIG.project.name}</title>
</svelte:head>

<div class="container mx-auto p-6">
  <!-- Page content -->
</div>
```

### Layout Classes
- **Container**: `container mx-auto p-6`
- **Grid layouts**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **Spacing**: `space-y-4` for vertical, `space-x-4` for horizontal
- **Responsive**: Always include responsive breakpoints (`sm:`, `md:`, `lg:`)

## 🎯 Data Flow Patterns

### State Management Decision Tree

**When to use different data patterns:**

```
Need data? 
├─ Page-specific data?
│  ├─ Simple static data → Page data (load function)
│  ├─ Dynamic data → Page data + stores
│  └─ Complex state → Custom store + page data
├─ Global application state?
│  ├─ Authentication → authStore
│  ├─ UI state (theme, etc.) → uiStore  
│  ├─ Multi-page state → Custom store
│  └─ Real-time data → Store + SSE/WebSocket
├─ Form state?
│  ├─ Simple form → Local component state
│  ├─ Multi-step form → Form store
│  └─ Persistent drafts → Local storage + store
└─ Temporary/UI state?
   ├─ Modal visibility → Local component state
   ├─ Loading states → Local component state
   └─ Complex UI state → Derived stores
```

### Page Data Pattern
```typescript
// +page.ts - Use for initial page data
export async function load({ params, url, fetch }) {
  return {
    user: await getUser(),
    items: await getItems(),
    meta: {
      title: 'Page Title',
      description: 'Page description'
    }
  };
}

// +page.svelte  
import type { DashboardPageData } from '$lib/types/page-data';
export let data: DashboardPageData;
```

### Store Usage Pattern
```typescript
// Import stores
import { authStore } from '$lib/stores/auth.store';

// Use stores reactively
$: user = $authStore.user;
$: isAuthenticated = $authStore.isAuthenticated;

// Create derived stores for complex logic
import { derived } from 'svelte/store';
const userPermissions = derived(authStore, ($auth) => 
  $auth.user?.permissions || []
);
```

### API Call Pattern
```typescript
// Using the API service
import { apiService } from '$lib/services/api';

// GET request
const users = await apiService.get('/users');

// POST request with error handling
try {
  const newUser = await apiService.post('/users', userData);
} catch (error) {
  console.error('Failed to create user:', error);
}
```

## 🔧 Configuration Patterns

### Using Central Config
```typescript
import { APP_CONFIG, configHelpers } from '$lib/config/app.config';

// Check feature flags
if (configHelpers.isFeatureEnabled('authentication')) {
  // Feature is enabled
}

// Get API URL
const apiUrl = configHelpers.getApiUrl('/users');

// Get route
const dashboardUrl = configHelpers.getRoute('protected', 'dashboard');
```

### Environment-Specific Logic
```typescript
import { COMPUTED_CONFIG } from '$lib/config/app.config';

// Check environment
if (COMPUTED_CONFIG.environment === 'development') {
  console.log('Development mode');
}

// Use computed values
const apiBaseUrl = COMPUTED_CONFIG.apiBaseUrl;
```

## 🛡️ Authentication Patterns

### Route Protection
```typescript
// +page.ts for protected routes
import { redirect } from '@sveltejs/kit';
import { authService } from '$lib/services/auth';

export async function load({ url }) {
  if (!await authService.isAuthenticated()) {
    throw redirect(302, `/?returnUrl=${encodeURIComponent(url.pathname)}`);
  }
  
  return {};
}
```

### Role-Based Access
```typescript
import { configHelpers } from '$lib/config/app.config';

// Check user roles
const userRoles = ['user', 'admin'];
const hasAdminAccess = configHelpers.userHasRole(userRoles, 'admin');
```

## 🗺️ Routing & Navigation Patterns

### Using Routes Configuration
```typescript
// Import route helpers
import { RouteHelper } from '$lib/config/routes.config';

// Generate navigation for dashboard
const navigation = RouteHelper.getDashboardNavigation(userRoles, userPermissions);

// Check route access
const hasAccess = RouteHelper.hasAccess('/admin/users', userRoles, userPermissions);

// Generate URLs with parameters
const userUrl = RouteHelper.generateUrl('user-detail', { id: '123' });

// Get breadcrumbs
const breadcrumbs = RouteHelper.getBreadcrumbs('/dashboard/users/123');
```

### Navigation Generation
```typescript
<script lang="ts">
  import { RouteHelper } from '$lib/config/routes.config';
  import { authStore } from '$lib/stores/auth.store';
  
  // Generate navigation based on user permissions
  $: navigation = RouteHelper.getDashboardNavigation(
    $authStore.user?.roles || [],
    $authStore.user?.permissions || []
  );
</script>

<!-- Use with DashboardLayout -->
<DashboardLayout {navigation} user={$authStore.user}>
  <!-- Page content -->
</DashboardLayout>
```

### Route Metadata & SEO
```typescript
// +page.ts - Add SEO metadata from routes config
import { RouteHelper } from '$lib/config/routes.config';

export async function load({ url }) {
  const routeMeta = RouteHelper.getRouteMeta(url.pathname);
  
  return {
    meta: routeMeta || {
      title: 'Default Title',
      description: 'Default description'
    }
  };
}
```

## 🎨 Styling Patterns

### Color Usage
```css
/* Use semantic color tokens */
bg-background text-foreground
bg-card text-card-foreground  
bg-primary text-primary-foreground
text-muted-foreground
border-border
```

### Component Styling
```typescript
// Use cn() utility for conditional classes
import { cn } from '$lib/utils/cn';

const buttonClass = cn(
  'base-button-styles',
  isActive && 'active-styles',
  className
);
```

## 📱 Responsive Patterns

### Breakpoint Strategy
- **Mobile first**: Start with mobile styles
- **Standard breakpoints**: `sm:`, `md:`, `lg:`, `xl:`
- **Grid patterns**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Hide/show**: `hidden md:block`, `md:hidden`

### Layout Patterns
```html
<!-- Responsive container -->
<div class="container mx-auto px-4 sm:px-6 lg:px-8">

<!-- Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

<!-- Responsive text -->
<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold">
```

## 🧪 Testing Patterns

### Component Testing
```typescript
import { render, screen } from '@testing-library/svelte';
import Button from '$lib/components/ui/Button.svelte';

test('renders button with text', () => {
  render(Button, { props: { children: 'Click me' } });
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

### Service Testing
```typescript
import { apiService } from '$lib/services/api';

// Mock the service in tests
vi.mock('$lib/services/api');
```

## 🚨 Error Handling Patterns

### API Error Handling
```typescript
import { handleError } from '$lib/utils/error-handler';

try {
  const result = await apiService.post('/api/data', payload);
  return result;
} catch (error) {
  handleError(error, 'Failed to save data');
  throw error;
}
```

### Form Validation
```typescript
// Use validation with clear error messages
let errors: Record<string, string> = {};

function validateForm() {
  errors = {};
  
  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';
  
  return Object.keys(errors).length === 0;
}
```

## 🎯 Performance Patterns

### Lazy Loading
```typescript
// Dynamic component imports
const HeavyComponent = lazy(() => import('./HeavyComponent.svelte'));
```

### Reactive Optimization
```typescript
// Expensive computations
$: expensiveResult = expensive && computeExpensiveValue(data);

// Debounced reactions
$: debouncedSearch = debounce(searchTerm, 300);
```

## 📋 Code Quality Standards

### Import Organization
```typescript
// 1. Svelte/SvelteKit imports
import { onMount } from 'svelte';
import { goto } from '$app/navigation';

// 2. External libraries
import { clsx } from 'clsx';

// 3. Internal imports (grouped by type)
import { Button } from '$lib/components/ui';
import { apiService } from '$lib/services/api';
import { authStore } from '$lib/stores/auth.store';
import type { PageData } from './$types';
```

### TypeScript Usage
- Always use TypeScript
- Export types from components when needed
- Use proper generic types for API responses
- Define interfaces for complex data structures

### Naming Conventions
- **Components**: PascalCase (`Button.svelte`)
- **Files**: kebab-case (`api-service.ts`)
- **Variables**: camelCase (`isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- **CSS classes**: Use semantic names and Tailwind utilities

## ✅ AI System Checklist

When generating code, ensure:

**Component & Library Usage:**
- [ ] Use SHADCN-Svelte components (not legacy ones)
- [ ] Import from central config (`APP_CONFIG`)
- [ ] Use the `cn()` utility for class merging
- [ ] Include accessibility attributes

**Architecture & Structure:**
- [ ] Follow the file structure patterns
- [ ] Use appropriate layout templates (Dashboard/Form/Content)
- [ ] Import proper page data types from `$lib/types/page-data`
- [ ] Use routes configuration for navigation and metadata
- [ ] Follow the state management decision tree

**TypeScript & Data Flow:**
- [ ] Include proper TypeScript types
- [ ] Use established data flow patterns
- [ ] Apply proper store patterns based on use case
- [ ] Include loading and error states

**Styling & Responsive:**
- [ ] Use semantic color tokens
- [ ] Include responsive design breakpoints
- [ ] Follow layout classes patterns
- [ ] Use Tailwind utilities correctly

**Quality & Standards:**
- [ ] Add proper error handling
- [ ] Follow established naming conventions
- [ ] Include proper documentation/comments
- [ ] Organize imports correctly (Svelte → External → Internal)

**Route & Navigation:**
- [ ] Use RouteHelper for navigation generation
- [ ] Include proper route protection patterns
- [ ] Add SEO metadata from route configuration
- [ ] Generate breadcrumbs using RouteHelper

**Layout Templates:**
- [ ] Choose appropriate layout based on page type
- [ ] Use correct props and slots for layouts
- [ ] Include proper page data interfaces
- [ ] Follow responsive layout patterns

This ensures all generated code integrates seamlessly with the existing boilerplate patterns and Phase 2 architectural improvements.