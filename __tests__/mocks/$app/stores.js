import { vi } from 'vitest';

// Simple mock stores that behave like Svelte stores
export const page = {
  subscribe: vi.fn(() => () => {}),
  set: vi.fn(),
  update: vi.fn()
};

export const updated = {
  subscribe: vi.fn(() => () => {}),
  set: vi.fn(),
  update: vi.fn()
};

export const navigating = {
  subscribe: vi.fn(() => () => {}),
  set: vi.fn(),
  update: vi.fn()
};