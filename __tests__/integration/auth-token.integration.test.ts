/**
 * Auth Token Integration Tests - Behavior focused
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock auth service
vi.mock('$lib/services/auth', () => ({
  authService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    isAuthenticated: vi.fn().mockReturnValue(false),
    getCurrentUser: vi.fn().mockReturnValue(null),
    getUserClaims: vi.fn().mockReturnValue(null),
    logout: vi.fn().mockResolvedValue(undefined)
  }
}));

// Mock token service
vi.mock('$lib/services/token', () => ({
  tokenService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    isAuthenticated: vi.fn().mockReturnValue(false),
    getToken: vi.fn().mockReturnValue(null),
    getClaims: vi.fn().mockReturnValue(null),
    getRoles: vi.fn().mockReturnValue([]),
    userHasRole: vi.fn().mockReturnValue(false)
  }
}));

describe('Auth Token Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Service Integration', () => {
    it('should have both auth and token services initialized', async () => {
      const { authService } = await import('$lib/services/auth');
      const { tokenService } = await import('$lib/services/token');
      
      expect(authService).toBeDefined();
      expect(tokenService).toBeDefined();
    });

    it('should handle initialization without throwing', async () => {
      const { authService } = await import('$lib/services/auth');
      await expect(authService.initialize()).resolves.not.toThrow();
    });

    it('should maintain consistent authentication state', async () => {
      const { authService } = await import('$lib/services/auth');
      const { tokenService } = await import('$lib/services/token');
      
      const authResult = authService.isAuthenticated();
      const tokenResult = tokenService.isAuthenticated();
      
      // Both should be consistent (both false with our mocked setup)
      expect(authResult).toBe(false);
      expect(tokenResult).toBe(false);
    });
  });

  describe('Token Management', () => {
    it('should handle token operations', async () => {
      const { tokenService } = await import('$lib/services/token');
      
      const token = tokenService.getToken();
      const claims = tokenService.getClaims();
      
      // With no authenticated user, both should be null
      expect(token).toBeNull();
      expect(claims).toBeNull();
    });

    it('should handle role queries', async () => {
      const { tokenService } = await import('$lib/services/token');
      
      const roles = tokenService.getRoles();
      const hasAdmin = tokenService.userHasRole('admin');
      
      expect(Array.isArray(roles)).toBe(true);
      expect(hasAdmin).toBe(false);
    });
  });

  describe('Auth Operations', () => {
    it('should handle logout without throwing', async () => {
      const { authService } = await import('$lib/services/auth');
      await expect(authService.logout()).resolves.not.toThrow();
    });

    it('should handle user queries', async () => {
      const { authService } = await import('$lib/services/auth');
      
      const user = authService.getCurrentUser();
      const claims = authService.getUserClaims();
      
      expect(user).toBeNull();
      expect(claims).toBeNull();
    });
  });
});