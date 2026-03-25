/**
 * reCAPTCHA Utility Tests - Behavior focused
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test the real recaptcha utilities
import { clearRecaptchaVerifier, createRecaptchaVerifier } from '@xbg.solutions/utils-recaptcha';

describe('reCAPTCHA Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('clearRecaptchaVerifier', () => {
    it('should handle clearing without throwing', async () => {
      const mockVerifier = {
        clear: vi.fn()
      };

      // Should not throw
      await expect(clearRecaptchaVerifier(mockVerifier as any)).resolves.not.toThrow();
      expect(mockVerifier.clear).toHaveBeenCalled();
    });

    it('should handle invalid verifiers gracefully', async () => {
      // Should not throw with null verifier
      await expect(clearRecaptchaVerifier(null as any)).resolves.not.toThrow();
    });

    it('should handle verifier clear errors gracefully', async () => {
      const mockVerifier = {
        clear: vi.fn().mockImplementation(() => {
          throw new Error('Clear failed');
        })
      };

      // Should not throw even when clear fails
      await expect(clearRecaptchaVerifier(mockVerifier as any)).resolves.not.toThrow();
    });
  });

  describe('createRecaptchaVerifier', () => {
    it('should be a function', () => {
      expect(typeof createRecaptchaVerifier).toBe('function');
    });
  });
});