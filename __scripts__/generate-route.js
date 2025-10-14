#!/usr/bin/env node

/**
 * Route Generator
 * 
 * Generates a new SvelteKit route with TypeScript support, layout, and load functions.
 * 
 * Usage:
 *   node __scripts__/generate-route.js <route-path> [options]
 *   npm run generate:route <route-path> [options]
 * 
 * Options:
 *   --type <type>       Route type: page|layout|api|group (default: page)
 *   --auth              Require authentication
 *   --roles <roles>     Required roles (comma-separated)
 *   --with-load         Generate load function
 *   --with-actions      Generate form actions
 *   --with-error        Generate error page
 * 
 * Examples:
 *   node __scripts__/generate-route.js dashboard --auth --roles=user,admin
 *   node __scripts__/generate-route.js api/users --type=api --with-actions
 *   node __scripts__/generate-route.js admin --type=layout --auth --roles=admin
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const routePath = args[0];

if (!routePath) {
  console.error('❌ Route path is required!');
  console.log('Usage: node __scripts__/generate-route.js <route-path> [options]');
  console.log('Examples:');
  console.log('  node __scripts__/generate-route.js dashboard');
  console.log('  node __scripts__/generate-route.js api/users --type=api');
  console.log('  node __scripts__/generate-route.js admin --type=layout --auth');
  process.exit(1);
}

// Parse options
const options = {
  type: 'page',
  auth: false,
  roles: [],
  withLoad: false,
  withActions: false,
  withError: false
};

args.slice(1).forEach(arg => {
  if (arg.startsWith('--type=')) {
    options.type = arg.split('=')[1];
  } else if (arg.startsWith('--roles=')) {
    options.roles = arg.split('=')[1].split(',').map(r => r.trim());
  } else if (arg === '--auth') {
    options.auth = true;
  } else if (arg === '--with-load') {
    options.withLoad = true;
  } else if (arg === '--with-actions') {
    options.withActions = true;
  } else if (arg === '--with-error') {
    options.withError = true;
  }
});

// Validate route type
if (!['page', 'layout', 'api', 'group'].includes(options.type)) {
  console.error('❌ Invalid route type. Must be: page, layout, api, or group');
  process.exit(1);
}

// Generate file paths
const routeDir = path.join('src', 'routes', routePath);
const isApiRoute = routePath.startsWith('api/') || options.type === 'api';

// Ensure directory exists
if (!fs.existsSync(routeDir)) {
  fs.mkdirSync(routeDir, { recursive: true });
}

// Generate route name for display
const routeName = routePath
  .split('/')
  .pop()
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

// Generate page template
function generatePageTemplate() {
  const authImport = options.auth ? `
  import { authGuard } from '$lib/utils/auth-guard';
  import { authService } from '$lib/services/auth';` : '';
  
  const authCode = options.auth ? `
  const user = authService.getUser();
  const claims = authService.getUserClaims();
  
  onMount(() => {
    authGuard({
      requiredRoles: ${JSON.stringify(options.roles)},
      redirectTo: '/login',
      currentPath: $page.url.pathname
    });
  });` : '';
  
  const rolesCheck = options.roles.length > 0 ? `
  $: hasRequiredRole = ${options.roles.map(role => `$claims?.roles?.includes('${role}')`).join(' || ')};` : '';

  return `<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';${authImport}
  import { Button } from '$lib/components/ui/button';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  ${options.withLoad ? "import type { PageData } from './$types';" : ''}
  
  ${options.withLoad ? 'export let data: PageData;' : ''}
  
  // Page state
  let loading = false;
  let error: string | null = null;${authCode}${rolesCheck}
  
  onMount(() => {
    loadPageData();
  });
  
  async function loadPageData() {
    loading = true;
    error = null;
    
    try {
      // Load page-specific data
      console.log('Loading ${routeName} data...');
    } catch (err) {
      error = 'Failed to load page data';
      console.error('${routeName} error:', err);
    } finally {
      loading = false;
    }
  }
  
  function handleRefresh() {
    loadPageData();
  }
</script>

<svelte:head>
  <title>${routeName}</title>
  <meta name="description" content="${routeName} page" />
</svelte:head>

<div class="container mx-auto py-6">
  <div class="mb-6">
    <h1 class="text-3xl font-bold">${routeName}</h1>
    <p class="text-gray-600">Welcome to the ${routeName.toLowerCase()} page</p>
  </div>
  ${options.auth && options.roles.length > 0 ? `
  {#if !hasRequiredRole}
    <Card>
      <CardContent class="p-6 text-center">
        <h2 class="text-xl font-semibold mb-2">Access Denied</h2>
        <p class="text-gray-600">You don't have permission to view this page.</p>
        <p class="text-sm text-gray-500 mt-2">Required roles: ${options.roles.join(', ')}</p>
        <Button href="/dashboard" variant="outline" class="mt-4">
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  {:else}` : ''}
  
  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  {:else if error}
    <Card>
      <CardContent class="p-6">
        <div class="text-center">
          <h2 class="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p class="text-gray-600 mb-4">{error}</p>
          <Button on:click={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  {:else}
    <div class="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>${routeName} Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Add your page content here.</p>
          ${options.auth ? `
          {#if $user}
            <div class="mt-4 p-4 bg-green-50 rounded-lg">
              <p class="text-green-800">Authenticated as: {$user.email}</p>
              {#if $claims?.roles?.length}
                <p class="text-green-600 text-sm">Roles: {$claims.roles.join(', ')}</p>
              {/if}
            </div>
          {/if}` : ''}
        </CardContent>
      </Card>
    </div>
  {/if}${options.auth && options.roles.length > 0 ? `
  {/if}` : ''}
</div>`;
}

// Generate layout template
function generateLayoutTemplate() {
  const authImport = options.auth ? `
  import { authGuard } from '$lib/utils/auth-guard';
  import { authService } from '$lib/services/auth';` : '';
  
  const authCode = options.auth ? `
  const user = authService.getUser();
  const claims = authService.getUserClaims();
  
  onMount(() => {
    authGuard({
      requiredRoles: ${JSON.stringify(options.roles)},
      redirectTo: '/login',
      currentPath: $page.url.pathname
    });
  });` : '';

  return `<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';${authImport}
  import { Button } from '$lib/components/ui/button';
  ${options.withLoad ? "import type { LayoutData } from './$types';" : ''}
  
  ${options.withLoad ? 'export let data: LayoutData;' : ''}${authCode}
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Navigation header -->
  <header class="bg-white shadow-sm border-b">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <h1 class="text-xl font-semibold">${routeName}</h1>
          <nav class="ml-8 space-x-4">
            <!-- Add navigation links -->
          </nav>
        </div>
        
        <div class="flex items-center space-x-4">
          ${options.auth ? `
          {#if $user}
            <span class="text-sm text-gray-600">Welcome, {$user.email}</span>
            <Button variant="outline" size="sm" on:click={() => authService.logout()}>
              Logout
            </Button>
          {:else}
            <Button href="/login" size="sm">
              Login
            </Button>
          {/if}` : ''}
        </div>
      </div>
    </div>
  </header>
  
  <!-- Main content -->
  <main>
    <slot />
  </main>
  
  <!-- Footer -->
  <footer class="bg-white border-t mt-auto">
    <div class="container mx-auto px-4 py-4">
      <p class="text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} Your App. All rights reserved.
      </p>
    </div>
  </footer>
</div>`;
}

// Generate API route template
function generateApiTemplate() {
  const methods = options.withActions ? ['GET', 'POST', 'PUT', 'DELETE'] : ['GET'];
  
  let template = `import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiService } from '$lib/services/api/api.service';
import { handleError } from '$lib/utils/error-handler';

// Types
interface ${routeName}Item {
  id: string;
  // Add your data structure here
}

interface Create${routeName}Request {
  // Add creation request structure
}

interface Update${routeName}Request {
  // Add update request structure
}

`;

  methods.forEach(method => {
    switch (method) {
      case 'GET':
        template += `
// GET /${routePath}
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    // Optional: Check authentication
    // if (!locals.user) {
    //   throw error(401, 'Unauthorized');
    // }
    
    // Parse query parameters
    const limit = Number(url.searchParams.get('limit')) || 10;
    const offset = Number(url.searchParams.get('offset')) || 0;
    const search = url.searchParams.get('search') || '';
    
    // Fetch data (replace with your data source)
    const items: ${routeName}Item[] = [
      // Mock data - replace with actual data fetching
    ];
    
    // Apply search filter if provided
    const filteredItems = search 
      ? items.filter(item => 
          Object.values(item).some(value => 
            String(value).toLowerCase().includes(search.toLowerCase())
          )
        )
      : items;
    
    // Apply pagination
    const paginatedItems = filteredItems.slice(offset, offset + limit);
    
    return json({
      data: paginatedItems,
      meta: {
        total: filteredItems.length,
        limit,
        offset,
        hasMore: offset + limit < filteredItems.length
      }
    });
    
  } catch (err) {
    console.error('GET /${routePath} error:', err);
    const errorResponse = handleError(err, 'Failed to fetch ${routeName.toLowerCase()}');
    throw error(500, errorResponse);
  }
};`;
        break;
        
      case 'POST':
        template += `

// POST /${routePath}
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check authentication
    // if (!locals.user) {
    //   throw error(401, 'Unauthorized');
    // }
    
    const requestData: Create${routeName}Request = await request.json();
    
    // Validate request data
    if (!requestData) {
      throw error(400, 'Invalid request data');
    }
    
    // Create new item (replace with your data creation logic)
    const newItem: ${routeName}Item = {
      id: crypto.randomUUID(),
      ...requestData,
      // Add other fields like timestamps, user ID, etc.
    };
    
    // Save to database/storage
    // await saveItem(newItem);
    
    return json({
      data: newItem,
      message: '${routeName} created successfully'
    }, { status: 201 });
    
  } catch (err) {
    console.error('POST /${routePath} error:', err);
    const errorResponse = handleError(err, 'Failed to create ${routeName.toLowerCase()}');
    throw error(500, errorResponse);
  }
};`;
        break;
        
      case 'PUT':
        template += `

// PUT /${routePath}/[id]
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    // Check authentication
    // if (!locals.user) {
    //   throw error(401, 'Unauthorized');
    // }
    
    const { id } = params;
    if (!id) {
      throw error(400, 'ID parameter is required');
    }
    
    const requestData: Update${routeName}Request = await request.json();
    
    // Find existing item
    // const existingItem = await findItemById(id);
    // if (!existingItem) {
    //   throw error(404, '${routeName} not found');
    // }
    
    // Update item (replace with your update logic)
    const updatedItem: ${routeName}Item = {
      id,
      ...requestData,
      // Preserve certain fields or add timestamps
    };
    
    // Save updated item
    // await updateItem(id, updatedItem);
    
    return json({
      data: updatedItem,
      message: '${routeName} updated successfully'
    });
    
  } catch (err) {
    console.error('PUT /${routePath}/[id] error:', err);
    const errorResponse = handleError(err, 'Failed to update ${routeName.toLowerCase()}');
    throw error(500, errorResponse);
  }
};`;
        break;
        
      case 'DELETE':
        template += `

// DELETE /${routePath}/[id]
export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    // Check authentication
    // if (!locals.user) {
    //   throw error(401, 'Unauthorized');
    // }
    
    const { id } = params;
    if (!id) {
      throw error(400, 'ID parameter is required');
    }
    
    // Find existing item
    // const existingItem = await findItemById(id);
    // if (!existingItem) {
    //   throw error(404, '${routeName} not found');
    // }
    
    // Delete item (replace with your deletion logic)
    // await deleteItem(id);
    
    return json({
      message: '${routeName} deleted successfully'
    });
    
  } catch (err) {
    console.error('DELETE /${routePath}/[id] error:', err);
    const errorResponse = handleError(err, 'Failed to delete ${routeName.toLowerCase()}');
    throw error(500, errorResponse);
  }
};`;
        break;
    }
  });
  
  return template;
}

// Generate load function
function generateLoadFunction() {
  const fileName = options.type === 'layout' ? '+layout.ts' : '+page.ts';
  
  const authCheck = options.auth ? `
  // Check authentication
  if (!locals.user) {
    throw redirect(302, '/login');
  }
  
  // Check role permissions
  const userRoles = locals.claims?.roles || [];
  const requiredRoles = ${JSON.stringify(options.roles)};
  
  if (requiredRoles.length > 0 && !requiredRoles.some(role => userRoles.includes(role))) {
    throw redirect(302, '/unauthorized');
  }` : '';

  return `import type { ${options.type === 'layout' ? 'LayoutLoad' : 'PageLoad'} } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { apiService } from '$lib/services/api/api.service';

export const load: ${options.type === 'layout' ? 'LayoutLoad' : 'PageLoad'} = async ({ params, url, locals, fetch }) => {${authCheck}
  
  try {
    // Load page/layout data
    const data = {
      // Add your data loading logic here
      title: '${routeName}',
      user: locals.user || null,
      claims: locals.claims || null
    };
    
    // Example: Load data from API
    // const response = await apiService.get('/api/${routePath}', { fetch });
    // data.items = response.data;
    
    return data;
    
  } catch (err) {
    console.error('Load function error:', err);
    throw error(500, 'Failed to load page data');
  }
};`;
}

// Generate form actions
function generateFormActions() {
  return `import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { apiService } from '$lib/services/api/api.service';
import { handleError } from '$lib/utils/error-handler';

export const actions: Actions = {
  // Default form action
  default: async ({ request, locals }) => {
    ${options.auth ? `
    if (!locals.user) {
      throw redirect(302, '/login');
    }` : ''}
    
    const formData = await request.formData();
    
    try {
      // Process form data
      const data = {
        // Extract form fields
        // name: formData.get('name')?.toString(),
        // email: formData.get('email')?.toString(),
      };
      
      // Validate data
      if (!data) {
        return fail(400, {
          error: 'Invalid form data',
          data
        });
      }
      
      // Process the form submission
      // const result = await apiService.post('/api/${routePath}', data);
      
      return {
        success: true,
        message: 'Form submitted successfully'
      };
      
    } catch (err) {
      console.error('Form action error:', err);
      return fail(500, {
        error: handleError(err, 'Form submission failed'),
        data: Object.fromEntries(formData)
      });
    }
  },
  
  // Create action
  create: async ({ request, locals }) => {
    ${options.auth ? `
    if (!locals.user) {
      throw redirect(302, '/login');
    }` : ''}
    
    const formData = await request.formData();
    
    try {
      // Handle create logic
      return { success: true };
    } catch (err) {
      return fail(500, { error: 'Create failed' });
    }
  },
  
  // Update action
  update: async ({ request, locals }) => {
    ${options.auth ? `
    if (!locals.user) {
      throw redirect(302, '/login');
    }` : ''}
    
    const formData = await request.formData();
    
    try {
      // Handle update logic
      return { success: true };
    } catch (err) {
      return fail(500, { error: 'Update failed' });
    }
  },
  
  // Delete action
  delete: async ({ request, locals }) => {
    ${options.auth ? `
    if (!locals.user) {
      throw redirect(302, '/login');
    }` : ''}
    
    const formData = await request.formData();
    const id = formData.get('id')?.toString();
    
    if (!id) {
      return fail(400, { error: 'ID is required' });
    }
    
    try {
      // Handle delete logic
      return { success: true };
    } catch (err) {
      return fail(500, { error: 'Delete failed' });
    }
  }
};`;
}

// Generate error page
function generateErrorTemplate() {
  return `<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  
  $: error = $page.error;
  $: errorMessage = error?.message || 'An unexpected error occurred';
  $: errorCode = error?.code || 500;
</script>

<svelte:head>
  <title>Error {errorCode}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <Card class="max-w-md w-full">
    <CardHeader class="text-center">
      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <CardTitle class="text-2xl text-red-600">Error {errorCode}</CardTitle>
    </CardHeader>
    
    <CardContent class="text-center space-y-4">
      <p class="text-gray-600">{errorMessage}</p>
      
      <div class="space-y-2">
        <Button href="/" class="w-full">
          Go Home
        </Button>
        <Button href="/dashboard" variant="outline" class="w-full">
          Go to Dashboard
        </Button>
      </div>
      
      <details class="text-left mt-4">
        <summary class="cursor-pointer text-sm text-gray-500">
          Error Details
        </summary>
        <pre class="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
{JSON.stringify(error, null, 2)}
        </pre>
      </details>
    </CardContent>
  </Card>
</div>`;
}

// Write files
try {
  console.log(`🚀 Generating ${options.type} route: /${routePath}`);
  
  let filesToCreate = [];
  
  if (isApiRoute || options.type === 'api') {
    // API route
    const serverFile = path.join(routeDir, '+server.ts');
    fs.writeFileSync(serverFile, generateApiTemplate());
    filesToCreate.push(serverFile);
    
  } else if (options.type === 'layout') {
    // Layout route
    const layoutFile = path.join(routeDir, '+layout.svelte');
    fs.writeFileSync(layoutFile, generateLayoutTemplate());
    filesToCreate.push(layoutFile);
    
    if (options.withLoad) {
      const loadFile = path.join(routeDir, '+layout.ts');
      fs.writeFileSync(loadFile, generateLoadFunction());
      filesToCreate.push(loadFile);
    }
    
  } else if (options.type === 'group') {
    // Route group (just create directory with layout)
    const layoutFile = path.join(routeDir, '+layout.svelte');
    fs.writeFileSync(layoutFile, `<slot />`);
    filesToCreate.push(layoutFile);
    
  } else {
    // Page route
    const pageFile = path.join(routeDir, '+page.svelte');
    fs.writeFileSync(pageFile, generatePageTemplate());
    filesToCreate.push(pageFile);
    
    if (options.withLoad) {
      const loadFile = path.join(routeDir, '+page.ts');
      fs.writeFileSync(loadFile, generateLoadFunction());
      filesToCreate.push(loadFile);
    }
    
    if (options.withActions) {
      const actionsFile = path.join(routeDir, '+page.server.ts');
      fs.writeFileSync(actionsFile, generateFormActions());
      filesToCreate.push(actionsFile);
    }
  }
  
  if (options.withError) {
    const errorFile = path.join(routeDir, '+error.svelte');
    fs.writeFileSync(errorFile, generateErrorTemplate());
    filesToCreate.push(errorFile);
  }
  
  console.log(`✅ Route files created:`);
  filesToCreate.forEach(file => {
    console.log(`   ${file}`);
  });
  
  console.log(`\n🎉 Route /${routePath} generated successfully!`);
  console.log(`\n🌐 View your route at: http://localhost:5173/${routePath}`);
  
  if (options.auth) {
    console.log(`\n🔒 Authentication: Enabled`);
    if (options.roles.length > 0) {
      console.log(`   Required roles: ${options.roles.join(', ')}`);
    }
  }
  
} catch (error) {
  console.error('❌ Error generating route:', error.message);
  process.exit(1);
}