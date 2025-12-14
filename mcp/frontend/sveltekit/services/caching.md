# Caching Service

## Overview

Multi-level caching service supporting memory, localStorage, sessionStorage, and IndexedDB storage. Provides intelligent cache management with TTL, tag-based invalidation, and automatic cleanup.

**Location**: `src/lib/services/caching/`

## Key Components

### Cache Service (`cache.service.ts`)
Core caching functionality with multiple storage backends.

### API Cache Service (`api-cache.service.ts`)
Specialized API response caching with cache strategies and HTTP header parsing.

## Storage Options

- **memory**: Fast in-memory cache with LRU eviction (default, max 100 items)
- **localStorage**: Persistent browser storage
- **sessionStorage**: Session-scoped browser storage
- **indexedDB**: Large data storage with advanced querying

## Key Methods

### CacheService

#### `get<T>(key: string, storage?: string): Promise<T | null>`
Retrieve cached value by key.

```typescript
const user = await cacheService.get<User>('user:123', 'localStorage');
```

#### `set<T>(key: string, value: T, options?: CacheOptions): Promise<void>`
Store value in cache with options.

**Options**:
- `ttl`: Time to live in milliseconds (default: 1 hour)
- `tags`: Array of tags for grouped invalidation
- `storage`: Storage backend ('memory' | 'localStorage' | 'sessionStorage' | 'indexedDB')
- `maxSize`: Maximum size in bytes

```typescript
await cacheService.set('user:123', userData, {
  ttl: 30 * 60 * 1000, // 30 minutes
  tags: ['user', 'profile'],
  storage: 'localStorage'
});
```

#### `getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T>`
Get from cache or compute and store if missing.

```typescript
const data = await cacheService.getOrSet('expensive-data', async () => {
  return await fetchExpensiveData();
}, { ttl: 60000, storage: 'memory' });
```

#### `delete(key: string, storage?: string): Promise<void>`
Remove specific cached item.

```typescript
await cacheService.delete('user:123', 'localStorage');
```

#### `clear(storage?: string): Promise<void>`
Clear all items from storage.

```typescript
await cacheService.clear('memory');
```

#### `invalidateByTags(tags: string[], storage?: string): Promise<void>`
Remove all cached items with matching tags.

```typescript
await cacheService.invalidateByTags(['user', 'profile'], 'localStorage');
```

#### `cleanupExpired(): Promise<void>`
Manually trigger cleanup of expired items (runs automatically every 5 minutes).

#### `getStats(): Writable<CacheStats>`
Get cache statistics store (hit/miss counts, hit rate, item count).

```typescript
const stats = cacheService.getStats();
$stats // { hitCount, missCount, hitRate, itemCount, totalSize, evictedCount }
```

### APICacheService

#### `fetch<T>(url: string, options?: APICacheOptions): Promise<APIResponse<T>>`
Fetch with caching strategy.

**Strategies**:
- `cache-first`: Check cache first, fallback to network (default)
- `network-first`: Try network first, fallback to cache
- `cache-only`: Only use cache, throw if missing
- `network-only`: Always fetch from network

**Options**:
- `strategy`: Cache strategy
- `staleWhileRevalidate`: Return stale data immediately, fetch fresh data in background
- `ttl`: Override TTL from headers
- `storage`: Storage backend
- `tags`: Tags for invalidation
- `keyPrefix`: Custom cache key prefix

```typescript
const response = await apiCacheService.fetch<User[]>('/api/users', {
  strategy: 'cache-first',
  staleWhileRevalidate: true,
  ttl: 5 * 60 * 1000, // 5 minutes
  storage: 'localStorage',
  tags: ['users']
});
```

#### `get<T>(url: string, options?: APICacheOptions): Promise<APIResponse<T>>`
GET request with caching.

```typescript
const response = await apiCacheService.get<User>('/api/users/123', {
  strategy: 'cache-first',
  storage: 'localStorage'
});
```

#### `post<T>(url: string, body?: any, options?: APICacheOptions): Promise<APIResponse<T>>`
POST request (not cached by default).

```typescript
const response = await apiCacheService.post('/api/users', userData);
```

#### `put<T>(url: string, body?: any, options?: APICacheOptions): Promise<APIResponse<T>>`
PUT request with automatic cache invalidation.

```typescript
await apiCacheService.put('/api/users/123', updatedUser);
// Automatically invalidates '/api/users/*' cache entries
```

#### `delete<T>(url: string, options?: APICacheOptions): Promise<APIResponse<T>>`
DELETE request with automatic cache invalidation.

```typescript
await apiCacheService.delete('/api/users/123');
// Automatically invalidates '/api/users/*' cache entries
```

#### `invalidate(urlPattern: string, options?: APICacheOptions): Promise<void>`
Invalidate cached responses by URL pattern (supports wildcards).

```typescript
await apiCacheService.invalidate('/api/users/*', { storage: 'localStorage' });
```

#### `invalidateByTags(tags: string[], storage?: string): Promise<void>`
Invalidate cached responses by tags.

```typescript
await apiCacheService.invalidateByTags(['users', 'profile']);
```

#### `prefetch<T>(urls: string[], options?: APICacheOptions): Promise<void>`
Prefetch and cache multiple URLs.

```typescript
await apiCacheService.prefetch([
  '/api/users',
  '/api/settings'
], { strategy: 'network-first' });
```

#### `warmup(requests: Array<{url: string, options?: APICacheOptions}>): Promise<void>`
Warm up cache with common requests.

```typescript
await apiCacheService.warmup([
  { url: '/api/users', options: { storage: 'localStorage' } },
  { url: '/api/settings', options: { tags: ['config'] } }
]);
```

## Cache Invalidation Patterns

### Tag-Based Invalidation
Group related cache entries with tags:

```typescript
// Cache with tags
await cacheService.set('user:123', userData, {
  tags: ['user', 'profile', 'user:123']
});

// Invalidate all user-related cache
await cacheService.invalidateByTags(['user']);
```

### Pattern-Based Invalidation (API Cache)
Use wildcards to invalidate URL patterns:

```typescript
// Invalidate all user endpoints
await apiCacheService.invalidate('/api/users/*');

// Invalidate specific resource
await apiCacheService.invalidate('/api/users/123');
```

### Automatic Invalidation
PUT/DELETE requests automatically invalidate related cache entries:

```typescript
// Automatically invalidates '/api/users/*' cache
await apiCacheService.put('/api/users/123', updatedUser);
await apiCacheService.delete('/api/users/123');
```

### Time-Based Expiration
All cached items have TTL:

```typescript
await cacheService.set('data', value, {
  ttl: 5 * 60 * 1000 // 5 minutes
});
// Automatically cleaned up after expiration
```

## Usage Examples

### Basic Caching
```typescript
import { cacheService } from '$lib/services/caching';

// Store data
await cacheService.set('userPreferences', preferences, {
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  storage: 'localStorage'
});

// Retrieve data
const prefs = await cacheService.get('userPreferences', 'localStorage');
```

### API Caching with Strategies
```typescript
import { apiCacheService } from '$lib/services/caching';

// Cache-first: fast for frequently accessed data
const users = await apiCacheService.get('/api/users', {
  strategy: 'cache-first',
  ttl: 5 * 60 * 1000
});

// Network-first: ensure fresh data with fallback
const criticalData = await apiCacheService.get('/api/critical', {
  strategy: 'network-first'
});

// Stale-while-revalidate: instant response + background update
const posts = await apiCacheService.get('/api/posts', {
  strategy: 'cache-first',
  staleWhileRevalidate: true
});
```

### Computed Caching
```typescript
// Cache expensive computation
const result = await cacheService.getOrSet('expensiveCalc', async () => {
  return await performExpensiveCalculation();
}, { ttl: 60000 });
```

### Cache Invalidation on Updates
```typescript
// Update data and invalidate cache
await apiCacheService.put('/api/users/123', updatedUser);
// Related caches automatically invalidated

// Manual invalidation
await apiCacheService.invalidateByTags(['users']);
await apiCacheService.invalidate('/api/users/*');
```

### Large Data with IndexedDB
```typescript
// Store large datasets
await cacheService.set('largeDataset', bigData, {
  storage: 'indexedDB',
  ttl: 60 * 60 * 1000, // 1 hour
  tags: ['dataset']
});
```

### Cache Statistics
```typescript
import { cacheService } from '$lib/services/caching';

// Subscribe to stats in Svelte component
$: stats = cacheService.getStats();

// Access stats
console.log($stats.hitRate); // Cache hit percentage
console.log($stats.itemCount); // Number of cached items
```

## Response Format (API Cache)

```typescript
interface APIResponse<T> {
  data: T;                    // Response data
  status: number;             // HTTP status
  statusText: string;         // HTTP status text
  headers: Record<string, string>; // Response headers
  cached?: boolean;           // Whether from cache
  cacheTimestamp?: number;    // Cache timestamp
}
```

## Best Practices

1. **Choose appropriate storage**: Use memory for short-lived data, localStorage for persistent data, indexedDB for large datasets
2. **Set appropriate TTL**: Balance freshness vs performance
3. **Use tags**: Group related cache entries for efficient invalidation
4. **Leverage strategies**: Use cache-first for static data, network-first for dynamic data
5. **Stale-while-revalidate**: Great for perceived performance
6. **Invalidate on mutations**: Always invalidate cache after PUT/DELETE operations
7. **Monitor statistics**: Use cache stats to optimize caching strategy

## Notes

- Automatic cleanup runs every 5 minutes
- Memory cache uses LRU eviction (max 100 items by default)
- localStorage/sessionStorage handle quota exceeded with automatic cleanup
- IndexedDB supports multi-entry tags for efficient querying
- API cache respects HTTP cache-control headers
- All operations are async and handle SSR (return null on server)
