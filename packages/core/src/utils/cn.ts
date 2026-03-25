/**
 * src/lib/utils/cn.ts
 * Class Name Utility
 * 
 * Utility function for merging Tailwind CSS classes with class-variance-authority.
 * This is the standard utility used by shadcn-svelte components.
 * 
 * AI SYSTEMS: Use this utility for all conditional class name construction.
 * Example: cn("base-class", condition && "conditional-class", className)
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge classes with tailwind-merge and clsx
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 * 
 * @example
 * ```typescript
 * import { cn } from '$lib/utils/cn';
 * 
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500')
 * // → 'px-4 py-2 bg-blue-500'
 * 
 * // With conditionals
 * cn('base-class', isActive && 'active-class', className)
 * 
 * // Tailwind conflict resolution
 * cn('px-4 px-6') 
 * // → 'px-6' (later class wins)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export type for use in components
export type { ClassValue };