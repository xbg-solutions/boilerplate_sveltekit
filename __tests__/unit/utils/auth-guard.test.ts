/**
 * src/lib/utils/auth-guard.test.ts
 * 
 * Tests for auth-guard.ts - focused on testing behavior, not implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AUTH_ROUTES } from '@xbg.solutions/frontend-core';

// Mock the dependencies that auth-guard uses, not auth-guard itself
vi.mock('$lib/services/auth', () => ({
  authService: {
    isAuthenticated: vi.fn(),
    getUserRoles: vi.fn(),
    userHasRole: vi.fn(),
    userHasAnyRole: vi.fn()
  }
}));

// Import the REAL auth-guard functions to test them
import { guardRoute, guardRouteServer, redirectToUnauthorized, redirectToSignIn } from '@xbg.solutions/utils-firebase-auth';
import { authService } from '@xbg.solutions/utils-firebase-auth';

describe('Auth Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('guardRoute', () => {
    it('should allow access when user is authenticated', () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      
      const result = guardRoute();
      
      expect(result.status).toBe('authorized');
      expect(result.redirect).toBeNull();
    });
    
    it('should redirect to sign in when user is not authenticated', () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false);
      
      const result = guardRoute();
      
      expect(result.status).toBe('unauthenticated');
      expect(result.redirect).toContain(AUTH_ROUTES.SIGN_IN);
    });
    
    it('should check for required roles', () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.userHasRole).mockReturnValue(false);
      
      const result = guardRoute({ requiredRoles: ['admin'] });
      
      expect(result.status).toBe('unauthorized');
      expect(result.redirect).toBe(AUTH_ROUTES.UNAUTHORIZED);
    });
    
    it('should allow access when user has required roles', () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      vi.mocked(authService.userHasRole).mockReturnValue(true);
      
      const result = guardRoute({ requiredRoles: ['admin'] });
      
      expect(result.status).toBe('authorized');
      expect(result.redirect).toBeNull();
    });
  });
});