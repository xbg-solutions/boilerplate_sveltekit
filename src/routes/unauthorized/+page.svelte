<!--
  src/routes/unauthorized/+page.svelte
  Unauthorized Access Page
  
  This page is displayed when a user tries to access a protected route
  that they don't have permission to view.
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { Card, Button, Alert, AlertDescription } from '$lib/components/ui';
  import { authService } from '@xbg.solutions/utils-firebase-auth';
  import { AUTH_ROUTES } from '@xbg.solutions/frontend-core';
  
  // Get authentication state
  const isAuthenticated = authService.isAuthenticated();
  const userClaims = authService.getUserClaims();
  
  // Get the path that was attempted from query parameters
  $: attemptedPath = $page.url.searchParams.get('path') || '';
  
  // Handle logout
  function handleLogout() {
    authService.logout();
  }
</script>

<div class="max-w-xs sm:max-w-sm md:max-w-lg mx-auto px-4 sm:px-0 pt-6 sm:pt-8 md:pt-10">
  <div class="text-center mb-4 sm:mb-6 md:mb-8">
    <h1 class="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2" style="color: var(--accent)">Access Denied</h1>
    <p class="text-sm sm:text-base text-gray-600">You don't have permission to access this page</p>
  </div>

  <Card class="shadow-lg border-0">
    <div class="p-4 sm:p-6 text-center">
      <div class="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <svg class="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      
      <Alert className="mb-4 sm:mb-6 border-red-200 bg-red-50">
        <AlertDescription className="font-medium text-sm sm:text-base text-red-800">
          You don't have the required permissions
        </AlertDescription>
      </Alert>
      
      {#if isAuthenticated}
        <div class="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          {#if userClaims?.roles?.length}
            <div class="bg-gray-50 p-3 sm:p-4 rounded-lg inline-block">
              <p class="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Your current roles:</p>
              <div class="flex flex-wrap gap-1 sm:gap-2 justify-center">
                {#each userClaims.roles as role}
                  <span class="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-200 rounded-full text-xs sm:text-sm">{role}</span>
                {/each}
              </div>
            </div>
          {/if}
          
          {#if attemptedPath}
            <p class="text-xs sm:text-sm text-gray-600">
              Attempted path: {attemptedPath}
            </p>
          {/if}
          
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4 sm:mt-6">
            <Button href={AUTH_ROUTES.DEFAULT_POST_LOGIN_ROUTE} size="sm" class="sm:text-sm md:text-base">
              Go to Dashboard
            </Button>
            
            <Button variant="destructive" on:click={handleLogout} size="sm" class="sm:text-sm md:text-base">
              Logout
            </Button>
          </div>
        </div>
      {:else}
        <p class="mb-4 sm:mb-6 text-sm sm:text-base">Please log in to access this page.</p>
        
        <Button href={AUTH_ROUTES.LOGIN_ROUTE} size="sm" class="sm:text-sm md:text-base">
          Go to Login
        </Button>
      {/if}
    </div>
  </Card>
  
  <div class="text-center mt-4 sm:mt-6">
    <p class="text-xs sm:text-sm text-gray-500">
      © {new Date().getFullYear()} SvelteKit Boilerplate. All rights reserved.
    </p>
  </div>
</div>