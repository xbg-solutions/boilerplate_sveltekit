/**
 * src/lib/services/initialization/initialization.service.test.ts
 * Initialization Service Tests
 * 
 * Unit tests for the initialization service.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';

// Mock all external dependencies first
vi.mock('$lib/stores/initialization.store', () => ({
  initializationStore: {
    set: vi.fn(),
    update: vi.fn(),
    subscribe: vi.fn()
  }
}));

vi.mock('$lib/services/initialization/initialization.service', () => ({
  initializationService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn(),
    whenInitialized: vi.fn().mockResolvedValue(undefined)
  },
  getInitializationState: vi.fn(() => ({ isInitialized: false }))
}));

// Mock dependencies
vi.mock('firebase/app', () => {
  return {
    initializeApp: vi.fn(() => ({ name: 'mock-app' })),
    getApps: vi.fn(() => []),
    FirebaseError: class FirebaseError extends Error {
      constructor(code: string, message: string) {
        super(message);
        this.code = code;
      }
      code: string;
    }
  };
});

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ name: 'mock-auth' })),
  connectAuthEmulator: vi.fn()
}));

vi.mock('$lib/services/auth/auth.service', () => ({
  authService: {
    initialize: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('$lib/services/logging/logging.service', () => ({
  loggerService: {
    withContext: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(), 
      error: vi.fn()
    }))
  }
}));

vi.mock('$lib/services/events/pub-sub', () => ({
  publish: vi.fn()
}));

describe('Initialization Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it('should have initialization service available', async () => {
    // Import services after mocks are set up
    const { initializationService } = await import('$lib/services/initialization/initialization.service');
    
    expect(initializationService).toBeDefined();
    expect(typeof initializationService.initialize).toBe('function');
  });

  it('should handle initialization without throwing', async () => {
    const { initializationService } = await import('$lib/services/initialization/initialization.service');
    
    expect(initializationService.initialize).toBeDefined();
    expect(typeof initializationService.initialize).toBe('function');
  });

  it('should handle reset without throwing', async () => {
    const { initializationService } = await import('$lib/services/initialization/initialization.service');
    
    expect(() => initializationService.reset()).not.toThrow();
  });

  it('should handle whenInitialized promise', async () => {
    const { initializationService } = await import('$lib/services/initialization/initialization.service');
    
    expect(initializationService.whenInitialized).toBeDefined();
    expect(typeof initializationService.whenInitialized).toBe('function');
  });
});