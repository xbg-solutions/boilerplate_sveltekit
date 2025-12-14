# Token Utilities

## Overview

JWT token utilities for decoding, parsing, extracting claims, validating tokens, and managing token storage with Firebase integration.

**Location:** `src/lib/utils/tokens.ts`

## Key Functions

### decodeToken
Decodes a JWT without verifying signature.

```typescript
const decoded = decodeToken(jwtString);
```

### extractClaims
Extracts user claims from token or decoded payload.

```typescript
const claims = extractClaims(token);
// Returns: { uid, email, roles, isAdmin, etc. }
```

### getUserRoles
Gets roles array from claims or token.

```typescript
const roles = getUserRoles(claims);
// Returns: ['admin', 'user']
```

### hasRole
Checks if user has specific role.

```typescript
if (hasRole(claims, 'admin')) {
  // User is admin
}
```

### hasAnyRole
Checks if user has any of specified roles.

```typescript
if (hasAnyRole(claims, ['admin', 'moderator'])) {
  // Has at least one role
}
```

### isTokenExpired
Checks if token has expired.

```typescript
if (isTokenExpired(token, { bufferSeconds: 60 })) {
  // Token expired or expires within 60 seconds
}
```

### isTokenValid
Validates token format and expiration.

```typescript
if (isTokenValid(token)) {
  // Token is valid
}
```

### storeToken
Stores token securely.

```typescript
storeToken(token, {
  tokenType: 'id',
  mechanism: 'cookie',
  ttl: 3600
});
```

### retrieveToken
Retrieves stored token.

```typescript
const token = retrieveToken({
  tokenType: 'id',
  mechanism: 'cookie'
});
```

### clearTokens
Clears all stored tokens.

```typescript
clearTokens();
```

### getIdToken
Gets fresh ID token from Firebase.

```typescript
const token = await getIdToken({ forceRefresh: true });
```

### haveTokensChanged
Checks if two tokens differ.

```typescript
if (haveTokensChanged(oldToken, newToken)) {
  // Tokens changed
}
```

## Common Patterns

```typescript
// Extract and use claims
const claims = extractClaims(token);
const roles = getUserRoles(claims);

// Check permissions
if (hasRole(claims, 'admin')) {
  showAdminPanel();
}

// Validate before use
if (isTokenValid(token)) {
  makeAuthenticatedRequest(token);
}

// Safe extraction
const { success, data } = await safeExtractClaims(token);
if (success) {
  useData(data);
}
```

## Integration

- **Secure Storage**: Uses secure-storage for persistence
- **Firebase**: Gets tokens from Firebase Auth
- **RBAC**: Works with rbac utility
- **Auth Service**: Primary consumer

## Best Practices

1. Validate tokens before use
2. Check expiration with buffer
3. Store tokens securely
4. Clear on logout
5. Use safe methods in UI
6. Refresh expired tokens
7. Never log token contents
