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
