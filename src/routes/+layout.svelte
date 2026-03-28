<!--
  src/routes/+layout.svelte
  Universal Layout for SPA Mode with Standardized Spinner
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import '../app.css';

  // Import stores and services
  import { authStore } from '@xbg.solutions/utils-firebase-auth';
  import { initializationStore } from '@xbg.solutions/frontend-core';
  import { subscribe } from '@xbg.solutions/frontend-core';
  import { AUTH_EVENTS } from '@xbg.solutions/frontend-core';
  import { loadingStore } from '@xbg.solutions/frontend-core';
  import { PageTransition } from '$lib/components/layout';

  // Immediately disable SvelteKit's navigation progress bar and hide all browser-level loading indicators
  if (browser) {
    // Disable SvelteKit's navigation progress indicator programmatically
    try {
      const navigating = document.querySelector('#sveltekit-navigation-progress');
      if (navigating) {
        navigating.remove();
      }
    } catch (e) {
      console.warn('Error removing SvelteKit navigation indicator:', e);
    }

    // Hide native browser progress indicators via comprehensive CSS
    const style = document.createElement('style');
    style.textContent = `
      /* Hide all browser and SvelteKit loading indicators */
      html:before, html:after,
      body:before, body:after,
      #sveltekit-navigation-progress,
      #nprogress,
      .nprogress-busy,
      [role="progressbar"],
      progress {
        content: none !important;
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        pointer-events: none !important;
        z-index: -9999 !important;
      }

      /* Hide transition/progress bars at the top of viewport */
      html:before, body:before, :root:before {
        display: none !important;
        content: none !important;
      }

      /* Hide Chrome's loading bar */
      #nprogress .bar {
        display: none !important;
        opacity: 0 !important;
      }

      /* Remove loading animation */
      #nprogress .spinner {
        display: none !important;
        opacity: 0 !important;
      }

      /* SvelteKit specific fixes */
      :root {
        --sk-loader-size: 0 !important;
        --sk-loader-color: transparent !important;
      }
    `;
    document.head.appendChild(style);

    // Intercept and block any dynamic addition of progress bars
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
              try {
                // Cast to Element to access DOM properties safely
                const element = node as Element;
                // Remove loading indicators
                if (element.id === 'sveltekit-navigation-progress' ||
                    element.id === 'nprogress' ||
                    (node.nodeType === 1 && element.tagName === 'PROGRESS') ||
                    (element.getAttribute && element.getAttribute('role') === 'progressbar')) {
                  if (node.parentNode) {
                    node.parentNode.removeChild(node);
                  }
                }
              } catch (e) {
                // Silent error
              }
            });
          }
        });
      }).observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  }

  // Type imports
  import type { FirebaseUserClaims } from '@xbg.solutions/frontend-core';
  import type { User } from 'firebase/auth';
  import type { Snippet } from 'svelte';

  // Props
  let { children }: { children?: Snippet } = $props();

  // State variables
  let mounted = $state(false);
  let isLoading = $state(true);
  let isInitialized = $state(false);
  let isAuthenticated = $state(false);
  let user: User | null = $state(null);
  let claims: FirebaseUserClaims | null = $state(null);

  // Handle mounting and subscriptions
  $effect(() => {
    // Set mounted flag first (this is important!)
    mounted = true;

    // Only run in browser context
    if (!browser) return;

    // Set up auth subscriptions
    const unsubAuth = authStore.subscribe((state) => {
      if (!state) return;

      isLoading = state?.isLoading || state?.isInitializing || false;
      isAuthenticated = state?.isAuthenticated || false;
      user = state.user || null;
      claims = state.claims || null;
    });

    // Subscribe to initialization state
    const unsubInit = initializationStore.subscribe((state) => {
      if (!state) return;

      isInitialized = state?.isInitialized || false;
    });

    // Subscribe to events for additional safety
    const unsubAuthEvents = subscribe(AUTH_EVENTS.STATE_CHANGED, (event) => {
      if (!event?.payload) return;
    });

    // Mark loading in store - use different load key based on auth state
    const layoutKey = isAuthenticated ? 'protected' : 'public';
    loadingStore.startLoading('layout', layoutKey);

    // Cleanup function
    return () => {
      if (typeof unsubAuth === 'function') unsubAuth();
      if (typeof unsubInit === 'function') unsubInit();
      if (typeof unsubAuthEvents === 'function') unsubAuthEvents();
      loadingStore.endLoading('layout', isAuthenticated ? 'protected' : 'public');
    };
  });

  // Define different route types
  let currentPath = $derived($page.url.pathname);

  // Handle logout
  function handleLogout(event: Event): void {
    console.log('Logout button clicked, initiating signout');

    // Prevent default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Try using a direct call to auth service first
    try {
      // Direct call to signout from Firebase - less overhead
      import('firebase/auth')
        .then(module => {
          const auth = module.getAuth();
          console.log('Got auth instance:', !!auth);
          if (auth) {
            // Clear stored data first
            localStorage.removeItem('firebase:authUser:' + import.meta.env.VITE_FIREBASE_API_KEY);
            localStorage.removeItem('emailForSignIn');

            // Clear auth state immediately
            authStore.update(state => ({
              ...state,
              isAuthenticated: false,
              user: null,
              claims: null,
              authMethod: null
            }));

            console.log('Proceeding with Firebase signout');
            auth.signOut()
              .then(() => {
                console.log('Firebase signout successful, redirecting');
                // Force redirect
                window.location.href = '/?logout=true&ts=' + Date.now();
              })
              .catch(e => {
                console.error('Firebase signout error:', e);
                // Force redirect even on error
                window.location.href = '/?logout=error&ts=' + Date.now();
              });
          } else {
            console.log('No auth instance, force redirecting');
            window.location.href = '/?logout=noauth&ts=' + Date.now();
          }
        })
        .catch(e => {
          console.error('Failed to import Firebase:', e);
          // Force redirect on import error
          window.location.href = '/?logout=importerror&ts=' + Date.now();
        });
    } catch (err) {
      console.error('General error in logout handler:', err);
      // Fallback forced navigation
      window.location.href = '/?logout=error&ts=' + Date.now();
    }
  }

  // Helper function to check if user has a role
  function hasRole(role: string): boolean {
    if (!claims || !claims.roles) return false;
    return Array.isArray(claims.roles) && claims.roles.includes(role);
  }
</script>

{#if mounted}
  <div class="app-container tailwind-reset min-h-screen flex flex-col">
    <!-- Responsive Header -->
    <header class="border-b border-border bg-background w-full shadow-sm">
      <div class="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <h1 class="text-xl md:text-2xl font-bold text-primary">
          <a href="/" class="hover:opacity-90 transition-opacity">SvelteKit Boilerplate</a>
        </h1>

        <nav class="flex items-center gap-4">
          {#if isAuthenticated}
            <a href="/protected" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</a>
            <button onclick={handleLogout} class="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign Out</button>
          {:else}
            <a href="/" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</a>
          {/if}
        </nav>
      </div>
    </header>

    <!-- Main Content Area - Using responsive padding and spacing -->
    <!-- Global loading overlay that covers the entire app -->
    {#if isLoading}
      <div class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    {/if}
    
    {#if currentPath.includes('protected')}
      <!-- Protected Content requires authentication -->
      <main class="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex-grow">
        {#if !isLoading && !isAuthenticated}
          <div class="flex justify-center items-center h-48 md:h-64 flex-col px-4">
            <div class="w-12 h-12 md:w-16 md:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <span class="material-symbols-rounded text-amber-600 text-2xl md:text-3xl">no_accounts</span>
            </div>
            <p class="text-base md:text-lg font-medium text-red-600 text-center">Authentication required</p>
            <p class="mt-1 md:mt-2 text-sm md:text-base text-gray-600 text-center">Please log in to access this area</p>
          </div>
        {:else if !isLoading}
          {@render children?.()}
        {/if}
      </main>
    {:else}
      <!-- Other Content -->
      <main class="flex-grow">
        {#if !isLoading}
          {@render children?.()}
        {/if}
      </main>
    {/if}

    <!-- Responsive Footer -->
    <footer class="mt-auto py-3 sm:py-4 text-center" style="background-color: var(--primary-mid); color: var(--primary-dark);">
      <div class="container mx-auto px-4 sm:px-6">
        <p class="text-xs sm:text-sm md:text-base">
          © {new Date().getFullYear()} SvelteKit Boilerplate 
          <span class="hidden sm:inline">{currentPath.includes('protected') ? '- Protected Area' : ''}</span>
        </p>
      </div>
    </footer>
    
    <!-- Toast notification container (removed - legacy component) -->
    
    <!-- Page transition loading overlay -->
    <PageTransition />
  </div>
{/if}