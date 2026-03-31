/**
 * src/lib/utils/csrf.test.ts
 * CSRF protection utility unit tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { csrfProtection } from '@xbg.solutions/bpsk-utils-csrf';
import { secureStorage } from '@xbg.solutions/bpsk-utils-secure-storage';
import { 
  CSRF_TOKEN_KEY, 
  CSRF_HEADER_NAME, 
  CSRF_PROTECTED_METHODS,
  AUTH_NAMESPACE 
} from '@xbg.solutions/bpsk-utils-csrf';

// Mock the secure storage module
vi.mock('$lib/utils/secure-storage', () => {
  return {
    secureStorage: {
      setItem: vi.fn(() => true),
      getItem: vi.fn(() => null),
      removeItem: vi.fn(() => true)
    }
  };
});

// Mock the logger service
vi.mock('../services/logging/logging.service', () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    withContext: vi.fn()
  };
  
  // Mock the withContext function to return a similar mock
  mockLogger.withContext.mockReturnValue({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    startTimer: vi.fn(),
    endTimer: vi.fn()
  });
  
  return {
    loggerService: mockLogger
  };
});

// Mock import.meta.env
vi.stubGlobal('import', { 
  meta: { 
    env: { 
      DEV: true,
      TEST: true 
    } 
  } 
});

describe('CSRF Protection Utility', () => {
  // Mock crypto.getRandomValues for token generation
  const mockGetRandomValues = vi.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = i % 256; // Simple deterministic pattern for testing
    }
    return array;
  });
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Setup crypto mock
    vi.stubGlobal('crypto', {
      getRandomValues: mockGetRandomValues
    });
    
    // Mock window and document for isBrowser check
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', {});
    
    // Set default return values for mocks
    (secureStorage.setItem as any).mockReturnValue(true);
    (secureStorage.getItem as any).mockReturnValue(null);
    (secureStorage.removeItem as any).mockReturnValue(true);
  });
  
  afterEach(() => {
    // Clean up stubs after each test
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  
  describe('Token Generation', () => {
    it('should generate a new CSRF token', async () => {
      const token = await csrfProtection.generateCsrfToken();
      
      // Check token format (hex string of correct length)
      expect(token).toMatch(/^[0-9a-f]{64}$/);
      
      // Verify token was stored in secure storage
      expect(secureStorage.setItem).toHaveBeenCalledWith(
        CSRF_TOKEN_KEY,
        token,
        expect.objectContaining({
          namespace: AUTH_NAMESPACE,
          mechanism: 'cookie'
        })
      );
    });
    
    it('should handle storage failures during token generation', async () => {
      // Mock storage failure
      (secureStorage.setItem as any).mockReturnValue(false);
      
      // Token generation should throw
      await expect(csrfProtection.generateCsrfToken()).rejects.toThrow('Failed to store CSRF token');
    });
  });
  
  describe('Token Retrieval', () => {
    it('should get existing token from storage', async () => {
      // Mock existing token in storage
      const mockToken = 'existing-token-123';
      (secureStorage.getItem as any).mockReturnValue(mockToken);
      
      // Use our test helper to clear any internal token first
      (csrfProtection as any)._setCurrentTokenForTests('');
      (csrfProtection as any)._setCurrentTokenForTests(null);
      
      const token = await csrfProtection.getCsrfToken();
      
      // Should return existing token from storage
      expect(token).toBe(mockToken);
      
      // Should check storage
      expect(secureStorage.getItem).toHaveBeenCalledWith(
        CSRF_TOKEN_KEY,
        expect.objectContaining({
          namespace: AUTH_NAMESPACE,
          mechanism: 'cookie'
        })
      );
      
      // Should not generate a new token
      expect(secureStorage.setItem).not.toHaveBeenCalled();
    });
    
    it('should generate new token if none exists', async () => {
      // Mock no existing token
      (secureStorage.getItem as any).mockReturnValue(null);
      
      // Use our test helper to clear any internal token first
      (csrfProtection as any)._setCurrentTokenForTests('');
      (csrfProtection as any)._setCurrentTokenForTests(null);
      
      // Reset the getItem mock to track calls
      vi.clearAllMocks();
      
      const token = await csrfProtection.getCsrfToken();
      
      // Should generate and return a new token
      expect(token).toMatch(/^[0-9a-f]{64}$/);
      
      // Should try to get from storage first
      expect(secureStorage.getItem).toHaveBeenCalledWith(
        CSRF_TOKEN_KEY,
        expect.objectContaining({
          namespace: AUTH_NAMESPACE,
          mechanism: 'cookie'
        })
      );
      
      // Should store the new token
      expect(secureStorage.setItem).toHaveBeenCalledWith(
        CSRF_TOKEN_KEY,
        token,
        expect.anything()
      );
    });
  });
  
  describe('Token Validation', () => {
    it('should validate matching tokens', () => {
      const mockToken = 'valid-token-123';
      
      // Mock token in storage
      (secureStorage.getItem as any).mockReturnValue(mockToken);
      
      // Validate the same token
      const isValid = csrfProtection.validateCsrfToken(mockToken);
      
      expect(isValid).toBe(true);
    });
    
    it('should reject non-matching tokens', () => {
      const storedToken = 'stored-token-123';
      const submittedToken = 'different-token-456';
      
      // Mock token in storage
      (secureStorage.getItem as any).mockReturnValue(storedToken);
      
      // Validate a different token
      const isValid = csrfProtection.validateCsrfToken(submittedToken);
      
      expect(isValid).toBe(false);
    });
    
    it('should reject empty tokens', () => {
      const storedToken = 'stored-token-123';
      
      // Mock token in storage
      (secureStorage.getItem as any).mockReturnValue(storedToken);
      
      // Validate an empty token
      const isValid = csrfProtection.validateCsrfToken('');
      
      expect(isValid).toBe(false);
    });
    
    it('should handle missing stored token', () => {
      // Mock no token in storage
      (secureStorage.getItem as any).mockReturnValue(null);
      
      // Validate with any token
      const isValid = csrfProtection.validateCsrfToken('some-token');
      
      expect(isValid).toBe(false);
    });
  });
  
  describe('Request Protection', () => {
    it('should add CSRF token to protected methods', async () => {
      const mockToken = 'test-token-123';
      
      // Use the test helper to directly set the token
      (csrfProtection as any)._setCurrentTokenForTests(mockToken);
      
      // Test each protected method
      for (const method of CSRF_PROTECTED_METHODS) {
        const requestInit: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json'
          }
        };
        
        const protectedInit = await csrfProtection.protectRequest('/api/test', requestInit);
        
        // Headers should now be a plain object
        const headers = protectedInit.headers as Record<string, string>;
        
        // Check that token was added
        expect(headers[CSRF_HEADER_NAME]).toBe(mockToken);
        expect(headers['Content-Type']).toBe('application/json');
      }
    });
    
    it('should not add token to GET requests', async () => {
      const mockToken = 'test-token-123';
      
      // Use the test helper to directly set the token
      (csrfProtection as any)._setCurrentTokenForTests(mockToken);
      
      const requestInit: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const protectedInit = await csrfProtection.protectRequest('/api/test', requestInit);
      
      // For GET requests, we shouldn't modify the headers
      expect(protectedInit.method).toBe('GET');
      
      // The content-type should still be there
      const headers = protectedInit.headers as Record<string, string>;
      expect(headers['Content-Type']).toBe('application/json');
      
      // But no CSRF token should be added
      expect(headers[CSRF_HEADER_NAME]).toBeUndefined();
    });
    
    it('should handle missing requestInit', async () => {
      const mockToken = 'test-token-123';
      
      // Use the test helper to directly set the token
      (csrfProtection as any)._setCurrentTokenForTests(mockToken);
      
      // No request init provided (defaults to GET)
      const protectedInit = await csrfProtection.protectRequest('/api/test');
      
      // Should return an empty object (no headers needed for GET)
      expect(protectedInit).toEqual({});
    });
  });
  
  describe('Form Protection', () => {
    it('should add CSRF token to form data', async () => {
      const mockToken = 'test-token-123';
      
      // Use the test helper to directly set the token
      (csrfProtection as any)._setCurrentTokenForTests(mockToken);
      
      // Create form data
      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'test@example.com');
      
      // Protect the form data
      const protectedFormData = await csrfProtection.protectFormData(formData);
      
      // Verify original data is preserved
      expect(protectedFormData.get('name')).toBe('Test User');
      expect(protectedFormData.get('email')).toBe('test@example.com');
      
      // Verify CSRF token was added
      expect(protectedFormData.get(CSRF_HEADER_NAME)).toBe(mockToken);
    });
    
    it('should create HTML form field with CSRF token', async () => {
      const mockToken = 'test-token-123';
      
      // Use the test helper to directly set the token
      (csrfProtection as any)._setCurrentTokenForTests(mockToken);
      
      const formField = await csrfProtection.createCsrfFormField();
      
      // Should be an HTML input field with the token
      expect(formField).toBe(`<input type="hidden" name="${CSRF_HEADER_NAME}" value="${mockToken}">`);
    });
  });
  
  describe('Token Management', () => {
    it('should refresh CSRF token', async () => {
      // Setup test
      const oldToken = 'old-token-123';
      (csrfProtection as any)._setCurrentTokenForTests(oldToken);
      
      // Refresh token
      const newToken = await csrfProtection.refreshCsrfToken();
      
      // Should remove old token
      expect(secureStorage.removeItem).toHaveBeenCalledWith(
        CSRF_TOKEN_KEY,
        expect.objectContaining({
          namespace: AUTH_NAMESPACE,
          allMechanisms: true
        })
      );
      
      // Should generate and store new token
      expect(newToken).not.toBe(oldToken);
      expect(secureStorage.setItem).toHaveBeenCalledWith(
        CSRF_TOKEN_KEY,
        newToken,
        expect.anything()
      );
    });
    
    it('should clear all tokens', () => {
      // Setup test with a token
      const token = 'test-token-123';
      (csrfProtection as any)._setCurrentTokenForTests(token);
      
      const result = csrfProtection.clearTokens();
      
      // Should succeed
      expect(result).toBe(true);
      
      // Should remove token from storage
      expect(secureStorage.removeItem).toHaveBeenCalledWith(
        CSRF_TOKEN_KEY,
        expect.objectContaining({
          namespace: AUTH_NAMESPACE,
          allMechanisms: true
        })
      );
    });
  });
  
  describe('Error Handling', () => {
    it('should safely get token without throwing', async () => {
      // Make getItem throw an error
      (secureStorage.getItem as any).mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      // Should not throw
      const token = await csrfProtection.safeGetCsrfToken();
      
      // Should return null on error
      expect(token).toBeNull();
    });
    
    it('should handle validation failure with retry', async () => {
      // Set up for first failure and then success
      (secureStorage.removeItem as any).mockImplementation(() => {
        return true;
      });
      
      (secureStorage.setItem as any).mockImplementation(() => {
        return true;
      });
      
      // Should not throw on first attempt (retry count 0)
      await expect(csrfProtection.handleValidationFailure({
        url: '/api/test',
        method: 'POST',
        retryCount: 0
      })).resolves.not.toThrow();
      
      // Should refresh token
      expect(secureStorage.removeItem).toHaveBeenCalled();
      expect(secureStorage.setItem).toHaveBeenCalled();
      
      // Should throw on second attempt (retry already happened)
      await expect(csrfProtection.handleValidationFailure({
        url: '/api/test',
        method: 'POST',
        retryCount: 1
      })).rejects.toThrow('CSRF validation failed after retry');
    });
  });
});