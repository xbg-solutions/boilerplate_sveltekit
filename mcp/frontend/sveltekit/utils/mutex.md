# Mutex Utility

## Overview

Mutex implementation for managing critical sections and preventing race conditions in async operations.

**Location:** `src/lib/utils/mutex.ts`

## Key Features

- Named mutex locks
- Automatic lock expiry
- Timeout handling
- Debug mode with stack traces
- Force release capability
- Safe wrappers

## Key Functions

### acquire
Acquire a named mutex lock.

```typescript
const release = await mutexService.acquire('my-lock', {
  timeout: 5000,
  lockExpiry: 30000
});

try {
  // critical section
} finally {
  release();
}
```

### release
Release a mutex lock.

```typescript
mutexService.release('my-lock');
```

### forceRelease
Force release a lock regardless of who holds it.

```typescript
mutexService.forceRelease('stuck-lock');
```

### isLocked
Check if a lock is currently held.

```typescript
if (mutexService.isLocked('my-lock')) {
  // Lock is held
}
```

### getLockInfo
Get information about a held lock.

```typescript
const info = mutexService.getLockInfo('my-lock');
// { name, acquiredAt, expiresAt, stack? }
```

### safeAcquire
Safe version that returns null instead of throwing.

```typescript
const release = await mutexService.safeAcquire('my-lock');
if (release) {
  try {
    // critical section
  } finally {
    release();
  }
}
```

### withLock
Execute function with mutex lock.

```typescript
const result = await mutexService.withLock('my-lock', async () => {
  // critical section
  return computeResult();
});
```

### safeWithLock
Safe version that returns result object.

```typescript
const { success, result, error } = await mutexService.safeWithLock(
  'my-lock',
  async () => {
    return await operation();
  }
);
```

## Common Patterns

### Prevent Concurrent Operations
```typescript
async function updateBalance(userId, amount) {
  const release = await mutexService.acquire(`balance:${userId}`);
  
  try {
    const balance = await getBalance(userId);
    const newBalance = balance + amount;
    await setBalance(userId, newBalance);
    return newBalance;
  } finally {
    release();
  }
}
```

### Safe Critical Section
```typescript
const { success, result } = await mutexService.safeWithLock(
  'cache-update',
  async () => {
    return await rebuildCache();
  }
);

if (!success) {
  console.error('Failed to rebuild cache');
}
```

### With Timeout
```typescript
try {
  const release = await mutexService.acquire('resource', {
    timeout: 5000 // 5 second timeout
  });
  
  // If we get here, we have the lock
  try {
    // critical section
  } finally {
    release();
  }
} catch (error) {
  // Timeout or other error
  console.error('Failed to acquire lock');
}
```

## Options

```typescript
interface MutexOptions {
  timeout?: number;        // Acquisition timeout (default: 30000ms)
  lockExpiry?: number;     // Auto-release time (default: 60000ms)
  debug?: boolean;         // Capture stack traces
  _testMode?: boolean;     // Fail fast for testing
}
```

## Best Practices

1. Always use try/finally
2. Set appropriate timeouts
3. Use descriptive lock names
4. Scope locks narrowly
5. Avoid nested locks
6. Monitor lock contention
7. Use safeWithLock for simplicity
8. Clean up expired locks
