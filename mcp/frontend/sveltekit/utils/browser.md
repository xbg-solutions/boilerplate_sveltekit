# Browser Detection Utility

## Overview

Simple utility to detect browser environment vs server-side rendering (SSR).

**Location:** `src/lib/utils/browser.ts`

## Export

### browser
Boolean indicating browser environment.

```typescript
export const browser = typeof window !== 'undefined';
```

## Usage

```typescript
import { browser } from '$lib/utils/browser';

if (browser) {
  // Client-side code
  localStorage.setItem('key', 'value');
  window.addEventListener('resize', handler);
} else {
  // Server-side code
  console.log('Running on server');
}
```

## Common Patterns

### Conditional Logic
```typescript
import { browser } from '$lib/utils/browser';

function initializeApp() {
  if (browser) {
    // Initialize client-side features
    setupEventListeners();
    loadFromLocalStorage();
  }
}
```

### Component Mounting
```svelte
<script>
  import { browser } from '$lib/utils/browser';
  import { onMount } from 'svelte';
  
  if (browser) {
    onMount(() => {
      // Safe to use window here
      window.addEventListener('scroll', handleScroll);
    });
  }
</script>
```

### Storage Access
```typescript
import { browser } from '$lib/utils/browser';

function getStoredValue(key: string) {
  if (browser) {
    return localStorage.getItem(key);
  }
  return null;
}
```

### Feature Detection
```typescript
import { browser } from '$lib/utils/browser';

const hasGeolocation = browser && 'geolocation' in navigator;
const hasNotifications = browser && 'Notification' in window;
```

## Why Use This?

Instead of checking `typeof window !== 'undefined'` throughout your codebase, import this constant for consistency and readability.

```typescript
// ✅ Good
import { browser } from '$lib/utils/browser';
if (browser) { /* ... */ }

// ❌ Verbose
if (typeof window !== 'undefined') { /* ... */ }
```

## Testing

Useful for testing as it provides a single point to mock browser detection.

```typescript
// In tests
import * as browserModule from '$lib/utils/browser';
jest.spyOn(browserModule, 'browser', 'get').mockReturnValue(false);
```
