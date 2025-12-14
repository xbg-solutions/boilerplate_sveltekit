# CSRF Protection Utility

## Overview

CSRF protection using double-submit cookie pattern with automatic token generation, validation, request protection, and integration with secure storage.

**Location:** `src/lib/utils/csrf.ts`

## Key Features

- Double-submit cookie pattern
- Automatic token generation
- Request method filtering (POST, PUT, DELETE, PATCH)
- Token refresh mechanisms
- Form and fetch integration
- Safe methods that never throw

## Key Functions

### generateCsrfToken
Generates a new CSRF token and stores it.

```typescript
const token = await csrfProtection.generateCsrfToken();
```

### getCsrfToken
Gets the current CSRF token, generating if needed.

```typescript
const token = await csrfProtection.getCsrfToken();
```

### refreshCsrfToken
Refreshes the CSRF token.

```typescript
const newToken = await csrfProtection.refreshCsrfToken();
```

### validateCsrfToken
Validates a CSRF token against stored token.

```typescript
const isValid = csrfProtection.validateCsrfToken(token);
```

### protectRequest
Adds CSRF protection to a fetch request.

```typescript
const protectedInit = await csrfProtection.protectRequest(
  '/api/data',
  {
    method: 'POST',
    body: JSON.stringify(data)
  }
);

const response = await fetch('/api/data', protectedInit);
```

### createCsrfFormField
Creates HTML input field with CSRF token.

```typescript
const fieldHtml = await csrfProtection.createCsrfFormField();
// <input type="hidden" name="X-CSRF-Token" value="...">
```

### protectFormData
Adds CSRF protection to FormData.

```typescript
const protectedFormData = await csrfProtection.protectFormData(formData);
```

### handleValidationFailure
Handles CSRF validation failures with automatic retry.

```typescript
await csrfProtection.handleValidationFailure({
  url: '/api/endpoint',
  method: 'POST',
  retryCount: 0
});
```

### clearTokens
Clears all CSRF tokens.

```typescript
csrfProtection.clearTokens();
```

## Common Patterns

### Protect Fetch Requests
```typescript
import { csrfProtection } from '$lib/utils/csrf';

async function createUser(userData) {
  const init = await csrfProtection.protectRequest(
    '/api/users',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }
  );
  
  return fetch('/api/users', init);
}
```

### Protect Forms
```svelte
<script>
  import { csrfProtection } from '$lib/utils/csrf';
  import { onMount } from 'svelte';
  
  let csrfField = '';
  
  onMount(async () => {
    csrfField = await csrfProtection.createCsrfFormField();
  });
</script>

<form method="POST">
  {@html csrfField}
  <!-- other fields -->
  <button type="submit">Submit</button>
</form>
```

### API Service Integration
```typescript
class APIService {
  async post(endpoint, data) {
    const init = await csrfProtection.protectRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return fetch(endpoint, init);
  }
}
```

### Server-Side Validation
```typescript
// +server.ts
import { csrfProtection } from '$lib/utils/csrf';
import { json, error } from '@sveltejs/kit';

export async function POST({ request }) {
  const token = request.headers.get('X-CSRF-Token');
  
  if (!csrfProtection.validateCsrfToken(token)) {
    throw error(403, 'Invalid CSRF token');
  }
  
  // Process request
  return json({ success: true });
}
```

### FormData Protection
```typescript
async function submitForm(formData) {
  const protected = await csrfProtection.protectFormData(formData);
  
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: protected
  });
  
  return response.json();
}
```

## Protected Methods

By default, CSRF protection is applied to:
- POST
- PUT
- DELETE
- PATCH

GET, HEAD, OPTIONS are not protected.

## Constants

```typescript
const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_TOKEN_TTL = 3600; // 1 hour
const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];
```

## Integration Points

- **Secure Storage**: Stores tokens in cookies
- **Logger Service**: Logs all CSRF operations
- **Error Handler**: Handles validation failures
- **API Service**: Primary consumer

## Best Practices

1. Always validate on server
2. Use secure cookies (https only)
3. Set appropriate TTL
4. Refresh on authentication changes
5. Clear tokens on logout
6. Handle validation failures gracefully
7. Don't disable for convenience
8. Test CSRF protection

## Security Notes

- Uses cryptographically secure random tokens
- Double-submit cookie pattern
- HttpOnly and SameSite=Strict cookies
- Automatic token rotation
- Protection against CSRF attacks
- Not a replacement for other security measures
