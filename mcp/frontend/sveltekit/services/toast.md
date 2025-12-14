# Toast Service

**Location**: `src/lib/services/toast/toast.service.ts`

## Overview

The Toast Service provides a simple, event-driven API for displaying user notifications and feedback messages. It leverages the event system to publish toast notifications that are automatically handled by the toast store and rendered in the UI. The service supports multiple notification types (info, success, warning, error) with customizable positioning, duration, and dismissibility.

## Features

- **Event-Driven Architecture**: Uses pub-sub pattern via event bus
- **Multiple Variants**: Info, success, warning, and error toast types
- **Customizable Duration**: Auto-dismiss with configurable timing
- **Flexible Positioning**: Six position options (top/bottom, left/center/right)
- **User Control**: Optional dismiss button for manual closure
- **Auto-Generated IDs**: Unique identifiers for toast tracking
- **System Integration**: Automatic toasts for auth, token, and app lifecycle events

## Architecture

```
Toast Service
     ↓
Event Bus (publish TOAST_SHOW/HIDE/CLEAR)
     ↓
Toast Store (subscribes to events)
     ↓
UI Component (renders toasts)
```

## Core Methods

### `show(payload: ToastEventPayload): void`

Displays a toast notification with custom options.

**Parameters:**
- `payload.type`: Toast variant - `'info' | 'success' | 'warning' | 'error'`
- `payload.message`: The notification message (required)
- `payload.title`: Optional title for the toast
- `payload.duration`: Auto-dismiss time in milliseconds (default: 5000)
- `payload.position`: Screen position (default: 'top-right')
- `payload.dismissible`: Show close button (default: true)
- `payload.id`: Optional custom ID (auto-generated if not provided)

**Usage:**
```typescript
import { toastService } from '$lib/services/toast';

// Basic toast
toastService.show({
  type: 'info',
  message: 'Processing your request...'
});

// Custom toast with all options
toastService.show({
  type: 'success',
  message: 'Your changes have been saved',
  title: 'Success',
  duration: 3000,
  position: 'top-center',
  dismissible: true,
  id: 'save-success'
});

// Persistent toast (no auto-dismiss)
toastService.show({
  type: 'error',
  message: 'Critical error occurred',
  duration: 0, // Won't auto-dismiss
  dismissible: true
});
```

### `info(message: string, options?: Partial<ToastEventPayload>): void`

Shows an info toast notification.

**Default Duration**: 5000ms

**Usage:**
```typescript
// Simple info message
toastService.info('Your profile has been updated');

// With options
toastService.info('Processing data...', {
  title: 'Please Wait',
  position: 'bottom-right',
  duration: 3000
});
```

### `success(message: string, options?: Partial<ToastEventPayload>): void`

Shows a success toast notification.

**Default Duration**: 5000ms

**Usage:**
```typescript
// Simple success message
toastService.success('Document uploaded successfully');

// With options
toastService.success('Changes saved', {
  title: 'Success',
  duration: 3000
});
```

### `warning(message: string, options?: Partial<ToastEventPayload>): void`

Shows a warning toast notification.

**Default Duration**: 8000ms (longer than info/success)

**Usage:**
```typescript
// Simple warning
toastService.warning('Your session will expire in 5 minutes');

// With options
toastService.warning('Unsaved changes detected', {
  title: 'Warning',
  duration: 10000,
  dismissible: true
});
```

### `error(message: string, options?: Partial<ToastEventPayload>): void`

Shows an error toast notification.

**Default Duration**: 10000ms (longest duration)

**Usage:**
```typescript
// Simple error
toastService.error('Failed to load data');

// With options
toastService.error('Network connection lost', {
  title: 'Connection Error',
  duration: 0, // Persistent until dismissed
  dismissible: true
});
```

### `hide(id: string): void`

Hides a specific toast notification by its ID.

**Usage:**
```typescript
const toastId = 'my-custom-toast';

toastService.show({
  type: 'info',
  message: 'Loading...',
  id: toastId,
  duration: 0
});

// Hide it later
toastService.hide(toastId);
```

### `clear(): void`

Clears all currently displayed toast notifications.

**Usage:**
```typescript
// Remove all toasts
toastService.clear();
```

## Toast Positions

Available position values:
- `'top-left'`
- `'top-center'`
- `'top-right'` (default)
- `'bottom-left'`
- `'bottom-center'`
- `'bottom-right'`

**Usage:**
```typescript
toastService.info('Hello from the bottom!', {
  position: 'bottom-center'
});
```

## Store Integration

The toast service works with the toast store for state management:

```typescript
import { toastStore } from '$lib/stores/toast.store';

// Subscribe to toast state
toastStore.subscribe(state => {
  console.log('Active toasts:', state.toasts);
  console.log('Max toasts:', state.maxToasts);
});

// Manual store operations
toastStore.dismiss('toast-id'); // Dismiss specific toast
toastStore.clear(); // Clear all toasts
toastStore.setMaxToasts(10); // Set maximum visible toasts
```

**Toast Notification Structure:**
```typescript
interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  duration?: number;
  position?: string;
  dismissible?: boolean;
  createdAt: number;
}
```

## Events Published

The toast service publishes these events to the event bus:

### `CoreEventType.TOAST_SHOW`

Published when showing a toast.

**Payload:**
```typescript
{
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  duration: number;
  position: string;
  dismissible: boolean;
  timestamp: number;
}
```

### `CoreEventType.TOAST_HIDE`

Published when hiding a specific toast.

**Payload:**
```typescript
{
  id: string;
}
```

### `CoreEventType.TOAST_CLEAR`

Published when clearing all toasts.

**Payload:** `{}`

## Automatic System Toasts

The toast event handlers automatically display toasts for system events:

**Authentication Events:**
- `AUTH_LOGIN_SUCCESS`: "Welcome, {user}!" (success, 5s)
- `AUTH_LOGIN_FAILURE`: Error message (error, 7s)
- `AUTH_LOGOUT`: "You have been logged out." (info, 5s)

**Token Events:**
- `TOKEN_EXPIRED`: "Your session has expired." (warning, 8s)

**Application Events:**
- `APP_INITIALIZED`: "Application initialized successfully" (info, 3s)
- `APP_ERROR`: Error message (error, 10s)

**Navigation Events:**
- `NAVIGATION_END` (with error): Navigation error message (error, 7s)

**Initialization:**
```typescript
import { initToastEventHandlers, destroyToastEventHandlers } from '$lib/services/toast';

// Initialize handlers (usually in +layout.svelte)
initToastEventHandlers();

// Clean up on destroy
onDestroy(() => {
  destroyToastEventHandlers();
});
```

## Common Patterns

### Form Submission Feedback

```typescript
async function handleSubmit() {
  try {
    toastService.info('Saving changes...');
    await saveData();
    toastService.success('Changes saved successfully');
  } catch (error) {
    toastService.error(`Failed to save: ${error.message}`);
  }
}
```

### Multi-Step Process

```typescript
async function processData() {
  const toastId = 'process-toast';

  toastService.info('Processing data...', {
    id: toastId,
    duration: 0 // Don't auto-dismiss
  });

  try {
    await step1();
    await step2();
    await step3();

    toastService.hide(toastId);
    toastService.success('Processing complete!');
  } catch (error) {
    toastService.hide(toastId);
    toastService.error('Processing failed');
  }
}
```

### User Action Confirmation

```typescript
async function deleteItem(id: string) {
  try {
    await api.delete(`/items/${id}`);
    toastService.success('Item deleted', {
      duration: 3000
    });
  } catch (error) {
    toastService.error('Failed to delete item', {
      duration: 0, // Keep visible until dismissed
      dismissible: true
    });
  }
}
```

### Responsive Positioning

```typescript
import { browser } from '$lib/utils/browser';

function showNotification(message: string) {
  const position = browser && window.innerWidth < 768
    ? 'top-center' // Mobile
    : 'top-right'; // Desktop

  toastService.info(message, { position });
}
```

## Error Handling

The toast service validates inputs and provides fallbacks:

- Invalid toast types default to `'info'`
- Missing IDs are auto-generated
- Missing durations use defaults (5s, 8s, or 10s)
- Missing positions default to `'top-right'`

```typescript
// These all work without errors
toastService.show({ type: 'invalid', message: 'Test' }); // Falls back to 'info'
toastService.show({ type: 'success', message: 'Test' }); // Auto-generates ID
```

## Integration with Other Services

The toast service integrates seamlessly with:

**Event Bus**: All toasts are published as events
```typescript
import { subscribe, CoreEventType } from '$lib/services/events';

// Listen for toast events
subscribe(CoreEventType.TOAST_SHOW, (payload, event) => {
  console.log('Toast shown:', payload.message);
});
```

**Auth Service**: Automatic toasts for login/logout
**Token Service**: Automatic toasts for session expiration
**API Service**: Can be used for request feedback

## Testing

```typescript
import { describe, test, expect, vi } from 'vitest';
import { toastService } from '$lib/services/toast';

describe('Toast Service', () => {
  test('shows info toast', () => {
    const spy = vi.spyOn(console, 'log');
    toastService.info('Test message');
    expect(spy).toHaveBeenCalled();
  });

  test('shows error toast with custom duration', () => {
    toastService.error('Error message', { duration: 15000 });
    // Verify event was published
  });
});
```

## Dependencies

- **Event Bus**: Core pub-sub system for publishing toast events
- **Toast Store**: State management for active toasts
- **Event Types**: TypeScript definitions for toast payloads

## Configuration

Toast defaults are defined in `toast.service.ts`:

```typescript
const DEFAULT_TOAST_OPTIONS = {
  duration: 5000,
  position: 'top-right',
  dismissible: true
};
```

Duration defaults by type:
- Info/Success: 5000ms
- Warning: 8000ms
- Error: 10000ms

## Related Documentation

- [Events Service](./events.md)
- [Toast Store](../stores/toast.md)
- [Event Types](../types/event-types.md)

---

**Built for agentic development by [XBG Solutions](https://xbg.solutions)**
