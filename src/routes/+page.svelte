<!--
  src/routes/+page.svelte
  Login Page with Consistent Design System Integration
-->
<script lang="ts">
  import { subscribe } from '@xbg.solutions/bpsk-core';
  import { TAB_SYNC_EVENTS } from '@xbg.solutions/bpsk-utils-tab-sync';
  import { AUTH_EVENTS } from '@xbg.solutions/bpsk-core';
  import { PhoneAuth, EmailLinkAuth } from '$lib/components/auth';
  import { authService } from '@xbg.solutions/bpsk-utils-firebase-auth';
  import { goto } from '$app/navigation';
  import { safeRedirectUrl } from '$lib/utils/redirect';

  // Get return URL and other params from data or URL
  let { data = {} }: { data?: { returnUrl?: string } } = $props();

  let returnUrl = $derived(safeRedirectUrl(data?.returnUrl));

  // Check for reload or logout parameters (used for forced logout/clean state)
  let reloadParam = $derived(typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('reload') : null);
  let logoutParam = $derived(typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('logout') : null);

  // Track event subscriptions for cleanup
  // Define a union type that can be both a function and null
  type Unsubscriber = (() => void) | null;
  let storageListener: ((e: StorageEvent) => void) | null = null;

  // Active tab tracking
  let activeTab = $state(0);

  // Function to redirect if authenticated
  async function checkAuthAndRedirect() {
    console.log('Checking authentication state...');
    // First try the cached auth state
    if (authService.isAuthenticated()) {
      console.log('User is authenticated, redirecting to returnUrl:', returnUrl);
      window.location.href = returnUrl; // Use hard navigation for more reliable auth state
      return;
    }

    // If we got a remote login event but local state shows not authenticated,
    // force a reload to get latest state from Firebase
    try {
      console.log('Forcing reload of auth state from Firebase...');
      // Force refresh token if there is a user
      const { getFirebaseAuth } = await import('$lib/utils/firebase');
      const auth = await getFirebaseAuth();
      const authUser = auth.currentUser;

      if (authUser) {
        console.log('Firebase user found, refreshing token and redirecting');
        await authUser.getIdToken(true); // Force token refresh

        // Update auth store directly
        const { authStore } = await import('$lib/stores/auth.store');
        authStore.update(state => ({
          ...state,
          isAuthenticated: true,
          lastAuthenticated: Date.now()
        }));

        window.location.href = returnUrl; // Use hard navigation for more reliable auth state
      } else {
        console.log('No Firebase user found after refresh');

        // Double-check with Firebase onAuthStateChanged to be certain
        auth.onAuthStateChanged((user: any) => {
          if (user) {
            console.log('User found via onAuthStateChanged, redirecting');
            window.location.href = returnUrl;
          }
        });
      }
    } catch (err) {
      console.error('Error during auth check:', err);
    }
  }

  // Handle mounting and subscriptions with $effect
  $effect(() => {
    let messageSubscription: Unsubscriber = null;
    let authStateSubscription: Unsubscriber = null;
    let tabSyncSubscription: Unsubscriber = null;

    try {
      const hasStoredEmail = localStorage.getItem('emailForSignIn');

      if (reloadParam || logoutParam) {
        localStorage.removeItem('firebase:authUser:' + import.meta.env.VITE_FIREBASE_API_KEY);
        localStorage.removeItem('emailForSignIn');
        localStorage.removeItem('emailForSignIn_expiresAt');
        sessionStorage.removeItem('emailForSignIn');
      }

      // Subscribe to auth state changes
      authStateSubscription = subscribe(AUTH_EVENTS.STATE_CHANGED, (payload) => {
        console.log('Auth state changed on login page:', payload);
        if (payload.isAuthenticated) {
          checkAuthAndRedirect();
        }
      });

      // Also subscribe to specific login success events
      messageSubscription = subscribe(AUTH_EVENTS.LOGIN_SUCCESS, (payload) => {
        console.log('Login success event on login page:', payload);
        checkAuthAndRedirect();
      });

      // Subscribe to tab sync auth events
      tabSyncSubscription = subscribe(TAB_SYNC_EVENTS.AUTH_STATE_SYNCED, (payload) => {
        console.log('Tab sync auth state event received:', payload);
        if (payload.action === 'login' && payload.source === 'remote') {
          console.log('Remote login detected, checking auth state');
          // Force a full page reload which is more reliable than trying to manually sync auth
          // This ensures we get the latest Firebase auth state
          window.location.reload();
        }
      });

      // Initial check in case already authenticated
      checkAuthAndRedirect();
    } catch (e) {
      console.error('Error in login page mount:', e);
    }

    // Cleanup function
    return () => {
      if (messageSubscription && typeof messageSubscription === 'function') {
        (messageSubscription as () => void)();
      }

      if (authStateSubscription && typeof authStateSubscription === 'function') {
        (authStateSubscription as () => void)();
      }

      if (tabSyncSubscription && typeof tabSyncSubscription === 'function') {
        (tabSyncSubscription as () => void)();
      }

      if (storageListener) {
        window.removeEventListener('storage', storageListener);
      }
    };
  });

  // Helper type and functions for Firebase reCAPTCHA
  function safeSetWindowProperty(propertyName: string, defaultValue: any = null): void {
    if (typeof window !== 'undefined') {
      (window as any)[propertyName] = (window as any)[propertyName] || defaultValue;
    }
  }

  // Initialize window properties for Firebase reCAPTCHA
  safeSetWindowProperty('recaptchaVerifier');
  safeSetWindowProperty('confirmationResult');
  safeSetWindowProperty('recaptchaWidgetId');
</script>

<div class="flex flex-col items-center py-6 sm:py-8 md:py-12 mt-5vh">
  
  <!-- Responsive width with better mobile support -->
  <div class="w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 max-w-md sm:max-w-lg md:max-w-xl mt-4 sm:mt-6 md:mt-8 min-h-[20vh]">
    <!-- Container with primary-dark border -->
    <div class="border border-primary-dark rounded-lg overflow-hidden shadow-md">
      <!-- Tab navigation with improved active/inactive states - responsive text sizes -->
      <div class="flex border-b border-primary-dark">
        <!-- Email Tab -->
        <button
          class="flex-1 py-2 sm:py-3 px-2 sm:px-4 text-center transition-colors font-medium border-r border-primary-dark {activeTab === 0 ? 'bg-primary-light border-b-2 border-b-accent -mb-px' : 'bg-primary-mid text-gray-700 hover:bg-primary-light/70'}"
          onclick={() => (activeTab = 0)}
        >
          <div class="flex items-center justify-center">
            <span class="text-xs sm:text-sm md:text-base">Email Link</span>
          </div>
        </button>

        <!-- Phone Tab -->
        <button
          class="flex-1 py-2 sm:py-3 px-2 sm:px-4 text-center transition-colors font-medium {activeTab === 1 ? 'bg-primary-light border-b-2 border-b-accent -mb-px' : 'bg-primary-mid text-gray-700 hover:bg-primary-light/70'}"
          onclick={() => (activeTab = 1)}
        >
          <div class="flex items-center justify-center">
            <span class="text-xs sm:text-sm md:text-base">Phone Number</span>
          </div>
        </button>
      </div>

      <!-- Form content with responsive padding -->
      <div class="p-3 sm:p-4 md:p-5 bg-primary-light">
        {#if activeTab === 0}
          <!-- Email Authentication Form -->
          <EmailLinkAuth redirectUrl={returnUrl} />
        {:else}
          <!-- Phone Authentication Form -->
          <PhoneAuth 
            redirectUrl={returnUrl}
            recaptchaContainerId="login-recaptcha-container"
          />
          
          <!-- Add a visible container for the reCAPTCHA widget with responsive margin -->
          <div id="login-recaptcha-container" class="mt-4 sm:mt-5 md:mt-6 mb-2 sm:mb-3 md:mb-4 flex justify-center min-h-[78px]"></div>
        {/if}
      </div>
    </div>
  </div>
</div>


<style>
  /* Override for the active navigation item */
  button:focus {
    outline: none;
  }

  /* Responsive margin helper */
  .mt-5vh {
    margin-top: 5vh;
  }
</style>