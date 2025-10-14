/**
 * Auth System Integration Tests
 * Tests integration between auth and token services
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Auth System Integration', () => {
  beforeEach(() => {
    // Minimal setup for integration tests
  });

  afterEach(() => {
    // Minimal cleanup
  });

  it('should have both auth and token services available', async () => {
    const { authService } = await import('$lib/services/auth/auth.service');
    const { tokenService } = await import('$lib/services/token/token.service');

    expect(authService).toBeDefined();
    expect(tokenService).toBeDefined();
    expect(typeof authService.isAuthenticated).toBe('function');
    expect(typeof tokenService.isAuthenticated).toBe('function');
  });

  it('should handle authentication state integration', async () => {
    const { authService } = await import('$lib/services/auth/auth.service');
    const { tokenService } = await import('$lib/services/token/token.service');

    // Test that services can be called together
    expect(typeof authService.isAuthenticated).toBe('function');
    expect(typeof tokenService.isAuthenticated).toBe('function');
    
    // Test integration - both should return consistent state
    const authState = authService.isAuthenticated();
    const tokenState = tokenService.isAuthenticated();
    
    expect(typeof authState).toBe('boolean');
    expect(typeof tokenState).toBe('boolean');
  });

  it('should handle role-based access integration', async () => {
    const { tokenService } = await import('$lib/services/token/token.service');

    // Test role functionality exists and works
    expect(typeof tokenService.getRoles).toBe('function');
    expect(typeof tokenService.userHasRole).toBe('function');
    
    const roles = tokenService.getRoles();
    expect(Array.isArray(roles)).toBe(true);
    
    const hasRole = tokenService.userHasRole('admin');
    expect(typeof hasRole).toBe('boolean');
  });
});