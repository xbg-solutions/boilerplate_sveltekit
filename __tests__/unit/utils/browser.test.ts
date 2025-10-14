/**
 * src/lib/utils/browser.test.ts
 * Browser utility tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('browser utility', () => {
  // Save original window object reference
  const originalWindow = global.window;
  
  // Clean up after tests
  afterEach(() => {
    // Restore the original window object
    global.window = originalWindow;
    
    // Clear the module cache to ensure fresh imports
    vi.resetModules();
  });
  
  it('should return true in browser environment', async () => {
    // Ensure window is defined for this test
    global.window = {} as Window & typeof globalThis;
    
    // Import the module
    const { browser } = await import('$lib/utils/browser');
    
    // Verify result
    expect(browser).toBe(true);
  });
  
  it('should return false in non-browser environment', async () => {
    // Make window undefined to simulate SSR
    global.window = undefined as any;
    
    // Import the module
    const { browser } = await import('$lib/utils/browser');
    
    // Verify result
    expect(browser).toBe(false);
  });
  
  it('should be importable in any environment', async () => {
    // This test ensures the module can be imported without errors
    // regardless of environment
    
    // Import the module should not throw
    await expect(import('$lib/utils/browser')).resolves.toBeDefined();
  });
});