# CSRF Store

## Overview
Manages Cross-Site Request Forgery (CSRF) protection state, including token generation, storage, and validation. Provides protection against CSRF attacks for form submissions and API requests.

## Store Location
`src/lib/stores/csrf.ts`

## State Structure

```typescript
interface CSRFState {
  token: string | null;         // Current CSRF token
  validated: boolean;           // Whether token has been validated
}
```

## Key Methods

The `csrfProtection` object provides these methods:

- `clearTokens()` - Clear CSRF tokens
- `generateCsrfToken()` - Generate a new CSRF token
- `getCsrfToken()` - Get the current CSRF token
- `refreshCsrfToken()` - Refresh the CSRF token
- `handleValidationFailure(context)` - Handle token validation failure

## Usage Examples

### Subscribe to CSRF State
```typescript
import { csrfProtection } from '$lib/stores/csrf';

csrfProtection.subscribe($csrf => {
  console.log('CSRF Token:', $csrf.token);
  console.log('Validated:', $csrf.validated);
});
```

### Generate CSRF Token
```typescript
import { csrfProtection } from '$lib/stores/csrf';

const token = await csrfProtection.generateCsrfToken();
console.log('Generated token:', token);
```

### Get Current Token
```typescript
import { csrfProtection } from '$lib/stores/csrf';

const token = await csrfProtection.getCsrfToken();

if (token) {
  // Include in request
}
```

### Refresh Token
```typescript
import { csrfProtection } from '$lib/stores/csrf';

const newToken = await csrfProtection.refreshCsrfToken();
```

### Clear Tokens
```typescript
import { csrfProtection } from '$lib/stores/csrf';

csrfProtection.clearTokens();
```

### Handle Validation Failure
```typescript
import { csrfProtection } from '$lib/stores/csrf';

try {
  await submitForm();
} catch (error) {
  if (error.code === 'CSRF_VALIDATION_FAILED') {
    await csrfProtection.handleValidationFailure({ error });
  }
}
```

### Include in Form Submission
```typescript
import { csrfProtection } from '$lib/stores/csrf';

async function submitForm(formData: FormData) {
  const token = await csrfProtection.getCsrfToken();

  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: {
      'X-CSRF-Token': token || ''
    },
    body: formData
  });

  return response;
}
```

### Include in API Request
```typescript
import { csrfProtection } from '$lib/stores/csrf';

async function makeApiRequest(data: any) {
  const token = await csrfProtection.getCsrfToken();

  return fetch('/api/endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token || ''
    },
    body: JSON.stringify(data)
  });
}
```

### Validate Token Before Action
```typescript
import { csrfProtection } from '$lib/stores/csrf';
import { get } from 'svelte/store';

async function performSecureAction() {
  const $csrf = get(csrfProtection);

  if (!$csrf.validated) {
    // Token not validated, refresh first
    await csrfProtection.refreshCsrfToken();
  }

  // Proceed with action
}
```

## Integration Points

- **Form Components** - Include CSRF token in form submissions
- **API Service** - Automatically attach token to API requests
- **Request Handler** (`src/lib/stores/request-handler.ts`) - Validates tokens
- **Response Handler** (`src/lib/stores/response-handler.ts`) - Handles validation failures
- **Auth Service** - Refresh token on authentication state changes

## Security Considerations

1. **Token Rotation** - Refresh tokens periodically or after sensitive operations
2. **Token Validation** - Always validate tokens on the server side
3. **Secure Storage** - Tokens stored in memory, not localStorage
4. **Same-Origin Policy** - Tokens only valid for same origin
5. **HTTPS Only** - CSRF protection most effective over HTTPS

## Lifecycle

1. **Generation**: Token generated on app initialization or login
2. **Storage**: Token stored in secure memory (store state)
3. **Usage**: Token included in all state-changing requests
4. **Validation**: Server validates token on each request
5. **Refresh**: Token refreshed on validation failure or periodically
6. **Clearance**: Token cleared on logout or error

## Best Practices

1. Generate a new token on authentication state changes
2. Include token in all POST, PUT, DELETE, PATCH requests
3. Refresh token if validation fails
4. Clear tokens on logout
5. Don't expose tokens in URLs or logs
6. Use consistent header naming (e.g., 'X-CSRF-Token')
7. Implement server-side validation
8. Set `validated` flag after successful validation
