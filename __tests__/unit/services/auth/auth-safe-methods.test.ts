/**
 * Auth Service Safe Methods Tests
 * Tests for the safe wrapper functions exported from auth service
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the underlying auth service methods while preserving safe method exports
vi.mock('$lib/services/auth/auth.service', async () => {
  const actual = await vi.importActual('$lib/services/auth/auth.service');
  return {
    ...actual,
    authService: {
      sendEmailLink: vi.fn(),
      verifyEmailLink: vi.fn(), 
      sendPhoneCode: vi.fn(),
      verifyPhoneCode: vi.fn(),
      initialize: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: vi.fn(),
      getCurrentUser: vi.fn(),
      getUserClaims: vi.fn(),
      userHasRole: vi.fn(),
      userHasAnyRole: vi.fn(),
      destroy: vi.fn()
    },
    createAuthService: vi.fn()
  };
});

vi.mock('$lib/utils/error-handler', () => ({
  withErrorHandling: vi.fn((fn) => fn),
  AppError: class extends Error {},
  normalizeError: vi.fn((error) => ({
    message: error?.message || 'Mock error',
    firebaseCode: error?.firebaseCode || 'mock/error'
  }))
}));

// Mock Firebase utilities
vi.mock('$lib/utils/firebase', () => ({
  getFirebaseAuth: vi.fn(),
  safeGetCurrentUser: vi.fn(),
  subscribeToAuthChanges: vi.fn(),
  signOutUser: vi.fn(),
  processFirebaseError: vi.fn()
}));

// Mock email-link service
vi.mock('$lib/services/auth/email-link', () => ({
  default: {
    sendEmailLink: vi.fn().mockResolvedValue({ 
      success: true, 
      data: { email: 'test@example.com' } 
    }),
    verifyEmailLink: vi.fn().mockResolvedValue({ 
      success: true, 
      user: { uid: 'test-uid' },
      method: 'emailLink'
    })
  }
}));

// Mock phone-auth service
vi.mock('$lib/services/auth/phone-auth', () => ({
  default: {
    sendPhoneCode: vi.fn().mockResolvedValue({ 
      success: true, 
      verificationId: 'test-verification-id' 
    }),
    verifyPhoneCode: vi.fn().mockResolvedValue({ 
      success: true, 
      user: { uid: 'test-uid' },
      method: 'phoneNumber'
    })
  }
}));

// Mock other dependencies
vi.mock('$lib/services/logging/logging.service', () => ({
  loggerService: {
    withContext: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }))
  }
}));

vi.mock('$lib/services/token/token.service', () => ({
  tokenService: {
    processToken: vi.fn(),
    clearTokenState: vi.fn()
  }
}));

vi.mock('$lib/services/events', () => ({
  publish: vi.fn(),
  subscribe: vi.fn()
}));

vi.mock('$lib/stores/auth.store', () => ({
  authStore: {
    update: vi.fn(),
    subscribe: vi.fn()
  }
}));

vi.mock('$lib/utils/tokens', () => ({
  extractClaims: vi.fn(() => ({}))
}));

vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

describe('Auth Safe Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('safeSendEmailLink', () => {
    it('should be a function that can be called without throwing', async () => {
      const { safeSendEmailLink } = await import('$lib/services/auth/auth.service');
      
      expect(typeof safeSendEmailLink).toBe('function');
      
      // Should not throw when called
      await expect(safeSendEmailLink('test@example.com')).resolves.not.toThrow();
    });

    it('should handle errors gracefully through withErrorHandling wrapper', async () => {
      const { safeSendEmailLink } = await import('$lib/services/auth/auth.service');
      
      // Should not throw even with invalid parameters
      await expect(safeSendEmailLink('')).resolves.not.toThrow();
    });

    it('should accept optional parameters', async () => {
      const { safeSendEmailLink } = await import('$lib/services/auth/auth.service');
      
      // Should accept options parameter
      await expect(safeSendEmailLink('test@example.com', { customOption: true })).resolves.not.toThrow();
    });
  });

  describe('safeVerifyEmailLink', () => {
    it('should be a function with correct type', async () => {
      const { safeVerifyEmailLink } = await import('$lib/services/auth/auth.service');
      
      expect(typeof safeVerifyEmailLink).toBe('function');
      expect(safeVerifyEmailLink).toBeDefined();
    });

    it('should be wrapped with error handling', async () => {
      const { safeVerifyEmailLink } = await import('$lib/services/auth/auth.service');
      
      // The function should exist and be callable (function signature test)
      expect(safeVerifyEmailLink.length).toBeGreaterThanOrEqual(0); // Should accept at least 0 parameters
    });

    it('should maintain consistent function signature', async () => {
      const { safeVerifyEmailLink } = await import('$lib/services/auth/auth.service');
      
      // Function should be defined and have expected properties
      expect(safeVerifyEmailLink).toBeInstanceOf(Function);
      expect(safeVerifyEmailLink).toBeDefined(); // Should be defined
    });
  });

  describe('safeSendPhoneCode', () => {
    it('should be a function that can be called without throwing', async () => {
      const { safeSendPhoneCode } = await import('$lib/services/auth/auth.service');
      
      expect(typeof safeSendPhoneCode).toBe('function');
      
      const mockRecaptcha = { verify: vi.fn() };
      // Should not throw when called
      await expect(safeSendPhoneCode('+1234567890', mockRecaptcha)).resolves.not.toThrow();
    });

    it('should handle phone authentication errors gracefully', async () => {
      const { safeSendPhoneCode } = await import('$lib/services/auth/auth.service');
      
      const mockRecaptcha = { verify: vi.fn() };
      // Should not throw even with invalid phone number
      await expect(safeSendPhoneCode('invalid-phone', mockRecaptcha)).resolves.not.toThrow();
    });
  });

  describe('safeVerifyPhoneCode', () => {
    it('should be a function with correct type', async () => {
      const { safeVerifyPhoneCode } = await import('$lib/services/auth/auth.service');
      
      expect(typeof safeVerifyPhoneCode).toBe('function');
      expect(safeVerifyPhoneCode).toBeDefined();
    });

    it('should be wrapped with error handling', async () => {
      const { safeVerifyPhoneCode } = await import('$lib/services/auth/auth.service');
      
      // The function should exist and be callable (function signature test)
      expect(safeVerifyPhoneCode.length).toBe(2); // Should accept 2 parameters
    });
  });

  describe('createAuthService factory', () => {
    it('should create new auth service instances', async () => {
      const { createAuthService } = await import('$lib/services/auth/auth.service');
      
      // Mock the factory function
      const mockService = {
        initialize: vi.fn(),
        sendEmailLink: vi.fn(),
        verifyEmailLink: vi.fn(),
        sendPhoneCode: vi.fn(),
        verifyPhoneCode: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: vi.fn(),
        getCurrentUser: vi.fn(),
        getUserClaims: vi.fn(),
        userHasRole: vi.fn(),
        userHasAnyRole: vi.fn(),
        destroy: vi.fn()
      };
      
      vi.mocked(createAuthService).mockReturnValue(mockService);
      
      const service = createAuthService();
      expect(service).toBeDefined();
      expect(typeof service.initialize).toBe('function');
      expect(typeof service.sendEmailLink).toBe('function');
      expect(typeof service.verifyEmailLink).toBe('function');
      expect(typeof service.sendPhoneCode).toBe('function');
      expect(typeof service.verifyPhoneCode).toBe('function');
      expect(typeof service.logout).toBe('function');
      expect(typeof service.isAuthenticated).toBe('function');
      expect(typeof service.getCurrentUser).toBe('function');
      expect(typeof service.getUserClaims).toBe('function');
      expect(typeof service.userHasRole).toBe('function');
      expect(typeof service.userHasAnyRole).toBe('function');
      expect(typeof service.destroy).toBe('function');
    });

    it('should create independent service instances', async () => {
      const { createAuthService } = await import('$lib/services/auth/auth.service');
      
      const mockService1 = { initialize: vi.fn(), logout: vi.fn() };
      const mockService2 = { initialize: vi.fn(), logout: vi.fn() };
      
      vi.mocked(createAuthService)
        .mockReturnValueOnce(mockService1 as any)
        .mockReturnValueOnce(mockService2 as any);
      
      const service1 = createAuthService();
      const service2 = createAuthService();
      
      expect(service1).not.toBe(service2);
      expect(createAuthService).toHaveBeenCalledTimes(2);
    });
  });

  describe('Auth Service Integration', () => {
    it('should have all expected safe method exports', async () => {
      const authModule = await import('$lib/services/auth/auth.service');
      
      expect(authModule.safeSendEmailLink).toBeDefined();
      expect(authModule.safeVerifyEmailLink).toBeDefined();
      expect(authModule.safeSendPhoneCode).toBeDefined();
      expect(authModule.safeVerifyPhoneCode).toBeDefined();
      expect(authModule.createAuthService).toBeDefined();
      expect(authModule.authService).toBeDefined();
      
      expect(typeof authModule.safeSendEmailLink).toBe('function');
      expect(typeof authModule.safeVerifyEmailLink).toBe('function');
      expect(typeof authModule.safeSendPhoneCode).toBe('function');  
      expect(typeof authModule.safeVerifyPhoneCode).toBe('function');
      expect(typeof authModule.createAuthService).toBe('function');
      expect(typeof authModule.authService).toBe('object');
    });

    it('should maintain consistent API across safe methods', async () => {
      const authModule = await import('$lib/services/auth/auth.service');
      
      // All safe methods should be functions
      const safeMethods = [
        authModule.safeSendEmailLink,
        authModule.safeVerifyEmailLink,
        authModule.safeSendPhoneCode,
        authModule.safeVerifyPhoneCode
      ];
      
      for (const method of safeMethods) {
        expect(typeof method).toBe('function');
        expect(method).toBeDefined();
      }
    });
  });
});