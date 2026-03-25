// src/lib/utils/browser.ts

/**
 * Indicates whether the code is running in a browser environment
 * Esppecially useful during testing
 */
export const browser = typeof window !== 'undefined';