# Tab Sync Store

## Overview
Manages tab synchronization state across multiple browser tabs. Tracks which tab is the primary tab, authentication state synchronization, online/offline status, and cross-tab communication. Enables seamless multi-tab authentication and state coordination.

## Store Location
`src/lib/stores/tab-sync.store.ts`

## State Structure

```typescript
interface TabSyncState {
  isInitialized: boolean;       // Whether the service has been initialized
  isPrimaryTab: boolean;        // Whether this tab is currently the primary tab
  tabId: string;                // ID of the current tab
  isAuthenticated: boolean;     // Whether the user is authenticated in this tab
  isVisible: boolean;           // Whether the tab is currently visible
  isOnline: boolean;            // Whether the browser is online
  knownTabs: Record<string, TabInfo>; // Record of all known tabs
  lastActive: number;           // Last time this tab was active
  lastAuthStateUpdate: number;  // Last time auth state was updated
  offlineQueue: QueuedMessage[]; // Queue of messages to process when returning online
  recentAuthAttempts: number[]; // Recent auth attempts (for rate limiting)
  error: AppError | null;       // Error state if something goes wrong
}

interface TabInfo {
  lastSeen: number;             // Timestamp of last heartbeat
  isPrimary: boolean;           // Whether this tab has claimed primary status
  isAuthenticated: boolean;     // Authentication state in this tab
  isVisible?: boolean;          // Whether the tab is currently visible
}

interface QueuedMessage {
  id: string;                   // Unique message ID
  type: string;                 // Message type
  data: any;                    // Message data
  timestamp: number;            // When message was created
  attempts: number;             // Number of attempts to send
}
```

## Key State Fields

### Tab Management
- **tabId** - Unique identifier for the current tab
- **isPrimaryTab** - True if this tab has primary responsibility (e.g., token refresh)
- **knownTabs** - Information about all active tabs

### Synchronization
- **isAuthenticated** - Auth state synchronized across tabs
- **lastAuthStateUpdate** - Timestamp of last auth state change
- **recentAuthAttempts** - Track auth attempts for rate limiting

### Connectivity
- **isOnline** - Browser connectivity status
- **isVisible** - Document visibility (for performance optimization)
- **offlineQueue** - Messages queued while offline

## Usage Examples

### Subscribe to Tab Sync State
```typescript
import { tabSyncStore } from '$lib/stores/tab-sync.store';

tabSyncStore.subscribe($tabSync => {
  console.log('Is primary tab:', $tabSync.isPrimaryTab);
  console.log('Tab ID:', $tabSync.tabId);
  console.log('Known tabs:', Object.keys($tabSync.knownTabs).length);
});
```

### Check if Primary Tab
```typescript
import { tabSyncStore } from '$lib/stores/tab-sync.store';
import { get } from 'svelte/store';

const $tabSync = get(tabSyncStore);
if ($tabSync.isPrimaryTab) {
  // Perform primary tab operations (e.g., token refresh)
}
```

### Update Authentication State
```typescript
import { tabSyncStore } from '$lib/stores/tab-sync.store';

tabSyncStore.update(state => ({
  ...state,
  isAuthenticated: true,
  lastAuthStateUpdate: Date.now()
}));
```

### Track Tab Visibility
```typescript
import { tabSyncStore } from '$lib/stores/tab-sync.store';

document.addEventListener('visibilitychange', () => {
  tabSyncStore.update(state => ({
    ...state,
    isVisible: document.visibilityState === 'visible',
    lastActive: Date.now()
  }));
});
```

### Queue Offline Message
```typescript
import { tabSyncStore } from '$lib/stores/tab-sync.store';

tabSyncStore.update(state => ({
  ...state,
  offlineQueue: [
    ...state.offlineQueue,
    {
      id: generateId(),
      type: 'auth:refresh',
      data: { reason: 'token-expiring' },
      timestamp: Date.now(),
      attempts: 0
    }
  ]
}));
```

### Update Online Status
```typescript
import { tabSyncStore } from '$lib/stores/tab-sync.store';

window.addEventListener('online', () => {
  tabSyncStore.update(state => ({
    ...state,
    isOnline: true
  }));
});

window.addEventListener('offline', () => {
  tabSyncStore.update(state => ({
    ...state,
    isOnline: false
  }));
});
```

### Register New Tab
```typescript
import { tabSyncStore } from '$lib/stores/tab-sync.store';

tabSyncStore.update(state => {
  const newTabId = generateTabId();

  return {
    ...state,
    tabId: newTabId,
    knownTabs: {
      ...state.knownTabs,
      [newTabId]: {
        lastSeen: Date.now(),
        isPrimary: false,
        isAuthenticated: false,
        isVisible: true
      }
    }
  };
});
```

## Integration Points

- **Tab Sync Service** (`src/lib/services/tab-sync.service.ts`) - Manages tab coordination
- **Auth Store** (`src/lib/stores/auth.store.ts`) - Synchronizes authentication state
- **Broadcast Channel API** - Cross-tab communication
- **Local Storage Events** - Fallback for tab sync
- **Visibility API** - Track tab visibility
- **Network Information API** - Track online/offline status

## Event Types

Tab sync publishes and listens for these events:

- `TAB_SYNC:INITIALIZED` - Tab sync initialized
- `TAB_SYNC:PRIMARY_CHANGED` - Primary tab changed
- `TAB_SYNC:AUTH_STATE` - Auth state synchronized
- `TAB_SYNC:TAB_JOINED` - New tab joined
- `TAB_SYNC:TAB_LEFT` - Tab closed
- `TAB_SYNC:ERROR` - Tab sync error occurred

## Primary Tab Responsibilities

The primary tab handles:
1. Token refresh operations
2. Periodic auth state validation
3. Broadcasting auth changes to other tabs
4. Managing shared resources

## Best Practices

1. Always check `isPrimaryTab` before performing primary-only operations
2. Use offline queue for operations that can be deferred
3. Respect rate limiting in `recentAuthAttempts`
4. Clean up `knownTabs` entries for closed tabs
5. Handle online/offline transitions gracefully
6. Update `lastActive` on user interaction
7. Synchronize auth state immediately on changes
8. Process offline queue when returning online
