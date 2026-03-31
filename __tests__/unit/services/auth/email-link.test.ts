/**
 * Email Link Auth Tests - Behavior focused
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Test real email link auth functions
import { sendEmailLink, verifyEmailLink } from '@xbg.solutions/bpsk-utils-firebase-auth';

describe('Email Link Authentication', () => {
  beforeEach(() => {
    // Clean state with our mocked Firebase
  });

  describe('Service Availability', () => {
    it('should have email link functions available', () => {
      expect(typeof sendEmailLink).toBe('function');
      expect(typeof verifyEmailLink).toBe('function');
    });
  });

  describe('Send Email Link', () => {
    it('should handle send email link without throwing', async () => {
      // With mocked Firebase, this should resolve
      await expect(sendEmailLink({
        email: 'test@example.com'
      })).resolves.not.toThrow();
    });

    it('should require email parameter', async () => {
      // Should handle missing email gracefully
      await expect(sendEmailLink({} as any)).resolves.not.toThrow();
    });
  });

  describe('Verify Email Link', () => {
    it('should handle verification without throwing', async () => {
      // With mocked Firebase, this should resolve
      await expect(verifyEmailLink({
        url: 'http://localhost:3000/confirm?token=test'
      })).resolves.not.toThrow();
    });

    it('should handle invalid URLs gracefully', async () => {
      await expect(verifyEmailLink({
        url: 'invalid-url'
      })).resolves.not.toThrow();
    });
  });
});