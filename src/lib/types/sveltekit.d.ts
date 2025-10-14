/**
 * src/lib/types/sveltekit.d.ts
 * TypeScript declarations for SvelteKit related types
 */

/**
 * Augments the App namespace for SvelteKit
 */
declare namespace App {
  /**
   * Error interface for SvelteKit error responses
   */
  interface Error {
    message: string;
    status: number;
    redirect?: string;
  }

  /**
   * Metadata for SvelteKit pages
   */
  interface Metadata {
    title?: string;
    description?: string;
  }
}