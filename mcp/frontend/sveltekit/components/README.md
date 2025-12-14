# SvelteKit Components Documentation

Comprehensive documentation for all UI components in the application.

This documentation covers the 80+ components including SHADCN-Svelte atomic components and custom application components.

## Overview

The component library consists of atomic, accessible, and customizable UI components built on SHADCN-Svelte, plus custom application components for authentication, layout, animations, and advanced features.

### Component Philosophy
- **Atomic Design**: SHADCN components are building blocks
- **Composition Over Configuration**: Combine simple components into complex UIs
- **Accessibility First**: WCAG Level AA compliance built-in
- **Type Safety**: Full TypeScript support
- **Customizable**: Tailwind CSS for styling
- **Consistent**: Predictable API across all components

## Component Categories

### [UI Components](./overview.md)
**SHADCN-Svelte atomic component library - 30+ components**

Foundation components for all user interfaces:
- **Form Components**: Button, Input, Checkbox, RadioGroup, Select, Label, Textarea, Switch
- **Layout Components**: Card, Separator, Tabs, Accordion, Dialog, Sheet
- **Data Display**: Table, Badge, Avatar, Skeleton, Tooltip
- **Feedback**: Alert, Progress, Toast
- **Navigation**: Breadcrumb, Pagination, NavigationMenu, DropdownMenu
- **Advanced**: Command, Popover, ContextMenu, Calendar, Slider

**See [overview.md](./overview.md) for complete SHADCN component reference.**

---

### Authentication Components
**User authentication flows - 2 components**

- **EmailLinkAuth**: Passwordless email authentication with magic links
- **PhoneAuth**: SMS-based phone number authentication with verification

**Use When**: Implementing authentication flows, login/signup pages

---

### Layout Components
**Application structure and navigation - 9 components**

- **HeaderNav**: Responsive navigation header with RBAC support
- **PageHeader**: Page title and breadcrumb component
- **PageFooter**: Application footer component
- **Seo**: Meta tags and SEO optimization component
- **PageTransition**: Smooth page navigation transitions
- **ClientOnly**: Client-side only rendering wrapper
- **DeferredRender**: Lazy rendering for performance
- **AuthGuard**: Route protection wrapper component
- **AppInitializer**: Application initialization orchestrator

**Use When**: Building page layouts, navigation, SEO, route protection

---

### Animation Components
**Transition and animation wrappers - 6 components**

- **FadeTransition**: Fade in/out effects for elements
- **SlideTransition**: Sliding animations (up, down, left, right)
- **ScaleTransition**: Zoom/scale effects
- **FlipTransition**: FLIP technique animations
- **StaggeredAnimation**: Staggered list entrance animations
- **PageTransition**: Page-to-page navigation effects

**Use When**: Adding polish, transitions, entrance/exit animations

---

### Advanced Components
**Complex feature-rich components - 4 components**

- **DataTable**: Full-featured data table with sorting, filtering, pagination, selection
- **FormWizard**: Multi-step form wizard with validation and progress
- **ImageUpload**: Image upload with preview, cropping, and Firebase Storage
- **ChartWrapper**: Chart.js integration wrapper for data visualization

**Use When**: Complex data tables, multi-step forms, file uploads, charts

---

### Diagnostic Components
**Application monitoring and debugging - 1 component**

- **InitializationStatus**: Real-time service initialization progress display

**Use When**: Debugging initialization issues, development monitoring

---

### Error Handling Components
**Error display and boundaries - 4 components**

- **ErrorDisplay**: Generic error display with retry functionality
- **ErrorBoundary**: Component tree error catching and recovery
- **ErrorBoundaryTest**: Development testing tool for error boundaries

**Use When**: Error handling, resilient component trees, development testing

## Component Count Summary

| Category | Components | Description |
|----------|-----------|-------------|
| **UI (SHADCN)** | 30+ | Atomic form, layout, data, navigation components |
| **Authentication** | 2 | Email link and phone authentication flows |
| **Layout** | 9 | Page structure, navigation, SEO, guards |
| **Animations** | 6 | Transitions and entrance/exit effects |
| **Advanced** | 4 | Data tables, forms, uploads, charts |
| **Diagnostics** | 1 | Initialization status monitoring |
| **Error Handling** | 4 | Error display and boundaries |
| **Total** | **56+** | Plus 30+ SHADCN components |

## Import Patterns

### SHADCN UI Components

```typescript
// Individual imports (recommended)
import { Button } from '$lib/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
```

### Application Components

```typescript
// Layout components
import { HeaderNav } from '$lib/components/layout/HeaderNav.svelte';
import { AuthGuard } from '$lib/components/layout/AuthGuard.svelte';
import { PageHeader } from '$lib/components/layout/PageHeader.svelte';

// Animation components
import { FadeTransition } from '$lib/components/animations/FadeTransition.svelte';
import { SlideTransition } from '$lib/components/animations/SlideTransition.svelte';

// Advanced components
import { DataTable } from '$lib/components/advanced/DataTable.svelte';
import { FormWizard } from '$lib/components/advanced/FormWizard.svelte';

// Error handling
import { ErrorBoundary } from '$lib/components/error-boundary/ErrorBoundary.svelte';
```

## Common Usage Patterns

### Basic Form Pattern

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '$lib/components/ui/card';

  let email = '';
  let password = '';

  async function handleSubmit() {
    // Handle form submission
  }
</script>

<Card class="w-full max-w-md">
  <CardHeader>
    <CardTitle>Sign In</CardTitle>
  </CardHeader>
  <CardContent class="space-y-4">
    <div>
      <Label for="email">Email</Label>
      <Input id="email" type="email" bind:value={email} />
    </div>
    <div>
      <Label for="password">Password</Label>
      <Input id="password" type="password" bind:value={password} />
    </div>
  </CardContent>
  <CardFooter>
    <Button on:click={handleSubmit}>Sign In</Button>
  </CardFooter>
</Card>
```

### Protected Page Pattern

```svelte
<script lang="ts">
  import { AuthGuard } from '$lib/components/layout/AuthGuard.svelte';
  import { PageHeader } from '$lib/components/layout/PageHeader.svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { DataTable } from '$lib/components/advanced/DataTable.svelte';
</script>

<AuthGuard requiredRoles={['admin']}>
  <PageHeader title="Admin Dashboard" />

  <Card>
    <CardContent>
      <DataTable {data} {columns} />
    </CardContent>
  </Card>
</AuthGuard>
```

### Animated Content Pattern

```svelte
<script lang="ts">
  import { FadeTransition } from '$lib/components/animations/FadeTransition.svelte';
  import { SlideTransition } from '$lib/components/animations/SlideTransition.svelte';
  import { Card } from '$lib/components/ui/card';

  let show = true;
</script>

<FadeTransition {show}>
  <SlideTransition direction="up">
    <Card>
      <!-- Animated content -->
    </Card>
  </SlideTransition>
</FadeTransition>
```

### Error Boundary Pattern

```svelte
<script lang="ts">
  import { ErrorBoundary } from '$lib/components/error-boundary/ErrorBoundary.svelte';
  import { ClientOnly } from '$lib/components/layout/ClientOnly.svelte';

  function handleError(error) {
    console.error('Component error:', error);
  }
</script>

<ErrorBoundary onError={handleError}>
  <ClientOnly>
    <ComplexComponent />
  </ClientOnly>
</ErrorBoundary>
```

### Data Display Pattern

```svelte
<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '$lib/components/ui/table';
  import { Badge } from '$lib/components/ui/badge';
  import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';

  export let users;
</script>

<Card>
  <CardHeader>
    <CardTitle>Users</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each users as user}
          <TableRow>
            <TableCell class="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              {user.name}
            </TableCell>
            <TableCell>
              <Badge variant={user.active ? 'default' : 'secondary'}>
                {user.status}
              </Badge>
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

## Component Selection Guide

### For Forms
- Simple form: `Button`, `Input`, `Label`, `Checkbox`
- Complex form: `FormWizard` component
- File upload: `ImageUpload` component
- Select options: `Select`, `RadioGroup`, `Checkbox`

### For Layout
- Page structure: `HeaderNav`, `PageHeader`, `PageFooter`
- Content cards: `Card` with sub-components
- Modals: `Dialog` or `Sheet`
- Tabs: `Tabs` component
- Protected routes: `AuthGuard`

### For Data Display
- Simple lists: `Card` + custom layout
- Complex tables: `DataTable` component
- Status indicators: `Badge`, `Progress`
- User info: `Avatar`
- Charts: `ChartWrapper` component

### For Navigation
- Top nav: `HeaderNav`
- Breadcrumbs: `Breadcrumb` component
- Pagination: `Pagination` component
- Dropdown menus: `DropdownMenu`

### For Feedback
- Notifications: `Toast` (via toast service)
- Errors: `ErrorDisplay`, `ErrorBoundary`
- Loading: `Skeleton`, `Progress`
- Alerts: `Alert` component

### For Animations
- Fade effects: `FadeTransition`
- Slide effects: `SlideTransition`
- Scale effects: `ScaleTransition`
- Page transitions: `PageTransition`
- List animations: `StaggeredAnimation`

## Best Practices

### Component Usage
1. **Start with SHADCN components** for atomic UI elements
2. **Use layout components** for page structure
3. **Wrap with ErrorBoundary** for resilience
4. **Add animations** for polish (optional)
5. **Use advanced components** for complex features

### Performance
1. **Import only what you need** for better tree-shaking
2. **Use ClientOnly** for client-side only components
3. **Use DeferredRender** for below-the-fold content
4. **Lazy load heavy components** when possible
5. **Keep component trees shallow**

### Accessibility
1. **Always provide labels** for form inputs
2. **Use semantic HTML** elements
3. **Test keyboard navigation**
4. **Ensure color contrast** (WCAG AA)
5. **Provide alt text** for images

### Styling
1. **Use Tailwind utilities** for styling
2. **Use cn() utility** for conditional classes
3. **Follow design system** tokens
4. **Maintain consistency** across components
5. **Support dark mode** with dark: variants

### Testing
1. **Test user behavior**, not implementation
2. **Use @testing-library/svelte** for component tests
3. **Mock external dependencies**
4. **Test accessibility** with axe
5. **Test keyboard interactions**

## Component Integration

### With Services
```typescript
// Components use services for business logic
import { authService } from '$lib/services/auth';
import { toast } from '$lib/services/toast';

async function handleAction() {
  try {
    await authService.signIn(email, password);
    toast.success('Signed in successfully!');
  } catch (error) {
    toast.error('Sign in failed');
  }
}
```

### With Stores
```svelte
<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { Button } from '$lib/components/ui/button';

  // Reactive subscription
  $: user = $authStore.user;
  $: isAuthenticated = $authStore.isAuthenticated;
</script>

{#if isAuthenticated}
  <p>Welcome, {user.displayName}!</p>
{:else}
  <Button>Sign In</Button>
{/if}
```

### With Utils
```svelte
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { sanitize } from '$lib/utils/sanitizer';

  export let className = '';
  let isActive = false;
  let userInput = '';

  $: cleanInput = sanitize(userInput);
</script>

<div class={cn('base-classes', isActive && 'active', className)}>
  {cleanInput}
</div>
```

## Documentation Structure

Each component category documentation includes:

1. **Component Overview** - Purpose and use cases
2. **Props/API** - All available properties with types
3. **Events** - Custom events dispatched
4. **Usage Examples** - Code snippets and patterns
5. **Features** - Key capabilities
6. **Integration Patterns** - Combining components
7. **Best Practices** - Recommendations
8. **Accessibility** - A11y considerations

## Testing Components

### Unit Test Pattern

```typescript
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent.svelte';

test('component renders and handles interaction', async () => {
  const user = userEvent.setup();

  render(MyComponent, { props: { title: 'Test' } });

  expect(screen.getByText('Test')).toBeInTheDocument();

  await user.click(screen.getByRole('button'));

  expect(screen.getByText('Clicked')).toBeInTheDocument();
});
```

## File Locations

**Component Implementations**: `src/lib/components/`
- `src/lib/components/ui/` - SHADCN components
- `src/lib/components/layout/` - Layout components
- `src/lib/components/animations/` - Animation components
- `src/lib/components/advanced/` - Advanced components
- `src/lib/components/auth/` - Authentication components
- `src/lib/components/error-boundary/` - Error handling

**Component Documentation**: `mcp/frontend/sveltekit/components/`
**Component Tests**: `__tests__/components/`

## Additional Resources

- [SHADCN Component Overview](./overview.md) - Complete SHADCN reference
- [SHADCN-Svelte Documentation](https://www.shadcn-svelte.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Svelte Documentation](https://svelte.dev/docs)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

## For AI Agents

When generating component code:
1. **Import from correct paths** (`$lib/components/ui`, `$lib/components/layout`, etc.)
2. **Follow TypeScript** patterns with proper types
3. **Use SHADCN components** as building blocks
4. **Wrap with ErrorBoundary** for error handling
5. **Add accessibility** attributes (labels, aria, roles)
6. **Test behavior** with @testing-library/svelte
7. **Follow existing patterns** from documentation

---

**All components are designed to work together seamlessly with consistent APIs, styling, and accessibility.**

Last updated: 2025-12-14
