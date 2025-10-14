/**
 * src/lib/templates/index.ts
 * Layout Template Exports
 * 
 * Centralized export for all layout templates.
 * These templates provide consistent, reusable layout patterns
 * for common page types in SvelteKit applications.
 */

export { default as DashboardLayout } from './DashboardLayout.svelte';
export { default as FormLayout } from './FormLayout.svelte';
export { default as ContentLayout } from './ContentLayout.svelte';

// Template type definitions
export interface NavigationItem {
  label: string;
  href: string;
  icon?: any;
  badge?: string;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface Author {
  name: string;
  avatar?: string;
  bio?: string;
}

// Template prop types
export interface DashboardLayoutProps {
  navigation?: NavigationItem[];
  user?: User | null;
  showNotifications?: boolean;
  notificationCount?: number;
}

export interface FormLayoutProps {
  title?: string;
  description?: string;
  showSidebar?: boolean;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  centered?: boolean;
  showLogo?: boolean;
  logoSrc?: string;
  logoAlt?: string;
  backgroundColor?: 'white' | 'gray' | 'gradient';
}

export interface ContentLayoutProps {
  title?: string;
  subtitle?: string;
  showBreadcrumbs?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  showSidebar?: boolean;
  sidebarPosition?: 'left' | 'right';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  showMeta?: boolean;
  publishDate?: string;
  readTime?: string;
  tags?: string[];
  author?: Author | null;
}