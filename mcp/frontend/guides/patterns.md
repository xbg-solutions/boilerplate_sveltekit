# 🎯 Development Patterns & Best Practices

Common patterns and architectural practices used in this SvelteKit 5 boilerplate.

## Authentication Patterns

### Protected Routes

```svelte
<!-- src/routes/dashboard/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { authGuard } from '$lib/utils/auth-guard';
  import { onMount } from 'svelte';
  
  onMount(() => {
    // Protect this entire route tree
    authGuard({
      requiredRoles: ['user'],
      redirectTo: '/login',
      currentPath: $page.url.pathname
    });
  });
</script>

<div class="min-h-screen bg-gray-50">
  <nav class="bg-white shadow">
    <!-- Navigation for authenticated users -->
  </nav>
  
  <main class="container mx-auto py-6">
    <slot />
  </main>
</div>
```

### Role-Based Access Control

```svelte
<script lang="ts">
  import { authService } from '$lib/services/auth';
  import { hasPermission } from '$lib/utils/rbac';
  
  const userClaims = authService.getUserClaims();
  
  // Check permissions
  $: canEditUsers = hasPermission($userClaims, 'manageUsers');
  $: canViewAnalytics = hasPermission($userClaims, 'viewAnalytics');
</script>

<!-- Conditional rendering based on permissions -->
{#if canEditUsers}
  <Button href="/admin/users">Manage Users</Button>
{/if}

{#if canViewAnalytics}
  <Card>
    <CardHeader>
      <CardTitle>Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Analytics content -->
    </CardContent>
  </Card>
{/if}
```

## API Integration Patterns

### API Service Usage

```svelte
<script lang="ts">
  import { apiService } from '$lib/services/api';
  import { toast } from '$lib/services/toast';
  import { handleError } from '$lib/utils/error-handler';
  
  interface User {
    id: string;
    name: string;
    email: string;
  }
  
  let users: User[] = [];
  let loading = false;
  
  async function loadUsers() {
    loading = true;
    try {
      const response = await apiService.get<User[]>('/users');
      users = response.data;
    } catch (error) {
      handleError(error, 'Failed to load users');
    } finally {
      loading = false;
    }
  }
  
  async function createUser(userData: Omit<User, 'id'>) {
    try {
      const response = await apiService.post<User>('/users', userData);
      users = [...users, response.data];
      toast.success('User created successfully');
    } catch (error) {
      handleError(error, 'Failed to create user');
    }
  }
  
  // Load data on mount
  onMount(loadUsers);
</script>
```

### Error Handling Pattern

```svelte
<script lang="ts">
  import { createErrorResponse, handleError } from '$lib/utils/error-handler';
  
  let error: string | null = null;
  let retrying = false;
  
  async function performAction() {
    error = null;
    
    try {
      // API call or async operation
      await someAsyncOperation();
    } catch (err) {
      // Handle error and show user-friendly message
      error = handleError(err, 'Operation failed');
    }
  }
  
  async function retry() {
    retrying = true;
    await performAction();
    retrying = false;
  }
</script>

{#if error}
  <Alert variant="destructive" class="mb-4">
    <AlertTriangle class="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
    <Button variant="outline" size="sm" on:click={retry} disabled={retrying} class="mt-2">
      {retrying ? 'Retrying...' : 'Try Again'}
    </Button>
  </Alert>
{/if}
```

## Form Patterns

### Form with Validation

```svelte
<script lang="ts">
  import { z } from 'zod';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { toast } from '$lib/services/toast';
  
  // Validation schema
  const userSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    age: z.number().min(18, 'Must be at least 18 years old')
  });
  
  type UserData = z.infer<typeof userSchema>;
  
  let formData: UserData = {
    name: '',
    email: '',
    age: 18
  };
  
  let errors: Partial<Record<keyof UserData, string>> = {};
  let submitting = false;
  
  function validateField(field: keyof UserData) {
    try {
      userSchema.pick({ [field]: true }).parse({ [field]: formData[field] });
      errors[field] = undefined;
    } catch (err) {
      if (err instanceof z.ZodError) {
        errors[field] = err.errors[0].message;
      }
    }
    errors = errors; // Trigger reactivity
  }
  
  async function handleSubmit() {
    // Validate entire form
    try {
      userSchema.parse(formData);
      errors = {};
    } catch (err) {
      if (err instanceof z.ZodError) {
        errors = err.errors.reduce((acc, error) => {
          acc[error.path[0] as keyof UserData] = error.message;
          return acc;
        }, {} as typeof errors);
      }
      return;
    }
    
    submitting = true;
    try {
      await apiService.post('/users', formData);
      toast.success('User created successfully');
      // Reset form or redirect
    } catch (error) {
      handleError(error, 'Failed to create user');
    } finally {
      submitting = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div>
    <Label for="name">Name</Label>
    <Input
      id="name"
      bind:value={formData.name}
      on:blur={() => validateField('name')}
      class={errors.name ? 'border-red-500' : ''}
      required
    />
    {#if errors.name}
      <p class="text-red-500 text-sm mt-1">{errors.name}</p>
    {/if}
  </div>
  
  <div>
    <Label for="email">Email</Label>
    <Input
      id="email"
      type="email"
      bind:value={formData.email}
      on:blur={() => validateField('email')}
      class={errors.email ? 'border-red-500' : ''}
      required
    />
    {#if errors.email}
      <p class="text-red-500 text-sm mt-1">{errors.email}</p>
    {/if}
  </div>
  
  <Button type="submit" disabled={submitting} class="w-full">
    {submitting ? 'Creating...' : 'Create User'}
  </Button>
</form>
```

## Data Loading Patterns

### Reactive Data Loading

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import { apiService } from '$lib/services/api';
  
  // Store for data
  const data = writable([]);
  const loading = writable(false);
  const error = writable(null);
  
  // Derived stores
  const isEmpty = derived(data, ($data) => $data.length === 0);
  const hasError = derived(error, ($error) => $error !== null);
  
  // Search/filter functionality
  let searchTerm = '';
  $: filteredData = $data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  async function loadData() {
    loading.set(true);
    error.set(null);
    
    try {
      const response = await apiService.get('/data');
      data.set(response.data);
    } catch (err) {
      error.set(handleError(err, 'Failed to load data'));
    } finally {
      loading.set(false);
    }
  }
  
  onMount(loadData);
</script>

<!-- Search input -->
<Input 
  placeholder="Search..." 
  bind:value={searchTerm} 
  class="mb-4"
/>

<!-- Loading state -->
{#if $loading}
  <div class="grid gap-4">
    {#each Array(3) as _}
      <Skeleton class="h-20 w-full" />
    {/each}
  </div>

<!-- Error state -->
{:else if $hasError}
  <Alert variant="destructive">
    <AlertTriangle class="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{$error}</AlertDescription>
    <Button variant="outline" on:click={loadData} class="mt-2">
      Retry
    </Button>
  </Alert>

<!-- Empty state -->
{:else if $isEmpty}
  <div class="text-center py-8">
    <p class="text-gray-500">No data found</p>
    <Button variant="outline" on:click={loadData} class="mt-2">
      Refresh
    </Button>
  </div>

<!-- Data display -->
{:else}
  <div class="grid gap-4">
    {#each filteredData as item}
      <Card>
        <CardContent>
          <h3 class="font-semibold">{item.name}</h3>
          <p class="text-gray-600">{item.description}</p>
        </CardContent>
      </Card>
    {/each}
  </div>
{/if}
```

## Store Patterns

### Custom Store with Actions

```typescript
// src/lib/stores/user.store.ts
import { writable, derived } from 'svelte/store';
import { apiService } from '$lib/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserStore {
  users: User[];
  loading: boolean;
  error: string | null;
}

function createUserStore() {
  const { subscribe, set, update } = writable<UserStore>({
    users: [],
    loading: false,
    error: null
  });

  return {
    subscribe,
    
    async load() {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const response = await apiService.get<User[]>('/users');
        set({
          users: response.data,
          loading: false,
          error: null
        });
      } catch (error) {
        update(state => ({
          ...state,
          loading: false,
          error: 'Failed to load users'
        }));
      }
    },
    
    async create(userData: Omit<User, 'id'>) {
      try {
        const response = await apiService.post<User>('/users', userData);
        update(state => ({
          ...state,
          users: [...state.users, response.data]
        }));
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    async update(id: string, userData: Partial<User>) {
      try {
        const response = await apiService.put<User>(`/users/${id}`, userData);
        update(state => ({
          ...state,
          users: state.users.map(user => 
            user.id === id ? response.data : user
          )
        }));
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    async delete(id: string) {
      try {
        await apiService.delete(`/users/${id}`);
        update(state => ({
          ...state,
          users: state.users.filter(user => user.id !== id)
        }));
      } catch (error) {
        throw error;
      }
    }
  };
}

export const userStore = createUserStore();

// Derived stores for computed values
export const activeUsers = derived(
  userStore,
  ($store) => $store.users.filter(user => user.role !== 'inactive')
);

export const userCount = derived(
  userStore,
  ($store) => $store.users.length
);
```

### Using the Custom Store

```svelte
<script lang="ts">
  import { userStore, activeUsers, userCount } from '$lib/stores/user.store';
  import { onMount } from 'svelte';
  
  onMount(() => {
    userStore.load();
  });
  
  async function handleCreateUser(userData) {
    try {
      await userStore.create(userData);
      toast.success('User created successfully');
    } catch (error) {
      handleError(error, 'Failed to create user');
    }
  }
</script>

<div class="mb-4">
  <h2>Users ({$userCount})</h2>
  <p>Active users: {$activeUsers.length}</p>
</div>

{#if $userStore.loading}
  <p>Loading...</p>
{:else if $userStore.error}
  <Alert variant="destructive">
    <AlertDescription>{$userStore.error}</AlertDescription>
  </Alert>
{:else}
  {#each $userStore.users as user}
    <UserCard {user} on:delete={() => userStore.delete(user.id)} />
  {/each}
{/if}
```

## Component Composition Patterns

### Higher-Order Components

```svelte
<!-- src/lib/components/withAuth.svelte -->
<script lang="ts">
  import { authService } from '$lib/services/auth';
  import { hasPermission } from '$lib/utils/rbac';
  
  export let requiredRoles: string[] = [];
  export let requiredPermissions: string[] = [];
  export let fallback: string = 'Access denied';
  
  const userClaims = authService.getUserClaims();
  
  $: hasRequiredAccess = 
    (requiredRoles.length === 0 || requiredRoles.some(role => $userClaims?.roles?.includes(role))) &&
    (requiredPermissions.length === 0 || requiredPermissions.every(permission => 
      hasPermission($userClaims, permission)
    ));
</script>

{#if hasRequiredAccess}
  <slot />
{:else}
  <div class="text-gray-500 text-center py-8">
    {fallback}
  </div>
{/if}
```

### Usage of Higher-Order Component

```svelte
<script lang="ts">
  import WithAuth from '$lib/components/withAuth.svelte';
</script>

<WithAuth requiredRoles={['admin']} requiredPermissions={['manageUsers']}>
  <AdminPanel />
</WithAuth>

<WithAuth requiredRoles={['user', 'premium']} fallback="Upgrade to premium to access this feature">
  <PremiumFeature />
</WithAuth>
```

## Event Handling Patterns

### Custom Events

```svelte
<!-- Child Component -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher<{
    save: { id: string; data: any };
    cancel: void;
    delete: { id: string };
  }>();
  
  export let item: any;
  
  function handleSave() {
    dispatch('save', { 
      id: item.id, 
      data: { ...item } 
    });
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  function handleDelete() {
    dispatch('delete', { id: item.id });
  }
</script>

<div class="card">
  <!-- Item content -->
  <div class="actions">
    <Button on:click={handleSave}>Save</Button>
    <Button variant="outline" on:click={handleCancel}>Cancel</Button>
    <Button variant="destructive" on:click={handleDelete}>Delete</Button>
  </div>
</div>
```

```svelte
<!-- Parent Component -->
<script lang="ts">
  function handleItemSave(event) {
    const { id, data } = event.detail;
    // Handle save logic
  }
  
  function handleItemDelete(event) {
    const { id } = event.detail;
    // Handle delete logic
  }
</script>

<ItemCard 
  {item} 
  on:save={handleItemSave}
  on:cancel={handleCancel}
  on:delete={handleItemDelete}
/>
```

## Performance Patterns

### Lazy Loading Components

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  let component: any;
  let loading = false;
  
  async function loadComponent() {
    loading = true;
    try {
      const module = await import('$lib/components/heavy/HeavyChart.svelte');
      component = module.default;
    } catch (error) {
      console.error('Failed to load component:', error);
    } finally {
      loading = false;
    }
  }
  
  onMount(() => {
    // Load component when needed
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadComponent();
        observer.disconnect();
      }
    });
    
    observer.observe(document.getElementById('chart-container'));
  });
</script>

<div id="chart-container" class="min-h-96">
  {#if loading}
    <Skeleton class="h-96 w-full" />
  {:else if component}
    <svelte:component this={component} />
  {:else}
    <div class="h-96 flex items-center justify-center">
      <Button on:click={loadComponent}>Load Chart</Button>
    </div>
  {/if}
</div>
```

### Virtualized Lists

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  export let items: any[];
  export let itemHeight = 60;
  export let containerHeight = 400;
  
  let scrollTop = 0;
  let containerRef: HTMLElement;
  
  $: visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
  $: startIndex = Math.floor(scrollTop / itemHeight);
  $: endIndex = Math.min(startIndex + visibleCount, items.length);
  $: visibleItems = items.slice(startIndex, endIndex);
  $: offsetY = startIndex * itemHeight;
</script>

<div 
  bind:this={containerRef}
  class="overflow-auto"
  style="height: {containerHeight}px"
  on:scroll={(e) => scrollTop = e.target.scrollTop}
>
  <div style="height: {items.length * itemHeight}px; position: relative;">
    <div style="transform: translateY({offsetY}px)">
      {#each visibleItems as item, i}
        <div class="flex items-center p-4 border-b" style="height: {itemHeight}px">
          <slot {item} index={startIndex + i} />
        </div>
      {/each}
    </div>
  </div>
</div>
```

## Testing Patterns

### Component Testing

```typescript
// src/lib/components/UserCard.test.ts
import { render, fireEvent, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import UserCard from './UserCard.svelte';

test('renders user information correctly', () => {
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  };

  render(UserCard, { props: { user } });

  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});

test('emits delete event when delete button is clicked', async () => {
  const user = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' };
  const { component } = render(UserCard, { props: { user } });

  const handleDelete = vi.fn();
  component.$on('delete', handleDelete);

  const deleteButton = screen.getByText('Delete');
  await fireEvent.click(deleteButton);

  expect(handleDelete).toHaveBeenCalledWith(
    expect.objectContaining({
      detail: { id: '1' }
    })
  );
});
```

### Service Testing

```typescript
// src/lib/services/user.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from './user.service';
import { apiService } from './api.service';

vi.mock('./api.service');

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create user successfully', async () => {
    const mockUser = { id: '1', name: 'John', email: 'john@example.com' };
    const userData = { name: 'John', email: 'john@example.com' };

    vi.mocked(apiService.post).mockResolvedValue({ data: mockUser });

    const result = await userService.createUser(userData);

    expect(apiService.post).toHaveBeenCalledWith('/users', userData);
    expect(result).toEqual(mockUser);
  });
});
```

## Error Boundary Pattern

```svelte
<!-- src/lib/components/ErrorBoundary.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import { Button } from '$lib/components/ui/button';
  import { AlertTriangle, RefreshCw } from 'lucide-svelte';
  
  export let fallback: string = 'Something went wrong';
  export let showReload: boolean = true;
  export let showRetry: boolean = true;
  
  const dispatch = createEventDispatcher<{
    error: { error: Error; componentStack: string };
    retry: void;
  }>();
  
  let hasError = false;
  let error: Error | null = null;
  
  function handleError(err: Error) {
    console.error('Component error:', err);
    hasError = true;
    error = err;
    dispatch('error', { 
      error: err, 
      componentStack: err.stack || '' 
    });
  }
  
  function retry() {
    hasError = false;
    error = null;
    dispatch('retry');
  }
  
  function reload() {
    window.location.reload();
  }
  
  onMount(() => {
    const originalOnError = window.onerror;
    const originalOnUnhandledRejection = window.onunhandledrejection;
    
    window.onerror = (message, source, lineno, colno, error) => {
      if (error) handleError(error);
      return originalOnError?.(message, source, lineno, colno, error);
    };
    
    window.onunhandledrejection = (event) => {
      handleError(new Error(event.reason));
      return originalOnUnhandledRejection?.(event);
    };
    
    return () => {
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
    };
  });
</script>

{#if hasError}
  <div class="flex items-center justify-center min-h-96 p-8">
    <Alert variant="destructive" class="max-w-md">
      <AlertTriangle class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription class="mb-4">
        {fallback}
        {#if error}
          <details class="mt-2">
            <summary class="cursor-pointer text-sm">Error details</summary>
            <pre class="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        {/if}
      </AlertDescription>
      
      <div class="flex gap-2">
        {#if showRetry}
          <Button variant="outline" size="sm" on:click={retry}>
            <RefreshCw class="h-3 w-3 mr-1" />
            Try Again
          </Button>
        {/if}
        
        {#if showReload}
          <Button variant="outline" size="sm" on:click={reload}>
            Reload Page
          </Button>
        {/if}
      </div>
    </Alert>
  </div>
{:else}
  <slot />
{/if}
```

These patterns provide a solid foundation for building scalable, maintainable SvelteKit applications. Use them as starting points and adapt them to your specific needs.