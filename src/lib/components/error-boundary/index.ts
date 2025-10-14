export { default as ErrorBoundary } from './ErrorBoundary.svelte';
export { default as ErrorBoundaryTest } from './ErrorBoundaryTest.svelte';

export type ErrorBoundaryProps = {
  fallback?: string;
  showReload?: boolean;
  showHome?: boolean;
  showBack?: boolean;
  showRetry?: boolean;
  showDetails?: boolean;
  enableReporting?: boolean;
  contactEmail?: string;
  level?: 'page' | 'component' | 'global';
};