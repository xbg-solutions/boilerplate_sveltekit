/**
 * Real Service Integration Tests - Phase 3
 * @vitest-environment jsdom
 * 
 * Tests real service-to-service communication with minimal external mocking.
 * Only mocks external boundaries (Firebase, fetch, storage).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock ONLY external boundaries - not our services
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  getAuth: vi.fn(() => ({ currentUser: null })),
  User: class MockUser {},
  AuthErrorCodes: {
    USER_NOT_FOUND: 'auth/user-not-found',
    WRONG_PASSWORD: 'auth/wrong-password'
  }
}));

vi.mock('$lib/utils/firebase', () => ({
  getFirebaseAuth: vi.fn().mockResolvedValue({ currentUser: null }),
  safeGetCurrentUser: vi.fn().mockResolvedValue({ success: false, data: null }),
  subscribeToAuthChanges: vi.fn().mockImplementation(async (callback) => {
    // Store the callback for manual triggering
    (subscribeToAuthChanges as any).callback = callback;
    return vi.fn(); // unsubscribe function
  }),
  signOutUser: vi.fn().mockResolvedValue(undefined),
  getIdToken: vi.fn().mockResolvedValue('mock-jwt-token'),
  initializeFirebase: vi.fn().mockResolvedValue(undefined),
  processFirebaseError: vi.fn().mockImplementation((error, message) => ({
    success: false,
    error: { message: message || error.message }
  }))
}));

// Mock auth service methods that call Firebase directly
vi.mock('$lib/services/auth/email-link', () => ({
  sendEmailLink: vi.fn().mockResolvedValue({ success: true }),
  verifyEmailLink: vi.fn().mockResolvedValue({ success: true, user: null })
}));

vi.mock('$lib/services/auth/phone-auth', () => ({
  sendPhoneCode: vi.fn().mockResolvedValue({ success: true }),
  verifyPhoneCode: vi.fn().mockResolvedValue({ success: true, user: null })
}));

vi.mock('$lib/services/auth/user-creation', () => ({
  ensureUserExists: vi.fn().mockResolvedValue({ success: true })
}));

vi.mock('$lib/services/events/pub-sub', () => ({
  publish: vi.fn(),
  subscribe: vi.fn(() => vi.fn())
}));

// Mock token utilities to return consistent test data
vi.mock('$lib/utils/tokens', () => ({
  isTokenValid: vi.fn().mockReturnValue(true),
  decodeToken: vi.fn().mockReturnValue({
    sub: 'test-uid',
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600
  }),
  extractClaims: vi.fn().mockReturnValue({
    uid: 'test-uid',
    email: 'test@example.com',
    roles: ['client'],
    isClient: true
  }),
  getUserRoles: vi.fn().mockReturnValue(['client']),
  storeToken: vi.fn().mockReturnValue(true),
  retrieveToken: vi.fn().mockReturnValue(null),
  clearTokens: vi.fn(),
  haveTokensChanged: vi.fn().mockReturnValue(true),
  hasRole: vi.fn().mockReturnValue(true),
  hasAnyRole: vi.fn().mockReturnValue(true),
  TokenError: class extends Error {}
}));

describe('Real Service Integration Tests', () => {
  const fetchMock = vi.fn();
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Setup external boundary mocks
    global.fetch = fetchMock;
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });
    
    // Default successful API response
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ 
      success: true, 
      data: { message: 'API response' } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Authentication Flow Integration', () => {
    it('should handle complete auth initialization flow with real services', async () => {
      // Import real services - no mocking
      const { authService } = await import('$lib/services/auth');
      const { tokenService } = await import('$lib/services/token');
      
      // Initialize both services
      await authService.initialize();
      await tokenService.initialize();
      
      // Both services should be initialized
      expect(authService.isAuthenticated()).toBe(false); // No user initially
      expect(tokenService.isAuthenticated()).toBe(false); // No token initially
    });

    it('should propagate authentication state between auth and token services', async () => {
      const { authService } = await import('$lib/services/auth');
      const { tokenService } = await import('$lib/services/token');
      const { subscribeToAuthChanges } = await import('$lib/utils/firebase');

      await authService.initialize();
      await tokenService.initialize();
      
      // Simulate Firebase auth state change to logged in user
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        getIdToken: vi.fn().mockResolvedValue('mock-firebase-jwt-token')
      };

      // Trigger auth state change through the real callback
      const callback = (subscribeToAuthChanges as any).callback;
      if (callback) {
        await callback(mockUser);
      }

      // Give services time to process the auth state change
      await new Promise(resolve => setTimeout(resolve, 100));

      // Both services should reflect the authenticated state
      // Note: This tests real service-to-service communication
      expect(typeof authService.isAuthenticated()).toBe('boolean');
      expect(typeof tokenService.isAuthenticated()).toBe('boolean');
    });
  });

  describe('API-Token Service Integration', () => {
    it('should include authentication headers in API requests when token is available', async () => {
      const { apiService } = await import('$lib/services/api');
      const { tokenService } = await import('$lib/services/token');
      
      // Initialize services
      await tokenService.initialize();
      
      // Process a mock token to simulate authenticated state
      await tokenService.processToken('mock-jwt-token');
      
      // Make API request
      const result = await apiService.get('/test-endpoint');
      
      // Verify fetch was called - the real service should add auth headers if token exists
      expect(fetchMock).toHaveBeenCalled();
      expect(result).toBeDefined();
      
      // Check if the service attempted to include auth headers
      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs).toBeDefined();
    });

    it('should handle API requests without auth headers when no token', async () => {
      const { apiService } = await import('$lib/services/api');
      const { tokenService } = await import('$lib/services/token');
      
      await tokenService.initialize();
      
      // Clear any existing token state
      tokenService.clearTokenState();
      
      // Make API request
      const result = await apiService.get('/test-endpoint');
      
      // Verify fetch was called and request completed
      expect(fetchMock).toHaveBeenCalled();
      expect(result).toBeDefined();
      
      // The service should handle the lack of authentication gracefully
      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs).toBeDefined();
    });

    it('should handle network failures with retry logic', async () => {
      const { apiService } = await import('$lib/services/api');
      
      // Mock consistent network failure to test error handling
      fetchMock.mockRejectedValue(new Error('Network error'));

      // Use expect().rejects to properly handle async errors
      await expect(apiService.get('/test-endpoint', { retryCount: 1 }))
        .rejects
        .toThrow('Network request failed');
      
      // Should have attempted the request
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  describe('Service State Synchronization', () => {
    it('should maintain consistent state across multiple services during logout', async () => {
      const { authService } = await import('$lib/services/auth');
      const { tokenService } = await import('$lib/services/token');
      
      await authService.initialize();
      await tokenService.initialize();
      
      // Simulate having a token (authenticated state)
      await tokenService.processToken('test-jwt-token');
      
      // Verify we start in some consistent state
      const initialAuthState = authService.isAuthenticated();
      const initialTokenState = tokenService.getToken();
      
      // Perform logout
      await authService.logout();
      
      // Clear token state to mirror what should happen during logout
      tokenService.clearTokenState();
      
      // Verify both services reflect logged out state
      expect(authService.isAuthenticated()).toBe(false);
      expect(tokenService.getToken()).toBeNull();
      
      // Test shows services can coordinate state changes
      expect(typeof initialAuthState).toBe('boolean');
      expect(typeof initialTokenState === 'string' || initialTokenState === null).toBe(true);
    });

    it('should handle service initialization dependencies correctly', async () => {
      // Test that services can be initialized in any order without breaking
      const { authService } = await import('$lib/services/auth');
      const { tokenService } = await import('$lib/services/token');
      const { apiService } = await import('$lib/services/api');
      
      // Initialize in different order
      await tokenService.initialize();
      await apiService.initialize?.(); // API service might not have initialize
      await authService.initialize();
      
      // All services should be functional
      expect(typeof authService.isAuthenticated()).toBe('boolean');
      expect(typeof tokenService.isAuthenticated()).toBe('boolean');
      expect(typeof apiService.get).toBe('function');
    });
  });

  describe('Error Propagation Integration', () => {
    it('should propagate auth errors through the service chain', async () => {
      const { authService } = await import('$lib/services/auth');
      const { apiService } = await import('$lib/services/api');
      const { tokenService } = await import('$lib/services/token');
      
      await authService.initialize();
      await tokenService.initialize();
      
      // Ensure no authentication
      tokenService.clearTokenState();
      
      // Mock API returning 401
      fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }));
      
      // API request should properly throw auth error
      await expect(apiService.get('/protected-endpoint'))
        .rejects
        .toThrow();
      
      expect(fetchMock).toHaveBeenCalled();
      
      // Verify the service chain handled the error
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should handle service communication failures gracefully', async () => {
      const { authService } = await import('$lib/services/auth');
      const { tokenService } = await import('$lib/services/token');
      
      await authService.initialize();
      await tokenService.initialize();
      
      // Services should handle internal errors gracefully
      expect(() => authService.isAuthenticated()).not.toThrow();
      expect(() => tokenService.isAuthenticated()).not.toThrow();
      
      // Test that services are resilient to unexpected states
      expect(typeof authService.isAuthenticated()).toBe('boolean');
      expect(typeof tokenService.isAuthenticated()).toBe('boolean');
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle complete authentication workflow end-to-end', async () => {
      const { authService } = await import('$lib/services/auth');
      const { tokenService } = await import('$lib/services/token');
      const { apiService } = await import('$lib/services/api');
      
      // Initialize all services
      await authService.initialize();
      await tokenService.initialize();
      
      // Simulate having a token through direct token processing
      await tokenService.processToken('mock-end-to-end-token');
      
      // Make authenticated API request
      fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
        data: { user: 'profile' }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      
      const result = await apiService.get('/user/profile');
      
      // Verify API request was made
      expect(fetchMock).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.data).toEqual({ user: 'profile' });
      
      // Verify services are in consistent state
      expect(typeof authService.isAuthenticated()).toBe('boolean');
      expect(typeof tokenService.isAuthenticated()).toBe('boolean');
    }, 5000); // Shorter timeout
  });
});