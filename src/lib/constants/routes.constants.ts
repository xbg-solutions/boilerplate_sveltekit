/**
 * src/lib/constants/routes.constants.ts
 * Routes Constants
 * 
 * @deprecated This file is being phased out in favor of centralized configuration.
 * New code should import routes from '@/lib/config/app.config.ts' instead.
 * 
 * Legacy route constants that now reference the central configuration.
 * This file is maintained for backwards compatibility during the migration.
 */

import { APP_CONFIG } from '../config/app.config';
// Re-export AUTH_ROUTES for backward compatibility
import { AUTH_ROUTES } from './auth.constants';

/**
 * @deprecated Use APP_CONFIG.routes instead
 * Legacy route constants - use central config for new development
 */
export const ROUTES = {
  LOGIN: APP_CONFIG.routes.public.signIn,
  CONFIRM: APP_CONFIG.routes.public.confirm,
  UNAUTHORIZED: APP_CONFIG.routes.public.unauthorized,
  PROTECTED: {
    HOME: APP_CONFIG.routes.protected.dashboard,
    CLIENT: APP_CONFIG.routes.protected.client,
    CONSULTANT: APP_CONFIG.routes.protected.consultant,  
    ADMIN: APP_CONFIG.routes.protected.admin,
    SYSADMIN: APP_CONFIG.routes.protected.sysadmin
  }
};

// Authentication-related routing is now in auth.constants.ts and app.config.ts

// Export types for use in other modules  
export type ClaimOperator = 'all' | 'any' | 'not';

export interface RouteClaimConfig {
  operator: ClaimOperator;
  claims: string[];
}