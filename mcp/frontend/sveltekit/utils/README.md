# SvelteKit Utilities Documentation

Comprehensive documentation for all utility functions in `src/lib/utils/`.

## Documentation Files

All 21 utility files have been documented with the following structure:
- Overview and key features
- Function signatures and descriptions
- Usage examples
- Common patterns
- Integration points
- Best practices

## Utilities Index

### Error Handling & Validation
- **[error-handler.md](./error-handler.md)** - Error normalization, custom error classes, error handling
- **[error-handler-toast.md](./error-handler-toast.md)** - Toast notification integration for errors
- **[error-testing.md](./error-testing.md)** - Error testing utilities for development
- **[sanitizer.md](./sanitizer.md)** - Input sanitization and XSS prevention

### Authentication & Security
- **[auth-guard.md](./auth-guard.md)** - Route protection and authentication guards
- **[rbac.md](./rbac.md)** - Role-based access control
- **[csrf.md](./csrf.md)** - CSRF protection with double-submit cookies
- **[tokens.md](./tokens.md)** - JWT token utilities
- **[signout.md](./signout.md)** - User signout handling
- **[recaptcha.md](./recaptcha.md)** - Firebase reCAPTCHA integration

### Firebase Integration
- **[firebase.md](./firebase.md)** - Firebase initialization and auth
- **[firebase-storage.md](./firebase-storage.md)** - Firebase Storage file uploads

### Storage & Caching
- **[secure-storage.md](./secure-storage.md)** - Secure storage across multiple mechanisms
- **[cache-helpers.md](./cache-helpers.md)** - Caching utilities and wrappers

### Performance & SEO
- **[performance.md](./performance.md)** - Performance monitoring and optimization
- **[seo.md](./seo.md)** - SEO utilities and meta tags

### Routing & Navigation
- **[route-handler.md](./route-handler.md)** - Route protection and load functions
- **[mutex.md](./mutex.md)** - Concurrency control and critical sections

### Real-Time & Streaming
- **[sse.md](./sse.md)** - Server-Sent Events handling

### UI & Styling
- **[cn.md](./cn.md)** - Class name utility for Tailwind CSS

### Environment
- **[browser.md](./browser.md)** - Browser vs SSR detection

## Quick Reference

### Most Used Utilities

#### Error Handling
```typescript
import { normalizeError, handleError } from '$lib/utils/error-handler';

try {
  await operation();
} catch (error) {
  const appError = normalizeError(error);
  handleError(appError);
}
```

#### Input Sanitization
```typescript
import { sanitize, inputSanitizer } from '$lib/utils/sanitizer';

const clean = inputSanitizer(userInput);
const cleanObj = sanitize(apiResponse, { level: 'strict' });
```

#### Route Protection
```typescript
import { routeHandler } from '$lib/utils/route-handler';

export const load = routeHandler.createLoadFunction(
  () => authService.getAuthState(),
  { claims: { operator: 'any', claims: ['admin'] } }
);
```

#### RBAC
```typescript
import { rbacUtil } from '$lib/utils/rbac';

if (rbacUtil.hasRole(claims, 'admin')) {
  // Admin only code
}
```

#### Class Names
```typescript
import { cn } from '$lib/utils/cn';

<div class={cn('base', isActive && 'active', className)} />
```

#### CSRF Protection
```typescript
import { csrfProtection } from '$lib/utils/csrf';

const init = await csrfProtection.protectRequest(url, {
  method: 'POST',
  body: data
});
```

## Documentation Structure

Each utility documentation includes:

1. **Overview** - What the utility does and why use it
2. **Key Features** - Main capabilities
3. **Key Functions** - Function signatures and usage
4. **Common Patterns** - Real-world examples
5. **Integration Points** - How it connects with other parts
6. **Best Practices** - Recommendations and tips
7. **Type Definitions** - TypeScript interfaces (when applicable)

## For AI Agents

These documentation files are optimized for AI agent consumption:
- Focus on WHAT and HOW, not WHY (implementation details)
- Practical examples for every function
- Clear integration points
- Type-safe examples with TypeScript
- Common patterns section for quick reference
- Best practices for proper usage

## Utility Relationships

### Core Dependencies
- Most utilities depend on `error-handler` for error handling
- Authentication utilities use `firebase` as base
- Security utilities integrate with `secure-storage`
- UI utilities often use `browser` for environment detection

### Service Integration
- All utilities integrate with the logging service
- Most publish events to the event system
- Many use the error reporting service

## Getting Started

For new developers or AI agents:

1. Start with **error-handler.md** - Foundation for error handling
2. Read **firebase.md** - Core Firebase integration
3. Check **auth-guard.md** and **rbac.md** - Authentication patterns
4. Review **sanitizer.md** - Input validation
5. Explore feature-specific utilities as needed

## Contributing

When adding new utilities:
1. Follow the documentation structure shown here
2. Include practical examples
3. Document integration points
4. Add to this index
5. Update relationship diagrams if needed

## Location

All utility files are located in: `src/lib/utils/`

All documentation files are located in: `mcp/frontend/sveltekit/utils/`
