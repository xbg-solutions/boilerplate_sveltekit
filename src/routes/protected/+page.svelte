<!--
  src/routes/protected/+page.svelte
  Protected Home Page
  
  This is the default landing page for authenticated users.
  It displays basic information about the user and their authentication status.
  
  UPDATED: Now uses token service for claims and rbacUtil for role checking
-->
<script lang="ts">
  import { Card, Alert, AlertDescription } from '$lib/components/ui';
  import { authStore } from '@xbg.solutions/utils-firebase-auth';
  import { loggerService } from '@xbg.solutions/frontend-core';
  import { onMount, onDestroy } from 'svelte';
  import { tokenService } from '@xbg.solutions/utils-firebase-auth';
  import { rbacUtil } from '@xbg.solutions/utils-rbac';
  import { subscribe } from '@xbg.solutions/frontend-core';
  import { TAB_SYNC_EVENTS } from '@xbg.solutions/utils-tab-sync';
  
  // Get user from the auth store
  $: user = $authStore.user;
  $: authMethod = $authStore.authMethod;
  
  // Get claims from token service
  $: claims = tokenService.getClaims();
  
  // Create a logger
  const logger = loggerService.withContext('ProtectedPage');
  
  // Initialize custom claims object that will properly handle boolean values
  type CustomClaimsType = {
    uid: string;
    email: string;
    name: string;
    isClient: boolean;
    isConsultant: boolean;
    isAdmin: boolean;
    isSysAdmin: boolean;
    roles: string[];
  };
  
  // Default initial values
  let customClaimsInitial: CustomClaimsType = {
    uid: '',
    email: '',
    name: '',
    isClient: false,
    isConsultant: false,
    isAdmin: false,
    isSysAdmin: false,
    roles: []
  };
  
  // Initialize custom claims with proper structure
  let customClaims = { ...customClaimsInitial };
  
  // Update custom claims when token service claims change
  $: if (claims) {
    customClaims = {
      ...customClaimsInitial,
      uid: claims.uid || user?.uid || '',
      email: claims.email || user?.email || '',
      name: claims.name || '',
      isClient: claims.isClient === true,
      isConsultant: claims.isConsultant === true,
      isAdmin: claims.isAdmin === true,
      isSysAdmin: claims.isSysAdmin === true,
      roles: Array.isArray(claims.roles) ? claims.roles : []
    };
    
    logger.info('Claims updated from token service', { customClaims });
  }
  
  // Check for specific roles using the RBAC utility
  $: isAdmin = rbacUtil.hasRole(claims, 'admin');
  $: isSysAdmin = rbacUtil.hasRole(claims, 'sysadmin');
  $: isClient = rbacUtil.hasRole(claims, 'client');
  $: isConsultant = rbacUtil.hasRole(claims, 'consultant');
  
  // Get all permissions using RBAC utility
  $: userPermissions = rbacUtil.getAllPermissions(claims);
  
  // Track event subscriptions for cleanup
  type Unsubscriber = (() => void) | null;
  let tabSyncSubscription: Unsubscriber = null;
  
  onMount(() => {
    try {
      // Subscribe to tab sync auth events
      tabSyncSubscription = subscribe(TAB_SYNC_EVENTS.AUTH_STATE_SYNCED, (payload) => {
        console.log('Protected page: Tab sync auth state event received:', payload);
        if (payload.action === 'logout') {
          console.log('Protected page: Logout detected in another tab, forcing reload');
          window.location.reload();
        }
      });
    } catch (e) {
      logger.error('Error setting up event listeners:', e as Error);
    }
  });
  
  onDestroy(() => {
    // Unsubscribe from events
    if (tabSyncSubscription && typeof tabSyncSubscription === 'function') {
      (tabSyncSubscription as () => void)();
    }
  });
</script>

<div class="mt-4 sm:mt-6 md:mt-8 mx-auto w-full sm:w-11/12 md:w-4/5 lg:w-3/5 xl:w-1/2 px-4 sm:px-0">
  <div>
    <h2 class="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Protected Page</h2>
    <h3 class="text-lg sm:text-xl font-semibold text-green-600 mb-2 sm:mb-4">Yay! It worked.</h3>
    
    <p class="mb-4 text-sm sm:text-base">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam at enim euismod, maximus tortor in, 
      faucibus magna. Vestibulum pellentesque risus eget purus finibus, vel ultrices urna elementum. 
      Nullam vel massa id quam euismod interdum. Donec hendrerit augue vel magna pellentesque, sit amet 
      fermentum nisi luctus.
    </p>
  </div>
  
  <Card class="mt-4 sm:mt-6 md:mt-8 p-4 sm:p-6 md:p-8">
    <h3 class="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Your Authentication Info</h3>
    
    <Alert className="mb-3 sm:mb-4 border-green-200 bg-green-50">
      <AlertDescription className="font-medium text-sm sm:text-base text-green-800">
        Successfully authenticated!
      </AlertDescription>
    </Alert>
    
    <div class="space-y-2 sm:space-y-3">
      <div>
        <h4 class="font-medium text-sm sm:text-base">User ID:</h4>
        <p class="text-xs sm:text-sm ml-2 sm:ml-4">{user?.uid || 'Not available'}</p>
      </div>
      
      {#if user?.email}
        <div>
          <h4 class="font-medium text-sm sm:text-base">Email:</h4>
          <p class="text-xs sm:text-sm ml-2 sm:ml-4">{user.email}</p>
        </div>
      {/if}
      
      {#if authMethod}
        <div>
          <h4 class="font-medium text-sm sm:text-base">Authentication Method:</h4>
          <p class="text-xs sm:text-sm ml-2 sm:ml-4">{authMethod}</p>
        </div>
      {/if}
      
      <div>
        <h4 class="font-medium text-sm sm:text-base">Custom Attributes:</h4>
        <pre class="text-xs sm:text-sm ml-2 sm:ml-4 p-2 bg-gray-100 rounded overflow-auto max-h-40 sm:max-h-60">
{JSON.stringify({
  uid: customClaims.uid,
  email: customClaims.email,
  name: customClaims.name,
  isClient: customClaims.isClient,
  isConsultant: customClaims.isConsultant,
  isAdmin: customClaims.isAdmin,
  isSysAdmin: customClaims.isSysAdmin,
  roles: customClaims.roles
}, null, 2)}
        </pre>
      </div>
      
      <div>
        <h4 class="font-medium text-sm sm:text-base">Roles:</h4>
        <div class="ml-2 sm:ml-4 flex flex-wrap gap-1 sm:gap-2">
          {#if isClient}
            <span class="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Client</span>
          {/if}
          {#if isConsultant}
            <span class="px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Consultant</span>
          {/if}
          {#if isAdmin}
            <span class="px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Admin</span>
          {/if}
          {#if isSysAdmin}
            <span class="px-2 py-0.5 sm:py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">System Admin</span>
          {/if}
        </div>
      </div>
      
      {#if userPermissions.length > 0}
        <div>
          <h4 class="font-medium text-sm sm:text-base">Permissions:</h4>
          <ul class="ml-2 sm:ml-4 text-xs sm:text-sm">
            {#each userPermissions as permission}
              <li>• {permission}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </Card>
</div>