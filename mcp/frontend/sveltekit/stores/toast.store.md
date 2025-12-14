# Toast Store

## Overview
Manages the state of toast notifications throughout the application. Integrates with the event system to show, hide, and clear toast notifications. Automatically handles toast display duration and limits the number of concurrent toasts.

## Store Location
`src/lib/stores/toast.store.ts`

## State Structure

```typescript
interface ToastStoreState {
  toasts: ToastNotification[];  // Array of active toasts
  maxToasts: number;            // Maximum number of toasts shown at once (default: 5)
}

interface ToastNotification {
  id: string;                   // Unique toast identifier
  type: 'info' | 'success' | 'warning' | 'error'; // Toast type
  message: string;              // Message to display
  duration?: number;            // Display duration in ms (default: 5000)
  createdAt: number;            // Timestamp when toast was created
}
```

## Key Methods

- `dismiss(id: string)` - Dismiss a specific toast by ID
- `clear()` - Clear all active toasts
- `setMaxToasts(max: number)` - Set maximum number of concurrent toasts
- `destroy()` - Clean up event subscriptions

## Usage Examples

### Subscribe to Toast State
```typescript
import { toastStore } from '$lib/stores/toast.store';

toastStore.subscribe($toasts => {
  console.log('Active toasts:', $toasts.toasts);
  console.log('Max toasts:', $toasts.maxToasts);
});
```

### Show Toast via Event System
```typescript
import { publish } from '$lib/services/events';
import { CoreEventType } from '$lib/types/event.types';

// Show info toast
publish(CoreEventType.TOAST_SHOW, {
  type: 'info',
  message: 'Operation successful',
  duration: 5000
});

// Show error toast
publish(CoreEventType.TOAST_SHOW, {
  type: 'error',
  message: 'Something went wrong',
  duration: 7000
});

// Show toast with custom ID
publish(CoreEventType.TOAST_SHOW, {
  id: 'unique-toast-id',
  type: 'success',
  message: 'Item saved',
  duration: 3000
});
```

### Dismiss Toast
```typescript
import { toastStore } from '$lib/stores/toast.store';

toastStore.dismiss('toast-id');
```

### Clear All Toasts
```typescript
import { toastStore } from '$lib/stores/toast.store';

toastStore.clear();
```

### Set Maximum Toasts
```typescript
import { toastStore } from '$lib/stores/toast.store';

toastStore.setMaxToasts(3); // Only show 3 toasts at once
```

### Hide Toast via Event
```typescript
import { publish } from '$lib/services/events';
import { CoreEventType } from '$lib/types/event.types';

publish(CoreEventType.TOAST_HIDE, {
  id: 'toast-id'
});
```

### Clear All via Event
```typescript
import { publish } from '$lib/services/events';
import { CoreEventType } from '$lib/types/event.types';

publish(CoreEventType.TOAST_CLEAR);
```

## Integration Points

- **Event System** (`src/lib/services/events`) - Listens to toast events
- **Core Event Types** (`src/lib/types/event.types.ts`) - `TOAST_SHOW`, `TOAST_HIDE`, `TOAST_CLEAR`
- **Toast Component** - Displays toasts from store
- **Error Handlers** - Publish error toasts
- **Success Handlers** - Publish success notifications

## Event Types Listened

- `CoreEventType.TOAST_SHOW` - Show a new toast
- `CoreEventType.TOAST_HIDE` - Hide a specific toast
- `CoreEventType.TOAST_CLEAR` - Clear all toasts

## State Flow

1. **Event Received**: `TOAST_SHOW` event published
2. **Validation**: Toast type, message, duration validated
3. **ID Generation**: Unique ID generated if not provided
4. **Store Update**: Toast added to array (limited by `maxToasts`)
5. **Auto-Dismiss**: Timeout set to auto-dismiss after duration
6. **Manual Dismiss**: User or code calls `dismiss()` or publishes `TOAST_HIDE`

## Auto-Dismiss Behavior

- Toasts with `duration > 0` automatically dismiss after the specified time
- Toasts with `duration = 0` or negative values stay until manually dismissed
- Default duration is 5000ms (5 seconds)

## Toast Limits

- Maximum toasts shown controlled by `maxToasts` (default: 5)
- When limit reached, oldest toasts are removed
- Prevents toast overflow and UI clutter

## Best Practices

1. Always use the event system to show toasts (publish `TOAST_SHOW`)
2. Set appropriate durations (errors: longer, info: shorter)
3. Provide clear, concise messages
4. Use correct toast types for semantic meaning
5. Don't exceed `maxToasts` limit to avoid UI clutter
6. Clean up store with `destroy()` when unmounting root component
7. Use unique IDs when you need to programmatically dismiss specific toasts
