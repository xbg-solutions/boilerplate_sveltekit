/**
 * API Response Caching Service
 * 
 * Provides intelligent caching for API responses with support for
 * different caching strategies and automatic cache invalidation.
 */

import { cacheService, type CacheOptions } from './cache.service';
import { loggerService } from '../logging/logging.service';

export interface APIResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  cached?: boolean;
  cacheTimestamp?: number;
}

export interface APICacheOptions extends Omit<CacheOptions, 'storage'> {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  strategy?: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
  staleWhileRevalidate?: boolean;
  storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  keyPrefix?: string;
}

class APICacheService {
  private logger = loggerService.withContext('APICacheService');

  /**
   * Generate cache key for request
   */
  private generateCacheKey(url: string, options: APICacheOptions): string {
    const key = `${options.keyPrefix || 'api'}:${options.method || 'GET'}:${url}`;
    
    // Include body and relevant headers in key for uniqueness
    if (options.body) {
      const bodyKey = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body);
      return `${key}:${btoa(bodyKey).substring(0, 16)}`;
    }

    return key;
  }

  /**
   * Check if response should be cached
   */
  private shouldCache(response: Response, options: APICacheOptions): boolean {
    // Don't cache errors by default
    if (!response.ok) {
      return false;
    }

    // Don't cache non-GET requests by default
    const method = options.method?.toUpperCase() || 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
      return false;
    }

    // Check cache-control headers
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl?.includes('no-cache') || cacheControl?.includes('no-store')) {
      return false;
    }

    return true;
  }

  /**
   * Get TTL from response headers
   */
  private getTTLFromHeaders(response: Response, defaultTTL: number = 5 * 60 * 1000): number {
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl) {
      const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        return parseInt(maxAgeMatch[1]) * 1000; // Convert seconds to milliseconds
      }
    }

    const expires = response.headers.get('expires');
    if (expires) {
      const expiresTime = new Date(expires).getTime();
      const now = Date.now();
      if (expiresTime > now) {
        return expiresTime - now;
      }
    }

    return defaultTTL;
  }

  /**
   * Create response object from Response
   */
  private async createAPIResponse<T>(
    response: Response, 
    cached: boolean = false, 
    cacheTimestamp?: number
  ): Promise<APIResponse<T>> {
    const data = await response.json() as T;
    const headers: Record<string, string> = {};
    
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers,
      cached,
      cacheTimestamp
    };
  }

  /**
   * Fetch with caching
   */
  async fetch<T = any>(url: string, options: APICacheOptions = {}): Promise<APIResponse<T>> {
    const cacheKey = this.generateCacheKey(url, options);
    const strategy = options.strategy || 'cache-first';
    const storage = options.storage || 'memory';

    // Cache-only strategy
    if (strategy === 'cache-only') {
      const cached = await cacheService.get<APIResponse<T>>(cacheKey, storage);
      if (cached) {
        this.logger.debug('Cache hit (cache-only)', { url, cacheKey });
        return { ...cached, cached: true };
      }
      throw new Error(`No cached response for ${url}`);
    }

    // Network-only strategy
    if (strategy === 'network-only') {
      return this.fetchFromNetwork<T>(url, options);
    }

    // Cache-first strategy
    if (strategy === 'cache-first') {
      const cached = await cacheService.get<APIResponse<T>>(cacheKey, storage);
      if (cached) {
        this.logger.debug('Cache hit (cache-first)', { url, cacheKey });
        
        // Stale while revalidate
        if (options.staleWhileRevalidate) {
          this.fetchFromNetwork<T>(url, options).then(response => {
            this.cacheResponse(cacheKey, response, options);
          }).catch(error => {
            this.logger.warn('Background revalidation failed', error);
          });
        }
        
        return { ...cached, cached: true };
      }
      
      this.logger.debug('Cache miss (cache-first)', { url, cacheKey });
      const response = await this.fetchFromNetwork<T>(url, options);
      await this.cacheResponse(cacheKey, response, options);
      return response;
    }

    // Network-first strategy
    if (strategy === 'network-first') {
      try {
        const response = await this.fetchFromNetwork<T>(url, options);
        await this.cacheResponse(cacheKey, response, options);
        return response;
      } catch (error) {
        this.logger.warn('Network request failed, falling back to cache', {
          error: error instanceof Error ? error.message : String(error)
        });
        
        const cached = await cacheService.get<APIResponse<T>>(cacheKey, storage);
        if (cached) {
          this.logger.debug('Cache hit (network-first fallback)', { url, cacheKey });
          return { ...cached, cached: true };
        }
        
        throw error;
      }
    }

    throw new Error(`Unknown cache strategy: ${strategy}`);
  }

  /**
   * Fetch from network
   */
  private async fetchFromNetwork<T>(url: string, options: APICacheOptions): Promise<APIResponse<T>> {
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body
    };

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return this.createAPIResponse<T>(response);
  }

  /**
   * Cache response if appropriate
   */
  private async cacheResponse<T>(
    cacheKey: string, 
    response: APIResponse<T>, 
    options: APICacheOptions
  ): Promise<void> {
    const mockResponse = new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });

    if (!this.shouldCache(mockResponse, options)) {
      return;
    }

    const ttl = options.ttl || this.getTTLFromHeaders(mockResponse);
    const cacheOptions: CacheOptions = {
      ttl,
      tags: options.tags,
      storage: options.storage || 'memory'
    };

    await cacheService.set(cacheKey, response, cacheOptions);
    
    this.logger.debug('Response cached', { 
      cacheKey, 
      ttl, 
      storage: cacheOptions.storage 
    });
  }

  /**
   * Invalidate cache for URL pattern
   */
  async invalidate(urlPattern: string, options: Partial<APICacheOptions> = {}): Promise<void> {
    const storage = options.storage || 'memory';
    const keyPrefix = options.keyPrefix || 'api';
    
    // Simple pattern matching - could be enhanced with regex
    const pattern = `${keyPrefix}:${options.method || 'GET'}:${urlPattern}`;
    
    if (pattern.includes('*')) {
      // Wildcard invalidation
      await this.invalidateByPattern(pattern, storage);
    } else {
      // Exact match invalidation
      await cacheService.delete(pattern, storage);
    }
  }

  /**
   * Invalidate by URL pattern with wildcards
   */
  private async invalidateByPattern(pattern: string, storage: string): Promise<void> {
    // Convert pattern to regex
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    
    // This is a simplified implementation
    // In a production system, you might want to use tags for more efficient invalidation
    const allKeys = await cacheService.getStorage(storage)?.keys() || [];
    const matchingKeys = allKeys.filter(key => regex.test(key));
    
    await Promise.all(
      matchingKeys.map(key => cacheService.delete(key, storage))
    );
    
    this.logger.info(`Invalidated ${matchingKeys.length} cached responses`, { pattern, storage });
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[], storage: string = 'memory'): Promise<void> {
    await cacheService.invalidateByTags(tags, storage);
    this.logger.info('Invalidated cache by tags', { tags, storage });
  }

  /**
   * Prefetch and cache API responses
   */
  async prefetch<T = any>(urls: string[], options: APICacheOptions = {}): Promise<void> {
    const prefetchOptions = {
      ...options,
      strategy: 'network-first' as const
    };

    const promises = urls.map(url => 
      this.fetch<T>(url, prefetchOptions).catch(error => {
        this.logger.warn(`Prefetch failed for ${url}`, error);
      })
    );

    await Promise.allSettled(promises);
    this.logger.info(`Prefetched ${urls.length} URLs`);
  }

  /**
   * Warmup cache with common requests
   */
  async warmup(requests: Array<{ url: string; options?: APICacheOptions }>): Promise<void> {
    const promises = requests.map(({ url, options = {} }) =>
      this.fetch(url, { ...options, strategy: 'network-first' }).catch(error => {
        this.logger.warn(`Warmup failed for ${url}`, error);
      })
    );

    await Promise.allSettled(promises);
    this.logger.info(`Warmed up cache with ${requests.length} requests`);
  }

  /**
   * GET request with caching
   */
  async get<T = any>(url: string, options: Omit<APICacheOptions, 'method'> = {}): Promise<APIResponse<T>> {
    return this.fetch<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST request (typically not cached)
   */
  async post<T = any>(url: string, body?: any, options: Omit<APICacheOptions, 'method' | 'body'> = {}): Promise<APIResponse<T>> {
    return this.fetch<T>(url, { 
      ...options, 
      method: 'POST', 
      body: typeof body === 'string' ? body : JSON.stringify(body),
      strategy: 'network-only' // POST requests shouldn't be cached by default
    });
  }

  /**
   * PUT request with cache invalidation
   */
  async put<T = any>(url: string, body?: any, options: Omit<APICacheOptions, 'method' | 'body'> = {}): Promise<APIResponse<T>> {
    const response = await this.fetch<T>(url, {
      ...options,
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      strategy: 'network-only'
    });

    // Invalidate related cache entries
    await this.invalidate(url.split('?')[0] + '*', options);
    
    return response;
  }

  /**
   * DELETE request with cache invalidation
   */
  async delete<T = any>(url: string, options: Omit<APICacheOptions, 'method'> = {}): Promise<APIResponse<T>> {
    const response = await this.fetch<T>(url, {
      ...options,
      method: 'DELETE',
      strategy: 'network-only'
    });

    // Invalidate related cache entries
    await this.invalidate(url.split('?')[0] + '*', options);
    
    return response;
  }
}

// Export singleton instance
export const apiCacheService = new APICacheService();