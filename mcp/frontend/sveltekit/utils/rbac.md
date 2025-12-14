# RBAC Utility

## Overview

Role-Based Access Control utility for unified role and permission checking. Supports both role array-based permissions and boolean flag-based permissions with automatic synchronization between formats.

**Location:** `src/lib/utils/rbac.ts`

## Key Features

- Role array-based permissions
- Boolean flag-based permissions
- Automatic synchronization between formats
- Permission checking via role hierarchy
- Safe versions that never throw
- Token/claims extraction and normalization
- Integration with logging service

## Key Functions

### normalizeClaims

Normalizes claims to ensure consistent structure and type conversions.

```typescript
function normalizeClaims(
  claims: FirebaseUserClaims | null
): FirebaseUserClaims | null
```

**Usage:**
```typescript
const normalized = rbacUtil.normalizeClaims(rawClaims);
// Ensures roles is an array, boolean flags are booleans, etc.
```

### getRoles

Gets all roles from a claims object or token.

```typescript
function getRoles(
  claimsOrToken: FirebaseUserClaims | string | DecodedToken | null
): string[]
```

**Usage:**
```typescript
const roles = rbacUtil.getRoles(userClaims);
// Returns: ['admin', 'moderator']

const roles = rbacUtil.getRoles(idToken);
// Can also accept JWT token string
```

### hasRole

Checks if a user has a specific role.

```typescript
function hasRole(
  claimsOrToken: FirebaseUserClaims | string | DecodedToken | null,
  role: string
): boolean
```

**Usage:**
```typescript
if (rbacUtil.hasRole(userClaims, 'admin')) {
  // User is an admin
}

// Also checks boolean flags
if (rbacUtil.hasRole(userClaims, 'sysadmin')) {
  // Checks both roles array and isSysAdmin flag
}
```

### hasAnyRole

Checks if a user has any of the specified roles.

```typescript
function hasAnyRole(
  claimsOrToken: FirebaseUserClaims | string | DecodedToken | null,
  roles: string[]
): boolean
```

**Usage:**
```typescript
if (rbacUtil.hasAnyRole(userClaims, ['admin', 'moderator'])) {
  // User has at least one of these roles
}
```

### hasAllRoles

Checks if a user has all of the specified roles.

```typescript
function hasAllRoles(
  claimsOrToken: FirebaseUserClaims | string | DecodedToken | null,
  roles: string[]
): boolean
```

**Usage:**
```typescript
if (rbacUtil.hasAllRoles(userClaims, ['admin', 'verified'])) {
  // User has both roles
}
```

### hasPermission

Checks if a user has a specific permission via their roles.

```typescript
function hasPermission(
  claimsOrToken: FirebaseUserClaims | string | DecodedToken | null,
  permission: string
): boolean
```

**Usage:**
```typescript
if (rbacUtil.hasPermission(userClaims, 'users.delete')) {
  // User has permission to delete users
}
```

### hasAllPermissions

Checks if a user has all of the specified permissions.

```typescript
function hasAllPermissions(
  claimsOrToken: FirebaseUserClaims | string | DecodedToken | null,
  permissions: string[]
): boolean
```

**Usage:**
```typescript
if (rbacUtil.hasAllPermissions(userClaims, [
  'users.create',
  'users.update',
  'users.delete'
])) {
  // User has full CRUD permissions
}
```

### hasAnyPermission

Checks if a user has any of the specified permissions.

```typescript
function hasAnyPermission(
  claimsOrToken: FirebaseUserClaims | string | DecodedToken | null,
  permissions: string[]
): boolean
```

**Usage:**
```typescript
if (rbacUtil.hasAnyPermission(userClaims, [
  'content.moderate',
  'reports.view'
])) {
  // User can access moderation tools
}
```

### getAllPermissions

Gets all permissions available to a user based on their roles.

```typescript
function getAllPermissions(
  claimsOrToken: FirebaseUserClaims | string | DecodedToken | null
): string[]
```

**Usage:**
```typescript
const permissions = rbacUtil.getAllPermissions(userClaims);
// Returns all permissions the user has
```

### safeHasRole

Safe version of hasRole that never throws.

```typescript
function safeHasRole(
  claimsOrToken: FirebaseUserClaims | string | DecodedToken | null,
  role: string
): boolean
```

**Usage:**
```typescript
// Always returns boolean, never throws
const isAdmin = rbacUtil.safeHasRole(userClaims, 'admin');
```

### safeHasPermission

Safe version of hasPermission that never throws.

```typescript
function safeHasPermission(
  claimsOrToken: FirebaseUserClaims | string | DecodedToken | null,
  permission: string
): boolean
```

**Usage:**
```typescript
// Always returns boolean, never throws
const canDelete = rbacUtil.safeHasPermission(userClaims, 'users.delete');
```

## Common Usage Patterns

### Protecting UI Elements

```svelte
<script>
  import { rbacUtil } from '$lib/utils/rbac';
  import { authService } from '$lib/services/auth';

  $: userClaims = authService.getUserClaims();
  $: isAdmin = rbacUtil.hasRole($userClaims, 'admin');
  $: canModerate = rbacUtil.hasPermission($userClaims, 'content.moderate');
</script>

{#if isAdmin}
  <button>Admin Dashboard</button>
{/if}

{#if canModerate}
  <button>Moderate Content</button>
{/if}
```

### API Route Protection

```typescript
// +server.ts
import { rbacUtil } from '$lib/utils/rbac';
import { json, error } from '@sveltejs/kit';

export async function DELETE({ locals }) {
  const userClaims = locals.userClaims;

  if (!rbacUtil.hasPermission(userClaims, 'users.delete')) {
    throw error(403, 'Insufficient permissions');
  }

  // Proceed with deletion
  return json({ success: true });
}
```

### Form Action Protection

```typescript
// +page.server.ts
import { rbacUtil } from '$lib/utils/rbac';

export const actions = {
  delete: async ({ locals, params }) => {
    if (!rbacUtil.hasRole(locals.userClaims, 'admin')) {
      return {
        status: 403,
        error: 'Admin access required'
      };
    }

    // Proceed with action
  }
};
```

### Multiple Role Check

```typescript
import { rbacUtil } from '$lib/utils/rbac';

// Check if user has any moderator role
if (rbacUtil.hasAnyRole(userClaims, ['admin', 'moderator', 'contentModerator'])) {
  // Show moderation tools
}

// Check if user has all required roles
if (rbacUtil.hasAllRoles(userClaims, ['verified', 'premium'])) {
  // Show premium features
}
```

### Permission-Based Features

```typescript
import { rbacUtil } from '$lib/utils/rbac';

const featureFlags = {
  canExport: rbacUtil.hasPermission(userClaims, 'data.export'),
  canImport: rbacUtil.hasPermission(userClaims, 'data.import'),
  canManageUsers: rbacUtil.hasAllPermissions(userClaims, [
    'users.create',
    'users.update',
    'users.delete'
  ]),
  canAccessReports: rbacUtil.hasAnyPermission(userClaims, [
    'reports.view',
    'analytics.view'
  ])
};
```

### Safe Checks in Components

```typescript
import { rbacUtil } from '$lib/utils/rbac';

// Safe versions won't throw if claims are invalid
function checkFeatureAccess(claims: unknown) {
  return {
    isAdmin: rbacUtil.safeHasRole(claims, 'admin'),
    canDelete: rbacUtil.safeHasPermission(claims, 'users.delete')
  };
}
```

## Role and Permission Configuration

Roles and permissions are defined in `src/lib/constants/auth.constants.ts`:

```typescript
export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  // etc.
};

export const ROLE_PERMISSIONS = {
  admin: [
    'users.create',
    'users.update',
    'users.delete',
    'content.moderate',
    // all permissions
  ],
  moderator: [
    'content.moderate',
    'reports.view'
  ],
  user: [
    'profile.update',
    'content.create'
  ]
};

export const ROLE_HIERARCHY = {
  admin: ['moderator', 'user'], // Admin includes moderator and user
  moderator: ['user'] // Moderator includes user
};
```

## Boolean Flag Mapping

The utility automatically synchronizes between boolean flags and role arrays:

```typescript
export const CLAIM_BOOLEAN_MAP = {
  admin: 'isAdmin',
  consultant: 'isConsultant',
  client: 'isClient',
  sysadmin: 'isSysAdmin'
};

// When checking hasRole('admin'), it checks both:
// - claims.roles.includes('admin')
// - claims.isAdmin === true
```

## Integration Points

### Token Service

Works seamlessly with JWT tokens from the token service.

### Auth Service

Primary integration point for getting user claims.

### Logger Service

All operations are logged via `loggerService.withContext('RBACUtil')`.

## Best Practices

1. **Use safe versions in components** - Prevent errors in UI
2. **Check permissions, not roles** - More flexible and maintainable
3. **Define clear hierarchies** - Use ROLE_HIERARCHY for inheritance
4. **Sync flags and roles** - Keep boolean flags and role arrays in sync
5. **Server-side validation** - Always validate on server, not just client
6. **Cache results** - For expensive permission checks, cache the result
7. **Use constants** - Define roles and permissions in constants file

## Type Definitions

```typescript
interface FirebaseUserClaims {
  uid?: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  roles?: string[];
  isAdmin?: boolean;
  isClient?: boolean;
  isConsultant?: boolean;
  isSysAdmin?: boolean;
  [key: string]: any;
}
```
