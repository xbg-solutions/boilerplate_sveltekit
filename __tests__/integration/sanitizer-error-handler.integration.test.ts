/**
 * src/lib/utils/sanitizer-error-handler.integration.test.ts
 * Integration tests for sanitizer and error handler utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sanitize, strictSanitizer } from '$lib/utils/sanitizer';
import { 
  AppError, 
  ValidationError, 
  handleError,
  withErrorHandling
} from '$lib/utils/error-handler';

describe('Sanitizer and Error Handler Integration', () => {
  // Original console methods
  const originalConsole = {
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  // Mocked console functions
  const mockConsole = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
  
  beforeEach(() => {
    // Setup console mocks
    console.info = mockConsole.info;
    console.warn = mockConsole.warn;
    console.error = mockConsole.error;
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock import.meta.env.DEV
    vi.stubGlobal('import.meta', { env: { DEV: true } });
    
    // Basic document/window mocks if needed
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue({
        style: {},
        innerHTML: '',
        textContent: ''
      })
    });
  });
  
  afterEach(() => {
    // Restore console
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    
    // Cleanup
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should pass error context through the error handler', () => {
    // Create error with potentially unsafe context
    const unsafeInput = '<script>alert("XSS")</script>';
    const unsafeHtml = '<img src="x" onerror="alert(1)">';
    
    const error = new AppError('Test error', {
      context: {
        userInput: unsafeInput,
        formData: { name: unsafeHtml }
      }
    });
    
    // Handle the error
    const formatted = handleError(error);
    
    // Verify context is passed through (no automatic sanitization)
    if (formatted.context) {
      // Type assertion for context
      const context = formatted.context as { userInput: string; formData: { name: string } };
      
      // Context should still have the original values (not sanitized by error handler)
      expect(context.userInput).toBe(unsafeInput);
      expect(context.formData.name).toBe(unsafeHtml);
    } else {
      // Fail the test if context is not present
      expect(formatted.context).toBeDefined();
    }
    
    // Verify error was logged
    expect(mockConsole.error).toHaveBeenCalled();
  });
  
  it('should properly handle errors from sanitization operations', async () => {
    // Create a function that might throw during sanitization
    const processDangerousInput = async (input: string): Promise<string> => {
      if (input.includes('throw')) {
        throw new Error('Dangerous input');
      }
      return strictSanitizer(input);
    };
    
    // Wrap with error handling
    const safeProcess = withErrorHandling(processDangerousInput);
    
    // Test successful case
    const result1 = await safeProcess('<script>alert(1)</script>');
    expect(result1.success).toBe(true);
    expect(result1.data).toBe('alert(1)');
    
    // Test error case
    const result2 = await safeProcess('throw error');
    expect(result2.success).toBe(false);
    expect(result2.error).toBeInstanceOf(Error);
  });
  
  it('should handle validation errors with sanitized user input', async () => {
    // Mock a validate function that uses both sanitization and error handling
    const validateUserInput = async (input: string): Promise<string> => {
      // First sanitize the input
      const sanitized = strictSanitizer(input);
      
      // Then validate
      if (!sanitized || sanitized.length < 3) {
        throw new ValidationError('Validation failed', {
          field: 'input',
          rule: 'minLength',
          fieldErrors: { input: 'Input must be at least 3 characters' },
          userMessage: 'Please provide a longer input'
        });
      }
      
      return sanitized;
    };
    
    // Wrap with error handling
    const safeValidate = withErrorHandling(validateUserInput);
    
    // Test successful case
    const result1 = await safeValidate('Valid input <script>alert(1)</script>');
    expect(result1.success).toBe(true);
    expect(result1.data).toBe('Valid input alert(1)');
    
    // Test validation error case
    const result2 = await safeValidate('ab');
    expect(result2.success).toBe(false);
    expect(result2.error).toBeInstanceOf(ValidationError);
    if (result2.error instanceof ValidationError) {
      expect(result2.error.fieldErrors?.input).toBe('Input must be at least 3 characters');
    }
  });
});