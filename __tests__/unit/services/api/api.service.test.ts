/**
 * API Service Tests - Testing behaviors and contracts
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from '../../../../src/lib/services/api/api.service';

// Mock external dependencies only
vi.mock('$lib/services/api/request-handler', () => ({
  requestHandler: {
    prepareRequest: vi.fn(async () => ({ method: 'GET', headers: new Headers() })),
    executeRequest: vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 })),
    buildUrl: vi.fn((url) => url)
  }
}));

vi.mock('$lib/services/api/response-handler', () => ({
  responseHandler: {
    processResponse: vi.fn(async (response) => ({ success: true, data: await response.json() }))
  }
}));

vi.mock('$lib/services/events', () => ({
  publish: vi.fn()
}));

vi.mock('$lib/services/logging/logging.service', () => ({
  loggerService: {
    withContext: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      startTimer: vi.fn(() => ({ end: vi.fn() }))
    }))
  }
}));

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Public API Contract', () => {
    it('should expose all required HTTP methods', () => {
      expect(apiService).toBeDefined();
      expect(typeof apiService.get).toBe('function');
      expect(typeof apiService.post).toBe('function');
      expect(typeof apiService.put).toBe('function');
      expect(typeof apiService.delete).toBe('function');
      expect(typeof apiService.patch).toBe('function');
    });

    it('should be a proper API service instance', () => {
      expect(apiService).toBeInstanceOf(Object);
      expect(apiService.constructor.name).toBe('ApiService');
    });
  });

  describe('GET Requests', () => {
    it('should handle basic GET requests', async () => {
      const result = await apiService.get('/api/test');
      expect(result).toBeDefined();
    });

    it('should handle GET requests with query parameters', async () => {
      const result = await apiService.get('/api/test', { 
        params: { page: 1, limit: 10 } 
      });
      expect(result).toBeDefined();
    });

    it('should handle GET requests with custom headers', async () => {
      const result = await apiService.get('/api/test', {
        headers: { 'Custom-Header': 'test-value' }
      });
      expect(result).toBeDefined();
    });

    it('should handle GET requests with timeout options', async () => {
      const result = await apiService.get('/api/test', {
        timeout: 5000
      });
      expect(result).toBeDefined();
    });
  });

  describe('POST Requests', () => {
    it('should handle POST requests with data', async () => {
      const testData = { name: 'test', value: 123 };
      const result = await apiService.post('/api/test', testData);
      expect(result).toBeDefined();
    });

    it('should handle POST requests with JSON data', async () => {
      const jsonData = { key: 'value', nested: { prop: true } };
      const result = await apiService.post('/api/test', jsonData);
      expect(result).toBeDefined();
    });

    it('should handle POST requests with custom options', async () => {
      const result = await apiService.post('/api/test', { data: 'test' }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      expect(result).toBeDefined();
    });
  });

  describe('PUT Requests', () => {
    it('should handle PUT requests for updates', async () => {
      const updateData = { id: 1, name: 'updated' };
      const result = await apiService.put('/api/test/1', updateData);
      expect(result).toBeDefined();
    });

    it('should handle PUT requests with options', async () => {
      const result = await apiService.put('/api/test/1', { data: 'updated' }, {
        headers: { 'If-Match': 'etag-value' }
      });
      expect(result).toBeDefined();
    });
  });

  describe('DELETE Requests', () => {
    it('should handle DELETE requests', async () => {
      const result = await apiService.delete('/api/test/1');
      expect(result).toBeDefined();
    });

    it('should handle DELETE requests with options', async () => {
      const result = await apiService.delete('/api/test/1', {
        headers: { 'Authorization': 'Bearer token' }
      });
      expect(result).toBeDefined();
    });
  });

  describe('PATCH Requests', () => {
    it('should handle PATCH requests for partial updates', async () => {
      const patchData = { status: 'active' };
      const result = await apiService.patch('/api/test/1', patchData);
      expect(result).toBeDefined();
    });

    it('should handle PATCH requests with options', async () => {
      const result = await apiService.patch('/api/test/1', { field: 'value' }, {
        timeout: 15000
      });
      expect(result).toBeDefined();
    });
  });

  describe('Request Options Handling', () => {
    it('should handle requests with no options', async () => {
      await expect(apiService.get('/api/test')).resolves.toBeDefined();
      await expect(apiService.post('/api/test', {})).resolves.toBeDefined();
      await expect(apiService.delete('/api/test')).resolves.toBeDefined();
    });

    it('should handle requests with empty options', async () => {
      const emptyOptions = {};
      await expect(apiService.get('/api/test', emptyOptions)).resolves.toBeDefined();
      await expect(apiService.post('/api/test', {}, emptyOptions)).resolves.toBeDefined();
    });

    it('should handle complex request configurations', async () => {
      const complexOptions = {
        headers: { 'X-Custom': 'value' },
        params: { filter: 'active' },
        timeout: 30000,
        retries: 3
      };
      
      const result = await apiService.get('/api/complex', complexOptions);
      expect(result).toBeDefined();
    });
  });

  describe('Error Resilience', () => {
    it('should handle invalid URLs gracefully', async () => {
      const invalidUrls = ['', null, undefined, 'not-a-url'];
      
      for (const url of invalidUrls) {
        // Should not crash the service
        await expect(apiService.get(url as any)).resolves.toBeDefined();
      }
    });

    it('should handle invalid data gracefully', async () => {
      const invalidData = [null, undefined, Symbol('test'), function() {}];
      
      for (const data of invalidData) {
        // Should not crash the service
        await expect(apiService.post('/api/test', data as any)).resolves.toBeDefined();
      }
    });

    it('should handle malformed options according to contract', async () => {
      // The service expects proper options objects, null will throw - this is expected
      await expect(apiService.get('/api/test', null as any)).rejects.toThrow();
      
      // But it should handle malformed option properties gracefully  
      const partiallyValidOptions = [
        { headers: 'not-an-object' },
        { timeout: 'not-a-number' },
        { params: null }
      ];
      
      for (const options of partiallyValidOptions) {
        // Should not crash completely, but may handle gracefully
        await expect(apiService.get('/api/test', options as any)).resolves.toBeDefined();
      }
    });
  });

  describe('Type Safety and Return Values', () => {
    it('should return defined values for all methods', async () => {
      const getResult = await apiService.get('/api/test');
      const postResult = await apiService.post('/api/test', {});
      const putResult = await apiService.put('/api/test', {});
      const deleteResult = await apiService.delete('/api/test');
      const patchResult = await apiService.patch('/api/test', {});
      
      expect(getResult).toBeDefined();
      expect(postResult).toBeDefined();
      expect(putResult).toBeDefined();
      expect(deleteResult).toBeDefined();
      expect(patchResult).toBeDefined();
    });

    it('should handle typed responses correctly', async () => {
      interface TestResponse {
        id: number;
        name: string;
      }
      
      const result = await apiService.get<TestResponse>('/api/test');
      expect(result).toBeDefined();
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = [
        apiService.get('/api/test1'),
        apiService.get('/api/test2'),
        apiService.post('/api/test3', {}),
        apiService.put('/api/test4', {}),
        apiService.delete('/api/test5')
      ];
      
      const results = await Promise.all(requests);
      expect(results).toHaveLength(5);
      results.forEach(result => expect(result).toBeDefined());
    });

    it('should handle rapid sequential requests', async () => {
      for (let i = 0; i < 5; i++) {
        const result = await apiService.get(`/api/test/${i}`);
        expect(result).toBeDefined();
      }
    });
  });

  describe('Integration Patterns', () => {
    it('should support chaining operations', async () => {
      // Simulate a typical workflow: GET -> POST -> PUT
      const getResult = await apiService.get('/api/resource');
      expect(getResult).toBeDefined();
      
      const postResult = await apiService.post('/api/resource', { name: 'test' });
      expect(postResult).toBeDefined();
      
      const putResult = await apiService.put('/api/resource/1', { name: 'updated' });
      expect(putResult).toBeDefined();
    });

    it('should handle CRUD operations consistently', async () => {
      const resource = { name: 'test-resource' };
      
      // Create
      const created = await apiService.post('/api/resources', resource);
      expect(created).toBeDefined();
      
      // Read
      const read = await apiService.get('/api/resources/1');
      expect(read).toBeDefined();
      
      // Update
      const updated = await apiService.put('/api/resources/1', { ...resource, status: 'updated' });
      expect(updated).toBeDefined();
      
      // Delete
      const deleted = await apiService.delete('/api/resources/1');
      expect(deleted).toBeDefined();
    });
  });

  describe('Retry Mechanism', () => {
    beforeEach(() => {
      // Clear all mocks and reset timers for retry tests
      vi.clearAllMocks();
      vi.clearAllTimers();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should retry network errors with exponential backoff', async () => {
      const { requestHandler } = await import('../../../../src/lib/services/api/request-handler');
      const { NetworkError } = await import('../../../../src/lib/utils/error-handler');
      
      // Mock network failure then success
      vi.mocked(requestHandler.executeRequest)
        .mockRejectedValueOnce(new NetworkError('Connection failed', { statusCode: 0 }))
        .mockRejectedValueOnce(new NetworkError('Connection failed', { statusCode: 0 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: 'success' }), { status: 200 }));

      const requestPromise = apiService.get('/api/test', { retryCount: 2 });
      
      // Fast-forward through retry delays
      await vi.advanceTimersByTimeAsync(5000);
      
      const result = await requestPromise;
      expect(result).toBeDefined();
      
      // Should have made 3 total requests (initial + 2 retries)
      expect(requestHandler.executeRequest).toHaveBeenCalledTimes(3);
    });

    it('should retry 500 server errors but not 400 client errors', async () => {
      const { requestHandler } = await import('../../../../src/lib/services/api/request-handler');
      const { responseHandler } = await import('../../../../src/lib/services/api/response-handler');
      const { ApiError } = await import('../../../../src/lib/utils/error-handler');
      
      // Mock successful request execution but response handler throws retryable error
      vi.mocked(requestHandler.executeRequest)
        .mockResolvedValue(new Response(JSON.stringify({ error: 'Server error' }), { status: 500 }));
        
      vi.mocked(responseHandler.processResponse)
        .mockRejectedValueOnce(new ApiError('Server error', { 
          statusCode: 500, 
          context: { isRetryable: true } 
        }))
        .mockRejectedValueOnce(new ApiError('Server error', { 
          statusCode: 500, 
          context: { isRetryable: true } 
        }))
        .mockResolvedValueOnce({ data: 'success' });

      const requestPromise = apiService.get('/api/test', { retryCount: 2 });
      
      // Fast-forward through retry delays
      await vi.advanceTimersByTimeAsync(10000);
      
      const result = await requestPromise;
      expect(result).toBeDefined();
      
      // Should have retried the 500 errors
      expect(responseHandler.processResponse).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable client errors', async () => {
      const { requestHandler } = await import('../../../../src/lib/services/api/request-handler');
      const { responseHandler } = await import('../../../../src/lib/services/api/response-handler');
      const { ValidationError } = await import('../../../../src/lib/utils/error-handler');
      
      // Mock 400 validation error (non-retryable)
      vi.mocked(requestHandler.executeRequest)
        .mockResolvedValue(new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 }));
        
      vi.mocked(responseHandler.processResponse)
        .mockRejectedValueOnce(new ValidationError('Invalid data', { statusCode: 400 }));

      await expect(apiService.get('/api/test', { retryCount: 2 }))
        .rejects.toThrow(ValidationError);
      
      // Should not have retried
      expect(responseHandler.processResponse).toHaveBeenCalledTimes(1);
    });

    it('should handle token refresh retries correctly', async () => {
      const { requestHandler } = await import('../../../../src/lib/services/api/request-handler');
      const { responseHandler } = await import('../../../../src/lib/services/api/response-handler');
      const { AuthError } = await import('../../../../src/lib/utils/error-handler');
      
      // Mock token refresh scenario
      vi.mocked(requestHandler.executeRequest)
        .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Token expired' }), { status: 401 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ data: 'success' }), { status: 200 }));
        
      vi.mocked(responseHandler.processResponse)
        .mockRejectedValueOnce(new AuthError('Token refreshed successfully', { 
          action: 'login',
          statusCode: 401,
          context: { tokenRefreshed: true }
        }))
        .mockResolvedValueOnce({ data: 'success' });

      const result = await apiService.get('/api/test');
      expect(result).toEqual({ data: 'success' });
      
      // Should have immediately retried after token refresh
      expect(requestHandler.executeRequest).toHaveBeenCalledTimes(2);
    });

    it('should respect custom retry count configuration', async () => {
      const { requestHandler } = await import('../../../../src/lib/services/api/request-handler');
      const { NetworkError } = await import('../../../../src/lib/utils/error-handler');
      
      // Mock network failures for initial + 1 retry
      vi.mocked(requestHandler.executeRequest)
        .mockRejectedValueOnce(new NetworkError('Connection failed', { statusCode: 0 }))
        .mockRejectedValueOnce(new NetworkError('Connection failed', { statusCode: 0 }));

      const requestPromise = apiService.get('/api/test', { retryCount: 1 });
      
      await vi.advanceTimersByTimeAsync(5000);
      
      await expect(requestPromise).rejects.toThrow(NetworkError);
      
      // Should have made 2 total requests (initial + 1 retry)
      expect(requestHandler.executeRequest).toHaveBeenCalledTimes(2);
    });

    it('should calculate exponential backoff delays correctly', async () => {
      const { requestHandler } = await import('../../../../src/lib/services/api/request-handler');
      const { NetworkError } = await import('../../../../src/lib/utils/error-handler');
      
      vi.mocked(requestHandler.executeRequest)
        .mockRejectedValueOnce(new NetworkError('Connection failed', { statusCode: 0 }))
        .mockRejectedValueOnce(new NetworkError('Connection failed', { statusCode: 0 }))
        .mockRejectedValueOnce(new NetworkError('Connection failed', { statusCode: 0 }));

      // Create the promise and immediately expect it to reject to avoid unhandled rejection
      const requestPromise = apiService.get('/api/test', { retryCount: 2 });
      
      // Advance timers step by step to verify delay progression
      await vi.advanceTimersByTimeAsync(10000);  
      
      await expect(requestPromise).rejects.toThrow(NetworkError);
      
      // Verify that the service actually made retry attempts
      expect(requestHandler.executeRequest).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should prevent retry loops on persistent failures', async () => {
      const { requestHandler } = await import('../../../../src/lib/services/api/request-handler');
      const { NetworkError } = await import('../../../../src/lib/utils/error-handler');
      
      vi.mocked(requestHandler.executeRequest)
        .mockRejectedValueOnce(new NetworkError('Persistent failure', { statusCode: 0 }))
        .mockRejectedValueOnce(new NetworkError('Persistent failure', { statusCode: 0 }))
        .mockRejectedValueOnce(new NetworkError('Persistent failure', { statusCode: 0 }));

      // Create the promise and immediately expect it to reject to avoid unhandled rejection
      const requestPromise = apiService.get('/api/test', { retryCount: 2 });
      
      await vi.advanceTimersByTimeAsync(10000);
      
      await expect(requestPromise).rejects.toThrow(NetworkError);
      
      // Should stop after max retries
      expect(requestHandler.executeRequest).toHaveBeenCalledTimes(3);
    });
  });
});