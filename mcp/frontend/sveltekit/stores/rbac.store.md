# RBAC Store

## Overview
Manages Role-Based Access Control (RBAC) state, tracking user roles and permissions throughout the application. Used for authorization and access control decisions.

## Store Location
`src/lib/stores/rbac.ts`

## State Structure

```typescript
interface RoleBasedAccess {
  roles: string[];              // User's assigned roles
  permissions: string[];        // User's granted permissions
}
```

## Usage Examples

### Subscribe to RBAC State
```typescript
import { rbacStore } from '$lib/stores/rbac';

rbacStore.subscribe($rbac => {
  console.log('User roles:', $rbac.roles);
  console.log('User permissions:', $rbac.permissions);
});
```

### Set User Roles
```typescript
import { rbacStore } from '$lib/stores/rbac';

rbacStore.set({
  roles: ['admin', 'editor'],
  permissions: []
});
```

### Update Roles
```typescript
import { rbacStore } from '$lib/stores/rbac';

rbacStore.update(state => ({
  ...state,
  roles: ['user', 'viewer']
}));
```

### Add Role
```typescript
import { rbacStore } from '$lib/stores/rbac';

rbacStore.update(state => ({
  ...state,
  roles: [...state.roles, 'moderator']
}));
```

### Set Permissions
```typescript
import { rbacStore } from '$lib/stores/rbac';

rbacStore.update(state => ({
  ...state,
  permissions: ['read:posts', 'write:posts', 'delete:posts']
}));
```

### Check if User Has Role
```typescript
import { rbacStore } from '$lib/stores/rbac';
import { get } from 'svelte/store';

function hasRole(role: string): boolean {
  const $rbac = get(rbacStore);
  return $rbac.roles.includes(role);
}

if (hasRole('admin')) {
  // Show admin features
}
```

### Check if User Has Permission
```typescript
import { rbacStore } from '$lib/stores/rbac';
import { get } from 'svelte/store';

function hasPermission(permission: string): boolean {
  const $rbac = get(rbacStore);
  return $rbac.permissions.includes(permission);
}

if (hasPermission('write:posts')) {
  // Allow post creation
}
```

### Check Multiple Roles (Any)
```typescript
import { rbacStore } from '$lib/stores/rbac';
import { get } from 'svelte/store';

function hasAnyRole(roles: string[]): boolean {
  const $rbac = get(rbacStore);
  return roles.some(role => $rbac.roles.includes(role));
}

if (hasAnyRole(['admin', 'moderator'])) {
  // Show moderation features
}
```

### Check Multiple Roles (All)
```typescript
import { rbacStore } from '$lib/stores/rbac';
import { get } from 'svelte/store';

function hasAllRoles(roles: string[]): boolean {
  const $rbac = get(rbacStore);
  return roles.every(role => $rbac.roles.includes(role));
}
```

### Clear RBAC State
```typescript
import { rbacStore } from '$lib/stores/rbac';

rbacStore.set({
  roles: [],
  permissions: []
});
```

## Integration Points

- **Auth Store** (`src/lib/stores/auth.store.ts`) - Extracts roles from user claims
- **Token Store** (`src/lib/stores/token.store.ts`) - Extracts roles from JWT
- **Route Guards** - Check roles before allowing navigation
- **Component Guards** - Conditionally render based on roles/permissions
- **API Service** - Include roles in authorization headers

## Common Roles

- `admin` - Full system access
- `editor` - Content editing access
- `moderator` - Moderation capabilities
- `user` - Standard user access
- `viewer` - Read-only access
- `guest` - Limited anonymous access

## Permission Naming Conventions

Use a consistent format: `action:resource`

- `read:posts` - Read posts
- `write:posts` - Create/edit posts
- `delete:posts` - Delete posts
- `manage:users` - User management
- `view:analytics` - View analytics

## Usage in Components

```svelte
<script>
  import { rbacStore } from '$lib/stores/rbac';

  $: canEdit = $rbacStore.roles.includes('editor') ||
               $rbacStore.roles.includes('admin');

  $: canDelete = $rbacStore.permissions.includes('delete:posts');
</script>

{#if canEdit}
  <button>Edit</button>
{/if}

{#if canDelete}
  <button>Delete</button>
{/if}
```

## Route Protection

```typescript
import { rbacStore } from '$lib/stores/rbac';
import { get } from 'svelte/store';
import { redirect } from '@sveltejs/kit';

export function requireRole(role: string) {
  const $rbac = get(rbacStore);

  if (!$rbac.roles.includes(role)) {
    throw redirect(303, '/unauthorized');
  }
}
```

## Derived Stores

```typescript
import { rbacStore } from '$lib/stores/rbac';
import { derived } from 'svelte/store';

export const isAdmin = derived(
  rbacStore,
  $rbac => $rbac.roles.includes('admin')
);

export const canModerate = derived(
  rbacStore,
  $rbac => $rbac.roles.includes('admin') ||
           $rbac.roles.includes('moderator')
);

export const canWrite = derived(
  rbacStore,
  $rbac => $rbac.permissions.includes('write:posts')
);
```

## Best Practices

1. Load roles and permissions on authentication
2. Clear RBAC state on logout
3. Use consistent role and permission naming
4. Check permissions in addition to roles for fine-grained access
5. Cache role checks in derived stores for performance
6. Validate roles on both frontend and backend
7. Don't rely solely on frontend role checks for security
8. Update roles when user permissions change
9. Use hierarchical permissions (e.g., admin inherits all permissions)
10. Document all roles and permissions in your application
