/**
 * src/lib/interfaces/api.interfaces.ts
 * API Service Interfaces
 * 
 * Defines the contract for API services, request handlers, and response handlers
 */

import type { ApiError, AuthError, ValidationError } from '../utils/error-handler';
import type { RequestOptions, SafeRequestResult } from '../types/api.types';

/**
 * Interface for request handler functionality
 */
export interface IRequestHandler {
  /**
   * Prepares a request with proper headers, authentication, and CSRF protection
   * 
   * @param method HTTP method
   * @param url Request URL
   * @param data Request body data (if applicable)
   * @param options Additional request options
   * @returns Prepared request options
   */
  prepareRequest(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<RequestInit>;
  
  /**
   * Executes a request with timeout handling
   * 
   * @param url Request URL
   * @param options Request options
   * @param timeoutMs Timeout in milliseconds
   * @returns Response from the fetch request
   */
  executeRequest(
    url: string,
    options: RequestInit,
    timeoutMs?: number
  ): Promise<Response>;
  
  /**
   * Combines URL and query parameters
   * 
   * @param url Base URL
   * @param params Query parameters object
   * @returns URL with query parameters
   */
  buildUrl(url: string, params?: Record<string, any>): string;
}

/**
 * Interface for response handler functionality
 */
export interface IResponseHandler {
  /**
   * Processes an API response based on status code and content type
   * 
   * @param response Fetch Response object
   * @param method HTTP method that was used
   * @param url Request URL
   * @returns Parsed response data
   */
  processResponse<T>(
    response: Response,
    method: string,
    url: string
  ): Promise<T>;
}

/**
 * Interface for the main API service
 */
export interface IApiService {
  /**
   * Performs a GET request
   * 
   * @param url API endpoint URL
   * @param options Request options
   * @returns Response data
   */
  get<T>(url: string, options?: RequestOptions): Promise<T>;
  
  /**
   * Performs a POST request
   * 
   * @param url API endpoint URL
   * @param data Request body data
   * @param options Request options
   * @returns Response data
   */
  post<T>(url: string, data?: any, options?: RequestOptions): Promise<T>;
  
  /**
   * Performs a PUT request
   * 
   * @param url API endpoint URL
   * @param data Request body data
   * @param options Request options
   * @returns Response data
   */
  put<T>(url: string, data?: any, options?: RequestOptions): Promise<T>;
  
  /**
   * Performs a DELETE request
   * 
   * @param url API endpoint URL
   * @param options Request options
   * @returns Response data
   */
  delete<T>(url: string, options?: RequestOptions): Promise<T>;
  
  /**
   * Performs a PATCH request
   * 
   * @param url API endpoint URL
   * @param data Request body data
   * @param options Request options
   * @returns Response data
   */
  patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T>;
  
  /**
   * Safe version of GET that never throws
   * 
   * @param url API endpoint URL
   * @param options Request options
   * @returns Result object with success flag, data, and error
   */
  safeGet<T>(url: string, options?: RequestOptions): Promise<SafeRequestResult<T>>;
  
  /**
   * Safe version of POST that never throws
   * 
   * @param url API endpoint URL
   * @param data Request body data
   * @param options Request options
   * @returns Result object with success flag, data, and error
   */
  safePost<T>(url: string, data?: any, options?: RequestOptions): Promise<SafeRequestResult<T>>;
  
  /**
   * Safe version of PUT that never throws
   * 
   * @param url API endpoint URL
   * @param data Request body data
   * @param options Request options
   * @returns Result object with success flag, data, and error
   */
  safePut<T>(url: string, data?: any, options?: RequestOptions): Promise<SafeRequestResult<T>>;
  
  /**
   * Safe version of DELETE that never throws
   * 
   * @param url API endpoint URL
   * @param options Request options
   * @returns Result object with success flag, data, and error
   */
  safeDelete<T>(url: string, options?: RequestOptions): Promise<SafeRequestResult<T>>;
  
  /**
   * Safe version of PATCH that never throws
   * 
   * @param url API endpoint URL
   * @param data Request body data
   * @param options Request options
   * @returns Result object with success flag, data, and error
   */
  safePatch<T>(url: string, data?: any, options?: RequestOptions): Promise<SafeRequestResult<T>>;
}