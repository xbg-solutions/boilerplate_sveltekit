/**
 * src/lib/test-utils/index.ts
 * Centralized test utilities and common mocks
 * 
 * AI SYSTEMS: Import these utilities in test files for consistent mocking patterns
 */

import { vi } from 'vitest';

/**
 * Common console mock for tests that need to spy on console output
 */
export function createConsoleMock() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    debug: vi.fn()
  };
}

/**
 * Sets up console mocking for a test suite
 * Call this in beforeEach to mock console methods
 */
export function mockConsole() {
  const consoleMock = createConsoleMock();
  
  // Store original console methods
  const originalConsole = {
    info: console.info,
    warn: console.warn,
    error: console.error,
    log: console.log,
    debug: console.debug
  };
  
  // Apply mocks
  console.info = consoleMock.info;
  console.warn = consoleMock.warn;
  console.error = consoleMock.error;
  console.log = consoleMock.log;
  console.debug = consoleMock.debug;
  
  return {
    mocks: consoleMock,
    restore: () => {
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.log = originalConsole.log;
      console.debug = originalConsole.debug;
    }
  };
}

/**
 * Common Firebase auth mock
 */
export function createFirebaseAuthMock() {
  return {
    currentUser: null,
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    sendPasswordResetEmail: vi.fn()
  };
}

/**
 * Common API response mock factory
 */
export function createApiResponseMock<T>(data: T, status = 200, statusText = 'OK') {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Headers(),
    url: 'http://localhost:3000/api/test'
  } as unknown as Response;
}

/**
 * Common fetch mock factory
 */
export function createFetchMock() {
  return vi.fn();
}

/**
 * Helper to wait for async operations in tests
 */
export function waitForAsync(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to flush all pending promises
 */
export async function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

/**
 * Common test timeout values
 */
export const TEST_TIMEOUTS = {
  short: 100,
  medium: 1000,
  long: 5000
};

/**
 * Helper to create mock Svelte store
 */
export function createMockStore<T>(initialValue: T) {
  let value = initialValue;
  const subscribers = new Set<(value: T) => void>();
  
  return {
    subscribe: vi.fn((callback: (value: T) => void) => {
      subscribers.add(callback);
      callback(value);
      return () => subscribers.delete(callback);
    }),
    set: vi.fn((newValue: T) => {
      value = newValue;
      subscribers.forEach(callback => callback(value));
    }),
    update: vi.fn((updater: (value: T) => T) => {
      value = updater(value);
      subscribers.forEach(callback => callback(value));
    })
  };
}