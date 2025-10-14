/**
 * src/lib/utils/error-handler.integration.test.ts
 * Integration tests for the error handler with other services
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AppError,
  ApiError,
  AuthError,
  formatError,
  NetworkError,
  handleError,
  createErrorResponse,
  withErrorHandling
} from '$lib/utils/error-handler';
import { loggerService } from '$lib/services/logging/logging.service';

// This test uses the actual logging service, not a complete mock
// to test real integration between components

describe('Error Handler Integration', () => {
  // Mock console methods to avoid cluttering test output
  const originalConsole = {
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  // Create console mocks
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
  });
  
  afterEach(() => {
    // Restore original console methods
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    
    vi.unstubAllGlobals();
  });

  describe('Integration with Logger Service', () => {
    it('should log errors through the logger service', () => {
      const error = new AppError('Test integration error');
      handleError(error, { operation: 'test' });
      
      // Verify the logger service logged the error (via console.error)
      expect(mockConsole.error).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.any(AppError),
        expect.objectContaining({
          errorName: 'AppError',
          errorCategory: 'application',
          operation: 'test'
        })
      );
    });

    it('should include error details in development environment', () => {
      // Mock development environment
      vi.stubGlobal('import.meta', { env: { DEV: true } });
      
      const error = new ApiError('API error for testing', {
        endpoint: '/api/test',
        method: 'GET',
        apiStatusCode: 404
      });
      
      const formatted = handleError(error);
      
      expect(formatted.stack).toBeDefined();
      expect(formatted.details).toMatchObject({
        endpoint: '/api/test',
        method: 'GET',
        apiStatusCode: 404
      });
    });
    
    it('should exclude sensitive details in production environment', () => {
      // Mock production environment
      vi.stubGlobal('import.meta', { env: { DEV: false } });
      
      const error = new ApiError('API error with sensitive data', {
        endpoint: '/api/users',
        responseData: { password: '12345', email: 'user@example.com' },
        containsSensitiveInfo: true
      });
      
      // Pass false explicitly to ensure production-like behavior
      const formatted = formatError(error, false); // Explicitly use formatError with includeDetails=false
      
      // In production, stack and details should be excluded
      expect(formatted.stack).toBeUndefined();
      expect(formatted.details).toBeUndefined();
    });
    
    it('should use contextual logger from ErrorHandler service', () => {
      const authError = new AuthError('Authentication failed', {
        action: 'login'
      });
      
      handleError(authError, { userId: '123' });
      
      // Check if log includes the errorHandler context
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[ErrorHandler]'),
        expect.any(AuthError),
        expect.any(Object)
      );
    });
  });

  describe('Error Handler with API Scenarios', () => {
    it('should handle API fetch scenarios', async () => {
      // Mock fetch function
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));
      
      // Create a function that uses fetch with error handling
      const fetchData = async () => {
        try {
          const response = await fetch('/api/data');
          if (!response.ok) {
            throw new ApiError('API request failed', {
              apiStatusCode: response.status,
              endpoint: '/api/data',
              method: 'GET'
            });
          }
          return await response.json();
        } catch (error) {
          // Convert to proper error type
          if (error instanceof ApiError) {
            throw error;
          }
          throw new ApiError('Failed to fetch data', {
            endpoint: '/api/data',
            method: 'GET',
            cause: error instanceof Error ? error : undefined
          });
        }
      };
      
      // Wrap with error handling
      const safeFetch = withErrorHandling(fetchData);
      
      // Execute and check results
      const result = await safeFetch();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ApiError);
      expect(mockConsole.error).toHaveBeenCalled();
    });
    
    it('should detect network errors and categorize them properly', async () => {
      // Setup offline detection
      const originalOnline = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

      try {
        // Create a function that detects network status
        const fetchWithNetworkDetection = async () => {
          if (!navigator.onLine) {
            throw new NetworkError('Device is offline', {
              isOffline: true,
              endpoint: '/api/data'
            });
          }
          
          // This won't execute since we're "offline"
          const response = await fetch('/api/data');
          return await response.json();
        };
        
        // Wrap with error handling
        const safeFetch = withErrorHandling(fetchWithNetworkDetection);
        
        // Execute and check results
        const result = await safeFetch();
        
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(NetworkError);
        // Type assertion to access NetworkError-specific property
        if (result.error instanceof NetworkError) {
          expect(result.error.isOffline).toBe(true);
        }
        expect(mockConsole.error).toHaveBeenCalled();
      } finally {
        // Restore original online status
        Object.defineProperty(navigator, 'onLine', { value: originalOnline });
      }
    });
  });

  describe('Integration with SvelteKit', () => {
    it('should create SvelteKit-compatible error responses', () => {
      // Test different error types with SvelteKit error response creation
      const authError = new AuthError('User not authenticated', {
        action: 'authorize',
        userMessage: 'Please log in to access this page',
        statusCode: 401
      });
      
      const errorResponse = createErrorResponse(authError, {
        redirect: '/login'
      });
      
      // Verify it meets SvelteKit's expected format
      expect(errorResponse).toMatchObject({
        message: 'Please log in to access this page',
        status: 401,
        redirect: '/login'
      });
      
      // Verify it would work with the standard error handler
      function mockSvelteKitHandler(error: any) {
        return {
          status: error.status,
          message: error.message,
          redirect: error.redirect
        };
      }
      
      const handledResponse = mockSvelteKitHandler(errorResponse);
      expect(handledResponse).toMatchObject({
        status: 401,
        message: 'Please log in to access this page',
        redirect: '/login'
      });
    });
    
    it('should handle different status codes correctly', () => {
      const codes = [
        { error: new AuthError('Not authenticated', { action: 'login' }), expected: 401 },
        { error: new AuthError('Not authorized', { action: 'authorize' }), expected: 403 },
        { error: new ApiError('Not found', { apiStatusCode: 404 }), expected: 404 },
        { error: new NetworkError('Timeout', { isTimeout: true }), expected: 500 },
        { error: new NetworkError('Offline', { isOffline: true }), expected: 503 },
        { error: new AppError('Generic error'), expected: 500 }
      ];
      
      for (const { error, expected } of codes) {
        const response = createErrorResponse(error);
        expect(response.status).toBe(expected);
      }
    });
  });
});