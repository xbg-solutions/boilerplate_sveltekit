# Cache Helper Utilities

## Overview

Wrappers and helpers for common caching operations including memoization, API caching, user-specific caching, and cache warming.

**Location:** `src/lib/utils/cache-helpers.ts`

## Key Utilities

### memoize
Simple memoization decorator for functions.

```typescript
const expensiveFn = memoize((x) => {
  // expensive calculation
  return result;
}, { ttl: 60000 });
```

### asyncMemo
Async memoization with persistent cache.

```typescript
const cachedFetch = asyncMemo(async (id) => {
  return await fetchData(id);
}, { ttl: 300, storage: 'memory' });
```

### createCachedFetch
Creates cached fetch function.

```typescript
const cachedFetch = createCachedFetch({
  ttl: 300,
  strategy: 'cache-first'
});

const data = await cachedFetch('/api/data');
```

### cached
Cache decorator for class methods.

```typescript
class DataService {
  @cached({ ttl: 300 })
  async getData() {
    return await fetch('/api/data');
  }
}
```

## APICache Class

Wrapper for API endpoints with caching.

```typescript
const api = new APICache('/api', { ttl: 300 });

// Cached GET
const data = await api.get('/users');

// POST (not cached)
await api.post('/users', userData);

// Invalidate cache
await api.invalidate('/users/*');

// Prefetch
await api.prefetch(['/users', '/posts']);
```

## UserCache Class

User-specific cache utilities.

```typescript
const userCache = new UserCache(userId);

// Get/Set
await userCache.set('preferences', prefs);
const prefs = await userCache.get('preferences');

// Get or compute
const data = await userCache.getOrSet('computed', async () => {
  return await expensiveComputation();
});

// Clear user cache
await userCache.clear();
```

## CacheWarmer Class

Preload critical data at app start.

```typescript
const warmer = new CacheWarmer();

warmer.addTask('user-profile', async () => {
  await api.get('/user/profile');
}, 100); // priority

await warmer.warmup(3); // 3 concurrent tasks
```

## CacheMonitor Class

Monitor cache performance.

```typescript
const monitor = CacheMonitor.getInstance();

monitor.recordHit(responseTime);
monitor.recordMiss(responseTime);

const stats = monitor.getStats();
// { hits, misses, hitRate, avgResponseTime }
```

## Common Patterns

```typescript
// Memoized computation
const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
});

// API with caching
const api = new APICache('/api');
const users = await api.get('/users', { ttl: 300 });

// User-specific data
const userCache = new UserCache(userId);
const prefs = await userCache.getOrSet('prefs', () => 
  fetchUserPreferences(userId)
);

// Cache warming
const warmer = CacheWarmer.createCommonTasks(api);
await warmer.warmup();
```

## Integration

- **Cache Service**: Uses cacheService and apiCacheService
- **Secure Storage**: Persistent cache storage
- **Logger**: Performance monitoring

## Best Practices

1. Set appropriate TTL
2. Use cache-first for static data
3. Invalidate on mutations
4. Warm critical caches
5. Monitor cache performance
6. Use user-specific caches
7. Prefetch related data
