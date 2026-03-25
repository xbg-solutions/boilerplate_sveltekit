/**
 * src/lib/services/token/index.ts
 * Token Service Exports
 * 
 * Exports for the token service functionality
 */

import { get } from 'svelte/store';
import { tokenStore } from '../../stores/token.store';
import { createTokenService } from './token.service';

// Create the token service instance
const tokenService = createTokenService();

// Export store and service
export { tokenStore, tokenService };

// Export function to get current store state
export const getTokenState = () => get(tokenStore);

// Export utility functions from the service for easier access
export const {
  getToken,
  refreshToken,
  getClaims,
  getRoles,
  userHasRole,
  userHasAnyRole,
  isAuthenticated
} = tokenService;

// Default export for convenience
export default tokenService;