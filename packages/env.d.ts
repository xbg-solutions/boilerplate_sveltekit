/// <reference types="vite/client" />

// Vite environment variables
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// SvelteKit runtime module declarations
// These modules are provided by the consuming SvelteKit application
declare module '$app/navigation' {
  export function goto(url: string, opts?: { replaceState?: boolean; noScroll?: boolean; keepFocus?: boolean; invalidateAll?: boolean; state?: any }): Promise<void>;
  export function invalidate(url: string | URL | ((url: URL) => boolean)): Promise<void>;
  export function invalidateAll(): Promise<void>;
  export function preloadData(url: string): Promise<void>;
  export function preloadCode(...urls: string[]): Promise<void>;
  export function beforeNavigate(callback: (navigation: any) => void): void;
  export function afterNavigate(callback: (navigation: any) => void): void;
  export function onNavigate(callback: (navigation: any) => any): void;
}

declare module '$app/environment' {
  export const browser: boolean;
  export const building: boolean;
  export const dev: boolean;
  export const version: string;
}
