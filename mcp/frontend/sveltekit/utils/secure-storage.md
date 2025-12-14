# Secure Storage Utility

## Overview

Secure storage utility for safely storing and retrieving data with multiple storage mechanisms (cookies, localStorage, sessionStorage, memory), automatic data expiration, encryption support, and environment detection.

**Location:** `src/lib/utils/secure-storage.ts`

## Key Features

- Multiple storage mechanisms with fallbacks
- Automatic data expiration (TTL)
- Optional encryption for sensitive data
- Browser/SSR environment detection
- Namespace support for data partitioning
- Safe methods that never throw

## Key Functions

### setItem

Stores a value in secure storage.

```typescript
function setItem<T>(key: string, value: T, options?: StorageOptions): boolean
```

**Usage:**
```typescript
secureStorage.setItem('user_pref', { theme: 'dark' }, {
  namespace: 'app',
  mechanism: 'localStorage',
  ttl: 86400 // 24 hours in seconds
});
```

### getItem

Retrieves a value from secure storage.

```typescript
function getItem<T>(key: string, options?: StorageOptions): T | null
```

**Usage:**
```typescript
const prefs = secureStorage.getItem<UserPrefs>('user_pref', {
  namespace: 'app',
  mechanism: 'localStorage'
});
```

### removeItem

Removes an item from storage.

```typescript
function removeItem(key: string, options?: StorageOptions): boolean
```

**Usage:**
```typescript
secureStorage.removeItem('session_token', {
  namespace: 'auth',
  allMechanisms: true // Remove from all storage types
});
```

### clear

Clears storage by namespace or entirely.

```typescript
function clear(options?: {
  mechanism?: StorageMechanism;
  namespace?: string;
  allMechanisms?: boolean;
}): boolean
```

**Usage:**
```typescript
// Clear all auth-related storage
secureStorage.clear({
  namespace: 'auth',
  allMechanisms: true
});
```

### Safe Methods

Methods that never throw errors:

```typescript
await secureStorage.safeSet('key', value, options);
const data = await secureStorage.safeGet('key', options);
await secureStorage.safeRemove('key', options);
await secureStorage.safeClear(options);
```

## Storage Mechanisms

### localStorage
Persistent storage across sessions.

### sessionStorage
Cleared when browser session ends.

### cookie
HTTP cookies with secure flags.

### memory
In-memory storage (SSR fallback).

## Common Usage Patterns

### Store User Token
```typescript
import { secureStorage } from '$lib/utils/secure-storage';

secureStorage.setItem('auth_token', token, {
  namespace: 'auth',
  mechanism: 'cookie',
  ttl: 3600,
  cookieOptions: {
    secure: true,
    sameSite: 'strict'
  }
});
```

### Store with Encryption
```typescript
secureStorage.setItem('sensitive_data', data, {
  encryption: {
    enabled: true,
    key: encryptionKey
  },
  mechanism: 'localStorage'
});
```

### Get with Fallback
```typescript
const token = secureStorage.getItem('token', {
  mechanism: 'cookie',
  fallbackMechanisms: ['localStorage', 'sessionStorage']
});
```

## Options

```typescript
interface StorageOptions {
  mechanism?: 'localStorage' | 'sessionStorage' | 'cookie' | 'memory';
  namespace?: string;
  encryption?: { enabled: boolean; key?: string };
  ttl?: number; // Time to live in seconds
  cookieOptions?: {
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    path?: string;
    domain?: string;
  };
  fallbackMechanisms?: StorageMechanism[];
  allMechanisms?: boolean;
}
```

## Integration Points

- **Logger Service**: All operations logged
- **Error Handler**: Automatic error handling and logging
- **Auth Service**: Used for storing authentication tokens
- **Token Service**: Stores JWT tokens

## Best Practices

1. **Use namespaces** - Partition data by feature
2. **Set appropriate TTL** - Don't store indefinitely
3. **Use secure cookies** - For auth tokens
4. **Enable encryption** - For sensitive data
5. **Provide fallbacks** - Use fallbackMechanisms
6. **Handle SSR** - Check browser environment
7. **Clear on logout** - Remove user data
