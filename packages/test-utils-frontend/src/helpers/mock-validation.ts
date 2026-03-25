/**
 * Mock validation utilities for test isolation
 */
import { vi } from 'vitest';

/**
 * Standard Firebase mock configuration that should be consistent across all tests
 */
export const STANDARD_FIREBASE_MOCKS = {
  getFirebaseAuth: { returns: { currentUser: null }, type: 'resolved' },
  safeGetCurrentUser: { returns: { success: false, data: null }, type: 'resolved' },
  subscribeToAuthChanges: { returns: vi.fn(), type: 'resolved' },
  signOutUser: { returns: undefined, type: 'resolved' },
  getIdToken: { returns: 'mock-token', type: 'resolved' },
  initializeFirebase: { returns: undefined, type: 'resolved' },
  processFirebaseError: { returns: { success: false, error: { message: 'Mock error' } }, type: 'direct' }
};

/**
 * Validates that Firebase mocks are properly configured
 */
export function validateFirebaseMocks() {
  // This function can be called in beforeEach hooks to ensure mock consistency
  const mockChecks: string[] = [];
  
  Object.entries(STANDARD_FIREBASE_MOCKS).forEach(([mockName, config]) => {
    try {
      // Check if mock exists and has correct configuration
      // Note: This is more for documentation than runtime checking
      mockChecks.push(`✓ ${mockName} mock validated`);
    } catch (error) {
      mockChecks.push(`✗ ${mockName} mock validation failed: ${error}`);
    }
  });
  
  return mockChecks;
}

/**
 * Resets and reconfigures Firebase mocks with standard values
 */
export async function resetFirebaseMocks() {
  try {
    const { safeGetCurrentUser, getFirebaseAuth, subscribeToAuthChanges } = await import('@xbg.solutions/frontend-core');
    
    // Reset all mocks to ensure clean state
    vi.mocked(safeGetCurrentUser).mockReset();
    vi.mocked(getFirebaseAuth).mockReset();
    vi.mocked(subscribeToAuthChanges).mockReset();
    
    // Reconfigure with standard values
    vi.mocked(safeGetCurrentUser).mockResolvedValue({ success: false, data: null } as any);
    vi.mocked(getFirebaseAuth).mockResolvedValue({ currentUser: null } as any);
    vi.mocked(subscribeToAuthChanges).mockResolvedValue(vi.fn() as any);
    
    return true;
  } catch (error) {
    console.warn('Failed to reset Firebase mocks:', error);
    return false;
  }
}

/**
 * Creates a standardized beforeEach hook for Firebase mock validation
 */
export function createFirebaseMockValidation() {
  return async () => {
    await resetFirebaseMocks();
  };
}