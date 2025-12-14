# Layout Components

Components for application structure, navigation, SEO, and page composition.

## Components

### HeaderNav

Responsive navigation header with authentication state awareness.

**Location**: `$lib/components/layout/HeaderNav.svelte`

**Props:**
- `isAuthenticated`: boolean - Current authentication state
- `claims`: any - User claims for role-based navigation

**Features:**
- Responsive design (mobile hamburger menu + desktop nav)
- Role-based navigation items (RBAC integration)
- Active route highlighting
- Logout functionality with multiple fallbacks
- Mobile menu toggle

**Usage:**
```svelte
<script>
  import { HeaderNav } from '$lib/components/layout';
  import { authStore } from '$lib/stores/auth.store';
</script>

<HeaderNav
  isAuthenticated={$authStore.isAuthenticated}
  claims={$authStore.claims}
/>
```

**Navigation Items:**
- Common: Home
- Authenticated: Dashboard, role-specific routes, Logout
- Role-based: Client Area (client role), Consultant Area (consultant role)

### PageHeader

Page title and breadcrumb section.

**Location**: `$lib/components/layout/PageHeader.svelte`

**Props:**
- `title`: string - Page title
- `subtitle`: string - Optional subtitle
- `breadcrumbs`: Array<{label, href}> - Navigation breadcrumbs

**Usage:**
```svelte
<PageHeader
  title="Dashboard"
  subtitle="Welcome back"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' }
  ]}
/>
```

### PageFooter

Application footer with links and copyright.

**Location**: `$lib/components/layout/PageFooter.svelte`

**Usage:**
```svelte
<PageFooter />
```

### Seo

Meta tags and SEO optimization component.

**Location**: `$lib/components/layout/Seo.svelte`

**Props:**
- `title`: string - Page title
- `description`: string - Meta description
- `image`: string - Open Graph image
- `url`: string - Canonical URL
- `keywords`: string[] - SEO keywords
- `noindex`: boolean - Prevent search indexing

**Usage:**
```svelte
<script>
  import { Seo } from '$lib/components/layout';
</script>

<Seo
  title="My Page | App Name"
  description="Page description for search engines"
  image="/og-image.jpg"
  keywords={['svelte', 'sveltekit', 'boilerplate']}
/>
```

**Generated Tags:**
- `<title>`
- Meta description
- Open Graph tags (Facebook)
- Twitter Card tags
- Canonical URL
- Keywords

### PageTransition

Page navigation transitions.

**Location**: `$lib/components/layout/PageTransition.svelte`

**Props:**
- `duration`: number - Transition duration in ms
- `easing`: EasingFunction - Svelte easing function

**Usage:**
```svelte
<PageTransition duration={300}>
  <slot />
</PageTransition>
```

### ClientOnly

Render components only on the client side (skip SSR).

**Location**: `$lib/components/layout/ClientOnly.svelte`

**Props:**
- `fallback`: string - Optional SSR fallback content

**Usage:**
```svelte
<script>
  import { ClientOnly } from '$lib/components/layout';
  import HeavyComponent from './HeavyComponent.svelte';
</script>

<ClientOnly fallback="Loading...">
  <HeavyComponent />
</ClientOnly>
```

**Use Cases:**
- Browser-only APIs (localStorage, window)
- Heavy client-side components
- Third-party libraries without SSR support

### DeferredRender

Lazy render content after initial page load.

**Location**: `$lib/components/layout/DeferredRender.svelte`

**Props:**
- `delay`: number - Delay before rendering (ms)
- `condition`: boolean - Conditional rendering flag

**Usage:**
```svelte
<DeferredRender delay={500}>
  <ExpensiveComponent />
</DeferredRender>
```

**Benefits:**
- Improves initial page load performance
- Defers non-critical content
- Reduces Time to Interactive

### AuthGuard

Route protection component for authenticated pages.

**Location**: `$lib/components/layout/AuthGuard.svelte`

**Props:**
- `redirectTo`: string - Redirect URL if not authenticated (default: '/login')
- `requiredRoles`: string[] - Required roles for access
- `requireAll`: boolean - Require all roles vs any role

**Usage:**
```svelte
<script>
  import { AuthGuard } from '$lib/components/layout';
</script>

<AuthGuard redirectTo="/signin" requiredRoles={['admin']}>
  <ProtectedContent />
</AuthGuard>
```

**Features:**
- Automatic authentication checking
- Role-based access control
- Redirect to login if unauthorized
- Loading state handling

### AppInitializer

Application initialization and setup component.

**Location**: `$lib/components/layout/AppInitializer.svelte`

**Purpose:**
- Initialize Firebase services
- Set up auth state listeners
- Load user data
- Initialize stores

**Usage:**
```svelte
<!-- In root +layout.svelte -->
<script>
  import { AppInitializer } from '$lib/components/layout';
</script>

<AppInitializer>
  <slot />
</AppInitializer>
```

## Layout Patterns

### Basic App Layout

```svelte
<script>
  import {
    HeaderNav,
    PageFooter,
    AppInitializer,
    Seo
  } from '$lib/components/layout';
  import { authStore } from '$lib/stores/auth.store';
</script>

<AppInitializer>
  <Seo title="My App" description="App description" />

  <div class="app-layout">
    <HeaderNav
      isAuthenticated={$authStore.isAuthenticated}
      claims={$authStore.claims}
    />

    <main>
      <slot />
    </main>

    <PageFooter />
  </div>
</AppInitializer>
```

### Protected Page Layout

```svelte
<script>
  import { AuthGuard, PageHeader, Seo } from '$lib/components/layout';
</script>

<AuthGuard requiredRoles={['user']}>
  <Seo title="Dashboard" />
  <PageHeader title="Dashboard" />

  <div class="container">
    <slot />
  </div>
</AuthGuard>
```

### Performance-Optimized Layout

```svelte
<script>
  import {
    ClientOnly,
    DeferredRender,
    PageTransition
  } from '$lib/components/layout';
</script>

<PageTransition>
  <!-- Critical content -->
  <CriticalContent />

  <!-- Client-only content -->
  <ClientOnly>
    <BrowserOnlyComponent />
  </ClientOnly>

  <!-- Deferred content -->
  <DeferredRender delay={1000}>
    <NonCriticalContent />
  </DeferredRender>
</PageTransition>
```

## RBAC Integration

HeaderNav integrates with RBAC utilities:

```svelte
<script>
  import { rbacUtil } from '$lib/utils/rbac';

  // In component
  {#if rbacUtil.hasRole(claims, 'admin')}
    <a href="/admin">Admin Panel</a>
  {/if}
</script>
```

## Responsive Design

Components are mobile-first:
- HeaderNav: Hamburger menu < 768px, horizontal menu >= 768px
- Breakpoints: `sm:`, `md:`, `lg:` Tailwind classes
- Touch-friendly interactive elements

## Accessibility

- Semantic HTML5 elements (`<nav>`, `<main>`, `<footer>`)
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Screen reader announcements

## Best Practices

1. **Always use AppInitializer** at app root
2. **Set SEO meta tags** on every page
3. **Use AuthGuard** for protected routes
4. **Implement ClientOnly** for browser APIs
5. **Defer non-critical content** for performance
6. **Provide RBAC claims** to HeaderNav
7. **Use PageTransition** for smooth navigation

## Component Count: 9

- HeaderNav
- PageHeader
- PageFooter
- Seo
- PageTransition
- ClientOnly
- DeferredRender
- AuthGuard
- AppInitializer
