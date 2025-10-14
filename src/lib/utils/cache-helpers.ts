/**
 * Cache Helper Utilities
 * 
 * Simple wrappers and helpers for common caching operations
 */

import { cacheService, apiCacheService, type CacheOptions, type APICacheOptions } from '$lib/services/caching';

/**
 * Simple memoization decorator for functions
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: CacheOptions & { keyFn?: (...args: Parameters<T>) => string } = {}
): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = options.keyFn ? options.keyFn(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    
    // Handle promises
    if (result instanceof Promise) {
      result.catch(() => {
        cache.delete(key); // Remove failed promises from cache
      });
    }
    
    cache.set(key, result);
    
    // Auto-expire based on TTL
    if (options.ttl) {
      setTimeout(() => cache.delete(key), options.ttl);
    }
    
    return result;
  }) as T;
}

/**
 * Async memoization with persistent cache
 */
export function asyncMemo<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions & { keyFn?: (...args: Parameters<T>) => string } = {}
): T {
  return (async (...args: Parameters<T>) => {
    const key = options.keyFn 
      ? `asyncmemo:${options.keyFn(...args)}`
      : `asyncmemo:${JSON.stringify(args)}`;
    
    const cached = await cacheService.get(key, options.storage);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const result = await fn(...args);
      await cacheService.set(key, result, options);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  }) as T;
}

/**
 * Create a cached version of fetch
 */
export function createCachedFetch(defaultOptions: APICacheOptions = {}) {
  return async <T = any>(url: string, options: APICacheOptions = {}): Promise<T> => {
    const mergedOptions = { ...defaultOptions, ...options };
    const response = await apiCacheService.fetch<T>(url, mergedOptions);
    return response.data;
  };
}

/**
 * Cache decorator for class methods
 */
export function cached(options: CacheOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      const cached = await cacheService.get(key, options.storage);
      if (cached !== null) {
        return cached;
      }
      
      const result = await method.apply(this, args);
      await cacheService.set(key, result, options);
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Simple cache wrapper for API endpoints
 */
export class APICache {
  constructor(
    private baseURL: string = '',
    private defaultOptions: APICacheOptions = {}
  ) {}

  /**
   * GET request with caching
   */
  async get<T = any>(endpoint: string, options: APICacheOptions = {}): Promise<T> {
    const url = this.baseURL + endpoint;
    const response = await apiCacheService.get<T>(url, {
      ...this.defaultOptions,
      ...options
    });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, options: APICacheOptions = {}): Promise<T> {
    const url = this.baseURL + endpoint;
    const response = await apiCacheService.post<T>(url, data, {
      ...this.defaultOptions,
      ...options
    });
    return response.data;
  }

  /**
   * PUT request with cache invalidation
   */
  async put<T = any>(endpoint: string, data?: any, options: APICacheOptions = {}): Promise<T> {
    const url = this.baseURL + endpoint;
    const response = await apiCacheService.put<T>(url, data, {
      ...this.defaultOptions,
      ...options
    });
    return response.data;
  }

  /**
   * DELETE request with cache invalidation
   */
  async delete<T = any>(endpoint: string, options: APICacheOptions = {}): Promise<T> {
    const url = this.baseURL + endpoint;
    const response = await apiCacheService.delete<T>(url, {
      ...this.defaultOptions,
      ...options
    });
    return response.data;
  }

  /**
   * Invalidate cache for endpoint pattern
   */
  async invalidate(pattern: string, options?: Partial<APICacheOptions>): Promise<void> {
    await apiCacheService.invalidate(this.baseURL + pattern, {
      ...this.defaultOptions,
      ...options
    });
  }

  /**
   * Prefetch endpoints
   */
  async prefetch(endpoints: string[], options: APICacheOptions = {}): Promise<void> {
    const urls = endpoints.map(endpoint => this.baseURL + endpoint);
    await apiCacheService.prefetch(urls, {
      ...this.defaultOptions,
      ...options
    });
  }
}

/**
 * User-specific cache utilities
 */
export class UserCache {
  constructor(private userId: string) {}

  private getKey(key: string): string {
    return `user:${this.userId}:${key}`;
  }

  async get<T>(key: string, storage?: string): Promise<T | null> {
    return cacheService.get<T>(this.getKey(key), storage);
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    return cacheService.set(this.getKey(key), value, {
      ...options,
      tags: [...(options.tags || []), `user:${this.userId}`]
    });
  }

  async delete(key: string, storage?: string): Promise<void> {
    return cacheService.delete(this.getKey(key), storage);
  }

  async clear(storage?: string): Promise<void> {
    await cacheService.invalidateByTags([`user:${this.userId}`], storage);
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> {
    return cacheService.getOrSet(this.getKey(key), factory, {
      ...options,
      tags: [...(options.tags || []), `user:${this.userId}`]
    });
  }
}

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  private warmupTasks: Array<{
    name: string;
    priority: number;
    task: () => Promise<void>;
  }> = [];

  /**
   * Add warmup task
   */
  addTask(name: string, task: () => Promise<void>, priority: number = 0): void {
    this.warmupTasks.push({ name, task, priority });
    // Sort by priority (higher first)
    this.warmupTasks.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Execute all warmup tasks
   */
  async warmup(concurrency: number = 3): Promise<void> {
    // Execute tasks in chunks based on concurrency
    for (let i = 0; i < this.warmupTasks.length; i += concurrency) {
      const chunk = this.warmupTasks.slice(i, i + concurrency);
      
      await Promise.allSettled(
        chunk.map(async ({ name, task }) => {
          try {
            await task();
            console.debug(`Cache warmup completed: ${name}`);
          } catch (error) {
            console.warn(`Cache warmup failed: ${name}`, error);
          }
        })
      );
    }
  }

  /**
   * Create common warmup tasks
   */
  static createCommonTasks(apiCache: APICache): CacheWarmer {
    const warmer = new CacheWarmer();
    
    // High priority - critical data
    warmer.addTask('user-profile', async () => {
      await apiCache.get('/user/profile');
    }, 100);
    
    warmer.addTask('app-config', async () => {
      await apiCache.get('/config');
    }, 90);
    
    // Medium priority - frequently accessed
    warmer.addTask('navigation', async () => {
      await apiCache.get('/navigation');
    }, 50);
    
    // Low priority - nice to have
    warmer.addTask('recent-activity', async () => {
      await apiCache.get('/activity/recent');
    }, 10);
    
    return warmer;
  }
}

/**
 * Cache performance monitoring
 */
export class CacheMonitor {
  private static instance: CacheMonitor;
  private stats = {
    hits: 0,
    misses: 0,
    errors: 0,
    avgResponseTime: 0,
    totalRequests: 0
  };

  static getInstance(): CacheMonitor {
    if (!CacheMonitor.instance) {
      CacheMonitor.instance = new CacheMonitor();
    }
    return CacheMonitor.instance;
  }

  recordHit(responseTime: number): void {
    this.stats.hits++;
    this.stats.totalRequests++;
    this.updateAvgResponseTime(responseTime);
  }

  recordMiss(responseTime: number): void {
    this.stats.misses++;
    this.stats.totalRequests++;
    this.updateAvgResponseTime(responseTime);
  }

  recordError(): void {
    this.stats.errors++;
  }

  private updateAvgResponseTime(responseTime: number): void {
    this.stats.avgResponseTime = 
      (this.stats.avgResponseTime * (this.stats.totalRequests - 1) + responseTime) / 
      this.stats.totalRequests;
  }

  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.totalRequests > 0 
        ? (this.stats.hits / this.stats.totalRequests) * 100 
        : 0,
      errorRate: this.stats.totalRequests > 0 
        ? (this.stats.errors / this.stats.totalRequests) * 100 
        : 0
    };
  }

  reset(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      avgResponseTime: 0,
      totalRequests: 0
    };
  }
}