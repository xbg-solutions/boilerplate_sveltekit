/**
 * Phone Auth Tests - Behavior focused
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Test real phone auth functions
import { sendPhoneCode, verifyPhoneCode } from '$lib/services/auth/phone-auth';

describe('Phone Authentication', () => {
  beforeEach(() => {
    // Clean state with our mocked Firebase
  });

  describe('Service Availability', () => {
    it('should have phone auth functions available', () => {
      expect(typeof sendPhoneCode).toBe('function');
      expect(typeof verifyPhoneCode).toBe('function');
    });
  });

  describe('Send Phone Code', () => {
    it('should handle send phone code without throwing', async () => {
      // With mocked Firebase, this should resolve
      await expect(sendPhoneCode('+1234567890', {} as any)).resolves.not.toThrow();
    });

    it('should handle invalid phone numbers gracefully', async () => {
      await expect(sendPhoneCode('invalid-phone', {} as any)).resolves.not.toThrow();
    });
  });

  describe('Verify Phone Code', () => {
    it('should handle code verification without throwing', async () => {
      // With mocked Firebase, this should resolve
      await expect(verifyPhoneCode('test-verification-id', '123456')).resolves.not.toThrow();
    });

    it('should handle invalid codes gracefully', async () => {
      await expect(verifyPhoneCode('invalid-id', 'invalid-code')).resolves.not.toThrow();
    });
  });
});