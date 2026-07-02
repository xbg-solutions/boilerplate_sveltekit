/**
 * src/lib/utils/secure-storage.ts
 * Secure storage utility
 * 
 * A utility for storing and retrieving data with support for:
 * - Multiple storage mechanisms (cookies, localStorage, sessionStorage)
 * - Storage strategy selection based on data sensitivity
 * - Automatic data expiration
 * - Environment detection (browser vs SSR)
 * - Optional encryption for client-side storage (setItemAsync/getItemAsync)
 * - Integration with error handling
 *
 * SECURITY: despite the name, this is NOT a confidentiality boundary.
 * - The synchronous setItem/getItem path stores values as plaintext JSON;
 *   only the *Async variants apply encryption, and only when explicitly
 *   enabled via the `encryption` option.
 * - Even then, the passphrase must live in client-side code, so the
 *   encryption is obfuscation against casual inspection — anything stored
 *   here is readable by any script running on the page (e.g. via XSS).
 * - Cookies set here are never HttpOnly (impossible from client JS).
 * Do not treat this as protection for secrets; it provides namespacing,
 * TTLs, and tamper-evidence for low-sensitivity client state.
 */

import { loggerService } from '../services/logging/logging.service';
import { 
  ApplicationError, 
  handleError, 
  normalizeError, 
  tryCatch 
} from './error-handler';
import { STORAGE_DEFAULT_TTL, STORAGE_PREFIX } from '../constants/secure-storage.constants';
import type { 
  StorageOptions, 
  StorageMechanism, 
  StorageValue,
  StorageEncryption,
  StorageAdapter
} from '../types/storage.types';

// Create a context-aware logger
const storageLogger = loggerService.withContext('SecureStorage');

/**
 * Detects if running in browser environment
 * @returns True if in browser environment, false if in SSR
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Creates a storage key with proper prefix and namespace
 * @param key The base storage key
 * @param namespace Optional namespace to partition storage
 * @returns Prefixed and namespaced storage key
 */
function createStorageKey(key: string, namespace?: string): string {
  const prefix = STORAGE_PREFIX;
  return namespace 
    ? `${prefix}_${namespace}_${key}` 
    : `${prefix}_${key}`;
}

/**
 * Checks whether the Web Crypto API is available in the current environment.
 */
function isSubtleCryptoAvailable(): boolean {
  return typeof globalThis.crypto !== 'undefined'
    && typeof globalThis.crypto.subtle !== 'undefined';
}

/**
 * Derives an AES-GCM CryptoKey from a passphrase using PBKDF2.
 * Uses a fixed salt derived from the passphrase so the same passphrase
 * always produces the same key (no salt storage needed).
 */
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Use a deterministic salt derived from the passphrase so we don't
  // need to store a separate salt alongside the ciphertext.
  const salt = encoder.encode(`secure-storage-salt:${passphrase}`);

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a value using AES-GCM via the Web Crypto API.
 * Returns a base64-encoded string containing the 12-byte IV prepended to the ciphertext.
 * Falls back to base64 encoding when SubtleCrypto is unavailable (SSR).
 */
async function encryptValue(value: any, encryptionKey?: string): Promise<string> {
  try {
    const stringValue = JSON.stringify(value);

    if (!isSubtleCryptoAvailable() || !encryptionKey) {
      // Fallback: base64 encode (SSR / no key provided)
      return btoa(unescape(encodeURIComponent(stringValue)));
    }

    const key = await deriveKey(encryptionKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(stringValue);

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    // Prepend IV to ciphertext and base64-encode the whole thing
    const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuffer), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    throw new ApplicationError('Failed to encrypt value for storage', {
      cause: error instanceof Error ? error : new Error(String(error)),
      category: 'storage',
      context: { operation: 'encrypt' }
    });
  }
}

/**
 * Decrypts an AES-GCM encrypted value from storage.
 * Expects the base64-encoded string to contain a 12-byte IV prepended to the ciphertext.
 * Falls back to base64 decoding when SubtleCrypto is unavailable (SSR).
 */
async function decryptValue(encryptedValue: string, encryptionKey?: string): Promise<any> {
  try {
    if (!isSubtleCryptoAvailable() || !encryptionKey) {
      // Fallback: base64 decode
      const jsonString = decodeURIComponent(escape(atob(encryptedValue)));
      return JSON.parse(jsonString);
    }

    const combined = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const key = await deriveKey(encryptionKey);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const jsonString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(jsonString);
  } catch (error) {
    throw new ApplicationError('Failed to decrypt value from storage', {
      cause: error instanceof Error ? error : new Error(String(error)),
      category: 'storage',
      context: { operation: 'decrypt' }
    });
  }
}

/**
 * Prepares a value for storage with metadata
 * @param value The value to store
 * @param options Storage options
 * @returns Storage value with metadata
 */
function prepareValue(value: any, options: StorageOptions = {}): StorageValue {
  const { ttl = STORAGE_DEFAULT_TTL } = options;
  
  const expiresAt = ttl > 0 
    ? Date.now() + ttl * 1000 
    : 0; // 0 means no expiration
  
  return {
    value,
    createdAt: Date.now(),
    expiresAt,
    version: 1, // For potential future migrations
  };
}

/**
 * Checks if a stored value is expired
 * @param storageValue The storage value with metadata
 * @returns True if the value is expired
 */
function isExpired(storageValue: StorageValue): boolean {
  if (!storageValue.expiresAt || storageValue.expiresAt === 0) {
    return false; // No expiration set
  }
  
  return Date.now() > storageValue.expiresAt;
}

/**
 * Creates an adapter for localStorage
 * @returns Storage adapter for localStorage
 */
function localStorageAdapter(): StorageAdapter {
  return {
    get(key: string): string | null {
      if (!isBrowser()) return null;
      return localStorage.getItem(key);
    },
    
    set(key: string, value: string): boolean {
      if (!isBrowser()) return false;
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        storageLogger.error('LocalStorage set failed', error instanceof Error ? error : new Error(String(error)), {
          key,
          error: error instanceof Error ? error.message : String(error)
        });
        return false;
      }
    },
    
    remove(key: string): boolean {
      if (!isBrowser()) return false;
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        storageLogger.error('LocalStorage remove failed', error instanceof Error ? error : new Error(String(error)), {
          key
        });
        return false;
      }
    },
    
    clear(keyPrefix?: string): boolean {
      if (!isBrowser()) return false;
      try {
        if (keyPrefix) {
          // Only clear keys with the specified prefix
          Object.keys(localStorage)
            .filter(key => key.startsWith(keyPrefix))
            .forEach(key => localStorage.removeItem(key));
        } else {
          localStorage.clear();
        }
        return true;
      } catch (error) {
        storageLogger.error('LocalStorage clear failed', error instanceof Error ? error : new Error(String(error)));
        return false;
      }
    }
  };
}

/**
 * Creates an adapter for sessionStorage
 * @returns Storage adapter for sessionStorage
 */
function sessionStorageAdapter(): StorageAdapter {
  return {
    get(key: string): string | null {
      if (!isBrowser()) return null;
      return sessionStorage.getItem(key);
    },
    
    set(key: string, value: string): boolean {
      if (!isBrowser()) return false;
      try {
        sessionStorage.setItem(key, value);
        return true;
      } catch (error) {
        storageLogger.error('SessionStorage set failed', error instanceof Error ? error : new Error(String(error)), {
          key,
          error: error instanceof Error ? error.message : String(error)
        });
        return false;
      }
    },
    
    remove(key: string): boolean {
      if (!isBrowser()) return false;
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch (error) {
        storageLogger.error('SessionStorage remove failed', error instanceof Error ? error : new Error(String(error)), {
          key
        });
        return false;
      }
    },
    
    clear(keyPrefix?: string): boolean {
      if (!isBrowser()) return false;
      try {
        if (keyPrefix) {
          // Only clear keys with the specified prefix
          Object.keys(sessionStorage)
            .filter(key => key.startsWith(keyPrefix))
            .forEach(key => sessionStorage.removeItem(key));
        } else {
          sessionStorage.clear();
        }
        return true;
      } catch (error) {
        storageLogger.error('SessionStorage clear failed', error instanceof Error ? error : new Error(String(error)));
        return false;
      }
    }
  };
}

/**
 * Creates an adapter for cookies
 * @returns Storage adapter for cookies
 */
function cookieAdapter(): StorageAdapter {
  return {
    get(key: string): string | null {
      if (!isBrowser()) return null;
      
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(key + '=')) {
          return decodeURIComponent(cookie.substring(key.length + 1));
        }
      }
      return null;
    },
    
    set(key: string, value: string, options: { 
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
      path?: string;
      domain?: string;
      maxAge?: number;
    } = {}): boolean {
      if (!isBrowser()) return false;
      
      try {
        const { 
          secure = true, 
          sameSite = 'strict', 
          path = '/',
          domain,
          maxAge
        } = options;
        
        let cookieString = `${key}=${encodeURIComponent(value)}`;
        
        // Note: HttpOnly can only be set from the server, not client-side JavaScript
        // This is just for documentation purposes
        
        if (secure) cookieString += '; Secure';
        if (sameSite) cookieString += `; SameSite=${sameSite}`;
        if (path) cookieString += `; Path=${path}`;
        if (domain) cookieString += `; Domain=${domain}`;
        if (maxAge !== undefined) cookieString += `; Max-Age=${maxAge}`;
        
        document.cookie = cookieString;
        return true;
      } catch (error) {
        storageLogger.error('Cookie set failed', error instanceof Error ? error : new Error(String(error)), {
          key,
          error: error instanceof Error ? error.message : String(error)
        });
        return false;
      }
    },
    
    remove(key: string): boolean {
      if (!isBrowser()) return false;
      try {
        // Set expiration to past date to remove cookie
        document.cookie = `${key}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        return true;
      } catch (error) {
        storageLogger.error('Cookie remove failed', error instanceof Error ? error : new Error(String(error)), {
          key
        });
        return false;
      }
    },
    
    clear(keyPrefix?: string): boolean {
      if (!isBrowser()) return false;
      try {
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          const keyValue = cookie.split('=');
          const cookieKey = keyValue[0];
          
          if (!keyPrefix || cookieKey.startsWith(keyPrefix)) {
            document.cookie = `${cookieKey}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
          }
        }
        return true;
      } catch (error) {
        storageLogger.error('Cookie clear failed', error instanceof Error ? error : new Error(String(error)));
        return false;
      }
    }
  };
}

/**
 * Memory storage for SSR or fallback when other mechanisms fail
 */
const memoryStorage = new Map<string, string>();

/**
 * Creates an adapter for in-memory storage
 * @returns Storage adapter for in-memory storage
 */
function memoryStorageAdapter(): StorageAdapter {
  return {
    get(key: string): string | null {
      return memoryStorage.get(key) || null;
    },
    
    set(key: string, value: string): boolean {
      try {
        memoryStorage.set(key, value);
        return true;
      } catch (error) {
        storageLogger.error('Memory storage set failed', error instanceof Error ? error : new Error(String(error)), {
          key
        });
        return false;
      }
    },
    
    remove(key: string): boolean {
      try {
        memoryStorage.delete(key);
        return true;
      } catch (error) {
        storageLogger.error('Memory storage remove failed', error instanceof Error ? error : new Error(String(error)), {
          key
        });
        return false;
      }
    },
    
    clear(keyPrefix?: string): boolean {
      try {
        if (keyPrefix) {
          // Only clear keys with the specified prefix
          for (const key of memoryStorage.keys()) {
            if (key.startsWith(keyPrefix)) {
              memoryStorage.delete(key);
            }
          }
        } else {
          memoryStorage.clear();
        }
        return true;
      } catch (error) {
        storageLogger.error('Memory storage clear failed', error instanceof Error ? error : new Error(String(error)));
        return false;
      }
    }
  };
}

/**
 * Gets an adapter for the specified storage mechanism
 * @param mechanism Storage mechanism to use
 * @returns Appropriate storage adapter
 */
function getAdapter(mechanism: StorageMechanism): StorageAdapter {
  switch (mechanism) {
    case 'localStorage':
      return localStorageAdapter();
    case 'sessionStorage':
      return sessionStorageAdapter();
    case 'cookie':
      return cookieAdapter();
    case 'memory':
    default:
      return memoryStorageAdapter();
  }
}

/**
 * Secure storage utility implementation
 */
function createSecureStorage() {
  /**
   * Sets a value in secure storage (synchronous — uses async encryption internally
   * but falls back gracefully for sync callers via safeSet).
   * @param key Storage key
   * @param value Value to store
   * @param options Storage options
   * @returns True if storage was successful
   */
  const setItem = <T>(
    key: string,
    value: T,
    options: StorageOptions = {}
  ): boolean => {
    try {
      const {
        mechanism = 'localStorage',
        namespace,
        encryption = { enabled: false },
        ttl,
        cookieOptions
      } = options;

      // Prepare full storage key
      const storageKey = createStorageKey(key, namespace);

      // Prepare the value with metadata (expiration, etc.)
      const preparedValue = prepareValue(value, { ttl });

      // For sync path, only JSON-stringify (async encryption handled in setItemAsync)
      const stringifiedValue = JSON.stringify(preparedValue);

      // Get the appropriate adapter
      const adapter = getAdapter(mechanism);

      // For cookies, handle special options
      if (mechanism === 'cookie' && cookieOptions) {
        return adapter.set(storageKey, stringifiedValue, {
          secure: cookieOptions.secure,
          sameSite: cookieOptions.sameSite,
          path: cookieOptions.path,
          domain: cookieOptions.domain,
          maxAge: ttl
        });
      }

      // Store using the selected adapter
      return adapter.set(storageKey, stringifiedValue);
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to set storage item', {
        category: 'storage',
        context: { key, operation: 'setItem' }
      });

      storageLogger.error(
        `Storage set failed for key "${key}"`,
        normalizedError
      );

      return false;
    }
  };

  /**
   * Sets a value in secure storage with optional AES-GCM encryption.
   * @param key Storage key
   * @param value Value to store
   * @param options Storage options
   * @returns True if storage was successful
   */
  const setItemAsync = async <T>(
    key: string,
    value: T,
    options: StorageOptions = {}
  ): Promise<boolean> => {
    try {
      const {
        mechanism = 'localStorage',
        namespace,
        encryption = { enabled: false },
        ttl,
        cookieOptions
      } = options;

      const storageKey = createStorageKey(key, namespace);
      const preparedValue = prepareValue(value, { ttl });

      let stringifiedValue: string;

      if (encryption.enabled) {
        stringifiedValue = await encryptValue(preparedValue, encryption.key);
      } else {
        stringifiedValue = JSON.stringify(preparedValue);
      }

      const adapter = getAdapter(mechanism);

      if (mechanism === 'cookie' && cookieOptions) {
        return adapter.set(storageKey, stringifiedValue, {
          secure: cookieOptions.secure,
          sameSite: cookieOptions.sameSite,
          path: cookieOptions.path,
          domain: cookieOptions.domain,
          maxAge: ttl
        });
      }

      return adapter.set(storageKey, stringifiedValue);
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to set storage item', {
        category: 'storage',
        context: { key, operation: 'setItemAsync' }
      });

      storageLogger.error(`Storage set failed for key "${key}"`, normalizedError);
      return false;
    }
  };
  
  /**
   * Gets a value from secure storage (synchronous — no decryption support).
   * For encrypted values use getItemAsync instead.
   * @param key Storage key
   * @param options Storage options
   * @returns The stored value, or null if not found or expired
   */
  const getItem = <T>(
    key: string,
    options: StorageOptions = {}
  ): T | null => {
    try {
      const {
        mechanism = 'localStorage',
        namespace,
        fallbackMechanisms = []
      } = options;

      const storageKey = createStorageKey(key, namespace);

      const adapter = getAdapter(mechanism);
      let rawValue = adapter.get(storageKey);

      if (rawValue === null && fallbackMechanisms.length > 0) {
        for (const fallbackMechanism of fallbackMechanisms) {
          const fallbackAdapter = getAdapter(fallbackMechanism);
          rawValue = fallbackAdapter.get(storageKey);
          if (rawValue !== null) {
            storageLogger.info(`Retrieved value from fallback mechanism: ${fallbackMechanism}`, {
              key, primaryMechanism: mechanism, fallbackMechanism
            });
            break;
          }
        }
      }

      if (rawValue === null) return null;

      let storageValue: StorageValue;
      try {
        storageValue = JSON.parse(rawValue);
      } catch (error) {
        storageLogger.warn(`Failed to parse stored value for key "${key}"`, {
          key, error: error instanceof Error ? error.message : String(error)
        });
        adapter.remove(storageKey);
        return null;
      }

      if (isExpired(storageValue)) {
        storageLogger.info(`Expired value removed for key "${key}"`, {
          key, expiresAt: new Date(storageValue.expiresAt).toISOString()
        });
        adapter.remove(storageKey);
        return null;
      }

      return storageValue.value as T;
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to get storage item', {
        category: 'storage',
        context: { key, operation: 'getItem' }
      });
      storageLogger.error(`Storage get failed for key "${key}"`, normalizedError);
      return null;
    }
  };

  /**
   * Gets a value from secure storage with optional AES-GCM decryption.
   * @param key Storage key
   * @param options Storage options
   * @returns The stored value, or null if not found or expired
   */
  const getItemAsync = async <T>(
    key: string,
    options: StorageOptions = {}
  ): Promise<T | null> => {
    try {
      const {
        mechanism = 'localStorage',
        namespace,
        encryption = { enabled: false },
        fallbackMechanisms = []
      } = options;

      const storageKey = createStorageKey(key, namespace);
      const adapter = getAdapter(mechanism);
      let rawValue = adapter.get(storageKey);

      if (rawValue === null && fallbackMechanisms.length > 0) {
        for (const fallbackMechanism of fallbackMechanisms) {
          const fallbackAdapter = getAdapter(fallbackMechanism);
          rawValue = fallbackAdapter.get(storageKey);
          if (rawValue !== null) {
            storageLogger.info(`Retrieved value from fallback mechanism: ${fallbackMechanism}`, {
              key, primaryMechanism: mechanism, fallbackMechanism
            });
            break;
          }
        }
      }

      if (rawValue === null) return null;

      let storageValue: StorageValue;
      try {
        if (encryption.enabled) {
          storageValue = await decryptValue(rawValue, encryption.key);
        } else {
          storageValue = JSON.parse(rawValue);
        }
      } catch (error) {
        storageLogger.warn(`Failed to parse stored value for key "${key}"`, {
          key, error: error instanceof Error ? error.message : String(error)
        });
        adapter.remove(storageKey);
        return null;
      }

      if (isExpired(storageValue)) {
        storageLogger.info(`Expired value removed for key "${key}"`, {
          key, expiresAt: new Date(storageValue.expiresAt).toISOString()
        });
        adapter.remove(storageKey);
        return null;
      }

      return storageValue.value as T;
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to get storage item', {
        category: 'storage',
        context: { key, operation: 'getItemAsync' }
      });
      storageLogger.error(`Storage get failed for key "${key}"`, normalizedError);
      return null;
    }
  };
  
  /**
   * Removes an item from secure storage
   * @param key Storage key
   * @param options Storage options
   * @returns True if removal was successful
   */
  const removeItem = (
    key: string, 
    options: StorageOptions = {}
  ): boolean => {
    try {
      const {
        mechanism = 'localStorage',
        namespace,
        allMechanisms = false
      } = options;
      
      // Prepare full storage key
      const storageKey = createStorageKey(key, namespace);
      
      if (allMechanisms) {
        // Remove from all storage mechanisms
        let success = true;
        
        const mechanisms: StorageMechanism[] = ['localStorage', 'sessionStorage', 'cookie', 'memory'];
        
        for (const mech of mechanisms) {
          const adapter = getAdapter(mech);
          const result = adapter.remove(storageKey);
          
          // Track overall success
          success = success && result;
        }
        
        return success;
      } else {
        // Remove only from specified mechanism
        const adapter = getAdapter(mechanism);
        return adapter.remove(storageKey);
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to remove storage item', {
        category: 'storage',
        context: { key, operation: 'removeItem' }
      });
      
      storageLogger.error(
        `Storage remove failed for key "${key}"`, 
        normalizedError
      );
      
      return false;
    }
  };
  
  /**
   * Clears secure storage
   * @param options Storage options
   * @returns True if clear was successful
   */
  const clear = (options: {
    mechanism?: StorageMechanism;
    namespace?: string;
    allMechanisms?: boolean;
  } = {}): boolean => {
    try {
      const {
        mechanism = 'localStorage',
        namespace,
        allMechanisms = false
      } = options;
      
      // Prepare namespace prefix if needed
      const keyPrefix = namespace 
        ? `${STORAGE_PREFIX}_${namespace}_` 
        : STORAGE_PREFIX;
      
      if (allMechanisms) {
        // Clear all storage mechanisms
        let success = true;
        
        const mechanisms: StorageMechanism[] = ['localStorage', 'sessionStorage', 'cookie', 'memory'];
        
        for (const mech of mechanisms) {
          const adapter = getAdapter(mech);
          const result = adapter.clear(keyPrefix);
          
          // Track overall success
          success = success && result;
        }
        
        return success;
      } else {
        // Clear only specified mechanism
        const adapter = getAdapter(mechanism);
        return adapter.clear(keyPrefix);
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to clear storage', {
        category: 'storage',
        context: { operation: 'clear' }
      });
      
      storageLogger.error('Storage clear failed', normalizedError);
      
      return false;
    }
  };
  
  /**
   * Safely attempts to store a value and handles errors
   * @param key Storage key
   * @param value Value to store
   * @param options Storage options
   * @returns True if storage was successful
   */
  const safeSet = async <T>(
    key: string, 
    value: T, 
    options: StorageOptions = {}
  ): Promise<boolean> => {
    const timerLabel = `secureStorage_set_${key}`;
    const timerId = storageLogger.startTimer(timerLabel);
    
    try {
      const result = setItem(key, value, options);
      
      if (!result && options.fallbackMechanisms && options.fallbackMechanisms.length > 0) {
        // Try fallback mechanisms if primary fails
        for (const fallbackMechanism of options.fallbackMechanisms) {
          storageLogger.info(`Trying fallback mechanism for set: ${fallbackMechanism}`, {
            key,
            primaryMechanism: options.mechanism,
            fallbackMechanism
          });
          
          const fallbackResult = setItem(key, value, {
            ...options,
            mechanism: fallbackMechanism
          });
          
          if (fallbackResult) {
            storageLogger.info(`Successfully set using fallback mechanism: ${fallbackMechanism}`, {
              key
            });
            return true;
          }
        }
      }
      
      return result;
    } catch (error) {
      handleError(error, { key, operation: 'safeSet' });
      return false;
    } finally {
      storageLogger.endTimer(timerId);
    }
  };
  
  /**
   * Safely attempts to retrieve a value and handles errors
   * @param key Storage key
   * @param options Storage options
   * @returns The stored value or null if not found or error
   */
  const safeGet = async <T>(
    key: string, 
    options: StorageOptions = {}
  ): Promise<T | null> => {
    const result = await tryCatch(async () => {
      return getItem<T>(key, options);
    });
    
    // Return null if tryCatch returns undefined (on error)
    return result ?? null;
  };
  
  /**
   * Safely attempts to remove a value and handles errors
   * @param key Storage key
   * @param options Storage options
   * @returns True if removal was successful
   */
  const safeRemove = async (
    key: string, 
    options: StorageOptions = {}
  ): Promise<boolean> => {
    const result = await tryCatch(async () => {
      return removeItem(key, options);
    }, () => false);
    
    // Return false if tryCatch returns undefined (should never happen due to the errorHandler)
    return result === true;
  };
  
  /**
   * Safely attempts to clear storage and handles errors
   * @param options Storage options
   * @returns True if clear was successful
   */
  const safeClear = async (options: {
    mechanism?: StorageMechanism;
    namespace?: string;
    allMechanisms?: boolean;
  } = {}): Promise<boolean> => {
    const result = await tryCatch(async () => {
      return clear(options);
    }, () => false);
    
    // Return false if tryCatch returns undefined (should never happen due to the errorHandler)
    return result === true;
  };
  
  return {
    setItem,
    setItemAsync,
    getItem,
    getItemAsync,
    removeItem,
    clear,
    safeSet,
    safeGet,
    safeRemove,
    safeClear
  };
}

// Export singleton instance
export const secureStorage = createSecureStorage();