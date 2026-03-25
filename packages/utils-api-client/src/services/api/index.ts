/**
 * src/lib/services/api/index.ts
 * API Service exports
 * 
 * Centralizes all API-related exports to provide a clean interface
 * for importing API functionality throughout the application.
 */

// Export the main API service
export { apiService } from './api.service';

// Export request and response handlers for advanced usage scenarios
export { requestHandler } from './request-handler';
export { responseHandler } from './response-handler';

// Re-export API constants for consumers who need them
export { API_CONSTANTS } from '@xbg.solutions/frontend-core';

// Export types to improve developer experience
export type { 
  RequestOptions,
  SafeRequestResult,
  ApiResponse,
  PaginationParams,
  ResponseMetadata,
  ApiClient
} from '@xbg.solutions/frontend-core';