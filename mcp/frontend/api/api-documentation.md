# API Documentation

## Authentication Service

### `AuthService`

Handles user authentication including email/password, phone, and email-link authentication.

```typescript
interface AuthService {
  signInWithEmailAndPassword(email: string, password: string): Promise<User>;
  signUpWithEmailAndPassword(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
}
```

#### Methods

- **`signInWithEmailAndPassword`**: Sign in with email and password
  - `email: string` - User's email address
  - `password: string` - User's password
  - Returns: `Promise<User>` - Firebase user object
  - Throws: `AuthError` on authentication failure

- **`signUpWithEmailAndPassword`**: Create new account with email and password
  - `email: string` - User's email address
  - `password: string` - User's password (min 6 characters)
  - Returns: `Promise<User>` - Firebase user object
  - Throws: `AuthError` on registration failure

## API Service

### `ApiService`

Central service for making HTTP requests with authentication and error handling.

```typescript
interface ApiService {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T>;
  put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T>;
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T>;
}
```

#### Configuration

```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retry?: boolean;
  cache?: boolean;
}
```

## State Management

### `StateManager`

Reactive state management system with persistence.

```typescript
interface StateManager {
  set<T>(key: string, value: T): void;
  get<T>(key: string): T | null;
  subscribe<T>(key: string, callback: (value: T) => void): Unsubscribe;
  remove(key: string): void;
  clear(): void;
}
```

## Token Service

### `TokenService`

Manages JWT tokens, refresh tokens, and role-based access.

```typescript
interface TokenService {
  getAccessToken(): Promise<string | null>;
  refreshToken(): Promise<string>;
  getUserRoles(): string[];
  hasRole(role: string): boolean;
  clearTokens(): void;
}
```

## Event System

### `PubSub`

Event-driven communication system for decoupled components.

```typescript
interface PubSub {
  publish(event: string, data?: any): void;
  subscribe(event: string, callback: EventCallback): Unsubscribe;
  unsubscribe(event: string, callback?: EventCallback): void;
  clear(): void;
}
```

### Event Types

```typescript
type AuthEvents = 
  | 'auth:signIn'
  | 'auth:signOut' 
  | 'auth:tokenRefresh'
  | 'auth:error';

type UIEvents =
  | 'toast:show'
  | 'toast:hide'
  | 'loading:start'
  | 'loading:stop';

type SystemEvents =
  | 'app:initialized'
  | 'app:error'
  | 'navigation:change';
```

## Utility Functions

### Form Validation

```typescript
interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

function validateField(value: any, rules: ValidationRules): ValidationResult;
```

### Error Handling

```typescript
interface ErrorHandler {
  handle(error: Error, context?: string): void;
  logError(error: Error, metadata?: any): void;
  showUserError(message: string): void;
}
```

### Security Utilities

```typescript
interface SecurityUtils {
  sanitizeInput(input: string): string;
  validateCSRFToken(token: string): boolean;
  encryptSensitiveData(data: string): string;
  decryptSensitiveData(encrypted: string): string;
}
```

## Component Interfaces

### Loading States

```typescript
interface LoadingState {
  isLoading: boolean;
  error?: Error;
  data?: any;
}
```

### Toast Notifications

```typescript
interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  persistent?: boolean;
}
```

### Modal/Dialog

```typescript
interface DialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  dangerous?: boolean;
}
```

## Usage Examples

### Authentication Flow

```typescript
import { authService } from '$services/auth';
import { pubsub } from '$services/events';

// Sign in user
try {
  const user = await authService.signInWithEmailAndPassword(email, password);
  pubsub.publish('auth:signIn', { user });
} catch (error) {
  pubsub.publish('auth:error', { error });
}

// Listen for auth changes
authService.onAuthStateChanged((user) => {
  if (user) {
    pubsub.publish('auth:signIn', { user });
  } else {
    pubsub.publish('auth:signOut');
  }
});
```

### API Requests

```typescript
import { apiService } from '$services/api';

// GET request
const users = await apiService.get<User[]>('/users');

// POST request with data
const newUser = await apiService.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// With custom options
const data = await apiService.get('/data', {
  headers: { 'Custom-Header': 'value' },
  timeout: 5000,
  retry: true
});
```

### State Management

```typescript
import { stateManager } from '$services/state';

// Set state
stateManager.set('user', { id: 1, name: 'John' });

// Get state
const user = stateManager.get<User>('user');

// Subscribe to changes
const unsubscribe = stateManager.subscribe('user', (user) => {
  console.log('User changed:', user);
});
```

### Event Communication

```typescript
import { pubsub } from '$services/events';

// Subscribe to events
const unsubscribe = pubsub.subscribe('toast:show', (data) => {
  showToast(data.message, data.type);
});

// Publish events
pubsub.publish('toast:show', {
  message: 'Operation successful',
  type: 'success'
});
```