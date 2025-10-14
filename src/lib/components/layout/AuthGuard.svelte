<!--
  src/lib/components/layout/AuthGuard.svelte
  Auth Guard Component with Standardized Spinner
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { authStore } from '$lib/stores/auth.store';
  import { loadingStore } from '$lib/stores/loading.store';
  import { goto } from '$app/navigation';
  import { AUTH_ROUTES } from '$lib/constants/auth.constants';
  
  // Component props
  export let roles: string[] = [];              // Required roles (empty = just auth check)
  export let redirectTo: string = '';           // Where to redirect if not authorized
  export let shouldRedirect: boolean = true;    // Whether to redirect at all
  export let showFallback: boolean = true;      // Whether to show fallback content
  export let fallbackComponent: any = null;     // Custom fallback component
  
  // Internal state
  let mounted: boolean = false;
  let checking: boolean = true;
  let isAuthenticated: boolean = false;
  let hasRequiredRoles: boolean = false;
  let userRoles: string[] = [];
  
  // Subscribe to auth store
  let unsubscribe = () => {};
  
  // Perform auth check
  function checkAuthorization() {
    unsubscribe = authStore.subscribe(state => {
      if (!state) return;
      
      isAuthenticated = state?.isAuthenticated || false;
      userRoles = state?.claims?.roles || [];
      
      // Check if user has all required roles
      if (roles.length === 0) {
        // No specific roles required, just need authentication
        hasRequiredRoles = true;
      } else {
        // Check if user has any of the required roles
        hasRequiredRoles = roles.some(role => 
          Array.isArray(userRoles) 
            ? userRoles.includes(role)
            : userRoles === role
        );
      }
      
      checking = state?.isLoading || false;
    });
  }
  
  // On component mount
  onMount(() => {
    mounted = true;
    
    // Start auth check
    checkAuthorization();
    
    // Load auth state with loading indicator
    loadingStore.startLoading('auth', 'checkAccess');
    
    // Delayed check to ensure auth state is ready
    setTimeout(() => {
      // Handle unauthorized access
      if (mounted && !checking && shouldRedirect && !isAuthenticated) {
        goto(redirectTo || AUTH_ROUTES.SIGN_IN);
      } else if (mounted && !checking && shouldRedirect && !hasRequiredRoles) {
        goto(redirectTo || AUTH_ROUTES.UNAUTHORIZED);
      }
      
      loadingStore.endLoading('auth', 'checkAccess');
    }, 100);
  });
  
  // Cleanup on unmount
  onDestroy(() => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });
  
  // Compute overall auth state
  $: isAuthorized = isAuthenticated && hasRequiredRoles && !checking;
</script>

{#if isAuthorized}
  <!-- Render content when authorized -->
  <slot />
{:else if showFallback}
  <!-- Show custom fallback component if provided -->
  {#if fallbackComponent}
    <svelte:component this={fallbackComponent} />
  {:else}
    <!-- Default fallback content -->
    <slot name="fallback">
      <div class="auth-guard-fallback p-8 rounded-lg border border-gray-200 bg-white shadow-sm">
        {#if checking}
          <div class="auth-guard-message text-center">
            <div class="flex flex-col items-center justify-center p-6">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p class="text-sm text-gray-600">Checking authorization...</p>
            </div>
          </div>
        {:else if !isAuthenticated}
          <div class="auth-guard-message text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-rounded text-blue-600 text-3xl">lock</span>
            </div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">Authentication Required</h3>
            <p class="text-gray-600 mb-4">Please sign in to access this content</p>
            <button 
              class="py-2 px-4 text-white rounded-lg hover:bg-accent-dark transition-colors"
              onclick={() => goto(AUTH_ROUTES.SIGN_IN)}
              style="background-color: var(--accent);"
            >
              Sign In
            </button>
          </div>
        {:else if !hasRequiredRoles}
          <div class="auth-guard-message text-center">
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-rounded text-amber-600 text-3xl">no_accounts</span>
            </div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">Access Restricted</h3>
            <p class="text-gray-600">You don't have permission to access this content</p>
          </div>
        {/if}
      </div>
    </slot>
  {/if}
{/if}

<style>
  .auth-guard-fallback {
    max-width: 400px;
    margin: 2rem auto;
  }
  
  /* Style for Material Symbols icons */
  :global(.material-symbols-rounded) {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 1.25rem;
    line-height: 1;
  }
</style>