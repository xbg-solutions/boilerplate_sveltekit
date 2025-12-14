# Secure Storage Store

## Overview
Manages secure storage state, tracking encryption status and storage namespace. Used for managing encrypted local storage operations throughout the application.

## Store Location
`src/lib/stores/secure-storage.ts`

## State Structure

```typescript
interface SecureStorageState {
  encrypted: boolean;           // Whether storage is encrypted
  namespace: string | null;     // Storage namespace/prefix
}
```

## Usage Examples

### Subscribe to Storage State
```typescript
import { secureStorageStore } from '$lib/stores/secure-storage';

secureStorageStore.subscribe($storage => {
  console.log('Encryption enabled:', $storage.encrypted);
  console.log('Namespace:', $storage.namespace);
});
```

### Enable Encryption
```typescript
import { secureStorageStore } from '$lib/stores/secure-storage';

secureStorageStore.update(state => ({
  ...state,
  encrypted: true
}));
```

### Disable Encryption
```typescript
import { secureStorageStore } from '$lib/stores/secure-storage';

secureStorageStore.update(state => ({
  ...state,
  encrypted: false
}));
```

### Set Namespace
```typescript
import { secureStorageStore } from '$lib/stores/secure-storage';

secureStorageStore.update(state => ({
  ...state,
  namespace: 'myapp'
}));
```

### Clear Namespace
```typescript
import { secureStorageStore } from '$lib/stores/secure-storage';

secureStorageStore.update(state => ({
  ...state,
  namespace: null
}));
```

### Initialize Secure Storage
```typescript
import { secureStorageStore } from '$lib/stores/secure-storage';

function initSecureStorage(namespace: string, encrypted = true) {
  secureStorageStore.set({
    encrypted,
    namespace
  });
}

initSecureStorage('myapp', true);
```

### Check Encryption Status
```typescript
import { secureStorageStore } from '$lib/stores/secure-storage';
import { get } from 'svelte/store';

const $storage = get(secureStorageStore);

if ($storage.encrypted) {
  console.log('Storage is encrypted');
} else {
  console.log('Storage is not encrypted');
}
```

## Integration with Storage Operations

### Namespaced Key Generation
```typescript
import { secureStorageStore } from '$lib/stores/secure-storage';
import { get } from 'svelte/store';

function getNamespacedKey(key: string): string {
  const $storage = get(secureStorageStore);

  if ($storage.namespace) {
    return `${$storage.namespace}:${key}`;
  }

  return key;
}

// Usage
const key = getNamespacedKey('user_preferences');
// Returns: 'myapp:user_preferences'
```

### Secure Storage Wrapper
```typescript
import { secureStorageStore } from '$lib/stores/secure-storage';
import { get } from 'svelte/store';

class SecureStorageService {
  setItem(key: string, value: any): void {
    const $storage = get(secureStorageStore);
    const namespacedKey = this.getKey(key);

    let storedValue = JSON.stringify(value);

    if ($storage.encrypted) {
      storedValue = this.encrypt(storedValue);
    }

    localStorage.setItem(namespacedKey, storedValue);
  }

  getItem<T>(key: string): T | null {
    const $storage = get(secureStorageStore);
    const namespacedKey = this.getKey(key);

    let storedValue = localStorage.getItem(namespacedKey);

    if (!storedValue) return null;

    if ($storage.encrypted) {
      storedValue = this.decrypt(storedValue);
    }

    return JSON.parse(storedValue) as T;
  }

  removeItem(key: string): void {
    const namespacedKey = this.getKey(key);
    localStorage.removeItem(namespacedKey);
  }

  clear(): void {
    const $storage = get(secureStorageStore);

    if ($storage.namespace) {
      // Clear only namespaced items
      const prefix = `${$storage.namespace}:`;
      Object.keys(localStorage)
        .filter(key => key.startsWith(prefix))
        .forEach(key => localStorage.removeItem(key));
    } else {
      localStorage.clear();
    }
  }

  private getKey(key: string): string {
    const $storage = get(secureStorageStore);
    return $storage.namespace ? `${$storage.namespace}:${key}` : key;
  }

  private encrypt(value: string): string {
    // Implement encryption logic
    return btoa(value); // Simple base64 for example
  }

  private decrypt(value: string): string {
    // Implement decryption logic
    return atob(value); // Simple base64 for example
  }
}

export const secureStorage = new SecureStorageService();
```

## Usage Examples with Service

```typescript
import { secureStorage } from './secure-storage-service';

// Store data
secureStorage.setItem('user_token', 'abc123');

// Retrieve data
const token = secureStorage.getItem<string>('user_token');

// Remove data
secureStorage.removeItem('user_token');

// Clear all namespaced data
secureStorage.clear();
```

## Integration Points

- **Auth Service** - Store tokens securely
- **User Preferences** - Persist settings
- **Cache Management** - Store cached data
- **Session Storage** - Manage session data
- **Token Store** - Store authentication tokens

## Environment-Based Configuration

```typescript
import { secureStorageStore } from '$lib/stores/secure-storage';
import { dev } from '$app/environment';

// Disable encryption in development for easier debugging
secureStorageStore.set({
  encrypted: !dev,
  namespace: 'myapp'
});
```

## Multi-Tenant Support

```typescript
import { secureStorageStore } from '$lib/stores/secure-storage';

function switchTenant(tenantId: string) {
  secureStorageStore.set({
    encrypted: true,
    namespace: `tenant_${tenantId}`
  });
}

// Usage
switchTenant('company-abc');
// All storage operations now use 'tenant_company-abc:' prefix
```

## Component Usage

```svelte
<script>
  import { secureStorageStore } from '$lib/stores/secure-storage';
  import { onMount } from 'svelte';

  onMount(() => {
    // Initialize storage for this component
    secureStorageStore.update(state => ({
      ...state,
      namespace: 'mycomponent'
    }));
  });
</script>

<div>
  Encryption: {$secureStorageStore.encrypted ? 'Enabled' : 'Disabled'}
  <br>
  Namespace: {$secureStorageStore.namespace || 'None'}
</div>
```

## Best Practices

1. Set namespace early in app initialization
2. Use encryption for sensitive data (tokens, PII)
3. Clear namespace on tenant/user switch
4. Use consistent namespace naming conventions
5. Don't store highly sensitive data in localStorage even with encryption
6. Implement proper encryption/decryption (not just base64)
7. Consider using IndexedDB for larger datasets
8. Clear storage on logout
9. Handle encryption failures gracefully
10. Validate stored data on retrieval

## Security Considerations

1. **Client-Side Encryption**: Remember that client-side encryption can be inspected/bypassed
2. **Key Management**: Store encryption keys securely (not in localStorage)
3. **Sensitive Data**: Don't store highly sensitive data client-side
4. **HTTPS Only**: Always use HTTPS to prevent man-in-the-middle attacks
5. **Regular Cleanup**: Clear old/expired data regularly
6. **Audit Logs**: Log storage operations for sensitive data
