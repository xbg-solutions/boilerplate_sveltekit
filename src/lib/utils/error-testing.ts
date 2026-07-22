/**
 * Error Testing Utilities
 * 
 * Helper functions for testing error boundaries and error handling
 */

// Test-support helpers — this module is imported only by *.test.ts under vitest.
import { vi, type MockInstance } from 'vitest';

export interface ErrorTestConfig {
  type: 'sync' | 'async' | 'network' | 'chunk' | 'auth' | 'validation' | 'timeout';
  message?: string;
  delay?: number;
  code?: string;
  statusCode?: number;
}

export class ErrorTester {
  private static errorCount = 0;

  /**
   * Generate a test error with specific characteristics
   */
  static generateError(config: ErrorTestConfig): Error {
    this.errorCount++;
    
    const baseMessage = config.message || this.getDefaultMessage(config.type);
    const message = `${baseMessage} #${this.errorCount}`;
    
    const error = new Error(message);
    error.name = this.getErrorName(config.type);
    
    // Add custom properties based on error type
    this.addErrorProperties(error, config);
    
    return error;
  }

  /**
   * Trigger a synchronous error
   */
  static triggerSyncError(config: Partial<ErrorTestConfig> = {}): never {
    const error = this.generateError({ type: 'sync', ...config });
    throw error;
  }

  /**
   * Trigger an asynchronous error
   */
  static async triggerAsyncError(config: Partial<ErrorTestConfig> = {}): Promise<never> {
    const delay = config.delay || 100;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const error = this.generateError({ type: 'async', ...config });
    throw error;
  }

  /**
   * Trigger a network error
   */
  static triggerNetworkError(config: Partial<ErrorTestConfig> = {}): never {
    const error = this.generateError({ 
      type: 'network', 
      statusCode: 500,
      ...config 
    });
    throw error;
  }

  /**
   * Trigger a chunk loading error
   */
  static triggerChunkError(config: Partial<ErrorTestConfig> = {}): never {
    const error = this.generateError({ type: 'chunk', ...config });
    throw error;
  }

  /**
   * Trigger an authentication error
   */
  static triggerAuthError(config: Partial<ErrorTestConfig> = {}): never {
    const error = this.generateError({ 
      type: 'auth', 
      statusCode: 401,
      ...config 
    });
    throw error;
  }

  /**
   * Trigger a validation error
   */
  static triggerValidationError(config: Partial<ErrorTestConfig> = {}): never {
    const error = this.generateError({ 
      type: 'validation', 
      statusCode: 400,
      ...config 
    });
    throw error;
  }

  /**
   * Trigger a timeout error
   */
  static triggerTimeoutError(config: Partial<ErrorTestConfig> = {}): never {
    const error = this.generateError({ 
      type: 'timeout', 
      statusCode: 408,
      ...config 
    });
    throw error;
  }

  /**
   * Trigger an unhandled promise rejection
   */
  static triggerUnhandledPromise(config: Partial<ErrorTestConfig> = {}): void {
    const error = this.generateError({ type: 'async', ...config });
    Promise.reject(error);
  }

  /**
   * Create a component that will error on mount
   */
  static createErrorComponent(config: ErrorTestConfig = { type: 'sync' }) {
    return {
      onMount() {
        const error = ErrorTester.generateError(config);
        throw error;
      }
    };
  }

  private static getDefaultMessage(type: ErrorTestConfig['type']): string {
    const messages = {
      sync: 'Synchronous error occurred',
      async: 'Asynchronous operation failed',
      network: 'Failed to fetch data from server',
      chunk: 'Loading chunk failed',
      auth: 'Authentication required',
      validation: 'Validation failed',
      timeout: 'Request timed out'
    };
    
    return messages[type];
  }

  private static getErrorName(type: ErrorTestConfig['type']): string {
    const names = {
      sync: 'SyncError',
      async: 'AsyncError',
      network: 'NetworkError',
      chunk: 'ChunkLoadError',
      auth: 'AuthError',
      validation: 'ValidationError',
      timeout: 'TimeoutError'
    };
    
    return names[type];
  }

  private static addErrorProperties(error: Error, config: ErrorTestConfig): void {
    // Add common properties
    (error as any).timestamp = Date.now();
    (error as any).testError = true;
    
    if (config.code) {
      (error as any).code = config.code;
    }
    
    if (config.statusCode) {
      (error as any).status = config.statusCode;
      (error as any).statusCode = config.statusCode;
    }
    
    // Add type-specific properties
    switch (config.type) {
      case 'network':
        (error as any).isNetworkError = true;
        (error as any).url = 'https://api.example.com/data';
        break;
        
      case 'chunk':
        (error as any).isChunkLoadError = true;
        (error as any).chunkName = 'pages/dashboard';
        break;
        
      case 'auth':
        (error as any).isAuthError = true;
        (error as any).requiredRole = 'user';
        break;
        
      case 'validation':
        (error as any).isValidationError = true;
        (error as any).field = 'email';
        (error as any).rule = 'required';
        break;
        
      case 'timeout':
        (error as any).isTimeoutError = true;
        (error as any).timeout = config.delay || 30000;
        break;
    }
  }

  /**
   * Reset error counter (useful for testing)
   */
  static resetCounter(): void {
    this.errorCount = 0;
  }

  /**
   * Get current error count
   */
  static getErrorCount(): number {
    return this.errorCount;
  }
}

/**
 * Helper functions for testing error boundaries in Vitest
 */
export class ErrorBoundaryTestHelpers {
  /**
   * Wait for error boundary to catch an error
   */
  static async waitForError(
    triggerError: () => void | Promise<void>,
    timeout = 5000
  ): Promise<Error> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Error was not caught within timeout'));
      }, timeout);

      const errorHandler = (event: ErrorEvent) => {
        clearTimeout(timeoutId);
        window.removeEventListener('error', errorHandler);
        resolve(new Error(event.message));
      };

      const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
        clearTimeout(timeoutId);
        window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
        resolve(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      };

      window.addEventListener('error', errorHandler);
      window.addEventListener('unhandledrejection', unhandledRejectionHandler);

      // Trigger the error
      try {
        const result = triggerError();
        if (result instanceof Promise) {
          result.catch(() => {
            // Error will be handled by unhandledRejectionHandler
          });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        window.removeEventListener('error', errorHandler);
        window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
        resolve(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Mock console methods for testing
   */
  static mockConsole(): {
    error: MockInstance;
    warn: MockInstance;
    log: MockInstance;
    restore: () => void;
  } {
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    return {
      error: errorSpy,
      warn: warnSpy,
      log: logSpy,
      restore: () => {
        console.error = originalError;
        console.warn = originalWarn;
        console.log = originalLog;
      }
    };
  }

  /**
   * Create a mock error reporting service
   */
  static createMockErrorReportingService() {
    return {
      reportError: vi.fn().mockResolvedValue(true),
      addBreadcrumb: vi.fn(),
      configure: vi.fn(),
      clearBreadcrumbs: vi.fn(),
      getBreadcrumbs: vi.fn().mockReturnValue([]),
      getLocalReports: vi.fn().mockReturnValue([]),
      clearLocalReports: vi.fn()
    };
  }
}

// Development-only error triggers (removed in production)
if (import.meta.env.DEV) {
  // Expose ErrorTester globally for debugging
  (globalThis as any).ErrorTester = ErrorTester;
}