/**
 * src/lib/utils/error-handler.test.ts
 * Error handler unit tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create a manual import of the error handler module
// Import directly from the file, so we can test without mocking
import * as ErrorHandler from '$lib/utils/error-handler';
const {
  AppError,
  ApiError,
  ValidationError,
  AuthError,
  ApplicationError,
  NetworkError,
  normalizeError,
  formatError,
  handleError,
  createErrorResponse,
  tryCatch,
  withErrorHandling
} = ErrorHandler;

// Skip module mocking entirely for this test
// and use spies instead to verify function calls
describe('Error Handler Utilities', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock console methods to avoid test output noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock import.meta.env.DEV
    vi.stubGlobal('import.meta', { env: { DEV: true } });
  });
  
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  
  describe('Error Classes', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('Application error', {
        category: 'test',
        statusCode: 400,
        context: { testId: 123 },
        userVisible: true,
        userMessage: 'User-friendly error message',
        code: 'TEST_ERROR'
      });
      
      expect(error.message).toBe('Application error');
      expect(error.name).toBe('AppError');
      expect(error.category).toBe('test');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ testId: 123 });
      expect(error.userVisible).toBe(true);
      expect(error.userMessage).toBe('User-friendly error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.stack).toBeDefined();
    });
    
    it('should create ApiError with correct properties', () => {
      const error = new ApiError('API request failed', {
        endpoint: '/api/test',
        method: 'GET',
        apiStatusCode: 404,
        responseData: { error: 'Not found' }
      });
      
      expect(error.message).toBe('API request failed');
      expect(error.name).toBe('ApiError');
      expect(error.category).toBe('api');
      expect(error.statusCode).toBe(404);
      expect(error.endpoint).toBe('/api/test');
      expect(error.method).toBe('GET');
      expect(error.apiStatusCode).toBe(404);
      expect(error.responseData).toEqual({ error: 'Not found' });
    });
    
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Validation failed', {
        field: 'email',
        rule: 'required',
        fieldErrors: { email: 'Email is required' }
      });
      
      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('ValidationError');
      expect(error.category).toBe('validation');
      expect(error.statusCode).toBe(400);
      expect(error.field).toBe('email');
      expect(error.rule).toBe('required');
      expect(error.fieldErrors).toEqual({ email: 'Email is required' });
    });
    
    it('should create AuthError with correct properties', () => {
      const error = new AuthError('Authentication failed', {
        action: 'login',
        userMessage: 'Invalid credentials'
      });
      
      expect(error.message).toBe('Authentication failed');
      expect(error.name).toBe('AuthError');
      expect(error.category).toBe('auth');
      expect(error.statusCode).toBe(401);
      expect(error.action).toBe('login');
      expect(error.userMessage).toBe('Invalid credentials');
      expect(error.containsSensitiveInfo).toBe(true);
    });
    
    it('should create ApplicationError with correct properties', () => {
      const error = new ApplicationError('Application error', {
        statusCode: 500,
        userMessage: 'Something went wrong'
      });
      
      expect(error.message).toBe('Application error');
      expect(error.name).toBe('ApplicationError');
      expect(error.category).toBe('application');
      expect(error.statusCode).toBe(500);
      expect(error.userMessage).toBe('Something went wrong');
    });
    
    it('should create NetworkError with correct properties', () => {
      const error = new NetworkError('Network request failed', {
        isOffline: true,
        endpoint: '/api/data'
      });
      
      expect(error.message).toBe('Network request failed');
      expect(error.name).toBe('NetworkError');
      expect(error.category).toBe('network');
      expect(error.statusCode).toBe(503);
      expect(error.isOffline).toBe(true);
      expect(error.endpoint).toBe('/api/data');
      expect(error.userMessage).toBe('Unable to connect to the server. Please check your internet connection.');
    });
  });
  
  describe('normalizeError', () => {
    it('should return AppError instances unchanged', () => {
      const originalError = new ApiError('Test error');
      const normalizedError = normalizeError(originalError);
      
      expect(normalizedError).toBe(originalError);
    });
    
    it('should convert standard Error to ApplicationError', () => {
      const originalError = new Error('Standard error');
      const normalizedError = normalizeError(originalError);
      
      expect(normalizedError).toBeInstanceOf(ApplicationError);
      expect(normalizedError.message).toBe('Standard error');
      expect(normalizedError.cause).toBe(originalError);
    });
    
    it('should convert string to ApplicationError', () => {
      const normalizedError = normalizeError('Error message');
      
      expect(normalizedError).toBeInstanceOf(ApplicationError);
      expect(normalizedError.message).toBe('Error message');
    });
    
    it('should handle unknown error types with fallback message', () => {
      const normalizedError = normalizeError(null, 'Fallback message');
      
      expect(normalizedError).toBeInstanceOf(ApplicationError);
      expect(normalizedError.message).toBe('Fallback message');
      expect(normalizedError.context).toEqual({ originalError: null });
    });
    
    it('should apply custom options to normalized error', () => {
      const normalizedError = normalizeError('Error message', undefined, {
        statusCode: 418,
        userMessage: 'Custom message'
      });
      
      expect(normalizedError).toBeInstanceOf(ApplicationError);
      expect(normalizedError.statusCode).toBe(418);
      expect(normalizedError.userMessage).toBe('Custom message');
    });
  });
  
  describe('formatError', () => {
    it('should format AppError with basic info', () => {
      const error = new AppError('Test error', {
        category: 'test',
        statusCode: 400,
        userMessage: 'User message'
      });
      
      const formatted = formatError(error);
      
      expect(formatted.message).toBe('Test error');
      expect(formatted.name).toBe('AppError');
      expect(formatted.category).toBe('test');
      expect(formatted.statusCode).toBe(400);
      expect(formatted.userMessage).toBe('User message');
      expect(formatted.stack).toBeDefined();
    });
    
    it('should omit details when includeDetails is false', () => {
      const error = new ApiError('Test error', {
        endpoint: '/api/test',
        responseData: { sensitive: true }
      });
      
      const formatted = formatError(error, false);
      
      expect(formatted.message).toBe('Test error');
      expect(formatted.stack).toBeUndefined();
      expect(formatted.details).toBeUndefined();
    });
    
    it('should include specific details for different error types', () => {
      const apiError = new ApiError('API error', {
        endpoint: '/api/test',
        method: 'POST'
      });
      
      const validationError = new ValidationError('Validation error', {
        field: 'email',
        fieldErrors: { email: 'Invalid email' }
      });
      
      const authError = new AuthError('Auth error', {
        action: 'login'
      });
      
      // Create a network error with only isTimeout set
      const networkError = new NetworkError('Network error', {
        isTimeout: true
      });
      
      const apiFormatted = formatError(apiError);
      const validationFormatted = formatError(validationError);
      const authFormatted = formatError(authError);
      const networkFormatted = formatError(networkError);
      
      expect(apiFormatted.details).toMatchObject({
        endpoint: '/api/test',
        method: 'POST'
      });
      
      expect(validationFormatted.details).toMatchObject({
        field: 'email',
        fieldErrors: { email: 'Invalid email' }
      });
      
      expect(authFormatted.details).toMatchObject({
        action: 'login'
      });
      
      // First ensure details exists, then check isTimeout
      expect(networkFormatted.details).toBeDefined();
      expect(networkFormatted.details?.isTimeout).toBe(true);
    });
    
    it('should omit sensitive context information', () => {
      const error = new AppError('Test error', {
        context: { password: '12345', userId: '123' },
        containsSensitiveInfo: true
      });
      
      const formatted = formatError(error);
      
      expect(formatted.context).toEqual({
        note: 'Context omitted for security reasons'
      });
    });
  });
  
  // For these tests, we'll spy on console methods
  // since we're not mocking the logger service
  describe('handleError', () => {
    it('should log and format errors', () => {
      const error = new AppError('Test error');
      const result = handleError(error, { userId: '123' });
      
      expect(console.error).toHaveBeenCalled();
      
      expect(result).toMatchObject({
        message: 'Test error',
        name: 'AppError',
        category: 'application'
      });
    });
    
    it('should normalize non-AppError errors', () => {
      const error = new Error('Standard error');
      handleError(error);
      
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('createErrorResponse', () => {
    it('should create SvelteKit-compatible error response', () => {
      const error = new ValidationError('Validation failed', {
        userMessage: 'Please check your input',
        statusCode: 400
      });
      
      const response = createErrorResponse(error);
      
      expect(console.error).toHaveBeenCalled();
      expect(response).toEqual({
        message: 'Please check your input',
        status: 400
      });
    });
    
    it('should add redirect option if provided', () => {
      const error = new AuthError('Authentication failed');
      const response = createErrorResponse(error, { redirect: '/login' });
      
      expect(response).toEqual({
        message: 'Authentication failed. Please try again.',
        status: 401,
        redirect: '/login'
      });
    });
  });
  
  describe('tryCatch', () => {
    it('should return operation result on success', async () => {
      const operation = async () => 'success';
      const result = await tryCatch(operation);
      
      expect(result).toBe('success');
      expect(console.error).not.toHaveBeenCalled();
    });
    
    it('should handle errors and return undefined', async () => {
      const operation = async () => {
        throw new Error('Test error');
      };
      
      const result = await tryCatch(operation);
      
      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });
    
    it('should call custom error handler if provided', async () => {
      const operation = async () => {
        throw new Error('Test error');
      };
      
      const errorHandler = vi.fn();
      await tryCatch(operation, errorHandler);
      
      expect(errorHandler).toHaveBeenCalledWith(expect.any(ApplicationError));
    });
  });
  
  describe('withErrorHandling', () => {
    it('should return success result on successful operation', async () => {
      const operation = async () => 'success';
      const handleOp = withErrorHandling(operation);
      
      const result = await handleOp();
      
      expect(result).toEqual({
        success: true,
        data: 'success'
      });
    });
    
    it('should return error result on failed operation', async () => {
      const error = new ValidationError('Invalid input');
      const operation = async () => {
        throw error;
      };
      
      const handleOp = withErrorHandling(operation);
      const result = await handleOp();
      
      expect(result).toEqual({
        success: false,
        error
      });
      expect(console.error).toHaveBeenCalled();
    });
    
    it('should pass arguments to the wrapped function', async () => {
      const operation = async (a: number, b: string) => `${a}-${b}`;
      const handleOp = withErrorHandling(operation);
      
      const result = await handleOp(42, 'test');
      
      expect(result).toEqual({
        success: true,
        data: '42-test'
      });
    });
  });
});