#!/usr/bin/env node

/**
 * Service Generator
 * 
 * Generates a new service with TypeScript support, error handling, and tests.
 * 
 * Usage:
 *   node __scripts__/generate-service.js <ServiceName> [options]
 *   npm run generate:service <ServiceName> [options]
 * 
 * Options:
 *   --type <type>       Service type: api|store|util|auth|data (default: api)
 *   --with-test         Generate test file
 *   --with-types        Generate TypeScript types file
 *   --with-cache        Add caching functionality
 *   --with-events       Add event publishing
 * 
 * Examples:
 *   node __scripts__/generate-service.js UserService --type=api --with-test --with-cache
 *   node __scripts__/generate-service.js NotificationService --with-events --with-test
 *   node __scripts__/generate-service.js DataProcessor --type=util --with-types
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const serviceName = args[0];

if (!serviceName) {
  console.error('❌ Service name is required!');
  console.log('Usage: node __scripts__/generate-service.js <ServiceName> [options]');
  console.log('Examples:');
  console.log('  node __scripts__/generate-service.js UserService --type=api');
  console.log('  node __scripts__/generate-service.js NotificationStore --type=store');
  process.exit(1);
}

// Parse options
const options = {
  type: 'api',
  withTest: false,
  withTypes: false,
  withCache: false,
  withEvents: false
};

args.slice(1).forEach(arg => {
  if (arg.startsWith('--type=')) {
    options.type = arg.split('=')[1];
  } else if (arg === '--with-test') {
    options.withTest = true;
  } else if (arg === '--with-types') {
    options.withTypes = true;
  } else if (arg === '--with-cache') {
    options.withCache = true;
  } else if (arg === '--with-events') {
    options.withEvents = true;
  }
});

// Validate service name
if (!/^[A-Z][a-zA-Z0-9]*$/.test(serviceName)) {
  console.error('❌ Service name must be PascalCase (e.g., UserService, DataProcessor)');
  process.exit(1);
}

// Validate service type
if (!['api', 'store', 'util', 'auth', 'data'].includes(options.type)) {
  console.error('❌ Invalid service type. Must be: api, store, util, auth, or data');
  process.exit(1);
}

// Generate file paths
const serviceTypePath = {
  api: 'src/lib/services/api',
  store: 'src/lib/stores',
  util: 'src/lib/utils',
  auth: 'src/lib/services/auth',
  data: 'src/lib/services/data'
};

const basePath = serviceTypePath[options.type];
const kebabName = serviceName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const fileName = kebabName.replace('-service', '') + (options.type === 'store' ? '.store' : options.type === 'util' ? '' : '.service');
const serviceFile = path.join(basePath, `${fileName}.ts`);
const testFile = path.join(basePath, `${fileName}.test.ts`);
const typesFile = path.join(basePath, `${fileName}.types.ts`);

// Ensure directory exists
const dir = path.dirname(serviceFile);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Generate service template based on type
function generateServiceTemplate() {
  const templates = {
    api: generateApiServiceTemplate(),
    store: generateStoreServiceTemplate(),
    util: generateUtilServiceTemplate(),
    auth: generateAuthServiceTemplate(),
    data: generateDataServiceTemplate()
  };
  
  return templates[options.type];
}

function generateApiServiceTemplate() {
  const cacheImport = options.withCache ? `import { cacheService } from '$lib/services/cache/cache.service';` : '';
  const eventsImport = options.withEvents ? `import { publish } from '$lib/services/events';` : '';
  const typesImport = options.withTypes ? `import type { ${serviceName}Types } from './${fileName}.types';` : '';
  
  const cacheLogic = options.withCache ? `
  // Cache configuration
  private cacheKey = '${kebabName}';
  private cacheTTL = 5 * 60 * 1000; // 5 minutes` : '';
  
  const eventLogic = options.withEvents ? `
  // Event publishing
  private publishEvent(eventType: string, data: any) {
    publish(\`${kebabName}:\${eventType}\`, {
      timestamp: Date.now(),
      source: '${serviceName}',
      data
    });
  }` : '';

  return `/**
 * ${serviceName}
 * 
 * API service for managing ${serviceName.replace('Service', '').toLowerCase()} operations.
 * Handles CRUD operations, error handling, and data transformation.
 */

import { apiService } from '$lib/services/api/api.service';
import { handleError } from '$lib/utils/error-handler';
import { loggerService } from '$lib/services/logging/logging.service';${cacheImport}${eventsImport}${typesImport}

// Types
export interface ${serviceName.replace('Service', '')}Item {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Create${serviceName.replace('Service', '')}Request {
  name: string;
  description?: string;
}

export interface Update${serviceName.replace('Service', '')}Request {
  name?: string;
  description?: string;
}

export interface ${serviceName.replace('Service', '')}ListOptions {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ${serviceName.replace('Service', '')}Response {
  data: ${serviceName.replace('Service', '')}Item[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

class ${serviceName} {
  private baseUrl = '/api/${kebabName}';${cacheLogic}${eventLogic}

  /**
   * Get all items with optional filtering and pagination
   */
  async getAll(options: ${serviceName.replace('Service', '')}ListOptions = {}): Promise<${serviceName.replace('Service', '')}Response> {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.set('limit', options.limit.toString());
      if (options.offset) params.set('offset', options.offset.toString());
      if (options.search) params.set('search', options.search);
      if (options.sortBy) params.set('sortBy', options.sortBy);
      if (options.sortOrder) params.set('sortOrder', options.sortOrder);
      
      const url = \`\${this.baseUrl}?\${params.toString()}\`;${options.withCache ? `
      
      // Check cache first
      const cached = await cacheService.get<${serviceName.replace('Service', '')}Response>(url);
      if (cached) {
        loggerService.debug('${serviceName}: Returning cached data');
        return cached;
      }` : ''}
      
      const response = await apiService.get<${serviceName.replace('Service', '')}Response>(url);${options.withCache ? `
      
      // Cache the response
      await cacheService.set(url, response.data, this.cacheTTL);` : ''}${options.withEvents ? `
      
      this.publishEvent('list', { count: response.data.data.length, options });` : ''}
      
      return response.data;
      
    } catch (error) {
      loggerService.error('${serviceName}: Failed to get all items', { error, options });
      throw handleError(error, 'Failed to load ${serviceName.replace('Service', '').toLowerCase()}s');
    }
  }

  /**
   * Get a single item by ID
   */
  async getById(id: string): Promise<${serviceName.replace('Service', '')}Item> {
    if (!id) {
      throw new Error('ID is required');
    }

    try {
      const url = \`\${this.baseUrl}/\${id}\`;${options.withCache ? `
      
      // Check cache first
      const cached = await cacheService.get<${serviceName.replace('Service', '')}Item>(url);
      if (cached) {
        return cached;
      }` : ''}
      
      const response = await apiService.get<${serviceName.replace('Service', '')}Item>(url);${options.withCache ? `
      
      // Cache the response
      await cacheService.set(url, response.data, this.cacheTTL);` : ''}${options.withEvents ? `
      
      this.publishEvent('get', { id });` : ''}
      
      return response.data;
      
    } catch (error) {
      loggerService.error('${serviceName}: Failed to get item by ID', { error, id });
      throw handleError(error, \`Failed to load \${serviceName.replace('Service', '').toLowerCase()}\`);
    }
  }

  /**
   * Create a new item
   */
  async create(data: Create${serviceName.replace('Service', '')}Request): Promise<${serviceName.replace('Service', '')}Item> {
    try {
      // Validate input
      if (!data.name?.trim()) {
        throw new Error('Name is required');
      }

      const response = await apiService.post<${serviceName.replace('Service', '')}Item>(this.baseUrl, data);${options.withCache ? `
      
      // Invalidate related cache entries
      await this.invalidateCache();` : ''}${options.withEvents ? `
      
      this.publishEvent('create', { item: response.data });` : ''}
      
      loggerService.info('${serviceName}: Item created successfully', { id: response.data.id });
      return response.data;
      
    } catch (error) {
      loggerService.error('${serviceName}: Failed to create item', { error, data });
      throw handleError(error, 'Failed to create ${serviceName.replace('Service', '').toLowerCase()}');
    }
  }

  /**
   * Update an existing item
   */
  async update(id: string, data: Update${serviceName.replace('Service', '')}Request): Promise<${serviceName.replace('Service', '')}Item> {
    if (!id) {
      throw new Error('ID is required');
    }

    try {
      const response = await apiService.put<${serviceName.replace('Service', '')}Item>(\`\${this.baseUrl}/\${id}\`, data);${options.withCache ? `
      
      // Invalidate cache
      await this.invalidateCache();
      await cacheService.delete(\`\${this.baseUrl}/\${id}\`);` : ''}${options.withEvents ? `
      
      this.publishEvent('update', { id, item: response.data });` : ''}
      
      loggerService.info('${serviceName}: Item updated successfully', { id });
      return response.data;
      
    } catch (error) {
      loggerService.error('${serviceName}: Failed to update item', { error, id, data });
      throw handleError(error, 'Failed to update ${serviceName.replace('Service', '').toLowerCase()}');
    }
  }

  /**
   * Delete an item
   */
  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID is required');
    }

    try {
      await apiService.delete(\`\${this.baseUrl}/\${id}\`);${options.withCache ? `
      
      // Invalidate cache
      await this.invalidateCache();
      await cacheService.delete(\`\${this.baseUrl}/\${id}\`);` : ''}${options.withEvents ? `
      
      this.publishEvent('delete', { id });` : ''}
      
      loggerService.info('${serviceName}: Item deleted successfully', { id });
      
    } catch (error) {
      loggerService.error('${serviceName}: Failed to delete item', { error, id });
      throw handleError(error, 'Failed to delete ${serviceName.replace('Service', '').toLowerCase()}');
    }
  }${options.withCache ? `

  /**
   * Clear all cached data for this service
   */
  async clearCache(): Promise<void> {
    await this.invalidateCache();
    loggerService.debug('${serviceName}: Cache cleared');
  }

  /**
   * Invalidate cache entries
   */
  private async invalidateCache(): Promise<void> {
    await cacheService.deleteByPattern(\`\${this.baseUrl}*\`);
  }` : ''}${options.withEvents ? `

  /**
   * Subscribe to service events
   */
  onEvent(eventType: string, callback: (data: any) => void): () => void {
    const fullEventType = \`${kebabName}:\${eventType}\`;
    // Implementation depends on your event system
    // Return unsubscribe function
    return () => {};
  }` : ''}
}

// Export singleton instance
export const ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)} = new ${serviceName}();
export default ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)};`;
}

function generateStoreServiceTemplate() {
  return `/**
 * ${serviceName}
 * 
 * Svelte store for managing ${serviceName.replace('Service', '').replace('Store', '').toLowerCase()} state.
 */

import { writable, derived, type Writable, type Readable } from 'svelte/store';
import { browser } from '$app/environment';${options.withEvents ? `
import { publish } from '$lib/services/events';` : ''}

// Types
export interface ${serviceName.replace('Service', '').replace('Store', '')}State {
  data: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface ${serviceName.replace('Service', '').replace('Store', '')}Item {
  id: string;
  // Add your item properties here
}

// Initial state
const initialState: ${serviceName.replace('Service', '').replace('Store', '')}State = {
  data: [],
  loading: false,
  error: null,
  lastUpdated: null
};

// Create the store
function create${serviceName}() {
  const { subscribe, set, update }: Writable<${serviceName.replace('Service', '').replace('Store', '')}State> = writable(initialState);

  return {
    subscribe,
    
    // Actions
    setLoading(loading: boolean) {
      update(state => ({ ...state, loading }));
    },

    setError(error: string | null) {
      update(state => ({ ...state, error, loading: false }));
    },

    setData(data: any[]) {
      update(state => ({
        ...state,
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }));${options.withEvents ? `
      
      publish('${kebabName}:dataChanged', { count: data.length });` : ''}
    },

    addItem(item: ${serviceName.replace('Service', '').replace('Store', '')}Item) {
      update(state => ({
        ...state,
        data: [...state.data, item],
        lastUpdated: new Date()
      }));${options.withEvents ? `
      
      publish('${kebabName}:itemAdded', item);` : ''}
    },

    updateItem(id: string, updates: Partial<${serviceName.replace('Service', '').replace('Store', '')}Item>) {
      update(state => ({
        ...state,
        data: state.data.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ),
        lastUpdated: new Date()
      }));${options.withEvents ? `
      
      publish('${kebabName}:itemUpdated', { id, updates });` : ''}
    },

    removeItem(id: string) {
      update(state => ({
        ...state,
        data: state.data.filter(item => item.id !== id),
        lastUpdated: new Date()
      }));${options.withEvents ? `
      
      publish('${kebabName}:itemRemoved', { id });` : ''}
    },

    reset() {
      set(initialState);
    },

    // Load data from API
    async load() {
      this.setLoading(true);
      
      try {
        // Replace with your actual API call
        // const response = await apiService.get('/api/${kebabName}');
        // this.setData(response.data);
        
        // Mock data for now
        this.setData([]);
        
      } catch (error) {
        this.setError(error instanceof Error ? error.message : 'Failed to load data');
      }
    }
  };
}

// Create store instance
export const ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)} = create${serviceName}();

// Derived stores
export const ${serviceName.replace('Service', '').replace('Store', '').toLowerCase()}Items: Readable<${serviceName.replace('Service', '').replace('Store', '')}Item[]> = derived(
  ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)},
  ($store) => $store.data
);

export const ${serviceName.replace('Service', '').replace('Store', '').toLowerCase()}Loading: Readable<boolean> = derived(
  ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)},
  ($store) => $store.loading
);

export const ${serviceName.replace('Service', '').replace('Store', '').toLowerCase()}Error: Readable<string | null> = derived(
  ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)},
  ($store) => $store.error
);

export const ${serviceName.replace('Service', '').replace('Store', '').toLowerCase()}Count: Readable<number> = derived(
  ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)},
  ($store) => $store.data.length
);

// Auto-load data in browser
if (browser) {
  ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)}.load();
}`;
}

function generateUtilServiceTemplate() {
  return `/**
 * ${serviceName}
 * 
 * Utility functions for ${serviceName.replace('Service', '').toLowerCase()} operations.
 */

import { loggerService } from '$lib/services/logging/logging.service';${options.withEvents ? `
import { publish } from '$lib/services/events';` : ''}${options.withTypes ? `
import type { ${serviceName}Types } from './${fileName}.types';` : ''}

// Types
export interface ${serviceName.replace('Service', '')}Options {
  // Define your options here
}

export interface ${serviceName.replace('Service', '')}Result {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Main ${serviceName.replace('Service', '').toLowerCase()} function
 */
export function ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1).replace('Service', '')}(
  input: any,
  options: ${serviceName.replace('Service', '')}Options = {}
): ${serviceName.replace('Service', '')}Result {
  try {
    loggerService.debug('${serviceName}: Processing input', { input, options });

    // Your utility logic here
    const result = processInput(input, options);${options.withEvents ? `
    
    publish('${kebabName}:processed', { input, result, options });` : ''}

    return {
      success: true,
      data: result
    };

  } catch (error) {
    loggerService.error('${serviceName}: Processing failed', { error, input, options });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed'
    };
  }
}

/**
 * Async version of ${serviceName.replace('Service', '').toLowerCase()}
 */
export async function ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1).replace('Service', '')}Async(
  input: any,
  options: ${serviceName.replace('Service', '')}Options = {}
): Promise<${serviceName.replace('Service', '')}Result> {
  try {
    loggerService.debug('${serviceName}: Processing input async', { input, options });

    // Your async utility logic here
    const result = await processInputAsync(input, options);${options.withEvents ? `
    
    publish('${kebabName}:processedAsync', { input, result, options });` : ''}

    return {
      success: true,
      data: result
    };

  } catch (error) {
    loggerService.error('${serviceName}: Async processing failed', { error, input, options });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Async processing failed'
    };
  }
}

/**
 * Validate input data
 */
export function validate${serviceName.replace('Service', '')}Input(input: any): boolean {
  if (!input) {
    return false;
  }

  // Add your validation logic here
  return true;
}

/**
 * Transform input data
 */
export function transform${serviceName.replace('Service', '')}Input(input: any): any {
  if (!input) {
    throw new Error('Input is required');
  }

  // Add your transformation logic here
  return input;
}

// Helper functions
function processInput(input: any, options: ${serviceName.replace('Service', '')}Options): any {
  // Validate input
  if (!validate${serviceName.replace('Service', '')}Input(input)) {
    throw new Error('Invalid input data');
  }

  // Transform input
  const transformed = transform${serviceName.replace('Service', '')}Input(input);

  // Process the data
  // Add your processing logic here

  return transformed;
}

async function processInputAsync(input: any, options: ${serviceName.replace('Service', '')}Options): Promise<any> {
  // Async processing logic
  return new Promise((resolve, reject) => {
    try {
      const result = processInput(input, options);
      // Simulate async operation
      setTimeout(() => resolve(result), 100);
    } catch (error) {
      reject(error);
    }
  });
}

// Export utility object
export const ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)} = {
  process: ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1).replace('Service', '')},
  processAsync: ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1).replace('Service', '')}Async,
  validate: validate${serviceName.replace('Service', '')}Input,
  transform: transform${serviceName.replace('Service', '')}Input
};

export default ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)};`;
}

function generateAuthServiceTemplate() {
  return `/**
 * ${serviceName}
 * 
 * Authentication service for ${serviceName.replace('Service', '').replace('Auth', '').toLowerCase()} operations.
 */

import { authService } from '$lib/services/auth/auth.service';
import { tokenService } from '$lib/services/token/token.service';
import { handleError } from '$lib/utils/error-handler';
import { loggerService } from '$lib/services/logging/logging.service';${options.withEvents ? `
import { publish } from '$lib/services/events';` : ''}

// Types
export interface ${serviceName.replace('Service', '')}Credentials {
  // Define your credential structure
}

export interface ${serviceName.replace('Service', '')}Result {
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
}

class ${serviceName} {
  /**
   * Authenticate user
   */
  async authenticate(credentials: ${serviceName.replace('Service', '')}Credentials): Promise<${serviceName.replace('Service', '')}Result> {
    try {
      loggerService.info('${serviceName}: Starting authentication');

      // Validate credentials
      if (!this.validateCredentials(credentials)) {
        throw new Error('Invalid credentials');
      }

      // Perform authentication logic
      const authResult = await this.performAuth(credentials);

      if (!authResult.success) {
        throw new Error(authResult.error || 'Authentication failed');
      }${options.withEvents ? `

      publish('${kebabName}:authenticated', {
        userId: authResult.user?.id,
        timestamp: Date.now()
      });` : ''}

      loggerService.info('${serviceName}: Authentication successful');
      return authResult;

    } catch (error) {
      loggerService.error('${serviceName}: Authentication failed', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Validate user session
   */
  async validateSession(): Promise<boolean> {
    try {
      // Check if user is authenticated
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated) {
        return false;
      }

      // Validate token
      const token = await tokenService.getToken();
      if (!token) {
        return false;
      }

      // Additional validation logic here
      return true;

    } catch (error) {
      loggerService.error('${serviceName}: Session validation failed', { error });
      return false;
    }
  }

  /**
   * Refresh authentication
   */
  async refresh(): Promise<${serviceName.replace('Service', '')}Result> {
    try {
      loggerService.info('${serviceName}: Refreshing authentication');

      // Get current token
      const currentToken = await tokenService.getToken();
      if (!currentToken) {
        throw new Error('No token to refresh');
      }

      // Refresh token
      await tokenService.refreshToken();

      return {
        success: true
      };

    } catch (error) {
      loggerService.error('${serviceName}: Refresh failed', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refresh failed'
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      loggerService.info('${serviceName}: Signing out user');

      // Sign out from main auth service
      await authService.logout();${options.withEvents ? `

      publish('${kebabName}:signedOut', {
        timestamp: Date.now()
      });` : ''}

    } catch (error) {
      loggerService.error('${serviceName}: Sign out failed', { error });
      throw handleError(error, 'Sign out failed');
    }
  }

  // Helper methods
  private validateCredentials(credentials: ${serviceName.replace('Service', '')}Credentials): boolean {
    // Add your credential validation logic
    return !!credentials;
  }

  private async performAuth(credentials: ${serviceName.replace('Service', '')}Credentials): Promise<${serviceName.replace('Service', '')}Result> {
    // Add your authentication logic here
    // This might involve API calls, token exchange, etc.
    
    return {
      success: true,
      user: {
        id: 'user-id',
        // Add user properties
      },
      token: 'auth-token'
    };
  }
}

// Export singleton instance
export const ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)} = new ${serviceName}();
export default ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)};`;
}

function generateDataServiceTemplate() {
  return `/**
 * ${serviceName}
 * 
 * Data service for managing ${serviceName.replace('Service', '').replace('Data', '').toLowerCase()} data operations.
 */

import { apiService } from '$lib/services/api/api.service';
import { handleError } from '$lib/utils/error-handler';
import { loggerService } from '$lib/services/logging/logging.service';${options.withCache ? `
import { cacheService } from '$lib/services/cache/cache.service';` : ''}${options.withEvents ? `
import { publish } from '$lib/services/events';` : ''}

// Types
export interface ${serviceName.replace('Service', '').replace('Data', '')}DataItem {
  id: string;
  // Define your data structure
}

export interface ${serviceName.replace('Service', '').replace('Data', '')}Query {
  filter?: Record<string, any>;
  sort?: Record<string, 'asc' | 'desc'>;
  limit?: number;
  offset?: number;
}

export interface ${serviceName.replace('Service', '').replace('Data', '')}QueryResult {
  data: ${serviceName.replace('Service', '').replace('Data', '')}DataItem[];
  total: number;
  hasMore: boolean;
}

class ${serviceName} {
  private baseUrl = '/api/data/${kebabName}';${options.withCache ? `
  private cachePrefix = '${kebabName}:';
  private cacheTTL = 10 * 60 * 1000; // 10 minutes` : ''}

  /**
   * Query data with filtering and pagination
   */
  async query(query: ${serviceName.replace('Service', '').replace('Data', '')}Query = {}): Promise<${serviceName.replace('Service', '').replace('Data', '')}QueryResult> {
    try {
      loggerService.debug('${serviceName}: Querying data', { query });${options.withCache ? `

      // Check cache
      const cacheKey = this.cachePrefix + JSON.stringify(query);
      const cached = await cacheService.get<${serviceName.replace('Service', '').replace('Data', '')}QueryResult>(cacheKey);
      if (cached) {
        loggerService.debug('${serviceName}: Returning cached query result');
        return cached;
      }` : ''}

      // Build query parameters
      const params = new URLSearchParams();
      if (query.filter) params.set('filter', JSON.stringify(query.filter));
      if (query.sort) params.set('sort', JSON.stringify(query.sort));
      if (query.limit) params.set('limit', query.limit.toString());
      if (query.offset) params.set('offset', query.offset.toString());

      const response = await apiService.get<${serviceName.replace('Service', '').replace('Data', '')}QueryResult>(
        \`\${this.baseUrl}?\${params.toString()}\`
      );${options.withCache ? `

      // Cache the result
      await cacheService.set(cacheKey, response.data, this.cacheTTL);` : ''}${options.withEvents ? `

      publish('${kebabName}:queried', { query, resultCount: response.data.data.length });` : ''}

      return response.data;

    } catch (error) {
      loggerService.error('${serviceName}: Query failed', { error, query });
      throw handleError(error, 'Failed to query data');
    }
  }

  /**
   * Get data by ID
   */
  async getById(id: string): Promise<${serviceName.replace('Service', '').replace('Data', '')}DataItem | null> {
    if (!id) {
      throw new Error('ID is required');
    }

    try {${options.withCache ? `
      // Check cache
      const cacheKey = \`\${this.cachePrefix}item:\${id}\`;
      const cached = await cacheService.get<${serviceName.replace('Service', '').replace('Data', '')}DataItem>(cacheKey);
      if (cached) {
        return cached;
      }` : ''}

      const response = await apiService.get<${serviceName.replace('Service', '').replace('Data', '')}DataItem>(\`\${this.baseUrl}/\${id}\`);${options.withCache ? `

      // Cache the item
      await cacheService.set(cacheKey, response.data, this.cacheTTL);` : ''}

      return response.data;

    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      loggerService.error('${serviceName}: Get by ID failed', { error, id });
      throw handleError(error, 'Failed to get data item');
    }
  }

  /**
   * Save data item
   */
  async save(item: Omit<${serviceName.replace('Service', '').replace('Data', '')}DataItem, 'id'> | ${serviceName.replace('Service', '').replace('Data', '')}DataItem): Promise<${serviceName.replace('Service', '').replace('Data', '')}DataItem> {
    try {
      const isUpdate = 'id' in item && item.id;
      
      const response = isUpdate
        ? await apiService.put<${serviceName.replace('Service', '').replace('Data', '')}DataItem>(\`\${this.baseUrl}/\${item.id}\`, item)
        : await apiService.post<${serviceName.replace('Service', '').replace('Data', '')}DataItem>(this.baseUrl, item);${options.withCache ? `

      // Invalidate cache
      await this.invalidateCache();` : ''}${options.withEvents ? `

      publish(\`${kebabName}:\${isUpdate ? 'updated' : 'created'}\`, { item: response.data });` : ''}

      loggerService.info(\`${serviceName}: Item \${isUpdate ? 'updated' : 'created'}\`, { id: response.data.id });
      return response.data;

    } catch (error) {
      loggerService.error('${serviceName}: Save failed', { error, item });
      throw handleError(error, 'Failed to save data item');
    }
  }

  /**
   * Delete data item
   */
  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID is required');
    }

    try {
      await apiService.delete(\`\${this.baseUrl}/\${id}\`);${options.withCache ? `

      // Invalidate cache
      await this.invalidateCache();
      await cacheService.delete(\`\${this.cachePrefix}item:\${id}\`);` : ''}${options.withEvents ? `

      publish('${kebabName}:deleted', { id });` : ''}

      loggerService.info('${serviceName}: Item deleted', { id });

    } catch (error) {
      loggerService.error('${serviceName}: Delete failed', { error, id });
      throw handleError(error, 'Failed to delete data item');
    }
  }

  /**
   * Bulk operations
   */
  async bulkSave(items: Array<Omit<${serviceName.replace('Service', '').replace('Data', '')}DataItem, 'id'> | ${serviceName.replace('Service', '').replace('Data', '')}DataItem>): Promise<${serviceName.replace('Service', '').replace('Data', '')}DataItem[]> {
    try {
      const response = await apiService.post<${serviceName.replace('Service', '').replace('Data', '')}DataItem[]>(\`\${this.baseUrl}/bulk\`, { items });${options.withCache ? `

      // Invalidate cache
      await this.invalidateCache();` : ''}${options.withEvents ? `

      publish('${kebabName}:bulkSaved', { count: response.data.length });` : ''}

      return response.data;

    } catch (error) {
      loggerService.error('${serviceName}: Bulk save failed', { error, itemCount: items.length });
      throw handleError(error, 'Failed to bulk save items');
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    try {
      await apiService.post(\`\${this.baseUrl}/bulk-delete\`, { ids });${options.withCache ? `

      // Invalidate cache
      await this.invalidateCache();` : ''}${options.withEvents ? `

      publish('${kebabName}:bulkDeleted', { count: ids.length });` : ''}

    } catch (error) {
      loggerService.error('${serviceName}: Bulk delete failed', { error, ids });
      throw handleError(error, 'Failed to bulk delete items');
    }
  }${options.withCache ? `

  /**
   * Cache management
   */
  async clearCache(): Promise<void> {
    await this.invalidateCache();
    loggerService.debug('${serviceName}: Cache cleared');
  }

  private async invalidateCache(): Promise<void> {
    await cacheService.deleteByPattern(\`\${this.cachePrefix}*\`);
  }` : ''}
}

// Export singleton instance
export const ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)} = new ${serviceName}();
export default ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)};`;
}

// Generate types file
function generateTypesTemplate() {
  return `/**
 * ${serviceName} Types
 * 
 * TypeScript type definitions for ${serviceName}.
 */

// Core types
export interface ${serviceName}Config {
  // Configuration options
}

export interface ${serviceName}Options {
  // Service options
}

export interface ${serviceName}Result<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
}

// Event types
export interface ${serviceName}Events {
  // Define event types
}

// API types
export interface ${serviceName}ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// Error types
export interface ${serviceName}Error {
  code: string;
  message: string;
  details?: any;
}

// Export namespace
export namespace ${serviceName}Types {
  export type Config = ${serviceName}Config;
  export type Options = ${serviceName}Options;
  export type Result<T = any> = ${serviceName}Result<T>;
  export type Events = ${serviceName}Events;
  export type ApiResponse<T = any> = ${serviceName}ApiResponse<T>;
  export type Error = ${serviceName}Error;
}`;
}

// Generate test file
function generateTestTemplate() {
  const serviceInstance = serviceName.charAt(0).toLowerCase() + serviceName.slice(1);
  
  return `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ${serviceInstance} } from './${fileName}';${options.type === 'api' ? `
import { apiService } from '$lib/services/api/api.service';` : ''}${options.withCache ? `
import { cacheService } from '$lib/services/cache/cache.service';` : ''}

// Mock dependencies
${options.type === 'api' ? `vi.mock('$lib/services/api/api.service');` : ''}${options.withCache ? `
vi.mock('$lib/services/cache/cache.service');` : ''}
vi.mock('$lib/services/logging/logging.service');

describe('${serviceName}', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
  });

  describe('Basic functionality', () => {
    it('should be defined', () => {
      expect(${serviceInstance}).toBeDefined();
    });${options.type === 'api' ? `

    it('should get all items', async () => {
      const mockData = [{ id: '1', name: 'Test Item' }];
      const mockResponse = { data: { data: mockData, meta: { total: 1 } } };
      
      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      const result = await ${serviceInstance}.getAll();

      expect(apiService.get).toHaveBeenCalledWith(expect.stringContaining('/api/${kebabName}'));
      expect(result.data).toEqual(mockData);
    });

    it('should get item by ID', async () => {
      const mockItem = { id: '1', name: 'Test Item' };
      const mockResponse = { data: mockItem };
      
      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      const result = await ${serviceInstance}.getById('1');

      expect(apiService.get).toHaveBeenCalledWith('/api/${kebabName}/1');
      expect(result).toEqual(mockItem);
    });

    it('should create new item', async () => {
      const newItem = { name: 'New Item' };
      const createdItem = { id: '1', ...newItem };
      const mockResponse = { data: createdItem };
      
      vi.mocked(apiService.post).mockResolvedValue(mockResponse);

      const result = await ${serviceInstance}.create(newItem);

      expect(apiService.post).toHaveBeenCalledWith('/api/${kebabName}', newItem);
      expect(result).toEqual(createdItem);
    });

    it('should update existing item', async () => {
      const updates = { name: 'Updated Item' };
      const updatedItem = { id: '1', ...updates };
      const mockResponse = { data: updatedItem };
      
      vi.mocked(apiService.put).mockResolvedValue(mockResponse);

      const result = await ${serviceInstance}.update('1', updates);

      expect(apiService.put).toHaveBeenCalledWith('/api/${kebabName}/1', updates);
      expect(result).toEqual(updatedItem);
    });

    it('should delete item', async () => {
      vi.mocked(apiService.delete).mockResolvedValue({ data: null });

      await ${serviceInstance}.delete('1');

      expect(apiService.delete).toHaveBeenCalledWith('/api/${kebabName}/1');
    });` : ''}${options.type === 'store' ? `

    it('should set loading state', () => {
      ${serviceInstance}.setLoading(true);
      
      // Test loading state change
      // Note: You'll need to implement proper store testing
    });

    it('should set data', () => {
      const testData = [{ id: '1', name: 'Test' }];
      
      ${serviceInstance}.setData(testData);
      
      // Test data state change
    });

    it('should add item', () => {
      const newItem = { id: '1', name: 'New Item' };
      
      ${serviceInstance}.addItem(newItem);
      
      // Test item addition
    });` : ''}${options.type === 'util' ? `

    it('should process input correctly', () => {
      const input = { test: 'data' };
      const result = ${serviceInstance}.process(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle invalid input', () => {
      const result = ${serviceInstance}.process(null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate input', () => {
      expect(${serviceInstance}.validate({ test: 'data' })).toBe(true);
      expect(${serviceInstance}.validate(null)).toBe(false);
    });` : ''}
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'API Error';
      ${options.type === 'api' ? `vi.mocked(apiService.get).mockRejectedValue(new Error(errorMessage));

      await expect(${serviceInstance}.getAll()).rejects.toThrow();` : `
      // Add error handling tests for your service type`}
    });
  });${options.withCache ? `

  describe('Caching', () => {
    it('should return cached data when available', async () => {
      const cachedData = { data: [{ id: '1' }], meta: { total: 1 } };
      vi.mocked(cacheService.get).mockResolvedValue(cachedData);

      const result = await ${serviceInstance}.getAll();

      expect(cacheService.get).toHaveBeenCalled();
      expect(result).toEqual(cachedData);
    });

    it('should cache API responses', async () => {
      const mockResponse = { data: { data: [], meta: { total: 0 } } };
      vi.mocked(apiService.get).mockResolvedValue(mockResponse);
      vi.mocked(cacheService.get).mockResolvedValue(null);

      await ${serviceInstance}.getAll();

      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should clear cache', async () => {
      await ${serviceInstance}.clearCache();

      expect(cacheService.deleteByPattern).toHaveBeenCalled();
    });
  });` : ''}${options.withEvents ? `

  describe('Events', () => {
    it('should publish events for operations', async () => {
      // Mock publish function
      const mockPublish = vi.fn();
      vi.doMock('$lib/services/events', () => ({ publish: mockPublish }));

      // Test event publishing
      // Implementation depends on your specific service
    });
  });` : ''}
});`;
}

// Write files
try {
  console.log(`🚀 Generating ${serviceName} (${options.type} service)...`);
  
  let filesToCreate = [];
  
  // Write main service file
  fs.writeFileSync(serviceFile, generateServiceTemplate());
  filesToCreate.push(serviceFile);
  
  // Write test file if requested
  if (options.withTest) {
    fs.writeFileSync(testFile, generateTestTemplate());
    filesToCreate.push(testFile);
  }
  
  // Write types file if requested
  if (options.withTypes) {
    fs.writeFileSync(typesFile, generateTypesTemplate());
    filesToCreate.push(typesFile);
  }
  
  console.log(`✅ Service files created:`);
  filesToCreate.forEach(file => {
    console.log(`   ${file}`);
  });
  
  console.log(`\n🎉 ${serviceName} generated successfully!`);
  console.log(`\n📖 Import your service:`);
  console.log(`   import { ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)} } from '${serviceFile.replace(/^src\//, '$').replace(/\.ts$/, '')}';`);
  
  if (options.withTest) {
    console.log(`\n🧪 Run tests:`);
    console.log(`   npm test ${testFile}`);
  }
  
  console.log(`\n🔧 Features enabled:`);
  console.log(`   - Type: ${options.type}`);
  if (options.withCache) console.log(`   - Caching: ✅`);
  if (options.withEvents) console.log(`   - Events: ✅`);
  if (options.withTest) console.log(`   - Tests: ✅`);
  if (options.withTypes) console.log(`   - Types: ✅`);
  
} catch (error) {
  console.error('❌ Error generating service:', error.message);
  process.exit(1);
}