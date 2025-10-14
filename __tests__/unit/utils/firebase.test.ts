/**
 * src/lib/utils/firebase.test.ts
 * Behavioral tests for Firebase utility functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseError, processFirebaseError, isFirebaseInitialized, getFirebaseState } from '$lib/utils/firebase';

describe('Firebase Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.stubGlobal('import.meta', {
      env: {
        VITE_FIREBASE_API_KEY: 'test-api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'test-project',
        VITE_FIREBASE_APP_ID: 'test-app-id',
        DEV: false
      }
    });
  });

  describe('FirebaseError Class', () => {
    it('creates error with message and category', () => {
      const error = new FirebaseError('Test Firebase error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test Firebase error');
      expect(error.category).toBe('firebase');
    });

    it('accepts Firebase-specific properties', () => {
      const error = new FirebaseError('Auth failed', { 
        firebaseCode: 'auth/user-not-found',
        action: 'auth/sign-in'
      });
      
      expect(error.firebaseCode).toBe('auth/user-not-found');
      expect(error.action).toBe('auth/sign-in');
    });
  });

  describe('processFirebaseError Function', () => {
    it('returns existing FirebaseError unchanged', () => {
      const originalError = new FirebaseError('Already processed');
      const result = processFirebaseError(originalError);
      
      expect(result).toBe(originalError);
    });

    it('converts Error to FirebaseError', () => {
      const genericError = new Error('Generic error');
      const result = processFirebaseError(genericError, 'Firebase failed');
      
      expect(result).toBeInstanceOf(FirebaseError);
      // The function uses the error's message if available, not the fallback
      expect(result.message).toBe('Generic error');
      expect(result.cause).toBe(genericError);
    });

    it('extracts Firebase error properties', () => {
      const firebaseError = {
        code: 'auth/user-not-found',
        name: 'FirebaseAuthError',
        message: 'User not found'
      };
      
      const result = processFirebaseError(firebaseError);
      
      expect(result.firebaseCode).toBe('auth/user-not-found');
      expect(result.message).toBe('User not found');
    });

    it('maps error codes to user messages', () => {
      const error = { code: 'auth/invalid-email', message: 'Invalid email' };
      const result = processFirebaseError(error);
      
      expect(result.userMessage).toBe('Please enter a valid email address.');
    });
  });

  describe('State Functions', () => {
    it('returns state object', () => {
      const state = getFirebaseState();
      expect(state).toHaveProperty('initialized');
    });

    it('reports initialization status', () => {
      const status = isFirebaseInitialized();
      expect(typeof status).toBe('boolean');
    });
  });
});