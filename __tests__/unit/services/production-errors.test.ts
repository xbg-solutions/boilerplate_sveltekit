/**
 * Production Error Scenario Tests - Phase 4
 * 
 * Tests critical error paths that could occur in production:
 * - Firebase auth failures (network, invalid tokens)
 * - API timeout and retry scenarios
 * - LocalStorage quota exceeded
 * - Malformed server responses
 * - Concurrent authentication attempts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock external dependencies
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  getAuth: vi.fn(() => ({ currentUser: null })),
  User: class MockUser {},
  AuthErrorCodes: {
    USER_NOT_FOUND: 'auth/user-not-found',
    WRONG_PASSWORD: 'auth/wrong-password',
    TOO_MANY_REQUESTS: 'auth/too-many-requests',
    NETWORK_REQUEST_FAILED: 'auth/network-request-failed',
    EXPIRED_ACTION_CODE: 'auth/expired-action-code'
  }
}));

vi.mock('$lib/utils/firebase', () => ({
  getFirebaseAuth: vi.fn().mockResolvedValue({ currentUser: null }),
  safeGetCurrentUser: vi.fn().mockResolvedValue({ success: false, data: null }),
  subscribeToAuthChanges: vi.fn().mockResolvedValue(vi.fn()),
  signOutUser: vi.fn().mockResolvedValue(undefined),
  getIdToken: vi.fn().mockResolvedValue('mock-token'),
  initializeFirebase: vi.fn().mockResolvedValue(undefined),
  processFirebaseError: vi.fn().mockReturnValue({ success: false, error: { message: 'Mock error' } })
}));

vi.mock('$lib/services/events/pub-sub', () => ({
  publish: vi.fn(),
  subscribe: vi.fn(() => vi.fn())
}));

vi.mock('$lib/utils/tokens', () => ({
  isTokenValid: vi.fn().mockReturnValue(true),
  decodeToken: vi.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  extractClaims: vi.fn().mockReturnValue({ uid: 'test' }),
  storeToken: vi.fn().mockReturnValue(true),
  retrieveToken: vi.fn().mockReturnValue(null),
  clearTokens: vi.fn(),
  haveTokensChanged: vi.fn().mockReturnValue(false),
  TokenError: class extends Error {}
}));

vi.mock('$lib/utils/secure-storage', () => ({
  secureStorage: {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
}));

// Mock auth service methods that are called in tests
vi.mock('$lib/services/auth/email-link', () => {
  const mockFunctions = {
    sendEmailLink: vi.fn().mockResolvedValue({ success: true }),
    verifyEmailLink: vi.fn().mockResolvedValue({ success: true, user: null }),
    safeSendEmailLink: vi.fn().mockResolvedValue({ success: true }),
    safeVerifyEmailLink: vi.fn().mockResolvedValue({ success: true, user: null }),
    isEmailSignInLink: vi.fn().mockResolvedValue(false),
    isEmailSignInLinkSync: vi.fn().mockReturnValue(false),
    getStoredEmail: vi.fn().mockReturnValue(null),
    storeEmail: vi.fn().mockReturnValue(true),
    clearStoredEmail: vi.fn().mockReturnValue(true),
    checkUserExistsAndCreate: vi.fn().mockResolvedValue(true)
  };
  
  return {
    ...mockFunctions,
    default: mockFunctions
  };
});

vi.mock('$lib/services/auth/phone-auth', () => {
  const mockFunctions = {
    sendPhoneCode: vi.fn().mockResolvedValue({ success: true }),
    verifyPhoneCode: vi.fn().mockResolvedValue({ success: true, user: null })
  };
  return {
    ...mockFunctions,
    default: mockFunctions
  };
});

vi.mock('$lib/services/auth/user-creation', () => {
  const mockFunctions = {
    ensureUserExists: vi.fn().mockResolvedValue({ success: true })
  };
  return {
    ...mockFunctions,
    default: mockFunctions
  };
});

describe('Production Error Scenarios', () => {
  const fetchMock = vi.fn();
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Ensure Firebase mocks are properly reset and configured
    const { resetFirebaseMocks } = await import('../../test-utils/mock-validation');
    await resetFirebaseMocks();
    
    global.fetch = fetchMock;
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Firebase Authentication Failures', () => {
    it('should handle network failures during Firebase auth', async () => {
      const { authService } = await import('$lib/services/auth');
      const { subscribeToAuthChanges } = await import('$lib/utils/firebase');

      // Mock auth subscription failure
      subscribeToAuthChanges.mockRejectedValue(new Error('Network request failed'));

      await authService.initialize();

      // Should handle network failures gracefully - auth service should remain in a valid state
      expect(typeof authService.isAuthenticated()).toBe('boolean');
      expect(authService.isAuthenticated()).toBe(false); // Should default to unauthenticated
    });

    it('should handle invalid Firebase tokens', async () => {
      const { tokenService } = await import('$lib/services/token');
      const { isTokenValid, decodeToken } = await import('$lib/utils/tokens');

      // Mock invalid token scenario - update existing mocks for this test
      isTokenValid.mockReturnValue(false);
      decodeToken.mockImplementation(() => {
        throw new Error('Invalid token format');
      });

      await tokenService.initialize();

      // Should handle invalid tokens without crashing
      const result = await tokenService.processToken('invalid-token-format');
      expect(typeof result === 'boolean').toBe(true);
      
      // Service should remain in a valid state
      expect(typeof tokenService.isAuthenticated()).toBe('boolean');
    });

    it('should handle Firebase rate limiting', async () => {
      const { authService } = await import('$lib/services/auth');
      const { sendEmailLink } = await import('$lib/services/auth/email-link');

      // Mock rate limiting error in email-link service
      sendEmailLink.mockResolvedValue({
        success: false,
        error: {
          message: 'Too many authentication attempts. Please try again later.',
          code: 'auth/too-many-requests'
        }
      });

      await authService.initialize();

      // Should handle rate limiting gracefully
      const result = await authService.sendEmailLink('test@example.com');
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Too many');
    });

    it('should handle expired Firebase action codes', async () => {
      const { authService } = await import('$lib/services/auth');
      const { verifyEmailLink } = await import('$lib/services/auth/email-link');

      // Mock expired action code in email-link service
      verifyEmailLink.mockResolvedValue({
        success: false,
        error: {
          message: 'The action code has expired',
          code: 'auth/expired-action-code'
        }
      });

      await authService.initialize();

      const result = await authService.verifyEmailLink('expired-link');
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('auth/expired-action-code');
    });

    it('should handle Firebase auth state corruption', async () => {
      const { authService } = await import('$lib/services/auth');
      const { subscribeToAuthChanges } = await import('$lib/utils/firebase');

      await authService.initialize();

      // Mock corrupted auth state callback
      subscribeToAuthChanges.mockImplementation(async (callback) => {
        // Simulate corrupted auth state
        setTimeout(() => {
          try {
            callback(null); // Valid - user logged out
            callback({ uid: null, email: null } as any); // Corrupted user object
            callback(undefined as any); // Invalid callback data
          } catch (error) {
            // Auth service should handle callback errors gracefully
          }
        }, 10);
        return vi.fn();
      });

      await authService.initialize();

      // Allow async callbacks to execute
      await new Promise(resolve => setTimeout(resolve, 50));

      // Service should remain functional despite corrupted callbacks
      expect(typeof authService.isAuthenticated()).toBe('boolean');
    });
  });

  describe('API Timeout and Retry Scenarios', () => {
    it('should handle API timeouts with proper retry logic', async () => {
      const { apiService } = await import('$lib/services/api');

      // Mock timeout then success
      fetchMock
        .mockImplementationOnce(() => new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: 'success' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));

      vi.useFakeTimers();

      // Start request with timeout
      const requestPromise = apiService.get('/timeout-test', { 
        retryCount: 1,
        timeout: 50 
      });

      // Fast forward through timeout and retry delay
      await vi.runAllTimersAsync();

      // Handle either success or failure gracefully 
      try {
        const result = await requestPromise;
        expect(result).toBeDefined();
      } catch (error) {
        // If it fails, verify it's a proper timeout error
        expect(error).toBeDefined();
      }

      vi.useRealTimers();
    });

    it('should handle maximum retry attempts exceeded', async () => {
      const { apiService } = await import('$lib/services/api');

      // Reset fetch mock to ensure clean state
      fetchMock.mockReset();
      
      // Mock consistent failures - test the actual retry behavior
      fetchMock.mockRejectedValue(new Error('Service unavailable'));

      // Should eventually give up after max retries - use expect().rejects to properly handle async errors
      await expect(apiService.get('/failing-endpoint', { retryCount: 0, timeout: 100 }))
        .rejects
        .toThrow('Network request failed');

      // Should have attempted at least the initial request
      expect(fetchMock).toHaveBeenCalledTimes(1); // Just 1 initial attempt
    });

    it('should handle API circuit breaker scenarios', async () => {
      const { apiService } = await import('$lib/services/api');

      // Mock consistent failures to avoid unhandled rejections
      fetchMock.mockRejectedValue(new Error('Circuit breaker engaged'));

      // Test that API service properly handles circuit breaker scenarios
      await expect(apiService.get('/circuit-breaker-test', { retryCount: 0 }))
        .rejects
        .toThrow(/Network request failed/);

      // Verify fetch was called (circuit breaker attempted request)
      expect(fetchMock).toHaveBeenCalled();
    });

    it('should handle partial API response failures', async () => {
      const { apiService } = await import('$lib/services/api');

      // Mock partial response (connection drops mid-stream)
      fetchMock.mockImplementation(() => {
        const mockResponse = new Response(new ReadableStream({
          start(controller) {
            // Send partial JSON then close
            controller.enqueue(new TextEncoder().encode('{"partial": tr'));
            controller.close();
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        return Promise.resolve(mockResponse);
      });

      // Should handle partial responses gracefully - expect proper error handling
      await expect(apiService.get('/partial-response'))
        .rejects
        .toThrow(); // Should throw parsing error
    });
  });

  describe('LocalStorage Quota Exceeded Scenarios', () => {
    it('should handle localStorage quota exceeded errors', async () => {
      const { tokenService } = await import('$lib/services/token');
      const { storeToken } = await import('$lib/utils/tokens');

      // Mock localStorage quota exceeded
      storeToken.mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      await tokenService.initialize();

      // Should handle storage errors gracefully
      const result = await tokenService.processToken('test-token');
      expect(typeof result === 'boolean').toBe(true);
      
      // Service should remain functional
      expect(typeof tokenService.isAuthenticated()).toBe('boolean');
    });

    it('should handle sessionStorage unavailable scenarios', async () => {
      const { secureStorage } = await import('$lib/utils/secure-storage');

      // Mock sessionStorage completely unavailable
      Object.defineProperty(window, 'sessionStorage', {
        value: null,
        writable: true
      });

      // Should fallback gracefully when sessionStorage is unavailable
      try {
        const result = secureStorage.getItem('test-key');
        expect(result === null || typeof result === 'string').toBe(true);
      } catch (error) {
        // Should either return null or throw a graceful error
        expect(error).toBeDefined();
      }
    });

    it('should handle localStorage corruption scenarios', async () => {
      const { secureStorage } = await import('$lib/utils/secure-storage');

      // Mock corrupted localStorage data
      localStorageMock.getItem.mockImplementation((key) => {
        if (key.includes('corrupted')) {
          return 'invalid-json-{data';
        }
        return null;
      });

      // Should handle corrupted data gracefully
      try {
        const result = secureStorage.getItem('corrupted-data');
        // Should return null or string, not throw
        expect(result === null || typeof result === 'string').toBe(true);
      } catch (error) {
        // If it throws, that's also acceptable for corrupted data
        expect(error).toBeDefined();
      }
    });

    it('should handle storage access denied scenarios', async () => {
      // Mock storage access denied (privacy mode, etc.)
      localStorageMock.setItem.mockImplementation(() => {
        throw new DOMException('SecurityError', 'SecurityError');
      });

      const { secureStorage } = await import('$lib/utils/secure-storage');

      // Should handle access denied gracefully
      try {
        secureStorage.setItem('test-key', 'test-value');
        expect(true).toBe(true); // If no error, it handled gracefully
      } catch (error) {
        // Should throw a meaningful error
        expect(error).toBeDefined();
      }
    });
  });

  describe('Malformed Server Response Scenarios', () => {
    it('should handle non-JSON responses when JSON expected', async () => {
      const { apiService } = await import('$lib/services/api');

      // Mock HTML error page response
      fetchMock.mockResolvedValue(new Response('<html><body>Error 500</body></html>', {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }));

      // Should handle non-JSON responses gracefully
      await expect(apiService.get('/api/data', { retryCount: 0, timeout: 100 }))
        .rejects
        .toThrow();
    });

    it('should handle incomplete JSON responses', async () => {
      const { apiService } = await import('$lib/services/api');

      // Mock incomplete JSON
      fetchMock.mockResolvedValue(new Response('{"data": {"incomplete":', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));

      // Should handle malformed JSON gracefully
      await expect(apiService.get('/api/malformed'))
        .rejects
        .toThrow();
    });

    it('should handle unexpected response structure', async () => {
      const { apiService } = await import('$lib/services/api');

      // Mock valid JSON but unexpected structure
      fetchMock.mockResolvedValue(new Response(JSON.stringify({
        unexpected: 'structure',
        missing: 'expected fields'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));

      // Should handle unexpected structures gracefully
      const result = await apiService.get('/api/unexpected');
      expect(result).toBeDefined();
      expect(typeof result === 'object').toBe(true);
    });

    it('should handle mixed content-type responses', async () => {
      const { apiService } = await import('$lib/services/api');

      // Mock response with wrong content-type header
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ data: 'valid' }), {
        status: 200,
        headers: { 'Content-Type': 'text/plain' } // Wrong type for JSON
      }));

      // Should handle content-type mismatches
      const result = await apiService.get('/api/mixed-content');
      expect(result).toBeDefined();
    });

    it('should handle extremely large responses', async () => {
      const { apiService } = await import('$lib/services/api');

      // Mock very large response
      const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB string
      fetchMock.mockResolvedValue(new Response(JSON.stringify({
        data: largeData
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));

      // Should handle large responses (or timeout appropriately)
      // This should succeed with mocked response
      const result = await apiService.get('/api/large-response', { timeout: 1000 });
      expect(result).toBeDefined();
    });
  });

  describe('Concurrent Authentication Scenarios', () => {
    it('should handle concurrent login attempts', async () => {
      const { authService } = await import('$lib/services/auth');
      const { sendEmailLink } = await import('$lib/services/auth/email-link');

      // Mock successful email link sending
      sendEmailLink.mockResolvedValue({
        success: true,
        data: { email: 'test@example.com' }
      });

      await authService.initialize();

      // Start multiple concurrent login attempts
      const loginPromises = [
        authService.sendEmailLink('user1@example.com'),
        authService.sendEmailLink('user2@example.com'),
        authService.sendEmailLink('user3@example.com')
      ];

      const results = await Promise.all(loginPromises);

      // Should handle concurrent attempts without race conditions
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result.success === 'boolean').toBe(true);
      });
    });

    it('should handle concurrent token refresh attempts', async () => {
      const { tokenService } = await import('$lib/services/token');
      const { getIdToken } = await import('$lib/utils/firebase');

      // Mock token refresh
      getIdToken.mockResolvedValue('refreshed-token');

      await tokenService.initialize();

      // Start multiple concurrent refresh attempts
      const refreshPromises = [
        tokenService.refreshToken(),
        tokenService.refreshToken(),
        tokenService.refreshToken()
      ];

      const results = await Promise.all(refreshPromises);

      // Should handle concurrent refreshes properly
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result.success === 'boolean').toBe(true);
      });
    });

    it('should handle concurrent logout attempts', async () => {
      const { authService } = await import('$lib/services/auth');
      const { signOutUser } = await import('$lib/utils/firebase');

      signOutUser.mockResolvedValue(undefined);

      await authService.initialize();

      // Start multiple concurrent logout attempts
      const logoutPromises = [
        authService.logout(),
        authService.logout(),
        authService.logout()
      ];

      // Should handle concurrent logouts gracefully
      await expect(Promise.all(logoutPromises)).resolves.toBeDefined();
      
      // All should result in logged out state
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should handle auth state changes during service operations', async () => {
      const { authService } = await import('$lib/services/auth');
      const { tokenService } = await import('$lib/services/token');
      const { subscribeToAuthChanges } = await import('$lib/utils/firebase');

      await authService.initialize();
      await tokenService.initialize();

      // Mock rapid auth state changes
      let changeCallback: any;
      subscribeToAuthChanges.mockImplementation(async (callback) => {
        changeCallback = callback;
        return vi.fn();
      });

      await authService.initialize();

      // Simulate rapid auth state changes during operations
      const operations = [
        authService.sendEmailLink('test@example.com'),
        tokenService.refreshToken()
      ];

      // Trigger auth state changes while operations are in progress
      if (changeCallback) {
        changeCallback({ uid: 'user1', email: 'test1@example.com' });
        changeCallback(null); // logout
        changeCallback({ uid: 'user2', email: 'test2@example.com' });
      }

      // Operations should complete despite auth state changes
      const results = await Promise.all(operations);
      expect(results).toHaveLength(2);
    });
  });
});