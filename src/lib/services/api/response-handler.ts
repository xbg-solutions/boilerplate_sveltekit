/**
 * src/lib/services/api/response-handler.ts
 * API Response Handler
 * 
 * Handles API response processing with support for:
 * - Status code interpretation
 * - Content type handling
 * - Error response processing
 * - Token refresh on authentication failures
 */

import { loggerService } from '../../services/logging/logging.service';
import { tokenService } from '../../services/token/token.service';
import { 
  ApiError, 
  AuthError, 
  ValidationError, 
  normalizeError 
} from '../../utils/error-handler';
import { API_CONSTANTS } from '../../constants/api.constants';
import type { IResponseHandler } from '../../types/api.interfaces';
import type { LogContext } from '../../types/logging.interfaces';

// Create a context-aware logger
const responseLogger = loggerService.withContext('ResponseHandler');

/**
 * Parses response body based on content type
 * 
 * @param response Fetch Response object
 * @param logContext Optional logging context
 * @returns Parsed response body
 */
async function parseResponseBody<T>(response: Response, logContext?: LogContext): Promise<T> {
  const contentType = response.headers.get('Content-Type') || '';
  
  // Handle empty responses
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    responseLogger.info('Received empty response', logContext);
    return null as unknown as T;
  }
  
  try {
    // Parse based on content type
    if (contentType.includes('application/json')) {
      responseLogger.info('Parsing JSON response', logContext);
      return await response.json();
    } else if (contentType.includes('text/')) {
      responseLogger.info('Parsing text response', logContext);
      return await response.text() as unknown as T;
    } else if (contentType.includes('application/octet-stream')) {
      responseLogger.info('Parsing binary response', logContext);
      return await response.blob() as unknown as T;
    } else {
      // Default to JSON parsing with fallback to text
      responseLogger.info(`Attempting to parse unknown content type: ${contentType}`, logContext);
      try {
        return await response.json();
      } catch {
        return await response.text() as unknown as T;
      }
    }
  } catch (error) {
    responseLogger.error(
      `Failed to parse response body (${contentType})`,
      error instanceof Error ? error : new Error(String(error)),
      logContext
    );
    
    throw new ApiError('Failed to parse response body', {
      context: { 
        contentType,
        responseSize: response.headers.get('Content-Length')
      },
      userMessage: 'Failed to read response from server.'
    });
  }
}

/**
 * Creates appropriate API error based on status code
 * 
 * @param status HTTP status code
 * @param errorData Error data from response
 * @param method HTTP method
 * @param url Request URL
 * @returns Appropriate error object
 */
function createApiErrorFromStatus(
  status: number,
  errorData: any,
  method: string,
  url: string
): ApiError | AuthError | ValidationError {
  // Default error message and user message
  const errorMessage = errorData?.message || errorData?.error || 'API request failed';
  const userMessage = errorData?.userMessage || errorData?.message || 'An error occurred during the request.';
  
  // Create context object for error
  const context = { 
    endpoint: url,
    method,
    status,
    errorData: errorData ? { 
      message: errorData.message,
      code: errorData.code
    } : undefined
  };
  
  // Create appropriate error based on status code
  switch (true) {
    case status === API_CONSTANTS.STATUS.BAD_REQUEST:
      return new ValidationError(errorMessage, {
        statusCode: status,
        userMessage,
        context,
        fieldErrors: errorData?.errors || errorData?.fieldErrors || {}
      });
      
    case status === API_CONSTANTS.STATUS.UNAUTHORIZED:
      return new AuthError(errorMessage, {
        action: 'login', // Assume token expiration for 401
        statusCode: status,
        userMessage: 'Your session has expired. Please log in again.',
        context
      });
      
    case status === API_CONSTANTS.STATUS.FORBIDDEN:
      return new AuthError(errorMessage, {
        action: 'authorize',
        statusCode: status,
        userMessage: "You don't have permission to perform this action.",
        context
      });
      
    case status === API_CONSTANTS.STATUS.NOT_FOUND:
      return new ApiError(errorMessage, {
        statusCode: status,
        userMessage: 'The requested resource was not found.',
        context
      });
      
    case status >= 500:
      // Server errors are usually retryable
      return new ApiError(errorMessage, {
        statusCode: status,
        userMessage: 'The server encountered an error. Please try again later.',
        context: {
          ...context,
          isRetryable: true
        }
      });
      
    default:
      return new ApiError(errorMessage, {
        statusCode: status,
        userMessage,
        context
      });
  }
}

/**
 * Response Handler implementation
 */
export const responseHandler: IResponseHandler = {
  /**
   * Processes an API response based on status code and content type
   */
  async processResponse<T>(
    response: Response,
    method: string,
    url: string
  ): Promise<T> {
    const logContext: LogContext = {
      url,
      method,
      status: response.status,
      contentType: response.headers.get('Content-Type')
    };
    
    try {
      responseLogger.info(`Processing ${method} response from ${url} (${response.status})`, logContext);
      
      // Handle successful responses
      if (response.ok) {
        const responseData = await parseResponseBody<T>(response, logContext);
        responseLogger.info(`Successfully processed ${method} response from ${url}`, logContext);
        return responseData;
      }
      
      // Log error response
      responseLogger.warn(
        `Received error response from ${url}: ${response.status} ${response.statusText}`,
        logContext
      );
      
      // Handle error responses
      try {
        // Try to parse error response data
        let errorData: any = null;
        
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
          errorData = await response.json();
          responseLogger.info('Parsed JSON error response', {
            ...logContext,
            errorData: errorData?.message || errorData?.error
          });
        } else if (contentType.includes('text/')) {
          errorData = { message: await response.text() };
          responseLogger.info('Parsed text error response', logContext);
        }
        
        // Create appropriate error object based on status code
        const error = createApiErrorFromStatus(
          response.status,
          errorData,
          method,
          url
        );
        
        // Special handling for 401 Unauthorized - attempt token refresh
        if (response.status === API_CONSTANTS.STATUS.UNAUTHORIZED && tokenService.isAuthenticated()) {
          responseLogger.warn(`Authentication error for ${method} ${url}, attempting token refresh`, logContext);
          
          // Try to refresh the token
          const refreshResult = await tokenService.refreshToken();
          
          if (refreshResult.success) {
            // Token refreshed successfully, suggest retry
            responseLogger.info('Token refreshed successfully after auth error', logContext);
            
            // Create a special error with a token refreshed flag
            const refreshedError = new AuthError('Token refreshed successfully', {
              action: 'login',
              statusCode: API_CONSTANTS.STATUS.UNAUTHORIZED,
              context: { 
                endpoint: url,
                method,
                tokenRefreshed: true // Special flag for API service to recognize
              },
              userMessage: 'Your session has been refreshed. Please try again.'
            });
            
            throw refreshedError;
          } else {
            // Token refresh failed, throw original error
            responseLogger.warn('Token refresh failed after auth error', {
              ...logContext,
              refreshError: refreshResult.error?.message
            });
            
            throw error;
          }
        }
        
        // For other status codes, throw the error
        throw error;
      } catch (error) {
        // If error is already one of our error types, rethrow it
        if (error instanceof ApiError || error instanceof AuthError || error instanceof ValidationError) {
          throw error;
        }
        
        // Otherwise create a generic API error
        const apiError = new ApiError(`Error response from ${url}`, {
          statusCode: response.status,
          context: { 
            url,
            method,
            status: response.status,
            statusText: response.statusText
          },
          userMessage: 'The server returned an error response.'
        });
        
        throw apiError;
      }
    } catch (error) {
      // Handle errors that occurred during response processing
      
      // Pass through our specific error types
      if (error instanceof ApiError || error instanceof AuthError || error instanceof ValidationError) {
        // Special case for token refreshed error
        if (error instanceof AuthError && error.context && error.context.tokenRefreshed) {
          responseLogger.info('Propagating token refreshed error for retry', logContext);
          throw error;
        }
        
        responseLogger.error(
          `Error processing ${method} response from ${url}`, 
          error,
          logContext
        );
        
        throw error;
      }
      
      // Normalize other errors
      const normalizedError = normalizeError(error, `Error processing ${method} response from ${url}`, {
        category: 'api',
        context: logContext,
        statusCode: response.status
      });
      
      responseLogger.error(
        `Failed to process ${method} response from ${url}`,
        normalizedError,
        logContext
      );
      
      throw normalizedError;
    }
  }
};