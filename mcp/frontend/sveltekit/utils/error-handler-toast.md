# Error Handler Toast Integration

## Overview

Integration between error handler and toast notifications for showing user-friendly error messages.

**Location:** `src/lib/utils/error-handler-toast.ts`

## Key Functions

### showErrorToast
Show toast notification for an error.

```typescript
import { showErrorToast } from '$lib/utils/error-handler-toast';

try {
  await riskyOperation();
} catch (error) {
  showErrorToast(error);
}
```

**Options:**
```typescript
showErrorToast(error, {
  includeDetails: false,
  category: 'api',
  title: 'Operation Failed',
  duration: 7000
});
```

### showSuccessToast
Show success notification.

```typescript
showSuccessToast('User created successfully', {
  title: 'Success',
  duration: 5000
});
```

### showWarningToast
Show warning notification.

```typescript
showWarningToast('Unsaved changes detected', {
  title: 'Warning',
  duration: 6000
});
```

### showInfoToast
Show informational notification.

```typescript
showInfoToast('New features available', {
  title: 'Information',
  duration: 4000
});
```

### withToastNotification
Wrapper that shows toast on success/error.

```typescript
const saveWithToast = withToastNotification(
  saveUser,
  'User saved successfully'
);

await saveWithToast(userData);
// Shows success toast on success, error toast on failure
```

## Common Patterns

### API Error Handling
```typescript
import { showErrorToast, showSuccessToast } from '$lib/utils/error-handler-toast';

async function createUser(data) {
  try {
    await api.post('/users', data);
    showSuccessToast('User created successfully');
  } catch (error) {
    showErrorToast(error);
  }
}
```

### Form Submission
```svelte
<script>
  import { showErrorToast, showSuccessToast } from '$lib/utils/error-handler-toast';
  
  async function handleSubmit() {
    try {
      const result = await submitForm(formData);
      showSuccessToast('Form submitted successfully');
      goto('/success');
    } catch (error) {
      showErrorToast(error, {
        title: 'Submission Failed'
      });
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <!-- form fields -->
  <button type="submit">Submit</button>
</form>
```

### With Wrapper Function
```typescript
import { withToastNotification } from '$lib/utils/error-handler-toast';

const deleteUserWithToast = withToastNotification(
  deleteUser,
  'User deleted successfully',
  { category: 'user', duration: 5000 }
);

// Use it
await deleteUserWithToast(userId);
```

### Different Toast Types
```typescript
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast
} from '$lib/utils/error-handler-toast';

// Error
showErrorToast(error);

// Success
showSuccessToast('Operation completed');

// Warning
showWarningToast('This action cannot be undone');

// Info
showInfoToast('Pro tip: Use keyboard shortcuts');
```

### Custom Options
```typescript
showErrorToast(error, {
  title: 'Upload Failed',
  includeDetails: import.meta.env.DEV,
  category: 'upload',
  duration: 10000
});
```

## Error Toast Options

```typescript
interface ErrorToastOptions {
  includeDetails?: boolean;     // Show tech details (default: false in prod)
  category?: string;             // Error category for title
  title?: string;                // Custom title
  duration?: number;             // Duration in ms
  // ... other ToastEventPayload options
}
```

## Toast Durations

- Error: 7000ms (7 seconds)
- Success: 5000ms (5 seconds)
- Warning: 6000ms (6 seconds)
- Info: 4000ms (4 seconds)

## Integration Points

- **Error Handler**: Uses normalizeError
- **Toast Service**: Displays notifications
- **Logger**: Automatic logging

## Best Practices

1. Always show error toasts for user-facing errors
2. Use success toasts for confirmations
3. Use warnings for important notices
4. Keep messages concise
5. Use appropriate durations
6. Include user-friendly messages
7. Don't show tech details in production
8. Use wrappers for common operations

## Examples

### Complete CRUD with Toasts
```typescript
import {
  showErrorToast,
  showSuccessToast,
  withToastNotification
} from '$lib/utils/error-handler-toast';

export const userService = {
  create: withToastNotification(
    (data) => api.post('/users', data),
    'User created successfully'
  ),
  
  update: withToastNotification(
    (id, data) => api.put(`/users/${id}`, data),
    'User updated successfully'
  ),
  
  delete: withToastNotification(
    (id) => api.delete(`/users/${id}`),
    'User deleted successfully'
  )
};
```

### Try-Catch with Toast
```typescript
async function uploadFile(file) {
  try {
    const result = await upload(file);
    showSuccessToast(`${file.name} uploaded successfully`);
    return result;
  } catch (error) {
    showErrorToast(error, {
      title: 'Upload Failed',
      category: 'upload'
    });
    throw error; // Re-throw if needed
  }
}
```
