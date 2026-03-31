/**
 * src/lib/utils/rbac.ts
 * Role-Based Access Control Utility
 * 
 * A unified utility for role-based access control that supports both:
 * - Role array-based permissions
 * - Boolean flag-based permissions
 * 
 * This utility is designed to be flexible and adaptable for different
 * authentication and authorization models.
 */

import { loggerService, ROLES, CLAIM_BOOLEAN_MAP, BOOLEAN_CLAIM_ROLE_MAP, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '@xbg.solutions/bpsk-core';
import { extractClaims } from '@xbg.solutions/bpsk-utils-firebase-auth';
import type { FirebaseUserClaims, DecodedToken } from '@xbg.solutions/bpsk-core';

// Create a context-aware logger
const logger = loggerService.withContext('RBACUtil');

/**
 * RBAC utility for role and permission checking
 */
export const rbacUtil = {
  /**
   * Normalizes claims to ensure consistent structure
   * @param claims User claims to normalize
   * @returns Normalized claims
   */
  normalizeClaims(claims: FirebaseUserClaims | null): FirebaseUserClaims | null {
    if (!claims) return null;
    
    // Create a copy to avoid modifying the original
    const normalizedClaims = { ...claims };
    
    // Ensure roles is an array
    if (normalizedClaims.roles !== undefined) {
      if (typeof normalizedClaims.roles === 'string') {
        normalizedClaims.roles = (normalizedClaims.roles as string).split(/[,\s]+/).filter(Boolean);
      }
    }
    
    // If roles is not an array (undefined, null, or wrong type), initialize it
    if (!Array.isArray(normalizedClaims.roles)) {
      normalizedClaims.roles = [];
    }
    
    // Convert string/number boolean flags to actual booleans
    Object.values(CLAIM_BOOLEAN_MAP).forEach(flag => {
      if (normalizedClaims[flag] !== undefined) {
        const value = normalizedClaims[flag];
        if (value === 'true' || value === '1' || value === 1) {
          normalizedClaims[flag] = true;
        } else if (value === 'false' || value === '0' || value === 0) {
          normalizedClaims[flag] = false;
        } else {
          normalizedClaims[flag] = !!value;
        }
      }
    });
    
    // Sync between roles array and boolean flags
    this.syncRolesAndFlags(normalizedClaims);
    
    return normalizedClaims;
  },
  
  /**
   * Synchronizes roles array with boolean flags to ensure consistency
   * @param claims Claims object to synchronize
   */
  syncRolesAndFlags(claims: FirebaseUserClaims): void {
    if (!claims) return;
    
    // Initialize roles array if it doesn't exist
    if (!Array.isArray(claims.roles)) {
      claims.roles = [];
    }
    
    // Add roles based on boolean flags
    Object.entries(BOOLEAN_CLAIM_ROLE_MAP).forEach(([flag, role]) => {
      if (claims[flag] === true && !claims.roles!.includes(role)) {
        claims.roles!.push(role);
      }
    });
    
    // Set boolean flags based on roles
    Object.entries(CLAIM_BOOLEAN_MAP).forEach(([role, flag]) => {
      if (claims.roles!.includes(role) && claims[flag] !== true) {
        claims[flag] = true;
      }
    });
  },
  
  /**
   * Gets all roles from a claims object
   * @param claimsOrToken User claims or token
   * @returns Array of roles
   */
  getRoles(claimsOrToken: FirebaseUserClaims | string | DecodedToken | null): string[] {
    if (!claimsOrToken) return [];
    
    try {
      // Extract claims if token was provided
      let claims: FirebaseUserClaims;
      if (typeof claimsOrToken === 'string') {
        claims = extractClaims(claimsOrToken);
      } else if ('exp' in claimsOrToken && typeof claimsOrToken.exp === 'number') {
        claims = extractClaims(claimsOrToken as DecodedToken);
      } else {
        claims = claimsOrToken as FirebaseUserClaims;
      }
      
      // Normalize claims
      const normalizedClaims = this.normalizeClaims(claims);
      if (!normalizedClaims) return [];
      
      // Return roles array
      return normalizedClaims.roles || [];
    } catch (error) {
      logger.warn('Failed to get roles', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  },
  
  /**
   * Checks if a user has a specific role
   * @param claimsOrToken User claims or token
   * @param role Role to check
   * @returns True if user has the role
   */
  hasRole(claimsOrToken: FirebaseUserClaims | string | DecodedToken | null, role: string): boolean {
    if (!claimsOrToken) return false;
    
    try {
      // Extract claims if token was provided
      let claims: FirebaseUserClaims;
      if (typeof claimsOrToken === 'string') {
        claims = extractClaims(claimsOrToken);
      } else if ('exp' in claimsOrToken && typeof claimsOrToken.exp === 'number') {
        claims = extractClaims(claimsOrToken as DecodedToken);
      } else {
        claims = claimsOrToken as FirebaseUserClaims;
      }
      
      // Normalize claims
      const normalizedClaims = this.normalizeClaims(claims);
      if (!normalizedClaims) return false;
      
      // Check directly in roles array
      if (normalizedClaims.roles?.includes(role)) {
        return true;
      }
      
      // Check boolean flag
      const flag = CLAIM_BOOLEAN_MAP[role];
      if (flag && normalizedClaims[flag] === true) {
        return true;
      }
      
      // Check if the user has a higher role that includes this role
      for (const [higherRole, includedRoles] of Object.entries(ROLE_HIERARCHY)) {
        if (includedRoles.includes(role) && normalizedClaims.roles?.includes(higherRole)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      logger.warn(`Failed to check role "${role}"`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  },
  
  /**
   * Checks if a user has any of the specified roles
   * @param claimsOrToken User claims or token
   * @param roles Roles to check
   * @returns True if user has any of the roles
   */
  hasAnyRole(claimsOrToken: FirebaseUserClaims | string | DecodedToken | null, roles: string[]): boolean {
    if (!claimsOrToken || !roles.length) return false;
    
    return roles.some(role => this.hasRole(claimsOrToken, role));
  },
  
  /**
   * Checks if a user has all of the specified roles
   * @param claimsOrToken User claims or token
   * @param roles Roles to check
   * @returns True if user has all of the roles
   */
  hasAllRoles(claimsOrToken: FirebaseUserClaims | string | DecodedToken | null, roles: string[]): boolean {
    if (!claimsOrToken || !roles.length) return false;
    
    return roles.every(role => this.hasRole(claimsOrToken, role));
  },
  
  /**
   * Checks if a user has a specific permission
   * @param claimsOrToken User claims or token
   * @param permission Permission to check
   * @returns True if user has the permission
   */
  hasPermission(claimsOrToken: FirebaseUserClaims | string | DecodedToken | null, permission: string): boolean {
    if (!claimsOrToken) return false;
    
    try {
      // Get user roles
      const roles = this.getRoles(claimsOrToken);
      
      // Check if any role grants the permission
      return roles.some(role => {
        const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
        return rolePermissions && rolePermissions.includes(permission);
      });
    } catch (error) {
      logger.warn(`Failed to check permission "${permission}"`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  },
  
  /**
   * Checks if a user has all of the specified permissions
   * @param claimsOrToken User claims or token
   * @param permissions Permissions to check
   * @returns True if user has all of the permissions
   */
  hasAllPermissions(claimsOrToken: FirebaseUserClaims | string | DecodedToken | null, permissions: string[]): boolean {
    if (!claimsOrToken || !permissions.length) return false;
    
    return permissions.every(permission => this.hasPermission(claimsOrToken, permission));
  },
  
  /**
   * Checks if a user has any of the specified permissions
   * @param claimsOrToken User claims or token
   * @param permissions Permissions to check
   * @returns True if user has any of the permissions
   */
  hasAnyPermission(claimsOrToken: FirebaseUserClaims | string | DecodedToken | null, permissions: string[]): boolean {
    if (!claimsOrToken || !permissions.length) return false;
    
    return permissions.some(permission => this.hasPermission(claimsOrToken, permission));
  },
  
  /**
   * Gets all permissions available to a user
   * @param claimsOrToken User claims or token
   * @returns Array of permissions
   */
  getAllPermissions(claimsOrToken: FirebaseUserClaims | string | DecodedToken | null): string[] {
    if (!claimsOrToken) return [];
    
    try {
      // Get user roles
      const roles = this.getRoles(claimsOrToken);
      
      // Collect all permissions from all roles
      const permissions = new Set<string>();
      
      roles.forEach(role => {
        const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
        if (rolePermissions) {
          rolePermissions.forEach(permission => {
            permissions.add(permission);
          });
        }
      });
      
      return Array.from(permissions);
    } catch (error) {
      logger.warn('Failed to get all permissions', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  },
  
  /**
   * Safe version of hasRole that never throws
   * @param claimsOrToken User claims or token
   * @param role Role to check
   * @returns True if user has the role, false otherwise
   */
  safeHasRole(claimsOrToken: FirebaseUserClaims | string | DecodedToken | null, role: string): boolean {
    try {
      return this.hasRole(claimsOrToken, role);
    } catch (error) {
      const logError = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in safeHasRole for role "${role}"`, logError);
      return false;
    }
  },
  
  /**
   * Safe version of hasPermission that never throws
   * @param claimsOrToken User claims or token
   * @param permission Permission to check
   * @returns True if user has the permission, false otherwise
   */
  safeHasPermission(claimsOrToken: FirebaseUserClaims | string | DecodedToken | null, permission: string): boolean {
    try {
      return this.hasPermission(claimsOrToken, permission);
    } catch (error) {
      const logError = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error in safeHasPermission for permission "${permission}"`, logError);
      return false;
    }
  }
};