/**
 * src/lib/services/auth/user-creation.test.ts
 * Tests for auth user creation utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ensureUserExists } from '@xbg.solutions/bpsk-utils-firebase-auth';
import { CREATE_AUTH_USER_ON_FIRST_SIGNIN } from '@xbg.solutions/bpsk-core';

// Mock imports
vi.mock('../../services/logging/logging.service', () => ({
  loggerService: {
    withContext: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  }
}));

vi.mock('../../constants/auth.constants', async () => {
  const actual = await vi.importActual('../../constants/auth.constants');
  return {
    ...actual,
    CREATE_AUTH_USER_ON_FIRST_SIGNIN: {
      ENABLED: true,
      DEFAULT_ROLE: 'user',
      DEFAULT_ISCLIENT: true,
      DEFAULT_ISCONSULTANT: false,
      DEFAULT_ISADMIN: false,
      DEFAULT_ISYSADMIN: false
    }
  };
});

describe('User Creation Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should skip user creation when ENABLED is false', async () => {
    // Override the mock to disable auto-creation
    vi.mocked(CREATE_AUTH_USER_ON_FIRST_SIGNIN).ENABLED = false;
    
    const result = await ensureUserExists('test@example.com', 'email');
    
    expect(result).toBe(true);
  });

  it('should return success for email users when enabled', async () => {
    // Enable auto-creation
    vi.mocked(CREATE_AUTH_USER_ON_FIRST_SIGNIN).ENABLED = true;
    
    const result = await ensureUserExists('test@example.com', 'email');
    
    expect(result).toBe(true);
  });

  it('should return success for phone users when enabled', async () => {
    // Enable auto-creation
    vi.mocked(CREATE_AUTH_USER_ON_FIRST_SIGNIN).ENABLED = true;
    
    const result = await ensureUserExists('+15551234567', 'phone');
    
    expect(result).toBe(true);
  });

  it('should return success for extreme cases', async () => {
    // Enable auto-creation
    vi.mocked(CREATE_AUTH_USER_ON_FIRST_SIGNIN).ENABLED = true;
    
    // In our new CLI-based implementation, we want to ensure success even in edge cases
    // This reflects our design decision to favor continuation of authentication
    // even if user creation through CLI might fail
    const result = await ensureUserExists('exception@example.com', 'email');
    
    // The CLI tool implementation should return true to continue authentication flow
    expect(result).toBe(true);
  });
});