/**
 * src/lib/types/sanitizer.types.ts
 * Type definitions for the sanitizer utility
 */

/**
 * Sanitization level options
 * - strict: Removes all HTML tags, for high-risk user inputs
 * - medium: Allows selected safe HTML tags, for rich text content
 * - basic: Only escapes HTML special characters
 */
export type SanitizationLevel = 'strict' | 'medium' | 'basic';

/**
 * Options for configuring sanitization behavior
 */
export interface SanitizerOptions {
  /**
   * Sanitization level to apply
   * @default 'basic'
   */
  level?: SanitizationLevel;
  
  /**
   * Whether to preserve the original case
   * @default true
   */
  preserveCase?: boolean;
  
  /**
   * Whether to preserve whitespace (if false, excess whitespace is normalized)
   * @default true
   */
  preserveWhitespace?: boolean;
  
  /**
   * Maximum allowed length for strings
   * @default undefined (no limit)
   */
  maxLength?: number;
}

/**
 * Type helper for recursively sanitized values
 * - For strings, returns a sanitized string
 * - For primitive types (number, boolean), returns the type unchanged
 * - For arrays, returns an array with each element recursively processed
 * - For objects, returns an object with each property recursively processed
 * 
 * This is a more robust type that prevents TypeScript errors when transforming strings
 */
export type RecursivelyProcessed<T> = 
  T extends string ? string :
  T extends number ? number :
  T extends boolean ? boolean :
  T extends null ? null :
  T extends undefined ? undefined :
  T extends Array<infer U> ? Array<RecursivelyProcessed<U>> :
  T extends object ? { [K in keyof T]: RecursivelyProcessed<T[K]> } :
  T extends unknown ? unknown :
  T;