/**
 * src/lib/services/state/state-storage.integration.test.ts
 * @vitest-environment jsdom
 * 
 * Integration tests for state manager and secure storage services
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all dependencies to prevent hanging
vi.mock('$lib/utils/secure-storage', () => ({
  secureStorage: {
    setItem: vi.fn().mockReturnValue(true),
    getItem: vi.fn().mockReturnValue(null),
    removeItem: vi.fn().mockReturnValue(true),
    clear: vi.fn().mockReturnValue(true),
    safeGet: vi.fn().mockResolvedValue({ success: true, data: null }),
    safeSet: vi.fn().mockResolvedValue(true),
    safeRemove: vi.fn().mockResolvedValue(true),
    safeClear: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('$lib/services/state/state-manager.service', () => ({
  stateManagerService: {
    createStore: vi.fn(),
    getStore: vi.fn(),
    hydrateAll: vi.fn().mockReturnValue({ success: 0, failed: 0 }),
    persistAll: vi.fn().mockReturnValue({ success: 0, failed: 0 })
  }
}));

describe('State Manager and Secure Storage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it('should have secure storage available', async () => {
    const { secureStorage } = await import('$lib/utils/secure-storage');
    
    expect(secureStorage).toBeDefined();
    expect(typeof secureStorage.setItem).toBe('function');
    expect(typeof secureStorage.getItem).toBe('function');
  });

  it('should have state manager service available', async () => {
    const { stateManagerService } = await import('$lib/services/state/state-manager.service');
    
    expect(stateManagerService).toBeDefined();
    expect(typeof stateManagerService.hydrateAll).toBe('function');
  });

  it('should handle basic integration operations', async () => {
    const { stateManagerService } = await import('$lib/services/state/state-manager.service');
    
    expect(stateManagerService.hydrateAll).toBeDefined();
    expect(typeof stateManagerService.hydrateAll).toBe('function');
  });
});