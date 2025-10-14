/**
 * src/lib/utils/error-handler.ts
 * Error handling utilities
 * 
 * A centralized utility for application-wide error handling with support for:
 * - Custom error classes for different error types
 * - Error categorization and standardization
 * - Environment-specific error formatting and sanitization
 * - Integration with the logging service
 * - Support for SvelteKit's error handling mechanism
 */

import { loggerService } from '../services/logging/logging.service';
import type { LogContext } from '../types/logging.interfaces';
import type { 
  ErrorOptions, 
  FormattedError, 
  ApiErrorOptions,
  ValidationErrorOptions,
  AuthErrorOptions,
  NetworkErrorOptions
} from '../types/error.types';

// Create a context-aware logger for the error handler
const errorLogger = loggerService.withContext('ErrorHandler');

/**
 * Base application error class that all other error types extend
 */
export class AppError extends Error {
  /** Error category */
  public category: string;
  /** HTTP status code if applicable */
  public statusCode?: number;
  /** Additional context for the error */
  public context?: Record<string, any>;
  /** Whether this error should be reported to the user */
  public userVisible: boolean;
  /** Optional user-friendly message that can be displayed in the UI */
  public userMessage?: string;
  /** Optional error code for client-side handling */
  public code?: string;
  /** Whether error contains sensitive information and should be sanitized in production */
  public containsSensitiveInfo: boolean;
  /** Original error that caused this error */
  public cause?: Error;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    
    // Set name based on constructor name for better stack traces
    this.name = this.constructor.name;
    
    // Set default and custom properties
    this.category = options.category || 'application';
    this.statusCode = options.statusCode;
    this.context = options.context;
    this.userVisible = options.userVisible ?? true;
    this.userMessage = options.userMessage;
    this.code = options.code;
    this.containsSensitiveInfo = options.containsSensitiveInfo ?? false;
    this.cause = options.cause;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * API-related errors (network, HTTP, etc.)
 */
export class ApiError extends AppError {
  /** The API endpoint that was being accessed */
  public endpoint?: string;
  /** The HTTP method being used */
  public method?: string;
  /** Response status code from the API */
  public apiStatusCode?: number;
  /** Response data if available */
  public responseData?: any;

  constructor(
    message: string, 
    options: ApiErrorOptions = {}
  ) {
    super(message, {
      category: 'api',
      statusCode: options.apiStatusCode || 500,
      ...options
    });
    
    this.endpoint = options.endpoint;
    this.method = options.method;
    this.apiStatusCode = options.apiStatusCode;
    this.responseData = options.responseData;
  }
}

/**
 * Validation errors for form inputs, etc.
 */
export class ValidationError extends AppError {
  /** Field that failed validation */
  public field?: string;
  /** Validation rule that failed */
  public rule?: string;
  /** Map of field names to error messages */
  public fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    options: ValidationErrorOptions = {}
  ) {
    super(message, {
      category: 'validation',
      statusCode: 400,
      ...options
    });
    
    this.field = options.field;
    this.rule = options.rule;
    this.fieldErrors = options.fieldErrors;
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthError extends AppError {
  /** The authentication action that was being performed */
  public action?: 'login' | 'logout' | 'register' | 'verify' | 'reset' | 'authorize';

  constructor(
    message: string,
    options: AuthErrorOptions = {}
  ) {
    super(message, {
      category: 'auth',
      statusCode: options.action === 'authorize' ? 403 : 401,
      // For auth errors, default to not showing technical details to users
      userMessage: options.userMessage || 'Authentication failed. Please try again.',
      containsSensitiveInfo: true,
      ...options
    });
    
    this.action = options.action;
  }
}

/**
 * General application errors
 */
export class ApplicationError extends AppError {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, {
      category: 'application',
      statusCode: options.statusCode || 500,
      ...options
    });
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends ApiError {
  /** Whether the error was due to a timeout */
  public isTimeout?: boolean;
  /** Whether the error was due to offline status */
  public isOffline?: boolean;

  constructor(
    message: string,
    options: NetworkErrorOptions = {}
  ) {
    super(message, {
      category: 'network',
      statusCode: options.isOffline ? 503 : 500,
      userMessage: options.isOffline 
        ? 'Unable to connect to the server. Please check your internet connection.'
        : options.isTimeout
          ? 'The request timed out. Please try again.'
          : 'A network error occurred. Please try again.',
      ...options
    });
    
    // Explicitly assign the optional properties
    this.isTimeout = options.isTimeout;
    this.isOffline = options.isOffline;
  }
}

/**
 * Creates an appropriate error object from any caught error
 * 
 * @param error The caught error
 * @param fallbackMessage Default message if error is not an Error object
 * @param options Additional options for error creation
 * @returns An AppError instance
 */
export function normalizeError(
  error: unknown,
  fallbackMessage = 'An unknown error occurred',
  options: ErrorOptions = {}
): AppError {
  // If already an AppError, return as is
  if (error instanceof AppError) {
    return error;
  }
  
  // If standard Error with message, convert to ApplicationError
  if (error instanceof Error) {
    const appError = new ApplicationError(error.message, options);
    // Manually set the cause property since it might not be properly set through options
    appError.cause = error;
    return appError;
  }
  
  // If error is a string, use as message
  if (typeof error === 'string') {
    return new ApplicationError(error, options);
  }
  
  // Handle other types (objects, etc.)
  return new ApplicationError(fallbackMessage, {
    context: { originalError: error },
    ...options
  });
}

/**
 * Format an error for display/logging with appropriate detail level based on environment
 * 
 * @param error The error to format
 * @param includeDetails Whether to include detailed technical information
 * @returns Formatted error with appropriate detail level
 */
export function formatError(
  error: Error | AppError,
  includeDetails = import.meta.env.DEV
): FormattedError {
  const appError = error instanceof AppError
    ? error
    : normalizeError(error);
  
  // Base information to always include
  const formatted: FormattedError = {
    message: appError.message,
    name: appError.name,
    category: appError instanceof AppError ? appError.category : 'unknown'
  };
  
  // Add status code if available
  if (appError instanceof AppError && appError.statusCode) {
    formatted.statusCode = appError.statusCode;
  }
  
  // Add user-facing message if specified
  if (appError instanceof AppError && appError.userMessage) {
    formatted.userMessage = appError.userMessage;
  }
  
  // Only include detailed information in development or if explicitly requested
  if (includeDetails) {
    // Include stack trace only in development
    formatted.stack = appError.stack;
    
    // Include context information if available
    if (appError instanceof AppError) {
      if (appError.context) {
        formatted.context = appError.containsSensitiveInfo
          ? { note: 'Context omitted for security reasons' }
          : appError.context;
      }
      
      // Add error-specific details
      // Check for NetworkError first since it's a subclass of ApiError
      if (appError.name === 'NetworkError') {
        // For NetworkError, explicitly include isTimeout and isOffline
        const networkError = appError as NetworkError;
        formatted.details = {
          isTimeout: Boolean(networkError.isTimeout),
          isOffline: Boolean(networkError.isOffline),
          endpoint: networkError.endpoint,
          method: networkError.method
        };
      } else if (appError instanceof ApiError) {
        formatted.details = {
          endpoint: appError.endpoint,
          method: appError.method,
          apiStatusCode: appError.apiStatusCode
        };
        
        // Only include response data in development and if not sensitive
        if (!appError.containsSensitiveInfo && appError.responseData) {
          formatted.details.responseData = appError.responseData;
        }
      } else if (appError instanceof ValidationError) {
        formatted.details = {
          field: appError.field,
          rule: appError.rule,
          fieldErrors: appError.fieldErrors
        };
      } else if (appError instanceof AuthError) {
        formatted.details = {
          action: appError.action
        };
      }
    }
  }
  
  return formatted;
}

/**
 * Main error handler function for the application
 * 
 * @param error The error to handle
 * @param context Additional context information
 * @returns Formatted error information
 */
export function handleError(error: unknown, context: LogContext = {}): FormattedError {
  const normalizedError = normalizeError(error);
  
  // Log the error with appropriate level
  errorLogger.error(
    normalizedError.message,
    normalizedError,
    {
      errorName: normalizedError.name,
      errorCategory: normalizedError.category,
      ...context
    }
  );
  
  // Format the error based on environment
  return formatError(normalizedError);
}

/**
 * Creates a SvelteKit-compatible error response for use in load functions and actions
 * 
 * @param error The error to convert
 * @param options Additional options for the error response
 * @returns An error object compatible with SvelteKit's error handling
 */
export function createErrorResponse(
  error: unknown,
  options: { redirect?: string } = {}
): App.Error {
  const appError = normalizeError(error);
  
  // Log the error
  errorLogger.error(
    `Creating error response: ${appError.message}`,
    appError,
    { errorCategory: appError.category }
  );
  
  // Create SvelteKit error response
  return {
    message: appError.userMessage || appError.message,
    // Use appropriate status code, defaulting to 500
    status: appError.statusCode || 500,
    // Add redirect if specified
    ...(options.redirect ? { redirect: options.redirect } : {})
  };
}

/**
 * Helper function to safely try an operation and handle errors
 * 
 * @param operation Function to execute
 * @param errorHandler Custom error handler
 * @returns Result of the operation or undefined if failed
 */
export async function tryCatch<T>(
  operation: () => Promise<T>,
  errorHandler?: (error: AppError) => void
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const appError = normalizeError(error);
    
    // Log the error
    errorLogger.error(
      `Operation failed: ${appError.message}`,
      appError,
      { errorCategory: appError.category }
    );
    
    // Call custom error handler if provided
    if (errorHandler) {
      errorHandler(appError);
    }
    
    return undefined;
  }
}

/**
 * Creates a function that will catch errors from another function and return a result object
 * 
 * @param operation Function to wrap with error handling
 * @returns Object containing success flag, result value, and error if applicable
 */
export function withErrorHandling<T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>
): (...args: Args) => Promise<{ success: boolean; data?: T; error?: AppError }> {
  return async (...args: Args) => {
    try {
      const data = await operation(...args);
      return { success: true, data };
    } catch (error) {
      const appError = normalizeError(error);
      
      // Log the error
      errorLogger.error(
        `Operation failed: ${appError.message}`,
        appError,
        { errorCategory: appError.category, args }
      );
      
      return { success: false, error: appError };
    }
  };
}