# Tests

All tests live in `__tests__/` at the project root.

## Structure

```
__tests__/
├── unit/
│   ├── stores/              # Svelte store tests
│   ├── services/            # Service layer tests
│   │   ├── api/             # API service
│   │   ├── auth/            # Auth service
│   │   ├── events/          # Event bus
│   │   ├── file-handling/   # File upload
│   │   ├── initialization/  # App startup
│   │   ├── logging/         # Logger
│   │   ├── state/           # State manager
│   │   ├── toast/           # Toast notifications
│   │   └── token/           # Token management
│   ├── utils/               # Utility function tests
│   ├── lib/                 # Library tests
│   └── src/                 # Source-level tests
├── integration/             # Cross-service integration tests
├── test-utils/              # Shared test utilities and mocks
├── mocks/                   # Mock data
└── fixtures/                # Test fixtures
```

## Test Types

- **Unit tests** (`*.test.ts`) — Isolated, mocked dependencies
- **Integration tests** (`*.integration.test.ts`) — Service interactions

## Running Tests

```bash
npm test                    # All tests (unit + integration)
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
npm run test:coverage       # Unit tests with coverage
npm run test:unit:watch     # Unit tests in watch mode
npm run test:integration:watch  # Integration tests in watch mode
```

## Test Configuration

| Command | Config File |
|---|---|
| `npm run test:unit` | `vitest.unit.config.ts` |
| `npm run test:integration` | `vitest.integration.config.ts` |

Global test setup files:
- `vitest.unit.setup.ts` — Mocks SvelteKit, Firebase, browser APIs
- `vitest.integration.setup.ts` — Integration test environment

## Testing Philosophy

**Test WHAT, not HOW** — Behavioral testing only.

```typescript
// Good — test user-facing behavior
test('shows error toast when save fails', async () => {
  render(MyForm);
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
});

// Bad — test implementation details
test('apiService.post was called', () => {
  const spy = vi.spyOn(apiService, 'post');
  // ...
});
```

## Key Testing Patterns

### Dynamic Import Pattern (Required for ES Module Mocks)

```typescript
vi.mock('$lib/services/token', () => ({
  tokenService: { getToken: vi.fn() }
}));

describe('Tests', () => {
  let authService: any;

  beforeAll(async () => {
    const authModule = await import('$lib/services/auth/auth.service');
    authService = authModule.authService;
  });

  it('should work', async () => {
    const { tokenService } = await import('$lib/services/token');
    tokenService.getToken.mockReturnValue('token');
  });
});
```

### Complete Firebase Mock (Required in All Firebase Test Files)

```typescript
vi.mock('$lib/utils/firebase', () => ({
  getFirebaseAuth: vi.fn().mockResolvedValue({ currentUser: null }),
  safeGetCurrentUser: vi.fn().mockResolvedValue({ success: false, data: null }),
  subscribeToAuthChanges: vi.fn().mockResolvedValue(vi.fn()),
  signOutUser: vi.fn().mockResolvedValue(undefined),
  getIdToken: vi.fn().mockResolvedValue('mock-token'),
  initializeFirebase: vi.fn().mockResolvedValue(undefined),
  processFirebaseError: vi.fn().mockReturnValue({ success: false, error: { message: 'Mock error' } })
}));
```

Always include ALL exports. Missing exports cause "No export defined" errors.

### Mock Validation

```typescript
import { resetFirebaseMocks } from '../../test-utils/mock-validation';

beforeEach(async () => {
  vi.clearAllMocks();
  await resetFirebaseMocks();
});
```

## Rules

- **Dynamic import pattern required** for ES module testing with mocks
- **Complete mock interfaces mandatory** — partial mocks cause contamination
- **Never use `vi.mocked()`** on functions already mocked in top-level `vi.mock()`
- **`safeGetCurrentUser` must return `{ success, data }`** — not `null`
- **Mock at service boundaries** — Mock Firebase, APIs, browser APIs. Don't mock internal utilities.
- **Use `@testing-library/svelte`** for component tests
- **Use `jest-axe`** for accessibility tests

## Test Utilities

Located in `__tests__/test-utils/`:

- `mock-validation.ts` — Centralized mock management, `resetFirebaseMocks()`
- Firebase auth mocks, store mocks, API response mocks
- `waitForAsync()`, `flushPromises()` — Async helpers
