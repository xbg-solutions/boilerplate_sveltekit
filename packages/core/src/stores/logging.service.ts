import { writable } from 'svelte/store';

export interface LoggingServiceState {
  level: string;
  enabled: boolean;
  context: string | null;
}

const loggingServiceStore = writable<LoggingServiceState>({
  level: 'info',
  enabled: true,
  context: null
});

// Simple logging service that tests expect
export const loggerService = {
  info: (...args: any[]) => console.info(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
  debug: (...args: any[]) => console.debug(...args),
  
  withContext: (context: string) => ({
    info: (...args: any[]) => console.info(`[${context}]`, ...args),
    warn: (...args: any[]) => console.warn(`[${context}]`, ...args),
    error: (...args: any[]) => console.error(`[${context}]`, ...args),
    debug: (...args: any[]) => console.debug(`[${context}]`, ...args)
  })
};