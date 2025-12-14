# Tab Sync Service

## Overview

The Tab Sync Service synchronizes critical state across multiple browser tabs, particularly authentication state. It uses BroadcastChannel API (with localStorage fallback) to communicate between tabs, manages primary tab election, and handles cross-tab coordination for auth events, visibility changes, and online/offline status.

## Location

- **Service**: `/src/lib/services/tab-sync/tab-sync.service.ts`
- **Store**: `/src/lib/stores/tab-sync.store.ts`
- **Export**: `/src/lib/services/tab-sync/index.ts`
- **Constants**: `/src/lib/constants/tab-sync.constants.ts`
- **Types**: `/src/lib/types/tab-sync.types.ts`

## Key Features

- **Cross-Tab Messaging**: BroadcastChannel API with localStorage fallback
- **Primary Tab Election**: Automatic primary tab negotiation and failover
- **Auth Synchronization**: Login/logout synced across all tabs
- **Heartbeat System**: Detects and removes stale tabs
- **Offline Support**: Message queuing when offline
- **Visibility Tracking**: Monitors tab visibility state
- **Rate Limiting**: Prevents rapid auth attempt loops

## Key Methods

### initialize()

Initializes the tab sync service.

```typescript
await tabSyncService.initialize();
```

**Behavior**:
- Generates unique tab ID
- Sets up communication channel (BroadcastChannel or localStorage)
- Registers event handlers for auth state changes
- Starts heartbeat and cleanup intervals
- Negotiates primary tab status
- Returns true if successful, false otherwise

### isPrimaryTab()

Check if current tab is the primary tab.

```typescript
if (tabSyncService.isPrimaryTab()) {
  // Perform primary-tab-only operations
  console.log('This is the primary tab');
}
```

**Returns**: Boolean indicating primary status

### forceSync()

Force synchronization of auth state across tabs.

```typescript
await tabSyncService.forceSync();
```

Useful when you need to manually trigger state synchronization.

### broadcastMessage(type, data)

Broadcast a custom message to other tabs.

```typescript
tabSyncService.broadcastMessage('custom:event', {
  action: 'data-updated',
  entityId: '123',
  timestamp: Date.now()
});
```

**Parameters**:
- `type` - Custom message type
- `data` - Payload to send to other tabs

**Usage**: Other tabs receive via `TAB_SYNC_EVENTS.MESSAGE_RECEIVED` event

### getTabsInfo()

Get information about all known tabs.

```typescript
const tabs = tabSyncService.getTabsInfo();
console.log('Known tabs:', Object.keys(tabs).length);

Object.entries(tabs).forEach(([tabId, info]) => {
  console.log(`Tab ${tabId}:`, info.isPrimary ? 'PRIMARY' : 'secondary');
});
```

**Returns**: Record of tab IDs to TabInfo objects

### getCurrentTabInfo()

Get current tab's information.

```typescript
const info = tabSyncService.getCurrentTabInfo();
console.log('Last seen:', info.lastSeen);
console.log('Is primary:', info.isPrimary);
console.log('Is authenticated:', info.isAuthenticated);
console.log('Is visible:', info.isVisible);
```

**Returns**: TabInfo for current tab

### destroy()

Clean up and destroy the service.

```typescript
tabSyncService.destroy();
```

Unregisters handlers, clears intervals, closes channels, and resets state.

## Events

The service publishes events via the event system:

### TAB_SYNC_EVENTS.INITIALIZED

Published when service initializes.

```typescript
subscribe(TAB_SYNC_EVENTS.INITIALIZED, (event) => {
  console.log('Tab sync ready:', event.payload.tabId);
});
```

### TAB_SYNC_EVENTS.PRIMARY_TAB_CHANGED

Published when primary tab changes.

```typescript
subscribe(TAB_SYNC_EVENTS.PRIMARY_TAB_CHANGED, (event) => {
  console.log('Primary status:', event.payload.isPrimary);
});
```

### TAB_SYNC_EVENTS.AUTH_STATE_SYNCED

Published when auth state is synchronized.

```typescript
subscribe(TAB_SYNC_EVENTS.AUTH_STATE_SYNCED, (event) => {
  console.log('Auth synced:', event.payload.action); // 'login' or 'logout'
  console.log('Source:', event.payload.source); // 'local' or 'remote'
});
```

### TAB_SYNC_EVENTS.TAB_JOINED

Published when a new tab joins.

```typescript
subscribe(TAB_SYNC_EVENTS.TAB_JOINED, (event) => {
  console.log('New tab joined:', event.payload.tabId);
});
```

### TAB_SYNC_EVENTS.TAB_LEFT

Published when a tab leaves/closes.

```typescript
subscribe(TAB_SYNC_EVENTS.TAB_LEFT, (event) => {
  console.log('Tab left:', event.payload.tabId);
});
```

### TAB_SYNC_EVENTS.MESSAGE_RECEIVED

Published when custom message received from another tab.

```typescript
subscribe(TAB_SYNC_EVENTS.MESSAGE_RECEIVED, (event) => {
  console.log('Message type:', event.payload.type);
  console.log('Data:', event.payload.data);
  console.log('From tab:', event.payload.sourceTabId);
});
```

### TAB_SYNC_EVENTS.ONLINE_STATUS_CHANGED

Published when online/offline status changes.

```typescript
subscribe(TAB_SYNC_EVENTS.ONLINE_STATUS_CHANGED, (event) => {
  console.log('Online:', event.payload.isOnline);
});
```

### TAB_SYNC_EVENTS.RAPID_AUTH_ATTEMPTS

Published when too many auth attempts detected.

```typescript
subscribe(TAB_SYNC_EVENTS.RAPID_AUTH_ATTEMPTS, (event) => {
  console.warn('Rapid auth attempts:', event.payload.count);
});
```

## Usage Examples

### Basic Setup

```typescript
import { tabSyncService } from '$lib/services/tab-sync';
import { browser } from '$app/environment';

if (browser) {
  // Initialize tab sync during app startup
  await tabSyncService.initialize();
}
```

### Monitor Primary Tab Status

```typescript
import { tabSyncStore } from '$lib/services/tab-sync';

// Subscribe to tab sync state
tabSyncStore.subscribe(state => {
  if (state.isPrimaryTab) {
    console.log('This is the primary tab');
    // Perform primary-only operations
    startPeriodicDataSync();
  } else {
    console.log('This is a secondary tab');
    stopPeriodicDataSync();
  }
});
```

### React to Auth Synchronization

```typescript
import { subscribe } from '$lib/services/events';
import { TAB_SYNC_EVENTS } from '$lib/services/tab-sync';

// Listen for auth sync events
subscribe(TAB_SYNC_EVENTS.AUTH_STATE_SYNCED, (event) => {
  const { action, source } = event.payload;

  if (action === 'logout' && source === 'remote') {
    // Another tab logged out
    console.log('Logged out in another tab, redirecting...');
    window.location.href = '/login';
  } else if (action === 'login' && source === 'remote') {
    // Another tab logged in
    console.log('Logged in from another tab, refreshing...');
    window.location.reload();
  }
});
```

### Custom Cross-Tab Messages

```typescript
// In Tab 1 - Send a message
tabSyncService.broadcastMessage('cart:updated', {
  items: cartItems,
  total: cartTotal
});

// In Tab 2 - Receive the message
subscribe(TAB_SYNC_EVENTS.MESSAGE_RECEIVED, (event) => {
  if (event.payload.type === 'cart:updated') {
    console.log('Cart updated in another tab');
    updateLocalCart(event.payload.data);
  }
});
```

### Primary Tab Operations

```typescript
// Only perform expensive operations on primary tab
function startBackgroundTasks() {
  if (tabSyncService.isPrimaryTab()) {
    console.log('Starting background tasks on primary tab');

    // Start periodic tasks
    setInterval(() => {
      // Only runs on primary tab
      syncWithServer();
    }, 30000);
  }
}

// Monitor for primary tab changes
subscribe(TAB_SYNC_EVENTS.PRIMARY_TAB_CHANGED, (event) => {
  if (event.payload.isPrimary) {
    startBackgroundTasks();
  } else {
    stopBackgroundTasks();
  }
});
```

### Monitor Tab Activity

```typescript
import { tabSyncStore, TAB_SYNC_EVENTS } from '$lib/services/tab-sync';

// Monitor all tabs
subscribe(TAB_SYNC_EVENTS.TAB_JOINED, (event) => {
  console.log(`Tab ${event.payload.tabId} joined`);
  showNotification('New tab opened');
});

subscribe(TAB_SYNC_EVENTS.TAB_LEFT, (event) => {
  console.log(`Tab ${event.payload.tabId} left`);
});

// Get current tab count
$: tabCount = Object.keys($tabSyncStore.knownTabs).length + 1;
console.log(`Active tabs: ${tabCount}`);
```

### Force Sync After Manual Auth Change

```typescript
async function updateAuthState() {
  // Make some auth changes
  await authService.updateProfile(newProfile);

  // Force sync to other tabs
  await tabSyncService.forceSync();
}
```

### Safe Wrappers

```typescript
import { safeInitialize, safeForceSync } from '$lib/services/tab-sync';

// Initialize safely (doesn't throw)
const result = await safeInitialize();
if (result.success) {
  console.log('Tab sync initialized');
} else {
  console.error('Tab sync failed:', result.error);
}

// Force sync safely
await safeForceSync();
```

## Store Structure

The `tabSyncStore` tracks tab sync state:

```typescript
{
  isInitialized: boolean,           // Service initialized
  isPrimaryTab: boolean,             // This tab is primary
  tabId: string,                     // Unique tab identifier
  isAuthenticated: boolean,          // Current auth state
  isVisible: boolean,                // Tab visibility state
  isOnline: boolean,                 // Online/offline state
  knownTabs: {                       // Other known tabs
    [tabId: string]: {
      lastSeen: number,
      isPrimary: boolean,
      isAuthenticated: boolean,
      isVisible?: boolean
    }
  },
  lastActive: number,                // Last activity timestamp
  lastAuthStateUpdate: number,       // Last auth update timestamp
  offlineQueue: QueuedMessage[],     // Queued messages when offline
  recentAuthAttempts: number[],      // Recent auth attempt timestamps
  error: AppError | null             // Initialization error
}
```

## Integration Notes

- **BroadcastChannel**: Uses BroadcastChannel API when available
- **localStorage Fallback**: Falls back to localStorage for older browsers
- **Auth Integration**: Automatically syncs with auth service events
- **Heartbeat**: 30-second heartbeat interval (configurable)
- **Tab Timeout**: 90-second timeout for stale tab cleanup (configurable)
- **Offline Queue**: Queues up to 50 messages when offline (configurable)
- **SSR Safe**: Skips initialization in server-side rendering
- **Singleton**: Single instance shared across the application
