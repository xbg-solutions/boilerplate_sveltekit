/**
 *  src/lib/types/logging.types.ts
 *  Types for the logger
 */

/**
 * Supported log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Information about an active timer
 */
export type TimerInfo = {
  startTime: number;
  label: string;
};

/**
 * State managed by the logger store
 */
export type LoggerState = {
  enabled: boolean;
  timers: Record<string, TimerInfo>;
};