/**
 * Route Handler Tests - Behavior focused
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { routeHandler } from '../../../src/lib/utils/route-handler';

// Mock dependencies
vi.mock('../../../src/lib/services/logging/logging.service', () => ({
  loggerService: {
    withContext: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  }
}));

vi.mock('../../../src/lib/services/events', () => ({
  publish: vi.fn()
}));

vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

describe('Route Handler Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Protection Detection', () => {
    it('should identify protected routes correctly', () => {
      expect(routeHandler.isProtectedRoute('/protected')).toBe(true);
      expect(routeHandler.isProtectedRoute('/protected/')).toBe(true);
      expect(routeHandler.isProtectedRoute('/protected/dashboard')).toBe(true);
      expect(routeHandler.isProtectedRoute('/protected/admin/users')).toBe(true);
    });

    it('should identify unprotected routes correctly', () => {
      expect(routeHandler.isProtectedRoute('/')).toBe(false);
      expect(routeHandler.isProtectedRoute('/public')).toBe(false);
      expect(routeHandler.isProtectedRoute('/login')).toBe(false);
      expect(routeHandler.isProtectedRoute('/about')).toBe(false);
      expect(routeHandler.isProtectedRoute('/protectedx')).toBe(false); // Not exact match
    });
  });

  describe('Redirect Handling', () => {
    it('should create login redirect with return URL', () => {
      const result = routeHandler.redirectToLogin('/dashboard');
      
      expect(result.status).toBe(302);
      expect(result.redirect).toContain('/'); // Login route is '/' according to auth constants
      expect(result.redirect).toContain('returnUrl=%2Fdashboard');
    });

    it('should handle unauthorized redirects', () => {
      const result = routeHandler.redirectToUnauthorized();
      
      expect(result.status).toBe(403);
      expect(result.redirect).toMatch(/unauthorized|forbidden/i);
    });

    it('should use custom unauthorized route when provided', () => {
      const customRoute = '/custom-unauthorized';
      const result = routeHandler.redirectToUnauthorized(customRoute);
      
      expect(result.status).toBe(403);
      expect(result.redirect).toBe(customRoute);
    });
  });

  describe('Claims Checking', () => {
    const mockUserClaims = {
      roles: ['user', 'editor'],
      admin: true,
      beta_user: true
    };

    it('should handle "all" operator - user must have all claims', () => {
      expect(routeHandler.checkUserClaims(mockUserClaims, 'all', ['user', 'editor'])).toBe(true);
      expect(routeHandler.checkUserClaims(mockUserClaims, 'all', ['user', 'admin'])).toBe(true);
      expect(routeHandler.checkUserClaims(mockUserClaims, 'all', ['user', 'superadmin'])).toBe(false);
    });

    it('should handle "any" operator - user needs at least one claim', () => {
      expect(routeHandler.checkUserClaims(mockUserClaims, 'any', ['user', 'superadmin'])).toBe(true);
      expect(routeHandler.checkUserClaims(mockUserClaims, 'any', ['admin'])).toBe(true);
      expect(routeHandler.checkUserClaims(mockUserClaims, 'any', ['superadmin', 'owner'])).toBe(false);
    });

    it('should handle "not" operator - user must not have any claims', () => {
      expect(routeHandler.checkUserClaims(mockUserClaims, 'not', ['superadmin', 'owner'])).toBe(true);
      expect(routeHandler.checkUserClaims(mockUserClaims, 'not', ['user'])).toBe(false);
      expect(routeHandler.checkUserClaims(mockUserClaims, 'not', ['admin'])).toBe(false);
    });

    it('should handle null user claims', () => {
      expect(routeHandler.checkUserClaims(null, 'all', ['user'])).toBe(false);
      expect(routeHandler.checkUserClaims(null, 'any', ['user'])).toBe(false);
      // Function returns false early for null userClaims regardless of operator
      expect(routeHandler.checkUserClaims(null, 'not', ['user'])).toBe(false);
    });

    it('should handle empty required claims', () => {
      expect(routeHandler.checkUserClaims(mockUserClaims, 'all', [])).toBe(true);
      expect(routeHandler.checkUserClaims(null, 'all', [])).toBe(true);
    });
  });

  describe('Access Verification', () => {
    const mockUrl = new URL('https://example.com/protected/dashboard');
    const mockPublicUrl = new URL('https://example.com/public');

    it('should allow access to public routes', () => {
      const result = routeHandler.verifyAccess(mockPublicUrl, false, null);
      
      expect(result.hasAccess).toBe(true);
      expect(result.redirect).toBeUndefined();
    });

    it('should deny access to protected routes for unauthenticated users', () => {
      const result = routeHandler.verifyAccess(mockUrl, false, null);
      
      expect(result.hasAccess).toBe(false);
      expect(result.redirect).toBeDefined();
      expect(result.redirect?.status).toBe(302);
    });

    it('should allow access to protected routes for authenticated users without claim requirements', () => {
      const result = routeHandler.verifyAccess(mockUrl, true, { roles: ['user'] });
      
      expect(result.hasAccess).toBe(true);
      expect(result.redirect).toBeUndefined();
    });

    it('should check claims when route config is provided', () => {
      const routeConfig = {
        claims: { operator: 'any' as const, claims: ['admin'] }
      };

      // User with admin role should have access
      const adminResult = routeHandler.verifyAccess(
        mockUrl, 
        true, 
        { roles: ['admin'] }, 
        routeConfig
      );
      expect(adminResult.hasAccess).toBe(true);

      // User without admin role should be denied
      const userResult = routeHandler.verifyAccess(
        mockUrl, 
        true, 
        { roles: ['user'] }, 
        routeConfig
      );
      expect(userResult.hasAccess).toBe(false);
      expect(userResult.redirect?.status).toBe(403);
    });
  });

  describe('Return URL Handling', () => {
    it('should extract valid return URL from search params', () => {
      const url = new URL('https://example.com/login?returnUrl=%2Fdashboard');
      const returnUrl = routeHandler.getReturnUrl(url);
      
      expect(returnUrl).toBe('/dashboard');
    });

    it('should reject external return URLs for security', () => {
      const url = new URL('https://example.com/login?returnUrl=https://evil.com');
      const returnUrl = routeHandler.getReturnUrl(url);
      
      expect(returnUrl).not.toBe('https://evil.com');
      expect(returnUrl.startsWith('/')).toBe(true);
    });

    it('should provide default return URL when none specified', () => {
      const url = new URL('https://example.com/login');
      const returnUrl = routeHandler.getReturnUrl(url);
      
      expect(returnUrl).toBeTruthy();
      expect(returnUrl.startsWith('/')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should normalize and handle route errors', () => {
      const error = new Error('Test route error');
      const result = routeHandler.handleRouteError(error);
      
      expect(result.message).toBeTruthy();
      expect(result.status).toBe(500);
    });

    it('should handle unknown error types', () => {
      const result = routeHandler.handleRouteError('String error');
      
      expect(result.message).toBeTruthy();
      expect(result.status).toBe(500);
    });
  });
});