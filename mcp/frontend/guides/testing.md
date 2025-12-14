# Testing Guide

**Comprehensive testing philosophy and practices for building reliable, maintainable applications.**

This guide explains our behavioral testing approach and provides patterns for AI agents and developers to create effective tests.

---

## Test Suite Statistics

As of last update:

- **Total Test Files**: 59
- **Total Tests**: 871 passing
  - **Unit Tests**: 823 tests across 49 files
  - **Integration Tests**: 48 tests across 10 files
- **Coverage**: Comprehensive coverage of critical paths
- **Test Types**: Behavioral, integration, and accessibility tests

### Test Distribution

```
Unit Tests (823 tests)
├── Services: ~340 tests
│   ├── Auth Service: 58 tests
│   ├── Token Service: 55 tests
│   ├── API Service: 34 tests
│   ├── Toast Service: 45 tests
│   └── Event System: 46 tests
├── Utils: ~350 tests
│   ├── Error Handling: 54 tests
│   ├── SEO Utils: 35 tests
│   ├── RBAC: 26 tests
│   ├── Sanitizer: 24 tests
│   ├── Cache Helpers: 28 tests
│   └── Route Handler: 19 tests
└── Stores: ~133 tests
    └── Event Store: 16 tests

Integration Tests (48 tests)
├── Auth + Token Integration: 7 tests
├── API Integration: 5 tests
├── Real Service Flows: 10 tests
├── State Management: 3 tests
├── Error Handler Integration: 14 tests
└── Security Integration: 9 tests
```

---

## Testing Philosophy: Behavioral, Not Implementation

### The "Test WHAT, Not HOW" Principle

We follow behavioral testing patterns inspired by Testing Library's philosophy:

> **"The more your tests resemble the way your software is used, the more confidence they can give you."**

### Why Behavioral Testing?

1. **Maintainable**: Tests don't break when implementation changes
2. **Meaningful**: Tests verify actual user outcomes
3. **Reliable**: Tests catch real bugs, not implementation details
4. **Accessible**: Forces proper accessibility practices
5. **AI-Friendly**: Clear patterns for agents to follow

### What This Means in Practice

```typescript
// ❌ BAD: Testing Implementation
test('calls firebase.auth().signInWithEmailAndPassword', async () => {
  const spy = vi.spyOn(firebase.auth(), 'signInWithEmailAndPassword');
  await authService.signIn(email, password);
  expect(spy).toHaveBeenCalledWith(email, password);
});

// ✅ GOOD: Testing Behavior
test('user can log in with valid credentials', async () => {
  render(LoginPage);

  await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

  expect(screen.getByText('Welcome back!')).toBeInTheDocument();
});
```

**Key Differences:**
- Bad test: Breaks if we switch from Firebase to another auth provider
- Good test: Works regardless of implementation, tests user experience

---

## Testing Patterns for AI Agents

### Pattern 1: Component Rendering

**When to use**: Testing that components display data correctly.

```typescript
import { render, screen } from '@testing-library/svelte';
import UserProfile from './UserProfile.svelte';

describe('UserProfile Component', () => {
  test('displays user information', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    render(UserProfile, { user: mockUser });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  test('shows placeholder when no user provided', () => {
    render(UserProfile, { user: null });

    expect(screen.getByText('No user selected')).toBeInTheDocument();
  });
});
```

**Agent Checklist:**
- [ ] Test with valid data
- [ ] Test with null/undefined data
- [ ] Test with edge cases (empty strings, long text)
- [ ] Use accessible queries (getByText, getByRole, getByLabelText)

### Pattern 2: User Interactions

**When to use**: Testing forms, buttons, and interactive elements.

```typescript
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import ContactForm from './ContactForm.svelte';

describe('ContactForm', () => {
  test('user can submit contact form', async () => {
    const onSubmit = vi.fn();
    render(ContactForm, { onSubmit });

    // Type in form fields
    await userEvent.type(screen.getByLabelText('Name'), 'Jane Smith');
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Message'), 'Hello world');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: 'Send Message' }));

    // Verify callback was called with correct data
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Jane Smith',
      email: 'jane@example.com',
      message: 'Hello world'
    });
  });

  test('shows validation errors for invalid email', async () => {
    render(ContactForm);

    await userEvent.type(screen.getByLabelText('Email'), 'invalid-email');
    await userEvent.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
  });

  test('disables submit button while submitting', async () => {
    render(ContactForm, {
      onSubmit: () => new Promise(resolve => setTimeout(resolve, 100))
    });

    await userEvent.type(screen.getByLabelText('Name'), 'Jane');
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Message'), 'Hello');

    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
```

**Agent Checklist:**
- [ ] Test happy path (valid submission)
- [ ] Test validation errors
- [ ] Test loading states
- [ ] Test disabled states
- [ ] Use accessible queries for form fields

### Pattern 3: Service Testing

**When to use**: Testing business logic and API interactions.

```typescript
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { userService } from '$lib/services/user.service';
import { apiClient } from '$lib/utils/api-client';

// Mock the API client
vi.mock('$lib/utils/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getProfile returns user data', async () => {
    const mockUser = { id: '123', name: 'John', email: 'john@example.com' };
    vi.mocked(apiClient.get).mockResolvedValue(mockUser);

    const result = await userService.getProfile();

    expect(result).toEqual(mockUser);
    expect(apiClient.get).toHaveBeenCalledWith('/user/profile');
  });

  test('updateProfile sends correct data', async () => {
    const updateData = { name: 'Jane Doe' };
    const updatedUser = { id: '123', name: 'Jane Doe', email: 'jane@example.com' };
    vi.mocked(apiClient.put).mockResolvedValue(updatedUser);

    const result = await userService.updateProfile(updateData);

    expect(result).toEqual(updatedUser);
    expect(apiClient.put).toHaveBeenCalledWith('/user/profile', updateData);
  });

  test('handles errors gracefully', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

    await expect(userService.getProfile()).rejects.toThrow('Network error');
  });
});
```

**Agent Checklist:**
- [ ] Mock external dependencies (API, Firebase, etc.)
- [ ] Test successful operations
- [ ] Test error handling
- [ ] Verify correct parameters passed to dependencies
- [ ] Clear mocks between tests

### Pattern 4: Integration Testing

**When to use**: Testing multiple systems working together.

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { authService } from '$lib/services/auth';
import { tokenService } from '$lib/services/token.service';

describe('Auth + Token Integration', () => {
  beforeEach(() => {
    tokenService.clearToken();
  });

  test('successful login stores auth token', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    const mockToken = 'mock-jwt-token';

    // Mock auth service
    vi.spyOn(authService, 'signInWithEmailAndPassword')
      .mockResolvedValue(mockUser);

    // Mock token retrieval
    vi.spyOn(authService, 'getIdToken')
      .mockResolvedValue(mockToken);

    // Login
    await authService.signInWithEmailAndPassword('test@example.com', 'password');

    // Get token
    const token = await authService.getIdToken();

    // Store token
    tokenService.setToken(token);

    // Verify token is stored
    expect(tokenService.getToken()).toBe(mockToken);
  });

  test('logout clears stored token', async () => {
    // Setup: Store a token
    tokenService.setToken('mock-token');
    expect(tokenService.getToken()).toBe('mock-token');

    // Logout
    await authService.signOut();
    tokenService.clearToken();

    // Verify token is cleared
    expect(tokenService.getToken()).toBeNull();
  });
});
```

**Agent Checklist:**
- [ ] Test realistic user workflows
- [ ] Verify state changes across multiple services
- [ ] Test error propagation between systems
- [ ] Clean up state between tests

### Pattern 5: Accessibility Testing

**When to use**: Ensuring components are accessible to all users.

```typescript
import { render, screen } from '@testing-library/svelte';
import LoginForm from './LoginForm.svelte';

describe('LoginForm Accessibility', () => {
  test('all form fields have labels', () => {
    render(LoginForm);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  test('submit button is accessible', () => {
    render(LoginForm);

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    expect(submitButton).toBeInTheDocument();
  });

  test('error messages are announced to screen readers', async () => {
    render(LoginForm);

    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    const errorMessage = screen.getByText('Please enter your email');
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  test('form has proper keyboard navigation', async () => {
    render(LoginForm);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    // Tab through form
    await userEvent.tab();
    expect(emailInput).toHaveFocus();

    await userEvent.tab();
    expect(passwordInput).toHaveFocus();

    await userEvent.tab();
    expect(submitButton).toHaveFocus();
  });
});
```

**Agent Checklist:**
- [ ] All inputs have labels (getByLabelText works)
- [ ] Buttons have accessible names (getByRole('button', { name }))
- [ ] Error messages have role="alert"
- [ ] Keyboard navigation works (tab order)
- [ ] Focus management is correct

---

## Testing Requirements by Feature Type

### Forms & Data Entry

**Required Tests:**
1. User can enter data and submit
2. Validation errors display correctly
3. Submit button disabled during submission
4. Success message shown after submission
5. All fields have labels (accessibility)
6. Error messages are accessible (role="alert")

**Example:**
```typescript
describe('User Registration Form', () => {
  test('user can register with valid data', async () => { /* ... */ });
  test('shows error for existing email', async () => { /* ... */ });
  test('disables submit during registration', async () => { /* ... */ });
  test('shows success message after registration', async () => { /* ... */ });
  test('all fields have proper labels', () => { /* ... */ });
  test('error messages are announced to screen readers', async () => { /* ... */ });
});
```

### Data Display (Lists, Tables, Cards)

**Required Tests:**
1. Displays data when provided
2. Shows empty state when no data
3. Shows loading state while fetching
4. Handles long text/data gracefully
5. Pagination works (if applicable)

**Example:**
```typescript
describe('User List', () => {
  test('displays all users', () => { /* ... */ });
  test('shows empty state when no users', () => { /* ... */ });
  test('shows loading spinner while fetching', () => { /* ... */ });
  test('truncates long user names', () => { /* ... */ });
  test('pagination controls work', async () => { /* ... */ });
});
```

### Modals & Dialogs

**Required Tests:**
1. Opens when triggered
2. Closes on cancel/backdrop click
3. Submits data correctly
4. Traps focus inside dialog
5. Restores focus after closing

**Example:**
```typescript
describe('Edit Profile Dialog', () => {
  test('opens when edit button clicked', async () => { /* ... */ });
  test('closes on cancel button', async () => { /* ... */ });
  test('saves changes on submit', async () => { /* ... */ });
  test('focus is trapped inside dialog', async () => { /* ... */ });
  test('focus returns to trigger after closing', async () => { /* ... */ });
});
```

### Authentication Flows

**Required Tests:**
1. User can log in with valid credentials
2. Shows error for invalid credentials
3. Redirects to protected route after login
4. User can log out
5. Protected routes redirect when not authenticated

**Example:**
```typescript
describe('Authentication Flow', () => {
  test('user can log in with valid credentials', async () => { /* ... */ });
  test('shows error for invalid password', async () => { /* ... */ });
  test('redirects to dashboard after login', async () => { /* ... */ });
  test('user can log out', async () => { /* ... */ });
  test('redirects to login when accessing protected route', async () => { /* ... */ });
});
```

---

## Test Organization

### File Structure

```
__tests__/
├── unit/                           # Unit tests (823 tests)
│   ├── services/                   # Service tests
│   │   ├── auth/
│   │   │   ├── auth.service.test.ts
│   │   │   └── auth-safe-methods.test.ts
│   │   ├── api/
│   │   │   ├── api.service.test.ts
│   │   │   ├── request-handler.test.ts
│   │   │   └── response-handler.test.ts
│   │   └── token/
│   │       └── token.service.test.ts
│   ├── utils/                      # Utility tests
│   │   ├── error-handler.test.ts
│   │   ├── sanitizer.test.ts
│   │   └── route-handler.test.ts
│   └── stores/                     # Store tests
│       └── event.store.test.ts
│
└── integration/                    # Integration tests (48 tests)
    ├── auth.integration.test.ts
    ├── api.integration.test.ts
    └── real-service.integration.test.ts
```

### Naming Conventions

```typescript
// File naming: [name].test.ts or [name].integration.test.ts
// auth.service.test.ts
// api.integration.test.ts

// Test suite naming: Descriptive, feature-based
describe('UserProfile Component', () => {
  // Test naming: User-centric, behavioral
  test('user can update their profile information', async () => {
    // Test implementation
  });

  test('shows error when email is invalid', async () => {
    // Test implementation
  });
});
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Focused Testing

```bash
# Run specific test file
npm run test -- auth.service.test.ts

# Run tests matching pattern
npm run test -- --grep="user can log in"

# Run only tests in specific directory
npm run test:unit -- __tests__/unit/services/
```

### CI/CD Integration

Tests automatically run in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: npm test

- name: Upload Coverage
  run: npm run test:coverage
```

---

## Quality Metrics

### What We Measure

1. **Test Count**: 871 tests (target: maintain/increase)
2. **Coverage**: Critical paths covered (target: 80%+ on core features)
3. **Test Speed**: ~7.5 seconds total (target: < 10 seconds)
4. **Reliability**: 100% passing (target: always passing)

### Test Quality Checklist

For every test you write:

- [ ] **Behavioral**: Tests user behavior, not implementation
- [ ] **Accessible**: Uses accessible queries (getByRole, getByLabelText)
- [ ] **Independent**: Can run in isolation, any order
- [ ] **Clear**: Test name describes what user can do
- [ ] **Complete**: Covers happy path, error cases, edge cases
- [ ] **Maintainable**: Won't break with implementation changes

---

## Common Testing Mistakes (and How to Avoid Them)

### Mistake 1: Testing Implementation Details

```typescript
// ❌ BAD
test('sets loading to true before API call', () => {
  expect(component.loading).toBe(true);
});

// ✅ GOOD
test('shows loading spinner while fetching data', () => {
  expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
});
```

### Mistake 2: Not Using Accessible Queries

```typescript
// ❌ BAD (fragile, not accessibility-focused)
test('user can click submit button', async () => {
  await userEvent.click(screen.getByTestId('submit-button'));
});

// ✅ GOOD (accessible, resilient)
test('user can submit form', async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
});
```

### Mistake 3: Not Testing Error States

```typescript
// ❌ BAD (only tests happy path)
describe('UserList', () => {
  test('displays users', () => { /* ... */ });
});

// ✅ GOOD (tests error cases too)
describe('UserList', () => {
  test('displays users when loaded', () => { /* ... */ });
  test('shows error message when fetch fails', () => { /* ... */ });
  test('shows empty state when no users', () => { /* ... */ });
  test('shows loading state while fetching', () => { /* ... */ });
});
```

### Mistake 4: Leaking State Between Tests

```typescript
// ❌ BAD (state persists between tests)
let user;

test('creates user', async () => {
  user = await createUser();
});

test('updates user', async () => {
  await updateUser(user); // Depends on previous test
});

// ✅ GOOD (each test is independent)
describe('User Management', () => {
  let user;

  beforeEach(async () => {
    user = await createUser(); // Fresh state for each test
  });

  test('creates user', () => {
    expect(user).toBeDefined();
  });

  test('updates user', async () => {
    await updateUser(user);
    // Test update logic
  });
});
```

---

## For AI Agents: Test Generation Workflow

### Step 1: Identify Test Type

```
What are you testing?
├─ Component → Use Pattern 1 or 2
├─ Service → Use Pattern 3
├─ Integration → Use Pattern 4
└─ Accessibility → Use Pattern 5
```

### Step 2: Generate Test Structure

```typescript
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import ComponentName from './ComponentName.svelte';

describe('ComponentName', () => {
  // Happy path test
  test('user can [perform action]', async () => {
    // Arrange
    render(ComponentName, { /* props */ });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Action' }));

    // Assert
    expect(screen.getByText('Expected result')).toBeInTheDocument();
  });

  // Error case test
  test('shows error when [condition]', async () => {
    // Implementation
  });

  // Edge case test
  test('handles [edge case]', async () => {
    // Implementation
  });
});
```

### Step 3: Verify Test Quality

Run through the quality checklist:
- [ ] Behavioral (not implementation)
- [ ] Accessible (proper queries)
- [ ] Independent (no shared state)
- [ ] Clear (descriptive name)
- [ ] Complete (happy path + errors + edges)

### Step 4: Run Tests

```bash
npm run test:watch -- ComponentName.test.ts
```

---

## Summary

Our testing approach prioritizes:

1. **User Behavior Over Implementation**: Test what users do, not how code works
2. **Accessibility**: Force proper accessibility through testing
3. **Maintainability**: Tests that survive refactoring
4. **AI-Friendliness**: Clear patterns for reliable generation
5. **Quality**: 871 tests ensuring production readiness

**For AI agents**: Follow the patterns in this guide to generate tests that are behavioral, accessible, and maintainable. Always test the user experience, not the implementation.

---

**Built with comprehensive testing for production confidence by [XBG Solutions](https://xbg.solutions)**
