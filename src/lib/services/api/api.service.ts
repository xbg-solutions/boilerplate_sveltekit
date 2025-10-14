/**
 * src/lib/services/api/api.service.ts
 * API Service
 * 
 * A centralized service for API communication with support for:
 * - Type-safe request methods (GET, POST, PUT, DELETE)
 * - Authentication and CSRF protection
 * - Error handling and retry logic
 * - Event publishing
 * - Request deduplication
 */

import { loggerService } from '../../services/logging/logging.service';
import { publish } from '../../services/events';
import { 
  ApiError, 
  AuthError, 
  NetworkError, 
  ValidationError,
  normalizeError,
  withErrorHandling 
} from '../../utils/error-handler';
import { API_CONSTANTS } from '../../constants/api.constants';
import { requestHandler } from './request-handler';
import { responseHandler } from './response-handler';
import type { IApiService } from '../../types/api.interfaces';
import type { RequestOptions, SafeRequestResult } from '../../types/api.types';
import type { LogContext } from '../../types/logging.interfaces';

// Create a context-aware logger
const apiLogger = loggerService.withContext('ApiService');

/**
 * API Service Implementation
 */
class ApiService implements IApiService {
  private inFlightRequests: Map<string, Promise<any>>;
  
  constructor() {
    this.inFlightRequests = new Map();
    apiLogger.info('API Service initialized');
  }
  
  /**
   * Performs a GET request
   */
  async get<T>(
    url: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    // Extract params for URL building
    const params = options.params || {};
    
    // Note: We're not removing params here anymore since we do it in request()
    // But we're keeping a copy of options for deduplication and other uses
    const requestOptions = { ...options };
    
    const fullUrl = requestHandler.buildUrl(url, params);
    
    // Check if this is a cacheable request
    const shouldDedup = requestOptions.skipDeduplication !== true;
    const requestKey = shouldDedup ? `GET:${fullUrl}` : null;
    
    // Return existing request if one is in flight
    if (requestKey && this.inFlightRequests.has(requestKey)) {
      apiLogger.info(`Reusing in-flight request for ${fullUrl}`, {
        url: fullUrl,
        requestKey
      });
      
      return this.inFlightRequests.get(requestKey);
    }
    
    // Create the request promise
    const requestPromise = this.request<T>('GET', fullUrl, null, requestOptions);
    
    // Store for deduplication if applicable
    if (requestKey) {
      this.inFlightRequests.set(requestKey, requestPromise);
      
      // Clean up map entry when request completes
      requestPromise.finally(() => {
        this.inFlightRequests.delete(requestKey);
      });
    }
    
    return requestPromise;
  }
  
  /**
   * Performs a POST request
   */
  async post<T>(
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>('POST', url, data, options);
  }
  
  /**
   * Performs a PUT request
   */
  async put<T>(
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>('PUT', url, data, options);
  }
  
  /**
   * Performs a DELETE request
   */
  async delete<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>('DELETE', url, null, options);
  }
  
  /**
   * Performs a PATCH request
   */
  async patch<T>(
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>('PATCH', url, data, options);
  }
  
  /**
   * Core request method that handles all API communication
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const timeout = options.timeout || API_CONSTANTS.REQUEST_CONFIG.timeout;
    const maxRetries = options.retryCount !== undefined 
      ? options.retryCount 
      : API_CONSTANTS.REQUEST_CONFIG.retryCount;
    
    let retryCount = 0;
    let lastError: Error | null = null;
    
    const logContext: LogContext = {
      method,
      url,
      timeout,
      maxRetries
    };
    
    // Emit request start event
    publish(API_CONSTANTS.EVENTS.REQUEST_START, {
      method,
      url,
      timestamp: Date.now()
    }, 'ApiService');
    
    // Track start time for logging
    const startTime = performance.now();
    
    while (retryCount <= maxRetries) {
      try {
        // Create a clean copy of options without the params property
        const cleanOptions = { ...options };
        delete cleanOptions.params;
        
        // Prepare the request with clean options
        const requestOptions = await requestHandler.prepareRequest(method, url, data, cleanOptions);
        
        // Execute the request
        const response = await requestHandler.executeRequest(url, requestOptions, timeout);
        
        // Process the response
        const result = await responseHandler.processResponse<T>(response, method, url);
        
        // Calculate request duration
        const duration = performance.now() - startTime;
        
        // Emit success event
        publish(API_CONSTANTS.EVENTS.REQUEST_SUCCESS, {
          method,
          url,
          status: response.status,
          duration,
          timestamp: Date.now()
        }, 'ApiService');
        
        // Log success
        apiLogger.info(`${method} ${url} completed successfully`, {
          ...logContext,
          status: response.status,
          duration: Math.round(duration)
        });
        
        return result;
      } catch (error) {
        // Ensure lastError is always an Error object
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Special case: if this error indicates a successful token refresh,
        // we should retry the request with the new token
        if (error instanceof AuthError && 
            error.context && 
            error.context.tokenRefreshed) {
          apiLogger.info(`Retrying ${method} ${url} after token refresh`, logContext);
          continue; // Retry immediately with refreshed token
        }
        
        // Check if we should retry the request
        const shouldRetry = 
          // Not the last attempt
          retryCount < maxRetries && 
          // And either network error or server error that's marked retryable
          ((error instanceof NetworkError && !error.isOffline) || 
           (error instanceof ApiError && 
            error.statusCode && 
            error.statusCode >= 500 && 
            error.context && 
            error.context.isRetryable));
        
        if (shouldRetry) {
          // Increment retry count
          retryCount++;
          
          // Calculate delay with exponential backoff and jitter
          const delay = API_CONSTANTS.REQUEST_CONFIG.retryDelay * 
            Math.pow(2, retryCount - 1) * 
            (0.8 + Math.random() * 0.4);
          
          apiLogger.warn(`Retrying ${method} ${url} (${retryCount}/${maxRetries}) after ${Math.round(delay)}ms`, {
            ...logContext,
            retryCount,
            delay: Math.round(delay),
            error: lastError.message,
            errorType: lastError.constructor.name,
            statusCode: error instanceof ApiError ? error.statusCode : undefined
          });
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Calculate request duration
        const duration = performance.now() - startTime;
        
        // Emit error event with appropriate type
        if (error instanceof AuthError) {
          publish(API_CONSTANTS.EVENTS.AUTH_ERROR, {
            method,
            url,
            error: lastError.message,
            status: error.statusCode,
            duration,
            timestamp: Date.now()
          }, 'ApiService');
        } else if (error instanceof NetworkError) {
          publish(API_CONSTANTS.EVENTS.NETWORK_ERROR, {
            method,
            url,
            error: lastError.message,
            isOffline: error.isOffline,
            isTimeout: error.isTimeout,
            duration,
            timestamp: Date.now()
          }, 'ApiService');
        } else {
          publish(API_CONSTANTS.EVENTS.REQUEST_ERROR, {
            method,
            url,
            error: lastError.message,
            status: error instanceof ApiError ? error.statusCode : undefined,
            duration,
            timestamp: Date.now()
          }, 'ApiService');
        }
        
        // Log error - ensure it's an Error object
        apiLogger.error(`${method} ${url} failed`, lastError, {
          ...logContext,
          duration: Math.round(duration),
          retryAttempts: retryCount
        });
        
        // Rethrow the error
        throw error;
      }
    }
    
    // If we got here, we exhausted all retries
    // Ensure lastError is not null
    if (!lastError) {
      lastError = new Error(`Request to ${url} failed after ${retryCount} retries`);
    }
    
    apiLogger.error(`${method} ${url} failed after ${retryCount} retries`, lastError, logContext);
    throw lastError;
  }
  
  /**
   * Safe version of GET that never throws
   */
  async safeGet<T>(
    url: string,
    options?: RequestOptions
  ): Promise<SafeRequestResult<T>> {
    try {
      const data = await this.get<T>(url, options);
      return { success: true, data };
    } catch (error) {
      apiLogger.info(`Safe GET request to ${url} caught error`, {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Ensure we return a properly normalized error
      return { 
        success: false, 
        error: error instanceof Error ? 
          normalizeError(error) : 
          normalizeError(new Error(String(error)))
      };
    }
  }
  
  /**
   * Safe version of POST that never throws
   */
  async safePost<T>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<SafeRequestResult<T>> {
    try {
      const result = await this.post<T>(url, data, options);
      return { success: true, data: result };
    } catch (error) {
      apiLogger.info(`Safe POST request to ${url} caught error`, {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Ensure we return a properly normalized error
      return { 
        success: false, 
        error: error instanceof Error ? 
          normalizeError(error) : 
          normalizeError(new Error(String(error)))
      };
    }
  }
  
  /**
   * Safe version of PUT that never throws
   */
  async safePut<T>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<SafeRequestResult<T>> {
    try {
      const result = await this.put<T>(url, data, options);
      return { success: true, data: result };
    } catch (error) {
      apiLogger.info(`Safe PUT request to ${url} caught error`, {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Ensure we return a properly normalized error
      return { 
        success: false, 
        error: error instanceof Error ? 
          normalizeError(error) : 
          normalizeError(new Error(String(error)))
      };
    }
  }
  
  /**
   * Safe version of DELETE that never throws
   */
  async safeDelete<T>(
    url: string,
    options?: RequestOptions
  ): Promise<SafeRequestResult<T>> {
    try {
      const result = await this.delete<T>(url, options);
      return { success: true, data: result };
    } catch (error) {
      apiLogger.info(`Safe DELETE request to ${url} caught error`, {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Ensure we return a properly normalized error
      return { 
        success: false, 
        error: error instanceof Error ? 
          normalizeError(error) : 
          normalizeError(new Error(String(error)))
      };
    }
  }
  
  /**
   * Safe version of PATCH that never throws
   */
  async safePatch<T>(
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<SafeRequestResult<T>> {
    try {
      const result = await this.patch<T>(url, data, options);
      return { success: true, data: result };
    } catch (error) {
      apiLogger.info(`Safe PATCH request to ${url} caught error`, {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Ensure we return a properly normalized error
      return { 
        success: false, 
        error: error instanceof Error ? 
          normalizeError(error) : 
          normalizeError(new Error(String(error)))
      };
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();