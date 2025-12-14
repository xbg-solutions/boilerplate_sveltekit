# User Creation Store

## Overview
Manages the state of user creation operations, tracking creation status, last created user, and any errors that occur during the user creation process.

## Store Location
`src/lib/stores/user-creation.ts`

## State Structure

```typescript
interface UserCreationState {
  isCreating: boolean;          // Whether user creation is in progress
  lastCreated: string | null;   // UID of last created user
  error: string | null;         // Error message if creation failed
}
```

## Key Functions

- `ensureUserExists(uid: string)` - Ensures a user exists in the system

## Usage Examples

### Subscribe to User Creation State
```typescript
import { userCreationStore } from '$lib/stores/user-creation';

userCreationStore.subscribe($userCreation => {
  console.log('Creating user:', $userCreation.isCreating);
  console.log('Last created:', $userCreation.lastCreated);
  console.log('Error:', $userCreation.error);
});
```

### Start User Creation
```typescript
import { userCreationStore } from '$lib/stores/user-creation';

userCreationStore.update(state => ({
  ...state,
  isCreating: true,
  error: null
}));
```

### Complete User Creation
```typescript
import { userCreationStore } from '$lib/stores/user-creation';

userCreationStore.update(state => ({
  ...state,
  isCreating: false,
  lastCreated: userId,
  error: null
}));
```

### Handle User Creation Error
```typescript
import { userCreationStore } from '$lib/stores/user-creation';

userCreationStore.update(state => ({
  ...state,
  isCreating: false,
  error: 'Failed to create user: Invalid data'
}));
```

### Ensure User Exists
```typescript
import { ensureUserExists } from '$lib/stores/user-creation';

try {
  const exists = await ensureUserExists(userId);
  if (exists) {
    console.log('User exists or was created');
  }
} catch (error) {
  console.error('Failed to ensure user exists:', error);
}
```

### Reset State
```typescript
import { userCreationStore } from '$lib/stores/user-creation';

userCreationStore.set({
  isCreating: false,
  lastCreated: null,
  error: null
});
```

### Track Multiple User Creations
```typescript
import { userCreationStore } from '$lib/stores/user-creation';
import { get } from 'svelte/store';

async function createUsers(userIds: string[]) {
  for (const uid of userIds) {
    userCreationStore.update(state => ({
      ...state,
      isCreating: true,
      error: null
    }));

    try {
      await createUser(uid);

      userCreationStore.update(state => ({
        ...state,
        isCreating: false,
        lastCreated: uid
      }));
    } catch (error) {
      userCreationStore.update(state => ({
        ...state,
        isCreating: false,
        error: error.message
      }));
      break;
    }
  }
}
```

### Show Loading State
```typescript
import { userCreationStore } from '$lib/stores/user-creation';

userCreationStore.subscribe($state => {
  if ($state.isCreating) {
    // Show loading spinner
  }

  if ($state.error) {
    // Show error message
  }

  if ($state.lastCreated) {
    // Show success message
  }
});
```

## Integration Points

- **Auth Service** - Creates user records on authentication
- **User Service** - Manages user CRUD operations
- **Loading Store** - May track user creation loading state
- **Toast Store** - Shows creation success/error notifications
- **API Service** - Makes user creation API requests

## State Flow

1. **Start**: `isCreating` = true, clear `error`
2. **API Request**: Create user via backend
3. **Success**: `isCreating` = false, set `lastCreated` to user ID
4. **Error**: `isCreating` = false, set `error` message

## Use Cases

### User Registration
```typescript
import { userCreationStore } from '$lib/stores/user-creation';

async function registerUser(userData: UserData) {
  userCreationStore.update(state => ({
    ...state,
    isCreating: true,
    error: null
  }));

  try {
    const user = await api.createUser(userData);

    userCreationStore.update(state => ({
      ...state,
      isCreating: false,
      lastCreated: user.uid
    }));

    return user;
  } catch (error) {
    userCreationStore.update(state => ({
      ...state,
      isCreating: false,
      error: error.message
    }));
    throw error;
  }
}
```

### Lazy User Creation
```typescript
import { ensureUserExists } from '$lib/stores/user-creation';

async function onFirstLogin(uid: string) {
  // Ensure user record exists
  await ensureUserExists(uid);

  // Continue with login flow
}
```

## Best Practices

1. Always set `isCreating` to true before starting operations
2. Clear `error` before starting new operations
3. Update `lastCreated` only on successful creation
4. Provide descriptive error messages
5. Reset state after handling errors
6. Use `ensureUserExists()` for idempotent user creation
7. Handle race conditions if multiple creations can occur
8. Show appropriate UI feedback based on state
