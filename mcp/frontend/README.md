# Frontend MCP Knowledge Base

Model Context Protocol (MCP) documentation for the SvelteKit 5 AI-Compatible Boilerplate.

This knowledge base is optimized for AI agent consumption and provides comprehensive, structured documentation for all frontend components, services, utilities, stores, and patterns.

## What is MCP?

The Model Context Protocol (MCP) knowledge base provides:
- Structured, AI-optimized documentation
- Quick reference for all code patterns
- Integration points between components
- Best practices and usage examples
- Type-safe interfaces and signatures

## Directory Structure

```
mcp/frontend/
├── README.md                    # This file - main index
├── overview/                    # High-level project documentation
│   ├── README.md               # Project overview and philosophy
│   ├── getting-started.md      # Setup and first feature guide
│   └── quick-start.md          # 15-minute quick start
├── guides/                      # Development guides
│   ├── agentic-development.md  # AI agent workflow patterns
│   ├── configuration.md        # Configuration options
│   ├── deployment.md           # Deployment strategies
│   ├── patterns.md            # Code patterns and conventions
│   └── testing.md             # Testing philosophy and practices
├── api/                        # API documentation
│   ├── api-documentation.md    # Complete service API reference
│   ├── component-api-reference.md  # Component API reference
│   └── component-interfaces.md # TypeScript interfaces
└── sveltekit/                  # SvelteKit-specific documentation
    ├── README.md              # SvelteKit architecture index
    ├── services/              # Business logic services
    ├── utils/                 # Utility functions
    ├── stores/               # Svelte stores
    └── components/           # Component documentation
```

## Quick Navigation

### Getting Started
- [Project Overview](./overview/README.md) - Philosophy and core concepts
- [Getting Started Guide](./overview/getting-started.md) - Comprehensive setup
- [Quick Start](./overview/quick-start.md) - Start in 15 minutes

### Development Guides
- [Agentic Development](./guides/agentic-development.md) - AI agent workflows
- [Configuration](./guides/configuration.md) - App configuration
- [Testing](./guides/testing.md) - Testing strategy
- [Deployment](./guides/deployment.md) - Production deployment
- [Code Patterns](./guides/patterns.md) - Standard patterns

### API References
- [API Documentation](./api/api-documentation.md) - Service APIs
- [Component API](./api/component-api-reference.md) - Component interfaces
- [Type Definitions](./api/component-interfaces.md) - TypeScript types

### SvelteKit Architecture
- [SvelteKit Index](./sveltekit/README.md) - Architecture overview
- [Services](./sveltekit/services/README.md) - Business logic services
- [Utilities](./sveltekit/utils/README.md) - Helper functions
- [Stores](./sveltekit/stores/README.md) - State management
- [Components](./sveltekit/components/README.md) - UI components

## For AI Agents

### Key Features
- **Constrained Architecture**: Opinionated patterns for one-shot success
- **Atomic Components**: 30+ SHADCN components for composition
- **Single Config File**: `src/lib/config/app.config.ts`
- **Consistent Imports**: Standardized from `$lib/components/ui` and `$lib/config/app.config`
- **Type Safety**: Full TypeScript with strict mode
- **Test Coverage**: 871 passing behavioral tests

### Decision Trees

#### Component Selection
```
Need UI element?
├── Form input? → Use Input, Textarea, Select, Checkbox
├── Action button? → Use Button with appropriate variant
├── Layout container? → Use Card with CardHeader, CardContent, CardFooter
├── Modal/overlay? → Use Dialog or Sheet
├── Navigation? → Use Breadcrumb, Pagination, or Tabs
├── Feedback? → Use Toast (via service) or Alert
└── Data display? → Use Table, Badge, Avatar, or Progress
```

#### Service Selection
```
Need business logic?
├── Authentication? → authService
├── API calls? → apiService
├── Notifications? → toastService
├── Logging? → loggingService
├── File upload? → fileHandlingService
├── Events? → eventService or pubSubService
└── State persistence? → secureStorageService
```

#### Store Selection
```
Need state management?
├── User auth state? → auth.store + token.store
├── UI loading state? → loading.store
├── Notifications? → toast.store
├── CSRF protection? → csrf.store
├── Multi-tab sync? → tab-sync.store
├── Route info? → route-handler.store
└── Custom domain? → Create new store following patterns
```

### Common Patterns

#### Import Pattern
```typescript
// Always use these import paths
import { Button, Card, Input } from '$lib/components/ui';
import { APP_CONFIG } from '$lib/config/app.config';
import { authService } from '$lib/services/auth';
import { authStore } from '$lib/stores/auth';
import { normalizeError } from '$lib/utils/error-handler';
```

#### Component Pattern
```svelte
<script lang="ts">
  import { Button, Card, CardHeader, CardContent } from '$lib/components/ui';

  export let title: string;
  export let onAction: () => void;
</script>

<Card class="w-full">
  <CardHeader>{title}</CardHeader>
  <CardContent>
    <slot />
    <Button on:click={onAction}>Save</Button>
  </CardContent>
</Card>
```

#### Route Protection Pattern
```typescript
// +page.ts
import { routeHandler } from '$lib/utils/route-handler';

export const load = routeHandler.createLoadFunction(
  () => authService.getAuthState(),
  {
    claims: { operator: 'any', claims: ['admin', 'user'] },
    redirectTo: '/login'
  }
);
```

## Documentation Standards

Each documentation file follows this structure:

### Service Documentation
1. **Overview** - What the service does
2. **Key Features** - Main capabilities
3. **API Reference** - Function signatures and usage
4. **Common Patterns** - Real-world examples
5. **Integration Points** - How it connects with other parts
6. **Best Practices** - Recommendations

### Utility Documentation
1. **Overview** - Purpose and use cases
2. **Key Functions** - Function signatures
3. **Usage Examples** - Code examples
4. **Common Patterns** - Practical applications
5. **Integration Points** - Related utilities/services
6. **Best Practices** - Tips and recommendations

### Store Documentation
1. **Overview** - State managed by the store
2. **Store Location** - File path
3. **State Structure** - TypeScript interface
4. **Key Methods/Fields** - Important operations
5. **Usage Examples** - Code examples
6. **Integration Points** - Related stores/services
7. **Best Practices** - Recommended patterns

### Component Documentation
1. **Overview** - Component purpose
2. **Props/API** - Component interface
3. **Usage Examples** - Code examples
4. **Variants** - Available variants/options
5. **Accessibility** - A11y features
6. **Best Practices** - Usage recommendations

## How to Use This Knowledge Base

### For Human Developers
1. Start with [Getting Started](./overview/getting-started.md)
2. Review [Code Patterns](./guides/patterns.md)
3. Reference specific [Services](./sveltekit/services/README.md), [Utils](./sveltekit/utils/README.md), or [Stores](./sveltekit/stores/README.md) as needed
4. Check [Testing Guide](./guides/testing.md) when writing tests

### For AI Agents
1. Read [Agentic Development Guide](./guides/agentic-development.md) first
2. Use decision trees above for component/service selection
3. Follow import and code patterns exactly
4. Reference specific documentation for detailed API usage
5. Always generate tests using behavioral testing patterns

### For Code Generation
1. **Understand requirements** - Parse user input for features needed
2. **Select components** - Use decision tree to choose SHADCN components
3. **Choose services** - Map business logic to existing services
4. **Generate code** - Follow exact import patterns and code structure
5. **Add tests** - Generate behavioral tests following existing patterns
6. **Validate** - Ensure type safety and accessibility

## Integration Notes

### Backend Integration
- Pairs with [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend)
- API calls via `apiService` with automatic CSRF protection
- Token management via `tokenService` and `token.store`
- Supports Postman collection import for API generation

### Firebase Integration
- Authentication via `authService` (Firebase Auth)
- File uploads via `fileHandlingService` (Firebase Storage)
- Configuration in `APP_CONFIG.firebase`
- Initialization tracked via `initialization.store`

### Testing Integration
- 871 behavioral tests using Vitest + @testing-library/svelte
- Test utilities in `__tests__/utils/`
- Mock services in `__tests__/mocks/`
- Focus on "test WHAT, not HOW"

## Key Principles

### Constraints = Success
- **One config file**: All settings in `app.config.ts`
- **Atomic components**: Compose, don't create complex components
- **Consistent patterns**: Same imports, same structure, everywhere
- **Type safety**: TypeScript strict mode, no `any`
- **Behavioral testing**: Test user behavior, not implementation

### AI-Optimized Architecture
- **Predictable structure**: No surprises, clear patterns
- **Decision trees**: Eliminate ambiguity
- **Comprehensive docs**: Every function documented
- **Integration maps**: Clear relationships between parts
- **Best practices**: Guidance for every scenario

## Quick Reference Tables

### Services Overview
| Service | Purpose | Location |
|---------|---------|----------|
| authService | Authentication & user management | `$lib/services/auth` |
| apiService | HTTP requests & API integration | `$lib/services/api` |
| toastService | User notifications | `$lib/services/toast` |
| loggingService | Application logging | `$lib/services/logging` |
| eventService | Event-driven communication | `$lib/services/events` |
| fileHandlingService | File uploads/downloads | `$lib/services/file-handling` |

### Utilities Overview
| Utility | Purpose | Location |
|---------|---------|----------|
| error-handler | Error normalization & handling | `$lib/utils/error-handler` |
| sanitizer | Input sanitization & XSS prevention | `$lib/utils/sanitizer` |
| auth-guard | Route protection | `$lib/utils/auth-guard` |
| rbac | Role-based access control | `$lib/utils/rbac` |
| csrf | CSRF protection | `$lib/utils/csrf` |
| route-handler | Route load functions | `$lib/utils/route-handler` |

### Stores Overview
| Store | Purpose | Location |
|---------|---------|----------|
| auth.store | Authentication state | `$lib/stores/auth` |
| token.store | JWT token management | `$lib/stores/token` |
| loading.store | Loading indicators | `$lib/stores/loading` |
| toast.store | Toast notifications | `$lib/stores/toast` |
| csrf.store | CSRF tokens | `$lib/stores/csrf` |
| rbac.store | User roles/permissions | `$lib/stores/rbac` |

## Contributing to MCP Documentation

When adding new features:
1. Document all public APIs
2. Follow existing documentation structure
3. Include practical examples
4. Update this index with new files
5. Add to appropriate decision trees
6. Update integration maps

## Additional Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte Documentation](https://svelte.dev/docs)
- [SHADCN-Svelte Components](https://www.shadcn-svelte.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**This MCP knowledge base is continuously updated to reflect the latest architecture and patterns in the boilerplate.**

Last updated: 2025-12-14
