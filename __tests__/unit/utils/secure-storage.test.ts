/**
 * src/lib/utils/secure-storage.test.ts
 * Secure storage utility unit tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { secureStorage } from '$lib/utils/secure-storage';
import { 
  STORAGE_PREFIX, 
  AUTH_NAMESPACE, 
  PREFS_NAMESPACE,
  STORAGE_DEFAULT_TTL 
} from '$lib/constants/secure-storage.constants';

describe('Secure Storage Utility', () => {
  // Original console methods
  const originalConsole = {
    info: console.info,
    warn: console.warn,
    error: console.error
  };
  
  // Mocked console functions
  const mockConsole = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
  
  // Mock storage data
  const mockStorage = {
    local: new Map<string, string>(),
    session: new Map<string, string>(),
    cookie: new Map<string, string>()
  };
  
  // Mock localStorage
  const mockLocalStorage = {
    getItem: vi.fn((key: string) => mockStorage.local.get(key) || null),
    setItem: vi.fn((key: string, value: string) => mockStorage.local.set(key, value)),
    removeItem: vi.fn((key: string) => { 
      mockStorage.local.delete(key);
      return true;
    }),
    clear: vi.fn(() => { 
      mockStorage.local.clear();
      return undefined;
    }),
    key: vi.fn(),
    length: 0
  };
  
  // Mock sessionStorage
  const mockSessionStorage = {
    getItem: vi.fn((key: string) => mockStorage.session.get(key) || null),
    setItem: vi.fn((key: string, value: string) => mockStorage.session.set(key, value)),
    removeItem: vi.fn((key: string) => { 
      mockStorage.session.delete(key);
      return true;
    }),
    clear: vi.fn(() => { 
      mockStorage.session.clear();
      return undefined;
    }),
    key: vi.fn(),
    length: 0
  };
  
  // Mock Date.now
  const realDateNow = Date.now;
  const mockNow = 1609459200000; // 2021-01-01
  
  // Original Object.keys
  const originalObjectKeys = Object.keys;
  
  beforeEach(() => {
    // Setup console mocks
    console.info = mockConsole.info;
    console.warn = mockConsole.warn;
    console.error = mockConsole.error;
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Reset mock storage
    mockStorage.local.clear();
    mockStorage.session.clear();
    mockStorage.cookie.clear();
    
    // Mock browser environment using vi.stubGlobal
    vi.stubGlobal('localStorage', mockLocalStorage);
    vi.stubGlobal('sessionStorage', mockSessionStorage);
    
    // Create mock document that returns cookie string
    const mockDoc = {
      get cookie() {
        return Array.from(mockStorage.cookie.entries())
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
      },
      set cookie(value: string) {
        const parts = value.split(';')[0].split('=');
        const key = parts[0].trim();
        
        // Handle cookie deletion
        if (value.includes('Expires=Thu, 01 Jan 1970')) {
          mockStorage.cookie.delete(key);
          return;
        }
        
        // Set cookie value
        const val = parts.slice(1).join('=');
        mockStorage.cookie.set(key, val);
      }
    };
    vi.stubGlobal('document', mockDoc);
    
    // Mock window for isBrowser check
    vi.stubGlobal('window', { 
      localStorage: mockLocalStorage,
      sessionStorage: mockSessionStorage,
      document: mockDoc
    });
    
    // Mock Date.now
    Date.now = vi.fn(() => mockNow);
    
    // Mock Object.keys to return keys from our mock storage for localStorage
    Object.keys = vi.fn((obj) => {
      if (obj === localStorage) {
        return [...mockStorage.local.keys()];
      }
      if (obj === sessionStorage) {
        return [...mockStorage.session.keys()];
      }
      return originalObjectKeys(obj);
    });
  });
  
  afterEach(() => {
    // Restore console
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    
    // Restore Date.now
    Date.now = realDateNow;
    
    // Restore Object.keys
    Object.keys = originalObjectKeys;
    
    // Remove stubs
    vi.unstubAllGlobals();
    
    // Clear all mocks
    vi.restoreAllMocks();
  });
  
  /**
   * Helper to create a storage value with metadata
   */
  const createStoredValue = (value: any, options: { 
    createdAt?: number, 
    expiresAt?: number,
    version?: number
  } = {}) => {
    const now = mockNow;
    return JSON.stringify({
      value,
      createdAt: options.createdAt ?? now,
      expiresAt: options.expiresAt ?? (now + STORAGE_DEFAULT_TTL * 1000),
      version: options.version ?? 1
    });
  };
  
  describe('localStorage operations', () => {
    it('should store values in localStorage', () => {
      const key = 'testKey';
      const value = { name: 'Test User', id: 123 };
      
      // Call the storage function
      const result = secureStorage.setItem(key, value);
      
      // Check result
      expect(result).toBe(true);
      
      // Verify localStorage.setItem was called with the right key
      const expectedKey = `${STORAGE_PREFIX}_${key}`;
      expect(localStorage.setItem).toHaveBeenCalledWith(
        expectedKey,
        expect.any(String)
      );
    });
    
    it('should retrieve values from localStorage', () => {
      const key = 'testKey';
      const value = { name: 'Test User', id: 123 };
      const expectedKey = `${STORAGE_PREFIX}_${key}`;
      
      // Mock the stored value
      mockStorage.local.set(
        expectedKey,
        createStoredValue(value)
      );
      
      // Retrieve the value
      const retrievedValue = secureStorage.getItem(key);
      
      // Check that localStorage.getItem was called
      expect(localStorage.getItem).toHaveBeenCalledWith(expectedKey);
      
      // Verify the retrieved value
      expect(retrievedValue).toEqual(value);
    });
    
    it('should handle non-existent keys', () => {
      const result = secureStorage.getItem('nonExistentKey');
      expect(result).toBeNull();
    });
    
    it('should remove items from localStorage', () => {
      const key = 'removeKey';
      const expectedKey = `${STORAGE_PREFIX}_${key}`;
      
      // Setup mock data
      mockStorage.local.set(
        expectedKey,
        createStoredValue('test-value')
      );
      
      // Remove the item
      const result = secureStorage.removeItem(key);
      
      // Check result
      expect(result).toBe(true);
      
      // Verify localStorage.removeItem was called
      expect(localStorage.removeItem).toHaveBeenCalledWith(expectedKey);
    });
    
    it('should clear localStorage', () => {
      // Setup mock data
      mockStorage.local.set(
        `${STORAGE_PREFIX}_key1`,
        createStoredValue('value1')
      );
      
      mockStorage.local.set(
        `${STORAGE_PREFIX}_key2`,
        createStoredValue('value2')
      );
      
      // Add a non-prefixed key to verify it doesn't get removed
      mockStorage.local.set('other_key', 'other_value');
      
      // Verify we have data before clearing
      expect(mockStorage.local.size).toBe(3);
      
      // Clear storage
      const result = secureStorage.clear();
      
      // Check result
      expect(result).toBe(true);
      
      // Verify removeItem was called for each prefixed key
      expect(localStorage.removeItem).toHaveBeenCalledWith(`${STORAGE_PREFIX}_key1`);
      expect(localStorage.removeItem).toHaveBeenCalledWith(`${STORAGE_PREFIX}_key2`);
      
      // Verify the non-prefixed key is still there
      expect(mockStorage.local.has('other_key')).toBe(true);
      
      // Verify the prefixed keys are gone
      expect(mockStorage.local.has(`${STORAGE_PREFIX}_key1`)).toBe(false);
      expect(mockStorage.local.has(`${STORAGE_PREFIX}_key2`)).toBe(false);
    });
  });
  
  describe('sessionStorage operations', () => {
    it('should store and retrieve values from sessionStorage', () => {
      const key = 'sessionKey';
      const value = { temporaryData: true };
      const expectedKey = `${STORAGE_PREFIX}_${key}`;
      
      // Store in sessionStorage
      const result = secureStorage.setItem(key, value, {
        mechanism: 'sessionStorage'
      });
      
      // Check result
      expect(result).toBe(true);
      
      // Verify sessionStorage.setItem was called
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        expectedKey,
        expect.any(String)
      );
      
      // Mock stored value for retrieval
      mockStorage.session.set(
        expectedKey,
        createStoredValue(value)
      );
      
      // Retrieve value
      const retrievedValue = secureStorage.getItem(key, {
        mechanism: 'sessionStorage'
      });
      
      // Verify sessionStorage.getItem was called
      expect(sessionStorage.getItem).toHaveBeenCalledWith(expectedKey);
      
      // Check retrieved value
      expect(retrievedValue).toEqual(value);
    });
  });
  
  describe('namespaced storage', () => {
    it('should partition storage by namespace', () => {
      const key = 'sharedKey';
      const authValue = { tokens: { refresh: 'abc123' } };
      const prefsValue = { theme: 'dark' };
      
      // Store values in different namespaces
      secureStorage.setItem(key, authValue, { namespace: AUTH_NAMESPACE });
      secureStorage.setItem(key, prefsValue, { namespace: PREFS_NAMESPACE });
      
      // Verify localStorage calls with different keys
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `${STORAGE_PREFIX}_${AUTH_NAMESPACE}_${key}`,
        expect.any(String)
      );
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `${STORAGE_PREFIX}_${PREFS_NAMESPACE}_${key}`,
        expect.any(String)
      );
      
      // Mock stored values for retrieval
      mockStorage.local.set(
        `${STORAGE_PREFIX}_${AUTH_NAMESPACE}_${key}`,
        createStoredValue(authValue)
      );
      
      mockStorage.local.set(
        `${STORAGE_PREFIX}_${PREFS_NAMESPACE}_${key}`,
        createStoredValue(prefsValue)
      );
      
      // Retrieve values from different namespaces
      const retrievedAuthValue = secureStorage.getItem(key, { namespace: AUTH_NAMESPACE });
      const retrievedPrefsValue = secureStorage.getItem(key, { namespace: PREFS_NAMESPACE });
      
      // Verify retrieved values
      expect(retrievedAuthValue).toEqual(authValue);
      expect(retrievedPrefsValue).toEqual(prefsValue);
    });
  });
  
  describe('expiration handling', () => {
    it('should expire items based on TTL', () => {
      const key = 'expiringKey';
      const value = { temporary: true };
      const ttl = 60; // 1 minute
      const expectedKey = `${STORAGE_PREFIX}_${key}`;
      
      // Store with short TTL
      secureStorage.setItem(key, value, { ttl });
      
      // Mock stored value with expiration
      mockStorage.local.set(
        expectedKey,
        createStoredValue(value, {
          createdAt: mockNow,
          expiresAt: mockNow + ttl * 1000 // 1 minute from now
        })
      );
      
      // Verify retrieval before expiration
      const beforeExpiration = secureStorage.getItem(key);
      expect(beforeExpiration).toEqual(value);
      
      // Advance time beyond expiration
      vi.spyOn(Date, 'now').mockReturnValue(mockNow + ttl * 1000 + 1000); // 1 minute + 1 second
      
      // Verify retrieval after expiration
      const afterExpiration = secureStorage.getItem(key);
      expect(afterExpiration).toBeNull();
      
      // Verify removal of expired item
      expect(localStorage.removeItem).toHaveBeenCalledWith(expectedKey);
    });
    
    it('should keep items without expiration', () => {
      const key = 'permanentKey';
      const value = { permanent: true };
      const expectedKey = `${STORAGE_PREFIX}_${key}`;
      
      // Store with no expiration
      secureStorage.setItem(key, value, { ttl: 0 });
      
      // Mock stored value without expiration
      mockStorage.local.set(
        expectedKey,
        createStoredValue(value, {
          createdAt: mockNow,
          expiresAt: 0 // No expiration
        })
      );
      
      // Advance time far into the future
      vi.spyOn(Date, 'now').mockReturnValue(mockNow + 365 * 24 * 60 * 60 * 1000); // 1 year later
      
      // Verify item is still available
      const retrievedValue = secureStorage.getItem(key);
      expect(retrievedValue).toEqual(value);
    });
  });
  
  describe('basic error handling', () => {
    it('should return null when stored data is invalid', () => {
      const key = 'invalidKey';
      const expectedKey = `${STORAGE_PREFIX}_${key}`;
      
      // Setup invalid data
      mockStorage.local.set(expectedKey, 'not-valid-json');
      
      // Retrieve value
      const result = secureStorage.getItem(key);
      
      // Should return null
      expect(result).toBeNull();
      
      // Should log warning
      expect(mockConsole.warn).toHaveBeenCalled();
      
      // Should remove invalid value
      expect(localStorage.removeItem).toHaveBeenCalledWith(expectedKey);
    });
  });
  
  describe('safe operations', () => {
    it('safeGet should not throw errors', async () => {
      // Make localStorage.getItem throw
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => { 
        throw new Error('Storage error'); 
      });
      
      // Should not throw
      const result = await secureStorage.safeGet('errorKey');
      
      // Should return null
      expect(result).toBeNull();
    });
    
    it('safeSet should handle errors gracefully', async () => {
      // Make localStorage.setItem throw
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => { 
        throw new Error('Storage error'); 
      });
      
      // Should not throw
      const result = await secureStorage.safeSet('errorKey', 'value');
      
      // Should return false on error
      expect(result).toBe(false);
      
      // Should log error
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });
});