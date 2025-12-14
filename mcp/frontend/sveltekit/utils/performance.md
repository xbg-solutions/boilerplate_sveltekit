# Performance Monitoring Utilities

## Overview

Performance monitoring and optimization utilities including Web Vitals tracking, metrics collection, lazy loading, and performance auditing.

**Location:** `src/lib/utils/performance.ts`

## Key Features

### PerformanceMonitor Class

Tracks performance metrics.

```typescript
import { performanceMonitor } from '$lib/utils/performance';

// Record metric
performanceMonitor.recordMetric('api-call', 250);

// Measure sync function
const result = performanceMonitor.measure('computation', () => {
  return expensiveComputation();
});

// Measure async function
const result = await performanceMonitor.measureAsync('fetch', async () => {
  return await fetch('/api/data');
});

// Get metrics summary
const metrics = performanceMonitor.getMetrics('api-call');
// { count, min, max, avg, values }
```

### Web Vitals

Get Core Web Vitals metrics.

```typescript
const vitals = await getWebVitals();
// [ 
//   { name: 'LCP', value: 2100, rating: 'good' },
//   { name: 'FID', value: 80, rating: 'good' },
//   { name: 'CLS', value: 0.05, rating: 'good' }
// ]
```

### debounce

Debounce function calls.

```typescript
const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 300);
```

### throttle

Throttle function calls.

```typescript
const throttledScroll = throttle(() => {
  handleScroll();
}, 100);
```

### lazyLoadImages

Lazy load images using IntersectionObserver.

```typescript
// In HTML: <img data-src="image.jpg" class="lazy">
lazyLoadImages('img[data-src]');
```

### preloadResource

Preload critical resources.

```typescript
preloadResource('/api/critical-data', 'fetch');
preloadResource('/fonts/main.woff2', 'font');
```

### getBundleAnalytics

Get page load and resource metrics.

```typescript
const analytics = getBundleAnalytics();
// {
//   pageLoad: { domContentLoaded, loadComplete, ... },
//   resources: { scripts, stylesheets, images, total },
//   timing: { dns, tcp, ssl, request, response }
// }
```

### performanceAudit

Run complete performance audit.

```typescript
const audit = await performanceAudit();
// {
//   score: 85,
//   vitals: [...],
//   recommendations: [...],
//   metrics: { ... }
// }
```

## Common Patterns

```typescript
// Monitor API calls
const data = await performanceMonitor.measureAsync('api-users', () =>
  fetch('/api/users').then(r => r.json())
);

// Debounced search
const search = debounce(async (query) => {
  const results = await searchAPI(query);
  displayResults(results);
}, 300);

// Lazy load images
onMount(() => {
  lazyLoadImages();
});

// Preload critical data
preloadResource('/api/initial-data', 'fetch');

// Check performance in dev
if (import.meta.env.DEV) {
  const audit = await performanceAudit();
  console.log('Performance score:', audit.score);
}
```

## Web Vitals Thresholds

- **LCP** (Largest Contentful Paint): ≤2.5s good, ≤4s needs improvement
- **FID** (First Input Delay): ≤100ms good, ≤300ms needs improvement
- **CLS** (Cumulative Layout Shift): ≤0.1 good, ≤0.25 needs improvement

## Best Practices

1. Monitor critical operations
2. Use debounce for user input
3. Use throttle for scroll/resize
4. Lazy load below-fold images
5. Preload critical resources
6. Audit regularly in dev
7. Track Web Vitals
8. Optimize based on metrics
