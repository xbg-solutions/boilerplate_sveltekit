# Logging Service

## Overview

The Logging Service provides structured, context-aware logging with environment-specific behavior. It supports multiple log levels, performance timing, and runtime configuration via URL parameters. The service uses a Svelte store for state management and provides a singleton interface for application-wide logging.

## Location

- **Service**: `/src/lib/services/logging/logging.service.ts`
- **Store**: `/src/lib/stores/logging.store.ts`

## Log Levels

The service supports four log levels:

- **debug** - Detailed diagnostic information (only when enabled)
- **info** - General informational messages (only when enabled)
- **warn** - Warning messages (only when enabled)
- **error** - Error messages (always logged)

## Configuration

Logging is automatically configured based on:

1. **Environment**: Enabled by default in development mode
2. **URL Parameters** (development builds only):
   - `?verboseLogging=1` - Force enable verbose logging
   - `?devLogsOff=1` - Disable logging in development
   - These parameters are ignored in production builds for security

## Key Methods

### Log Methods

#### debug(message, context?)

Log debug information.

```typescript
loggerService.debug('Detailed diagnostic info', {
  userId: '123',
  operation: 'fetchData'
});
```

#### info(message, context?)

Log informational messages.

```typescript
loggerService.info('User logged in successfully', {
  userId: user.uid,
  method: 'email'
});
```

#### warn(message, context?)

Log warning messages.

```typescript
loggerService.warn('API rate limit approaching', {
  remaining: 10,
  resetTime: Date.now() + 60000
});
```

#### error(message, error?, context?)

Log error messages (always logged regardless of enabled state).

```typescript
loggerService.error('Failed to fetch user data', error, {
  userId: '123',
  endpoint: '/api/user'
});
```

### Performance Timing

#### startTimer(label)

Start a performance timer.

```typescript
const timerId = loggerService.startTimer('fetchUserData');
```

**Returns**: Timer ID string to use with `endTimer()`

#### endTimer(timerId, context?)

End a timer and log the duration.

```typescript
loggerService.endTimer(timerId, {
  recordCount: results.length
});
// Output: [INFO] fetchUserData completed in 245.32ms
```

### Context-Aware Logging

#### withContext(serviceKey)

Create a logger instance with predefined context.

```typescript
const authLogger = loggerService.withContext('AuthService');

// All logs from this logger will include [AuthService] tag
authLogger.info('User authenticated');
// Output: [INFO] [2025-01-14T12:00:00.000Z] [AuthService] User authenticated

authLogger.error('Authentication failed', error);
// Output: [ERROR] [2025-01-14T12:00:00.000Z] [AuthService] Authentication failed
```

The context logger provides the same methods:
- `debug(message, context?)`
- `info(message, context?)`
- `warn(message, context?)`
- `error(message, error?, context?)`
- `startTimer(label)` - Automatically prefixes label with service key
- `endTimer(timerId, context?)`

#### isEnabled()

Check if logging is currently enabled.

```typescript
if (loggerService.isEnabled()) {
  // Perform expensive logging operations
  const debugData = computeExpensiveDebugInfo();
  loggerService.debug('Debug data', debugData);
}
```

## Usage Examples

### Basic Logging

```typescript
import { loggerService } from '$lib/services/logging/logging.service';

// Log at different levels
loggerService.debug('Starting operation');
loggerService.info('Operation in progress');
loggerService.warn('Operation taking longer than expected');
loggerService.error('Operation failed', error);
```

### With Context

```typescript
// Log with additional context
loggerService.info('User profile updated', {
  userId: '123',
  fields: ['name', 'email'],
  timestamp: Date.now()
});
```

### Service-Specific Logger

```typescript
// Create a logger for a specific service
const userLogger = loggerService.withContext('UserService');

userLogger.info('Fetching user profile');
userLogger.warn('Profile incomplete', { userId: '123' });
userLogger.error('Failed to update profile', error, { userId: '123' });
```

### Performance Timing

```typescript
// Time an operation
const timerId = loggerService.startTimer('databaseQuery');

try {
  const results = await database.query('SELECT * FROM users');
  loggerService.endTimer(timerId, {
    resultCount: results.length
  });
} catch (error) {
  loggerService.endTimer(timerId, {
    error: true
  });
  throw error;
}
```

### Conditional Logging

```typescript
// Only log if enabled (to avoid expensive operations)
if (loggerService.isEnabled()) {
  const debugInfo = {
    state: JSON.stringify(getCurrentState()),
    memory: performance.memory,
    timing: performance.now()
  };
  loggerService.debug('State snapshot', debugInfo);
}
```

### Multiple Timers

```typescript
const logger = loggerService.withContext('DataProcessor');

const totalTimer = logger.startTimer('total_processing');
const fetchTimer = logger.startTimer('fetch_data');

const data = await fetchData();
logger.endTimer(fetchTimer, { records: data.length });

const processTimer = logger.startTimer('process_data');
const results = await processData(data);
logger.endTimer(processTimer, { results: results.length });

logger.endTimer(totalTimer);
```

## Log Format

Logs are formatted as:

```
[LEVEL] [TIMESTAMP] [SERVICE_KEY] Message
```

Example:
```
[INFO] [2025-01-14T12:00:00.000Z] [AuthService] User logged in successfully
[ERROR] [2025-01-14T12:00:00.000Z] [DatabaseService] Connection failed
```

Context objects are logged as separate console output for easy inspection.

## Store Structure

The `loggerStore` tracks logging state:

```typescript
{
  enabled: boolean,            // Whether logging is enabled
  timers: {                    // Active performance timers
    [timerId: string]: {
      startTime: number,
      label: string
    }
  }
}
```

## Integration Notes

- **SSR Safe**: Automatically disables logging in server-side rendering
- **Error Priority**: Error logs are always output, regardless of enabled state
- **Performance**: Timer information stored in store for persistence
- **Singleton**: Single instance shared across the application
- **Console API**: Uses native console methods (debug, info, warn, error)
