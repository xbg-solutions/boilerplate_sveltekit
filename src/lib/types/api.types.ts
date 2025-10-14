/**
 * src/lib/types/api.types.ts
 * API Type Definitions
 * 
 * Type definitions for the API service that integrate with the existing
 * application type system and error handling utilities.
 */

import type { AppError } from '../utils/error-handler';
import type { ErrorResult } from './error.types';

/**
 * Options for API requests
 * Adds custom properties while preserving compatibility with fetch options
 */
export interface RequestOptions {
  /** URL parameters to append as query string */
  params?: Record<string, any>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts for failed requests */
  retryCount?: number;
  /** Whether to enable request caching */
  enableCache?: boolean;
  /** Skip request deduplication */
  skipDeduplication?: boolean;
  /** Custom headers to add to the request */
  headers?: Record<string, string>;
  
  // Include necessary RequestInit properties but omit those we handle specially
  mode?: RequestMode;
  credentials?: RequestCredentials;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  integrity?: string;
  keepalive?: boolean;
  body?: BodyInit | null;
}

/**
 * Result of a safe API request that doesn't throw
 */
export interface SafeRequestResult<T> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data if successful */
  data?: T;
  /** Error if unsuccessful */
  error?: AppError;
}

/**
 * Standard pagination parameters used in API responses
 */
export interface PaginationParams {
  /** Current page number */
  page: number;
  /** Number of items per page */
  perPage: number;
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Standard metadata for API responses
 */
export interface ResponseMetadata {
  /** Optional pagination information */
  pagination?: PaginationParams;
}

/**
 * Standard API response structure
 * Generic type T represents the expected data type
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data: T;
  /** Response metadata */
  meta?: ResponseMetadata;
  /** Status message */
  message?: string;
  /** Success flag */
  success?: boolean;
}

/**
 * Interface for defining domain-specific API clients
 */
export interface ApiClient {
  /** Base URL for the API client */
  baseUrl: string;
  /** Service name for logging and events */
  serviceName: string;
}