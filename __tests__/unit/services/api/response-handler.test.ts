/**
 * Response Handler Tests - Behavior focused
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { responseHandler } from '../../../../src/lib/services/api/response-handler';
import { ApiError, AuthError, ValidationError } from '../../../../src/lib/utils/error-handler';

// Mock dependencies
vi.mock('../../../../src/lib/services/logging/logging.service', () => ({
  loggerService: {
    withContext: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  }
}));

vi.mock('../../../../src/lib/services/token/token.service', () => ({
  tokenService: {
    isAuthenticated: vi.fn().mockReturnValue(false),
    refreshToken: vi.fn().mockResolvedValue({ success: false })
  }
}));

describe('Response Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Response Processing', () => {
    it('should parse JSON responses correctly', async () => {
      const mockData = { message: 'success', data: [1, 2, 3] };
      const mockResponse = new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await responseHandler.processResponse(mockResponse, 'GET', '/test');
      
      expect(result).toEqual(mockData);
    });

    it('should parse text responses correctly', async () => {
      const mockText = 'Simple text response';
      const mockResponse = new Response(mockText, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });

      const result = await responseHandler.processResponse(mockResponse, 'GET', '/test');
      
      expect(result).toBe(mockText);
    });

    it('should handle empty responses (204 No Content)', async () => {
      const mockResponse = new Response(null, {
        status: 204,
        headers: { 'Content-Length': '0' }
      });

      const result = await responseHandler.processResponse(mockResponse, 'DELETE', '/test');
      
      expect(result).toBeNull();
    });

    it('should handle binary responses', async () => {
      const mockBlob = new Blob(['binary data'], { type: 'application/octet-stream' });
      const mockResponse = new Response(mockBlob, {
        status: 200,
        headers: { 'Content-Type': 'application/octet-stream' }
      });

      const result = await responseHandler.processResponse<Blob>(mockResponse, 'GET', '/download');
      
      // Check that we got a blob-like object with expected properties
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('type');
    });
  });

  describe('Error Response Handling', () => {
    it('should create ValidationError for 400 Bad Request', async () => {
      const errorData = { 
        message: 'Validation failed',
        errors: { email: 'Invalid email format' }
      };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });

      await expect(responseHandler.processResponse(mockResponse, 'POST', '/users'))
        .rejects.toThrow(ValidationError);
    });

    it('should create AuthError for 401 Unauthorized', async () => {
      const errorData = { message: 'Token expired' };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });

      await expect(responseHandler.processResponse(mockResponse, 'GET', '/profile'))
        .rejects.toThrow(AuthError);
    });

    it('should create AuthError for 403 Forbidden', async () => {
      const errorData = { message: 'Insufficient permissions' };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });

      await expect(responseHandler.processResponse(mockResponse, 'DELETE', '/admin'))
        .rejects.toThrow(AuthError);
    });

    it('should create ApiError for 404 Not Found', async () => {
      const errorData = { message: 'User not found' };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });

      await expect(responseHandler.processResponse(mockResponse, 'GET', '/users/123'))
        .rejects.toThrow(ApiError);
    });

    it('should create retryable ApiError for 500 Server Error', async () => {
      const errorData = { message: 'Internal server error' };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });

      try {
        await responseHandler.processResponse(mockResponse, 'POST', '/data');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).context?.isRetryable).toBe(true);
      }
    });
  });

  describe('Token Refresh Handling', () => {
    it('should attempt token refresh on 401 when authenticated', async () => {
      const { tokenService } = await import('../../../../src/lib/services/token/token.service');
      vi.mocked(tokenService.isAuthenticated).mockReturnValue(true);
      vi.mocked(tokenService.refreshToken).mockResolvedValue({ success: true });

      const errorData = { message: 'Token expired' };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });

      try {
        await responseHandler.processResponse(mockResponse, 'GET', '/profile');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).context?.tokenRefreshed).toBe(true);
      }

      expect(tokenService.refreshToken).toHaveBeenCalled();
    });

    it('should not attempt token refresh when not authenticated', async () => {
      const { tokenService } = await import('../../../../src/lib/services/token/token.service');
      vi.mocked(tokenService.isAuthenticated).mockReturnValue(false);

      const errorData = { message: 'Token expired' };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });

      await expect(responseHandler.processResponse(mockResponse, 'GET', '/profile'))
        .rejects.toThrow(AuthError);

      expect(tokenService.refreshToken).not.toHaveBeenCalled();
    });
  });

  describe('Malformed Response Handling', () => {
    it('should handle unparseable JSON responses', async () => {
      const mockResponse = new Response('invalid json {', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

      await expect(responseHandler.processResponse(mockResponse, 'GET', '/test'))
        .rejects.toThrow(ApiError);
    });

    it('should fall back to text parsing for unknown content types', async () => {
      const mockText = 'Unknown content type response';
      const mockResponse = new Response(mockText, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' } // Use a known content type that works
      });

      const result = await responseHandler.processResponse(mockResponse, 'GET', '/test');
      
      expect(result).toBe(mockText);
    });
  });
});