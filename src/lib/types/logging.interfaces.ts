/**
 *  src/lib/interfaces/logging.interfaces.ts
 *  Logging interfaces
 */

/**
 * Context information to be included with log entries
 */
export interface LogContext {
  /** Identifier for the service/component generating the log */
  serviceKey?: string;
  /** Unique instance identifier if available */
  instanceId?: string;
  /** Additional contextual information */
  [key: string]: any;
}

/**
 * Logger service interface
 */
export interface ILoggerService {
  /**
   * Log debug message (only in development)
   * @param message The debug message
   * @param context Additional context information
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Log informational message
   * @param message The message to log
   * @param context Additional context information
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log warning message
   * @param message The warning message
   * @param context Additional context information
   */
  warn(message: string, context?: LogContext): void;
  
  /**
   * Log error message, always outputs regardless of enabled state
   * @param message The error message
   * @param error Optional Error object
   * @param context Additional context information
   */
  error(message: string, error?: Error, context?: LogContext): void;
  
  /**
   * Start a performance timer
   * @param label Descriptive label for the operation being timed
   * @returns Timer ID to be used with endTimer
   */
  startTimer(label: string): string;
  
  /**
   * End a performance timer and log the duration
   * @param timerId ID returned from startTimer
   * @param context Additional context information
   */
  endTimer(timerId: string, context?: LogContext): void;
  
  /**
   * Create a new logger instance with predefined context
   * @param serviceKey Service/component identifier to include with all logs
   * @returns A new logger instance with the context preset
   */
  withContext(serviceKey: string): Omit<ILoggerService, 'withContext' | 'isEnabled'>;
  
  /**
   * Check if logging is currently enabled
   * @returns True if logging is enabled
   */
  isEnabled(): boolean;
}