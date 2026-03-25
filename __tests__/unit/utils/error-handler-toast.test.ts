/**
 * src/lib/utils/error-handler-toast.test.ts
 * Test for error handler toast integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toastService } from '@xbg.solutions/frontend-core';
import { 
  showErrorToast, 
  showSuccessToast, 
  showWarningToast, 
  showInfoToast,
  withToastNotification
} from '@xbg.solutions/frontend-core';
import { AppError } from '@xbg.solutions/frontend-core';

// Mock the toast service
vi.mock('$lib/services/toast', () => ({
  toastService: {
    show: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// Mock the error handler
vi.mock('./error-handler', () => ({
  normalizeError: vi.fn((error) => {
    if (error instanceof Error) {
      return {
        message: error.message,
        userMessage: error.message,
        category: 'test'
      };
    }
    return {
      message: String(error),
      userMessage: String(error),
      category: 'test'
    };
  }),
  AppError: class AppError extends Error {
    category: string;
    userMessage?: string;
    
    constructor(message: string, options: any = {}) {
      super(message);
      this.name = 'AppError';
      this.category = options.category || 'test';
      this.userMessage = options.userMessage;
    }
  }
}));

describe('Error Handler Toast Integration', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should show error toast with error message', () => {
    // Arrange
    const error = new Error('Test error message');
    
    // Act
    showErrorToast(error);
    
    // Assert
    expect(toastService.error).toHaveBeenCalledTimes(1);
    expect(toastService.error).toHaveBeenCalledWith(
      'Test error message',
      expect.objectContaining({
        duration: 7000
      })
    );
  });
  
  it('should show error toast with custom options', () => {
    // Arrange
    const error = new Error('Test error message');
    const options = {
      title: 'Custom Error Title',
      duration: 10000,
      position: 'bottom-right' as 'bottom-right'
    };
    
    // Act
    showErrorToast(error, options);
    
    // Assert
    expect(toastService.error).toHaveBeenCalledTimes(1);
    expect(toastService.error).toHaveBeenCalledWith(
      'Test error message',
      expect.objectContaining(options)
    );
  });
  
  it('should show success toast with message', () => {
    // Arrange
    const message = 'Operation successful';
    
    // Act
    showSuccessToast(message);
    
    // Assert
    expect(toastService.success).toHaveBeenCalledTimes(1);
    expect(toastService.success).toHaveBeenCalledWith(
      message,
      expect.objectContaining({
        title: 'Success'
      })
    );
  });
  
  it('should show warning toast with message', () => {
    // Arrange
    const message = 'Warning message';
    
    // Act
    showWarningToast(message);
    
    // Assert
    expect(toastService.warning).toHaveBeenCalledTimes(1);
    expect(toastService.warning).toHaveBeenCalledWith(
      message,
      expect.objectContaining({
        title: 'Warning'
      })
    );
  });
  
  it('should show info toast with message', () => {
    // Arrange
    const message = 'Information message';
    
    // Act
    showInfoToast(message);
    
    // Assert
    expect(toastService.info).toHaveBeenCalledTimes(1);
    expect(toastService.info).toHaveBeenCalledWith(
      message,
      expect.objectContaining({
        title: 'Information'
      })
    );
  });
  
  it('should create a function that shows success toast on success', async () => {
    // Arrange
    const successMessage = 'Operation completed successfully';
    const operation = vi.fn().mockResolvedValue('result');
    const wrappedOperation = withToastNotification(operation, successMessage);
    
    // Act
    const result = await wrappedOperation();
    
    // Assert
    expect(operation).toHaveBeenCalledTimes(1);
    expect(toastService.success).toHaveBeenCalledTimes(1);
    expect(toastService.success).toHaveBeenCalledWith(
      successMessage,
      expect.anything()
    );
    expect(result).toBe('result');
  });
  
  it('should create a function that shows error toast on failure', async () => {
    // Arrange
    const error = new Error('Operation failed');
    const operation = vi.fn().mockRejectedValue(error);
    const wrappedOperation = withToastNotification(operation, 'Success message');
    
    // Act
    const result = await wrappedOperation();
    
    // Assert
    expect(operation).toHaveBeenCalledTimes(1);
    expect(toastService.error).toHaveBeenCalledTimes(1);
    expect(toastService.success).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
  
  it('should pass arguments to the original function', async () => {
    // Arrange
    const operation = vi.fn().mockResolvedValue('result');
    const wrappedOperation = withToastNotification(operation, 'Success');
    const arg1 = 'test';
    const arg2 = { key: 'value' };
    
    // Act
    await wrappedOperation(arg1, arg2);
    
    // Assert
    expect(operation).toHaveBeenCalledWith(arg1, arg2);
  });
});