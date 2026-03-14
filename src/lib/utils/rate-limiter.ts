/**
 * src/lib/utils/rate-limiter.ts
 * Client-Side Rate Limiting Utilities
 *
 * IMPORTANT: This is CLIENT-SIDE rate limiting only.
 * For production security, implement server-side rate limiting in your API backend.
 *
 * These utilities provide:
 * - User experience improvements (prevent accidental double-clicks, spam)
 * - Client-side request throttling
 * - Feedback to users about rate limits
 *
 * They DO NOT provide security against:
 * - Malicious actors (can bypass client-side limits)
 * - DDoS attacks (need server-side protection)
 * - API abuse (need backend rate limiting)
 */

import { loggerService } from '../services/logging/logging.service';

const rateLimiterLogger = loggerService.withContext('RateLimiter');

/**
 * Configuration for rate limiting
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Key to identify this rate limiter (for storage) */
  key: string;
  /** Callback when rate limit is exceeded */
  onLimitExceeded?: (retryAfter: number) => void;
}

/**
 * Rate limit state stored in memory
 */
interface RateLimitState {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limit storage
 */
const rateLimitStore = new Map<string, RateLimitState>();

/**
 * Check if an action is rate limited
 *
 * @param config Rate limit configuration
 * @returns Object with allowed status and retry information
 */
export function checkRateLimit(config: RateLimitConfig): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const state = rateLimitStore.get(config.key);

  // No previous state or window has expired
  if (!state || now >= state.resetAt) {
    const newState: RateLimitState = {
      count: 1,
      resetAt: now + config.windowMs
    };
    rateLimitStore.set(config.key, newState);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newState.resetAt
    };
  }

  // Within the rate limit window
  if (state.count < config.maxRequests) {
    state.count++;
    rateLimitStore.set(config.key, state);

    return {
      allowed: true,
      remaining: config.maxRequests - state.count,
      resetAt: state.resetAt
    };
  }

  // Rate limit exceeded
  const retryAfter = state.resetAt - now;

  rateLimiterLogger.warn('Rate limit exceeded', {
    key: config.key,
    count: state.count,
    maxRequests: config.maxRequests,
    retryAfter
  });

  if (config.onLimitExceeded) {
    config.onLimitExceeded(retryAfter);
  }

  return {
    allowed: false,
    remaining: 0,
    resetAt: state.resetAt,
    retryAfter
  };
}

/**
 * Decorator for rate-limited functions
 *
 * @param config Rate limit configuration
 * @returns Decorator function
 */
export function rateLimit<T extends (...args: any[]) => any>(
  config: Omit<RateLimitConfig, 'key'>
): (target: T) => T {
  return (target: T): T => {
    // Generate a unique key for this function
    const key = config.key || `fn_${target.name || 'anonymous'}_${Math.random().toString(36).slice(2)}`;

    const wrapper = function (this: any, ...args: any[]) {
      const limitConfig: RateLimitConfig = {
        ...config,
        key
      };

      const result = checkRateLimit(limitConfig);

      if (!result.allowed) {
        throw new Error(`Rate limit exceeded. Retry after ${Math.ceil(result.retryAfter! / 1000)} seconds.`);
      }

      return target.apply(this, args);
    };

    return wrapper as T;
  };
}

/**
 * Throttle function - ensures a function is only called once per interval
 *
 * @param fn Function to throttle
 * @param intervalMs Minimum interval between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  intervalMs: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= intervalMs) {
      lastCall = now;
      return fn.apply(this, args);
    }

    // Clear any pending timeout
    if (timeout) {
      clearTimeout(timeout);
    }

    // Schedule the call for the end of the interval
    timeout = setTimeout(() => {
      lastCall = Date.now();
      fn.apply(this, args);
      timeout = null;
    }, intervalMs - timeSinceLastCall);

    return undefined;
  };
}

/**
 * Debounce function - delays execution until after a period of inactivity
 *
 * @param fn Function to debounce
 * @param delayMs Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn.apply(this, args);
      timeout = null;
    }, delayMs);
  };
}

/**
 * Action-specific rate limiters
 */

/**
 * Rate limiter for form submissions
 */
export function createFormSubmitLimiter(formId: string) {
  return {
    check: () => checkRateLimit({
      key: `form_submit_${formId}`,
      maxRequests: 5, // 5 submissions
      windowMs: 60 * 1000, // per minute
      onLimitExceeded: (retryAfter) => {
        rateLimiterLogger.warn('Form submission rate limit exceeded', {
          formId,
          retryAfter
        });
      }
    })
  };
}

/**
 * Rate limiter for API requests
 */
export function createApiRequestLimiter(endpoint: string) {
  return {
    check: () => checkRateLimit({
      key: `api_request_${endpoint}`,
      maxRequests: 100, // 100 requests
      windowMs: 15 * 60 * 1000, // per 15 minutes
      onLimitExceeded: (retryAfter) => {
        rateLimiterLogger.warn('API request rate limit exceeded', {
          endpoint,
          retryAfter
        });
      }
    })
  };
}

/**
 * Rate limiter for authentication attempts
 */
export function createAuthLimiter(action: 'login' | 'register' | 'reset-password') {
  return {
    check: () => checkRateLimit({
      key: `auth_${action}`,
      maxRequests: 3, // 3 attempts
      windowMs: 5 * 60 * 1000, // per 5 minutes
      onLimitExceeded: (retryAfter) => {
        rateLimiterLogger.warn('Auth rate limit exceeded', {
          action,
          retryAfter
        });
      }
    })
  };
}

/**
 * Rate limiter for file uploads
 */
export function createFileUploadLimiter(userId: string) {
  return {
    check: () => checkRateLimit({
      key: `file_upload_${userId}`,
      maxRequests: 10, // 10 uploads
      windowMs: 60 * 60 * 1000, // per hour
      onLimitExceeded: (retryAfter) => {
        rateLimiterLogger.warn('File upload rate limit exceeded', {
          userId,
          retryAfter
        });
      }
    })
  };
}

/**
 * Clear all rate limit data (useful for testing or user logout)
 */
export function clearRateLimits(): void {
  rateLimitStore.clear();
  rateLimiterLogger.info('All rate limits cleared');
}

/**
 * Clear rate limit for a specific key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
  rateLimiterLogger.info('Rate limit cleared', { key });
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(key: string): {
  active: boolean;
  count?: number;
  resetAt?: number;
  remaining?: number;
} {
  const state = rateLimitStore.get(key);

  if (!state || Date.now() >= state.resetAt) {
    return { active: false };
  }

  return {
    active: true,
    count: state.count,
    resetAt: state.resetAt,
    remaining: Math.max(0, 100 - state.count) // Assuming default max of 100
  };
}
