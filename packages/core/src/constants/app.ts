/**
 * src/lib/constants/app.ts
 * Application constants defines variables that are used app-wide.
 * 
 * @deprecated This file has been replaced by centralized configuration.
 * Import from '@/lib/config/app.config.ts' instead.
 */

// Re-export the central configuration for backwards compatibility
import { 
  APP_CONFIG,
  COMPUTED_CONFIG,
  configHelpers
} from '../config/app.config';

export { 
  APP_CONFIG as default,
  APP_CONFIG,
  COMPUTED_CONFIG,
  configHelpers
};

// Alias for backwards compatibility
export const APPLICATION_CONFIG = APP_CONFIG;
