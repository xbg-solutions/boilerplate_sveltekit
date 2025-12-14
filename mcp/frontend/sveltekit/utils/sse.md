# Server-Sent Events (SSE) Utilities

## Overview

Real-time event stream handling with automatic reconnection, error handling, and event system integration.

**Location:** `src/lib/utils/sse.ts`

## Key Features

- Automatic reconnection
- Event type filtering
- Progress tracking
- Error handling
- Credentials support
- Connection state management

## SSEConnection Class

### Constructor
```typescript
const connection = new SSEConnection({
  url: '/api/events',
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 3000,
  headers: { 'Authorization': `Bearer ${token}` },
  withCredentials: true,
  eventTypes: ['message', 'update', 'notification']
});
```

### Methods

#### connect
```typescript
connection.connect();
```

#### on
Register event handler.

```typescript
const unsubscribe = connection.on('message', (data, event) => {
  console.log('Message:', data);
});

// Unsubscribe
unsubscribe();
```

#### onError
Register error handler.

```typescript
connection.onError((error) => {
  console.error('SSE error:', error);
});
```

#### disconnect
```typescript
connection.disconnect();
```

#### getState
```typescript
const state = connection.getState();
// 'connecting' | 'open' | 'closed' | 'error'
```

#### isConnected
```typescript
if (connection.isConnected()) {
  // Connection is open
}
```

## Helper Functions

### createSSEConnection
```typescript
const connection = createSSEConnection({
  url: '/api/stream',
  autoReconnect: true
});
```

### streamSSE
Simple SSE usage with cleanup.

```typescript
const cleanup = streamSSE(
  '/api/notifications',
  (data) => {
    showNotification(data);
  },
  {
    autoReconnect: true,
    withCredentials: true
  }
);

// Later: cleanup();
```

### streamFetch
For fetch-based streaming (not SSE).

```typescript
for await (const chunk of streamFetch('/api/stream')) {
  console.log('Chunk:', chunk);
}
```

## Common Patterns

### Real-Time Notifications
```svelte
<script>
  import { createSSEConnection } from '$lib/utils/sse';
  import { onMount, onDestroy } from 'svelte';
  
  let connection;
  let notifications = [];
  
  onMount(() => {
    connection = createSSEConnection({
      url: '/api/notifications/stream',
      withCredentials: true
    });
    
    connection.on('notification', (data) => {
      notifications = [...notifications, data];
    });
    
    connection.onError((error) => {
      console.error('Connection error:', error);
    });
    
    connection.connect();
  });
  
  onDestroy(() => {
    connection?.disconnect();
  });
</script>

{#each notifications as notif}
  <div>{notif.message}</div>
{/each}
```

### AI Streaming Response
```typescript
const connection = createSSEConnection({
  url: '/api/ai/stream',
  eventTypes: ['token', 'complete', 'error']
});

let response = '';

connection.on('token', (data) => {
  response += data.token;
  updateUI(response);
});

connection.on('complete', () => {
  console.log('Complete response:', response);
  connection.disconnect();
});

connection.on('error', (data) => {
  console.error('AI Error:', data.error);
});

connection.connect();
```

### Live Updates
```typescript
const connection = createSSEConnection({
  url: '/api/live-updates',
  autoReconnect: true,
  maxReconnectAttempts: 10
});

connection.on('update', (data) => {
  updateDashboard(data);
});

connection.connect();
```

## Configuration

```typescript
interface SSEConfig {
  url: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  eventTypes?: string[];
}
```

## Connection States

- **connecting**: Initial connection
- **open**: Connected and ready
- **closed**: Disconnected
- **error**: Connection error occurred

## Events Published

- `sse:connected` - Connection established
- `sse:disconnected` - Connection closed
- `sse:error` - Connection error
- `sse:max_reconnects` - Max reconnection attempts reached
- `sse:{eventType}` - Custom event received

## Integration Points

- **Event System**: Publishes SSE events
- **Logger Service**: Logs all operations
- **Error Handler**: Handles connection errors

## Best Practices

1. Always disconnect on component unmount
2. Handle errors gracefully
3. Set appropriate reconnect limits
4. Use credentials for authenticated streams
5. Filter event types for efficiency
6. Monitor connection state
7. Test reconnection logic
