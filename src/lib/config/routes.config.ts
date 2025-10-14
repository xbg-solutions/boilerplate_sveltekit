/**
 * Routes Configuration
 * 
 * Centralized route definitions with metadata for the SvelteKit application.
 * This configuration supports navigation generation, route protection,
 * and integration with layout templates and page data types.
 */

import type { ComponentType } from 'svelte';

// Route metadata interface
export interface RouteConfig {
  path: string;
  name: string;
  title?: string;
  description?: string;
  layout?: 'dashboard' | 'form' | 'content' | 'default';
  component?: ComponentType;
  icon?: string;
  badge?: string;
  hidden?: boolean;
  protected?: boolean;
  roles?: string[];
  permissions?: string[];
  redirect?: string;
  preload?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    noindex?: boolean;
  };
  meta?: Record<string, any>;
}

// Route group interface
export interface RouteGroup {
  name: string;
  label: string;
  icon?: string;
  routes: RouteConfig[];
  collapsed?: boolean;
  protected?: boolean;
  roles?: string[];
  order?: number;
}

// Navigation item interface (for generated navigation)
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
  children?: NavigationItem[];
}

// Authentication routes
export const AUTH_ROUTES: RouteGroup = {
  name: 'auth',
  label: 'Authentication',
  routes: [
    {
      path: '/auth/signin',
      name: 'signin',
      title: 'Sign In',
      description: 'Sign in to your account',
      layout: 'form',
      hidden: true,
      protected: false,
      seo: {
        title: 'Sign In - Your App',
        description: 'Sign in to access your dashboard and manage your account.',
        noindex: true
      }
    },
    {
      path: '/auth/signup',
      name: 'signup',
      title: 'Sign Up',
      description: 'Create a new account',
      layout: 'form',
      hidden: true,
      protected: false,
      seo: {
        title: 'Sign Up - Your App',
        description: 'Create a new account to get started.',
        noindex: true
      }
    },
    {
      path: '/auth/forgot-password',
      name: 'forgot-password',
      title: 'Forgot Password',
      description: 'Reset your password',
      layout: 'form',
      hidden: true,
      protected: false
    },
    {
      path: '/auth/reset-password',
      name: 'reset-password',
      title: 'Reset Password',
      description: 'Set a new password',
      layout: 'form',
      hidden: true,
      protected: false
    },
    {
      path: '/auth/verify-email',
      name: 'verify-email',
      title: 'Verify Email',
      description: 'Verify your email address',
      layout: 'form',
      hidden: true,
      protected: false
    },
    {
      path: '/auth/signout',
      name: 'signout',
      title: 'Sign Out',
      hidden: true,
      protected: true
    }
  ]
};

// Dashboard routes
export const DASHBOARD_ROUTES: RouteGroup = {
  name: 'dashboard',
  label: 'Dashboard',
  icon: 'home',
  protected: true,
  order: 1,
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      title: 'Dashboard',
      description: 'Overview of your account and activity',
      layout: 'dashboard',
      icon: 'home',
      protected: true,
      preload: true,
      seo: {
        title: 'Dashboard - Your App',
        description: 'View your account overview, recent activity, and key metrics.',
        noindex: true
      }
    },
    {
      path: '/dashboard/analytics',
      name: 'analytics',
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      layout: 'dashboard',
      icon: 'bar-chart-3',
      protected: true,
      permissions: ['analytics:read']
    }
  ]
};

// User management routes
export const USER_ROUTES: RouteGroup = {
  name: 'users',
  label: 'Users',
  icon: 'users',
  protected: true,
  roles: ['admin', 'manager'],
  order: 2,
  routes: [
    {
      path: '/users',
      name: 'users-list',
      title: 'Users',
      description: 'Manage user accounts',
      layout: 'dashboard',
      icon: 'users',
      protected: true,
      roles: ['admin', 'manager'],
      permissions: ['users:read']
    },
    {
      path: '/users/[id]',
      name: 'user-detail',
      title: 'User Details',
      layout: 'dashboard',
      hidden: true,
      protected: true,
      roles: ['admin', 'manager'],
      permissions: ['users:read']
    },
    {
      path: '/users/create',
      name: 'user-create',
      title: 'Create User',
      layout: 'form',
      hidden: true,
      protected: true,
      roles: ['admin'],
      permissions: ['users:create']
    },
    {
      path: '/users/[id]/edit',
      name: 'user-edit',
      title: 'Edit User',
      layout: 'form',
      hidden: true,
      protected: true,
      roles: ['admin', 'manager'],
      permissions: ['users:update']
    }
  ]
};

// Profile routes
export const PROFILE_ROUTES: RouteGroup = {
  name: 'profile',
  label: 'Profile',
  icon: 'user',
  protected: true,
  order: 8,
  routes: [
    {
      path: '/profile',
      name: 'profile',
      title: 'Profile',
      description: 'Manage your profile and account settings',
      layout: 'dashboard',
      icon: 'user',
      protected: true,
      seo: {
        title: 'Profile - Your App',
        description: 'Manage your profile information and account settings.',
        noindex: true
      }
    },
    {
      path: '/profile/settings',
      name: 'profile-settings',
      title: 'Account Settings',
      description: 'Update your account preferences',
      layout: 'dashboard',
      icon: 'settings',
      protected: true
    },
    {
      path: '/profile/security',
      name: 'profile-security',
      title: 'Security',
      description: 'Manage your security settings',
      layout: 'dashboard',
      icon: 'shield',
      protected: true
    },
    {
      path: '/profile/billing',
      name: 'profile-billing',
      title: 'Billing',
      description: 'Manage billing and subscription',
      layout: 'dashboard',
      icon: 'credit-card',
      protected: true,
      permissions: ['billing:read']
    }
  ]
};

// Settings routes
export const SETTINGS_ROUTES: RouteGroup = {
  name: 'settings',
  label: 'Settings',
  icon: 'settings',
  protected: true,
  roles: ['admin'],
  order: 9,
  routes: [
    {
      path: '/settings',
      name: 'settings',
      title: 'Settings',
      description: 'Application settings and configuration',
      layout: 'dashboard',
      icon: 'settings',
      protected: true,
      roles: ['admin'],
      permissions: ['settings:read']
    },
    {
      path: '/settings/general',
      name: 'settings-general',
      title: 'General Settings',
      layout: 'dashboard',
      hidden: true,
      protected: true,
      roles: ['admin'],
      permissions: ['settings:update']
    },
    {
      path: '/settings/integrations',
      name: 'settings-integrations',
      title: 'Integrations',
      layout: 'dashboard',
      hidden: true,
      protected: true,
      roles: ['admin'],
      permissions: ['integrations:manage']
    }
  ]
};

// Public content routes
export const CONTENT_ROUTES: RouteGroup = {
  name: 'content',
  label: 'Content',
  protected: false,
  order: 10,
  routes: [
    {
      path: '/',
      name: 'home',
      title: 'Home',
      description: 'Welcome to our application',
      layout: 'default',
      protected: false,
      seo: {
        title: 'Your App - Welcome',
        description: 'Discover the power of our application and get started today.',
        keywords: ['app', 'welcome', 'home']
      }
    },
    {
      path: '/about',
      name: 'about',
      title: 'About',
      description: 'Learn more about our company and mission',
      layout: 'content',
      protected: false,
      seo: {
        title: 'About Us - Your App',
        description: 'Learn about our mission, values, and the team behind the application.',
        keywords: ['about', 'company', 'mission']
      }
    },
    {
      path: '/contact',
      name: 'contact',
      title: 'Contact',
      description: 'Get in touch with us',
      layout: 'form',
      protected: false,
      seo: {
        title: 'Contact Us - Your App',
        description: 'Get in touch with our team for support, questions, or feedback.',
        keywords: ['contact', 'support', 'help']
      }
    },
    {
      path: '/privacy',
      name: 'privacy',
      title: 'Privacy Policy',
      layout: 'content',
      protected: false,
      seo: {
        title: 'Privacy Policy - Your App',
        description: 'Our privacy policy and how we handle your data.'
      }
    },
    {
      path: '/terms',
      name: 'terms',
      title: 'Terms of Service',
      layout: 'content',
      protected: false,
      seo: {
        title: 'Terms of Service - Your App',
        description: 'Terms of service and usage guidelines.'
      }
    }
  ]
};

// Error routes
export const ERROR_ROUTES: RouteGroup = {
  name: 'errors',
  label: 'Errors',
  routes: [
    {
      path: '/404',
      name: 'not-found',
      title: '404 - Page Not Found',
      layout: 'default',
      hidden: true,
      protected: false,
      seo: {
        title: '404 - Page Not Found',
        description: 'The page you are looking for does not exist.',
        noindex: true
      }
    },
    {
      path: '/403',
      name: 'forbidden',
      title: '403 - Access Denied',
      layout: 'default',
      hidden: true,
      protected: false,
      seo: {
        noindex: true
      }
    },
    {
      path: '/500',
      name: 'server-error',
      title: '500 - Server Error',
      layout: 'default',
      hidden: true,
      protected: false,
      seo: {
        noindex: true
      }
    }
  ]
};

// All route groups
export const ROUTE_GROUPS: RouteGroup[] = [
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  USER_ROUTES,
  PROFILE_ROUTES,
  SETTINGS_ROUTES,
  CONTENT_ROUTES,
  ERROR_ROUTES
];

// Flattened routes for easy lookup
export const ALL_ROUTES: RouteConfig[] = ROUTE_GROUPS.flatMap(group => group.routes);

// Route utilities
export class RouteHelper {
  /**
   * Find route by name
   */
  static findByName(name: string): RouteConfig | undefined {
    return ALL_ROUTES.find(route => route.name === name);
  }

  /**
   * Find route by path
   */
  static findByPath(path: string): RouteConfig | undefined {
    return ALL_ROUTES.find(route => route.path === path);
  }

  /**
   * Get routes for navigation (excluding hidden routes)
   */
  static getNavigationRoutes(userRoles: string[] = [], userPermissions: string[] = []): NavigationItem[] {
    const visibleGroups = ROUTE_GROUPS.filter(group => {
      if (group.protected && (!userRoles.length && !userPermissions.length)) return false;
      if (group.roles && !group.roles.some(role => userRoles.includes(role))) return false;
      return true;
    });

    return visibleGroups.map(group => ({
      label: group.label,
      href: '#',
      icon: group.icon,
      children: group.routes
        .filter(route => {
          if (route.hidden) return false;
          if (route.protected && (!userRoles.length && !userPermissions.length)) return false;
          if (route.roles && !route.roles.some(role => userRoles.includes(role))) return false;
          if (route.permissions && !route.permissions.some(perm => userPermissions.includes(perm))) return false;
          return true;
        })
        .map(route => ({
          label: route.title || route.name,
          href: route.path,
          icon: route.icon,
          badge: route.badge
        }))
    })).filter(group => group.children && group.children.length > 0);
  }

  /**
   * Get breadcrumbs for a path
   */
  static getBreadcrumbs(path: string): Array<{ label: string; href?: string }> {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    for (const segment of segments) {
      currentPath += '/' + segment;
      const route = this.findByPath(currentPath);
      
      breadcrumbs.push({
        label: route?.title || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath
      });
    }

    // Remove href from last item (current page)
    if (breadcrumbs.length > 0) {
      delete breadcrumbs[breadcrumbs.length - 1].href;
    }

    return breadcrumbs;
  }

  /**
   * Check if route is protected
   */
  static isProtected(path: string): boolean {
    const route = this.findByPath(path);
    return route?.protected ?? false;
  }

  /**
   * Check if user has access to route
   */
  static hasAccess(
    path: string, 
    userRoles: string[] = [], 
    userPermissions: string[] = []
  ): boolean {
    const route = this.findByPath(path);
    if (!route) return false;

    // Public routes
    if (!route.protected) return true;

    // Protected routes require authentication
    if (route.protected && !userRoles.length && !userPermissions.length) return false;

    // Check roles
    if (route.roles && !route.roles.some(role => userRoles.includes(role))) return false;

    // Check permissions
    if (route.permissions && !route.permissions.some(perm => userPermissions.includes(perm))) return false;

    return true;
  }

  /**
   * Get route metadata for SEO
   */
  static getRouteMeta(path: string): RouteConfig['seo'] {
    const route = this.findByPath(path);
    return route?.seo;
  }

  /**
   * Get layout type for route
   */
  static getLayout(path: string): string {
    const route = this.findByPath(path);
    return route?.layout || 'default';
  }

  /**
   * Generate URL with parameters
   */
  static generateUrl(routeName: string, params: Record<string, string> = {}): string {
    const route = this.findByName(routeName);
    if (!route) return '/';

    let path = route.path;
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`[${key}]`, value);
    });

    return path;
  }

  /**
   * Get routes by group
   */
  static getRoutesByGroup(groupName: string): RouteConfig[] {
    const group = ROUTE_GROUPS.find(g => g.name === groupName);
    return group?.routes || [];
  }

  /**
   * Get dashboard navigation
   */
  static getDashboardNavigation(userRoles: string[] = [], userPermissions: string[] = []): NavigationItem[] {
    const navigation: NavigationItem[] = [];

    // Dashboard main
    navigation.push({
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'home'
    });

    // Add other groups based on access
    ROUTE_GROUPS.forEach(group => {
      if (group.name === 'dashboard' || group.name === 'auth' || group.name === 'errors' || group.name === 'content') return;
      
      if (group.protected && (!userRoles.length && !userPermissions.length)) return;
      if (group.roles && !group.roles.some(role => userRoles.includes(role))) return;

      const groupRoutes = group.routes.filter(route => {
        if (route.hidden) return false;
        if (route.protected && (!userRoles.length && !userPermissions.length)) return false;
        if (route.roles && !route.roles.some(role => userRoles.includes(role))) return false;
        if (route.permissions && !route.permissions.some(perm => userPermissions.includes(perm))) return false;
        return true;
      });

      if (groupRoutes.length > 0) {
        // If only one route, add it directly
        if (groupRoutes.length === 1) {
          navigation.push({
            label: groupRoutes[0].title || group.label,
            href: groupRoutes[0].path,
            icon: group.icon || groupRoutes[0].icon
          });
        } else {
          // Add as group with children
          navigation.push({
            label: group.label,
            href: '#',
            icon: group.icon,
            children: groupRoutes.map(route => ({
              label: route.title || route.name,
              href: route.path,
              icon: route.icon,
              badge: route.badge
            }))
          });
        }
      }
    });

    return navigation;
  }
}

// Export default configuration
export default {
  groups: ROUTE_GROUPS,
  routes: ALL_ROUTES,
  helper: RouteHelper
};