/**
 * Caching Service
 * 
 * Provides multiple levels of caching: memory, localStorage, sessionStorage,
 * and IndexedDB for different use cases and data sizes.
 */

import { writable, type Writable } from 'svelte/store';
import { loggerService } from '../logging/logging.service';

export interface CacheItem<T = any> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
  tags?: string[];
  size?: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[];
  storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  compress?: boolean;
  maxSize?: number; // Maximum size in bytes (for large items)
}

export interface CacheStats {
  hitCount: number;
  missCount: number;
  hitRate: number;
  itemCount: number;
  totalSize: number;
  evictedCount: number;
}

/**
 * Cache storage interface
 */
interface CacheStorage {
  get<T>(key: string): Promise<CacheItem<T> | null>;
  set<T>(key: string, item: CacheItem<T>): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}

/**
 * Memory cache storage
 */
class MemoryCacheStorage implements CacheStorage {
  private cache = new Map<string, CacheItem>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  async get<T>(key: string): Promise<CacheItem<T> | null> {
    const item = this.cache.get(key);
    return item ? (item as CacheItem<T>) : null;
  }

  async set<T>(key: string, item: CacheItem<T>): Promise<void> {
    // Implement LRU eviction
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, item);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async size(): Promise<number> {
    return this.cache.size;
  }
}

/**
 * LocalStorage cache storage
 */
class LocalStorageCacheStorage implements CacheStorage {
  protected prefix = 'cache:';

  async get<T>(key: string): Promise<CacheItem<T> | null> {
    if (typeof window === 'undefined') return null;
    
    try {
      const value = localStorage.getItem(this.prefix + key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, item: CacheItem<T>): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && error.code === 22) {
        await this.cleanup();
        try {
          localStorage.setItem(this.prefix + key, JSON.stringify(item));
        } catch {
          // Still can't save, give up
        }
      }
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const keys = await this.keys();
    keys.forEach(key => localStorage.removeItem(this.prefix + key));
  }

  async keys(): Promise<string[]> {
    if (typeof window === 'undefined') return [];
    
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }

  async size(): Promise<number> {
    return (await this.keys()).length;
  }

  protected async cleanup(): Promise<void> {
    const keys = await this.keys();
    const items: Array<{ key: string; item: CacheItem }> = [];
    
    // Get all items with their expiration times
    for (const key of keys) {
      const item = await this.get(key);
      if (item) {
        items.push({ key, item });
      }
    }
    
    // Sort by expiration time (oldest first)
    items.sort((a, b) => a.item.expiresAt - b.item.expiresAt);
    
    // Remove oldest 25% of items
    const removeCount = Math.ceil(items.length * 0.25);
    for (let i = 0; i < removeCount; i++) {
      await this.delete(items[i].key);
    }
  }
}

/**
 * SessionStorage cache storage
 */
class SessionStorageCacheStorage extends LocalStorageCacheStorage {
  protected prefix = 'session_cache:';

  async get<T>(key: string): Promise<CacheItem<T> | null> {
    if (typeof window === 'undefined') return null;
    
    try {
      const value = sessionStorage.getItem(this.prefix + key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, item: CacheItem<T>): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        await this.cleanup();
        try {
          sessionStorage.setItem(this.prefix + key, JSON.stringify(item));
        } catch {
          // Still can't save
        }
      }
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(this.prefix + key);
  }

  async keys(): Promise<string[]> {
    if (typeof window === 'undefined') return [];
    
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }
}

/**
 * IndexedDB cache storage for large data
 */
class IndexedDBCacheStorage implements CacheStorage {
  private dbName = 'CacheDB';
  private version = 1;
  private storeName = 'cache';
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('expiresAt', 'expiresAt');
          store.createIndex('tags', 'tags', { multiEntry: true });
        }
      };
    });
  }

  async get<T>(key: string): Promise<CacheItem<T> | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch {
      return null;
    }
  }

  async set<T>(key: string, item: CacheItem<T>): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.put(item);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw new Error(`Failed to set cache item: ${error}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw new Error(`Failed to delete cache item: ${error}`);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      throw new Error(`Failed to clear cache: ${error}`);
    }
  }

  async keys(): Promise<string[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const keys: string[] = [];
        const request = store.openCursor();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            keys.push(cursor.value.key);
            cursor.continue();
          } else {
            resolve(keys);
          }
        };
      });
    } catch {
      return [];
    }
  }

  async size(): Promise<number> {
    return (await this.keys()).length;
  }
}

/**
 * Main cache service
 */
class CacheService {
  private storages: Map<string, CacheStorage> = new Map();
  private stats: Writable<CacheStats> = writable({
    hitCount: 0,
    missCount: 0,
    hitRate: 0,
    itemCount: 0,
    totalSize: 0,
    evictedCount: 0
  });
  private logger = loggerService.withContext('CacheService');

  constructor() {
    this.storages.set('memory', new MemoryCacheStorage());
    this.storages.set('localStorage', new LocalStorageCacheStorage());
    this.storages.set('sessionStorage', new SessionStorageCacheStorage());
    this.storages.set('indexedDB', new IndexedDBCacheStorage());

    // Clean expired items periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanupExpired(), 5 * 60 * 1000); // Every 5 minutes
    }
  }

  /**
   * Get the underlying storage backend by name (used for advanced operations
   * like pattern-based invalidation).
   */
  getStorage(storage: string): CacheStorage | undefined {
    return this.storages.get(storage);
  }

  /**
   * Get item from cache
   */
  async get<T = any>(key: string, storage: string = 'memory'): Promise<T | null> {
    const store = this.storages.get(storage);
    if (!store) {
      this.logger.warn(`Storage ${storage} not found`);
      return null;
    }

    try {
      const item = await store.get<T>(key);
      
      if (!item) {
        this.updateStats('miss');
        return null;
      }

      // Check if expired
      if (Date.now() > item.expiresAt) {
        await store.delete(key);
        this.updateStats('miss');
        return null;
      }

      this.updateStats('hit');
      return item.value;
    } catch (error) {
      this.logger.error(`Failed to get cache item: ${key}`, error instanceof Error ? error : undefined);
      this.updateStats('miss');
      return null;
    }
  }

  /**
   * Set item in cache
   */
  async set<T = any>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const storage = options.storage || 'memory';
    const store = this.storages.get(storage);
    
    if (!store) {
      this.logger.warn(`Storage ${storage} not found`);
      return;
    }

    const now = Date.now();
    const ttl = options.ttl || (60 * 60 * 1000); // Default 1 hour
    
    const item: CacheItem<T> = {
      key,
      value,
      expiresAt: now + ttl,
      createdAt: now,
      tags: options.tags,
      size: this.estimateSize(value)
    };

    try {
      await store.set(key, item);
      this.logger.debug(`Cached item: ${key}`, { storage, ttl, size: item.size });
    } catch (error) {
      this.logger.error(`Failed to set cache item: ${key}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Delete item from cache
   */
  async delete(key: string, storage: string = 'memory'): Promise<void> {
    const store = this.storages.get(storage);
    if (!store) return;

    try {
      await store.delete(key);
      this.logger.debug(`Deleted cache item: ${key}`, { storage });
    } catch (error) {
      this.logger.error(`Failed to delete cache item: ${key}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Clear all items from cache
   */
  async clear(storage: string = 'memory'): Promise<void> {
    const store = this.storages.get(storage);
    if (!store) return;

    try {
      await store.clear();
      this.logger.info(`Cleared cache storage: ${storage}`);
    } catch (error) {
      this.logger.error(`Failed to clear cache: ${storage}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get or set cached value
   */
  async getOrSet<T = any>(
    key: string, 
    factory: () => Promise<T> | T, 
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options.storage);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[], storage: string = 'memory'): Promise<void> {
    const store = this.storages.get(storage);
    if (!store) return;

    try {
      const keys = await store.keys();
      const toDelete: string[] = [];

      for (const key of keys) {
        const item = await store.get(key);
        if (item?.tags && item.tags.some(tag => tags.includes(tag))) {
          toDelete.push(key);
        }
      }

      await Promise.all(toDelete.map(key => store.delete(key)));
      
      this.logger.info(`Invalidated ${toDelete.length} items by tags`, { tags, storage });
    } catch (error) {
      this.logger.error(`Failed to invalidate by tags`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Clean up expired items
   */
  async cleanupExpired(): Promise<void> {
    const now = Date.now();
    let totalCleaned = 0;

    for (const [storageName, store] of this.storages) {
      try {
        const keys = await store.keys();
        const toDelete: string[] = [];

        for (const key of keys) {
          const item = await store.get(key);
          if (item && now > item.expiresAt) {
            toDelete.push(key);
          }
        }

        await Promise.all(toDelete.map(key => store.delete(key)));
        totalCleaned += toDelete.length;
      } catch (error) {
        this.logger.error(`Failed to cleanup expired items in ${storageName}`, error instanceof Error ? error : undefined);
      }
    }

    if (totalCleaned > 0) {
      this.logger.info(`Cleaned up ${totalCleaned} expired cache items`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): Writable<CacheStats> {
    return this.stats;
  }

  /**
   * Estimate object size in bytes
   */
  private estimateSize(value: any): number {
    const str = JSON.stringify(value);
    return new Blob([str]).size;
  }

  /**
   * Update cache statistics
   */
  private updateStats(type: 'hit' | 'miss'): void {
    this.stats.update(stats => {
      if (type === 'hit') {
        stats.hitCount++;
      } else {
        stats.missCount++;
      }
      
      const total = stats.hitCount + stats.missCount;
      stats.hitRate = total > 0 ? (stats.hitCount / total) * 100 : 0;
      
      return stats;
    });
  }
}

// Export singleton instance
export const cacheService = new CacheService();