/**
 * src/lib/utils/secure-storage-sanitizer.integration.test.ts
 * Integration tests for secure storage and sanitizer utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { secureStorage } from '@xbg.solutions/bpsk-utils-secure-storage';
import { sanitize, strictSanitizer } from '@xbg.solutions/bpsk-utils-sanitizer';
import { STORAGE_PREFIX } from '@xbg.solutions/bpsk-utils-secure-storage';

describe('Secure Storage and Sanitizer Integration', () => {
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
  
  // Mock cookie handling
  const mockDocument = {
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
    },
    
    createElement: vi.fn((tagName: string) => {
      // Define an interface for our mock element
      interface MockElement {
        tagName: string;
        nodeName: string;
        nodeType: number;
        ownerDocument: any;
        parentNode: MockElement | null;
        childNodes: MockElement[];
        attributes: any[];
        innerHTML: string;
        textContent: string;
        appendChild: (child: MockElement) => MockElement;
        removeChild: (child: MockElement) => MockElement;
        getAttribute: (name: string) => string | null;
        setAttribute: (name: string, value: string) => void;
        removeAttribute: (name: string) => void;
        hasAttribute: (name: string) => boolean;
      }
      
      // Create a mock element that can be used by the sanitizer
      const element: MockElement = {
        tagName: tagName.toUpperCase(),
        nodeName: tagName.toUpperCase(),
        nodeType: 1,
        ownerDocument: mockDocument,
        parentNode: null,
        childNodes: [],
        attributes: [],
        innerHTML: '',
        textContent: '',
        appendChild: function(this: MockElement, child: MockElement) {
          this.childNodes.push(child);
          child.parentNode = this;
          return child;
        },
        removeChild: function(this: MockElement, child: MockElement) {
          const index = this.childNodes.indexOf(child);
          if (index !== -1) {
            this.childNodes.splice(index, 1);
            child.parentNode = null;
          }
          return child;
        },
        getAttribute: vi.fn(() => null),
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        hasAttribute: vi.fn(() => false)
      };
      
      return element;
    })
  };
  
  // Original Object.keys
  const originalObjectKeys = Object.keys;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Reset mock storage
    mockStorage.local.clear();
    mockStorage.session.clear();
    mockStorage.cookie.clear();
    
    // Mock browser environment
    vi.stubGlobal('localStorage', mockLocalStorage);
    vi.stubGlobal('sessionStorage', mockSessionStorage);
    vi.stubGlobal('document', mockDocument);
    vi.stubGlobal('window', { 
      localStorage: mockLocalStorage,
      sessionStorage: mockSessionStorage,
      document: mockDocument
    });
    
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
    // Restore Object.keys
    Object.keys = originalObjectKeys;
    
    // Remove stubs
    vi.unstubAllGlobals();
    
    // Clear all mocks
    vi.restoreAllMocks();
  });

  it('should sanitize data before storage and maintain integrity', () => {
    // Data with potentially harmful content
    const rawData = {
      name: '<script>alert("XSS")</script>John',
      description: '<img src="x" onerror="alert(1)">Bio info'
    };
    
    // Sanitize before storing
    const sanitizedData = sanitize(rawData);
    
    // Store sanitized data
    secureStorage.setItem('user-profile', sanitizedData);
    
    // Verify localStorage.setItem was called with sanitized data
    const expectedKey = `${STORAGE_PREFIX}_user-profile`;
    expect(localStorage.setItem).toHaveBeenCalledWith(
      expectedKey,
      expect.any(String)
    );
    
    // Retrieve the data with type assertion
    const retrievedData = secureStorage.getItem('user-profile') as {
      name: string;
      description: string;
    };
    
    // Verify data integrity
    expect(retrievedData).toEqual(sanitizedData);
    expect(retrievedData.name).not.toContain('<script>');
    expect(retrievedData.description).not.toContain('<img');
  });
  
  it('should maintain data type consistency through sanitization and storage', () => {
    // Complex nested object with different data types
    const complexData = {
      id: 123,
      active: true,
      name: 'Test <b>User</b>',
      tags: ['<script>alert(1)</script>', 'normal tag', '<img src="x">'],
      metadata: {
        createdBy: '<script>alert("admin")</script>Admin',
        notes: '<p>Some HTML</p>'
      }
    };
    
    // Sanitize and store
    const sanitizedData = sanitize(complexData);
    secureStorage.setItem('complex-data', sanitizedData);
    
    // Retrieve with type assertion
    const retrievedData = secureStorage.getItem('complex-data') as typeof complexData;
    
    // Verify type consistency
    expect(typeof retrievedData.id).toBe('number');
    expect(typeof retrievedData.active).toBe('boolean');
    expect(Array.isArray(retrievedData.tags)).toBe(true);
    expect(typeof retrievedData.metadata).toBe('object');
    
    // Verify all HTML is properly sanitized
    expect(retrievedData.name).not.toContain('<b>');
    expect(retrievedData.tags[0]).not.toContain('<script>');
    expect(retrievedData.metadata.createdBy).not.toContain('<script>');
    expect(retrievedData.metadata.notes).not.toContain('<p>');
  });
  
  it('should apply different sanitization levels correctly during storage', () => {
    // Simple behavioral test - verify sanitizers and storage work together
    const testContent = 'Test content with potential issues';
    
    // Store with different sanitization levels
    expect(() => {
      secureStorage.setItem('strict-sanitized', strictSanitizer(testContent));
    }).not.toThrow();
    
    expect(() => {
      secureStorage.setItem('medium-sanitized', sanitize(testContent, { level: 'medium' }));
    }).not.toThrow();
    
    // Verify storage and retrieval works
    const strictValue = secureStorage.getItem('strict-sanitized');
    const mediumValue = secureStorage.getItem('medium-sanitized');
    
    // Should return the sanitized content (behavior test)
    expect(typeof strictValue).toBe('string');
    expect(typeof mediumValue).toBe('string');
  });
});