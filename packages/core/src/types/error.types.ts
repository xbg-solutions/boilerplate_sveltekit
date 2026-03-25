/**
 * src/lib/types/error.types.ts
 * Error handling type definitions
 */

/**
 * Options for creating application errors
 */
export type ErrorOptions = {
  /** The category of the error */
  category?: string;
  /** HTTP status code for the error */
  statusCode?: number;
  /** Additional context information */
  context?: Record<string, any>;
  /** Whether this error should be displayed to the user */
  userVisible?: boolean;
  /** User-friendly message for display in UI */
  userMessage?: string;
  /** Error code for client-side handling */
  code?: string;
  /** Original error that caused this error */
  cause?: Error;
  /** Whether the error contains sensitive information */
  containsSensitiveInfo?: boolean;
};

/**
 * Extended options for API errors
 */
export type ApiErrorOptions = ErrorOptions & {
  /** The API endpoint that was being accessed */
  endpoint?: string;
  /** The HTTP method being used */
  method?: string;
  /** Response status code from the API */
  apiStatusCode?: number;
  /** Response data if available */
  responseData?: any;
};

/**
 * Extended options for network errors
 */
export type NetworkErrorOptions = ApiErrorOptions & {
  /** Whether the error was due to a timeout */
  isTimeout?: boolean;
  /** Whether the error was due to offline status */
  isOffline?: boolean;
};

/**
 * Extended options for validation errors
 */
export type ValidationErrorOptions = ErrorOptions & {
  /** Field that failed validation */
  field?: string;
  /** Validation rule that failed */
  rule?: string;
  /** Map of field names to error messages */
  fieldErrors?: Record<string, string>;
};

/**
 * Extended options for auth errors
 */
export type AuthErrorOptions = ErrorOptions & {
  /** The authentication action that was being performed */
  action?: 'login' | 'logout' | 'register' | 'verify' | 'reset' | 'authorize';
};

/**
 * Formatted error information suitable for logging and display
 */
export type FormattedError = {
  /** Error message */
  message: string;
  /** Error type/class name */
  name: string;
  /** Error category */
  category: string;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** User-friendly message suitable for display */
  userMessage?: string;
  /** Error stack trace (included only in development) */
  stack?: string;
  /** Additional context information */
  context?: Record<string, any>;
  /** Error-specific details */
  details?: Record<string, any>;
};

/**
 * Result type for functions with error handling
 */
export type ErrorResult<T> = {
  /** Whether the operation was successful */
  success: boolean;
  /** Result data if operation was successful */
  data?: T;
  /** Error information if operation failed */
  error?: FormattedError;
};