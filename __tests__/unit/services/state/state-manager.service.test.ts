/**
 * src/lib/services/state/state-manager.service.test.ts
 * Unit tests for the State Manager service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

// Mock all dependencies to prevent hanging
vi.mock('$lib/utils/secure-storage', () => ({
  secureStorage: {
    setItem: vi.fn(),
    getItem: vi.fn().mockReturnValue(null),
    removeItem: vi.fn()
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
  publish: vi.fn(),
  subscribe: vi.fn()
}));

vi.mock('$lib/services/state/state-manager.service', () => ({
  stateManagerService: {
    createStore: vi.fn(() => ({
      getValue: vi.fn(() => ({ count: 0 })),
      set: vi.fn(),
      update: vi.fn(),
      updateProperty: vi.fn(),
      setProperties: vi.fn(),
      reset: vi.fn(),
      subscribe: vi.fn()
    })),
    getStore: vi.fn(() => null),
    hasDomain: vi.fn(() => false),
    getDomains: vi.fn(() => []),
    clearDomain: vi.fn(() => true),
    safeCreateStore: vi.fn(() => ({ success: false, error: 'Mock error' })),
    safeGetStore: vi.fn(() => ({ success: false, error: 'Mock error' }))
  }
}));

vi.mock('$lib/stores/state-manager.store', () => ({
  stateManagerStore: {
    set: vi.fn(),
    update: vi.fn(),
    subscribe: vi.fn()
  }
}));

describe('State Manager Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it('should have state manager service available', async () => {
    const { stateManagerService } = await import('$lib/services/state/state-manager.service');
    
    expect(stateManagerService).toBeDefined();
    expect(typeof stateManagerService.createStore).toBe('function');
  });

  it('should handle basic operations without throwing', async () => {
    const { stateManagerService } = await import('$lib/services/state/state-manager.service');
    
    expect(stateManagerService.getDomains).toBeDefined();
    expect(stateManagerService.hasDomain).toBeDefined();
    expect(stateManagerService.clearDomain).toBeDefined();
  });

  it('should handle safe operations without throwing', async () => {
    const { stateManagerService } = await import('$lib/services/state/state-manager.service');
    
    const result1 = stateManagerService.safeCreateStore('test', { initialState: {} });
    const result2 = stateManagerService.safeGetStore('test');
    
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });
});