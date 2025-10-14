/**
 * vitest.integration.setup.ts
 * Integration test setup - minimal mocking, test real service interactions
 */

import { beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Global test utilities
import { cleanup } from '@testing-library/svelte';

// Set up Firebase environment variables for testing
process.env.VITE_FIREBASE_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
process.env.VITE_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.VITE_FIREBASE_APP_ID = '1:123456789:web:abcdef';

// Suppress logging in integration tests to prevent memory overflow
const originalConsole = { ...console };
console.log = vi.fn();
console.info = vi.fn(); 
console.warn = vi.fn();
console.error = vi.fn();

// Integration test cleanup - minimal cleanup, let services work together
beforeEach(() => {
  cleanup();
  // Keep console mocked to prevent excessive logging
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllTimers();
  cleanup();
});

// Only mock external APIs and frameworks, not our internal services

// Mock SvelteKit - external framework
vi.mock('@sveltejs/kit', () => ({
  redirect: vi.fn((status, location) => ({ status, redirect: location }))
}));

// Mock Firebase SDK - external dependency  
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'mock-app' })),
  getApps: vi.fn(() => [{ name: 'mock-app' }]),
  getApp: vi.fn(() => ({ name: 'mock-app' }))
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn((callback) => {
      callback(null);
      return () => {};
    }),
    signOut: vi.fn(() => Promise.resolve()),
    signInWithEmailAndPassword: vi.fn(() => Promise.resolve()),
    createUserWithEmailAndPassword: vi.fn(() => Promise.resolve()),
    sendPasswordResetEmail: vi.fn(() => Promise.resolve())
  })),
  connectAuthEmulator: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return () => {};
  }),
  signOut: vi.fn(() => Promise.resolve()),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve()),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  browserLocalPersistence: 'local',
  setPersistence: vi.fn(() => Promise.resolve()),
  EmailAuthProvider: {
    credential: vi.fn()
  }
}));

// Mock browser APIs - external dependencies
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  },
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  },
  writable: true
});

// Mock fetch - external API
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
    url: 'http://localhost:3000/api/test'
  })
) as unknown as typeof fetch;

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn(),
    replace: vi.fn(),
    assign: vi.fn()
  },
  writable: true
});

// Export utilities for tests
export const testUtils = {
  createMockUser: (overrides = {}) => ({
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    ...overrides
  }),
  
  createMockEvent: (type: string, detail?: any) => ({
    type,
    detail,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  })
};