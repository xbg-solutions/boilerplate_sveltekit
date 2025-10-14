<!--
  src/lib/components/layout/HeaderNav.svelte
  Header Navigation Component
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { rbacUtil } from '$lib/utils/rbac';
  import { page } from '$app/stores';
  
  /**
   * Reusable navigation component for page header
   * Responsive design with hamburger menu for mobile
   * Always displays appropriate links based on auth state
   */
  
  // Props
  export let isAuthenticated: boolean = false;
  export let claims: any = null;
  
  // State for mobile menu
  let mobileMenuOpen = false;
  
  // Toggle mobile menu
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
  
  // Current path for highlighting active links
  $: currentPath = $page?.url?.pathname || '';
  
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
            import('$lib/stores/auth.store').then(({ authStore }) => {
              authStore.update(state => ({
                ...state,
                isAuthenticated: false,
                user: null,
                claims: null,
                authMethod: null
              }));
            });
            
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
  
  // Add direct event listener to all logout buttons
  onMount(() => {
    if (!browser) return;
    
    // Add direct DOM event listeners to all logout buttons for maximum reliability
    setTimeout(() => {
      // Look for both desktop and mobile logout buttons
      const logoutButtons = document.querySelectorAll('[data-logout-button]');
      
      if (logoutButtons.length > 0) {
        console.log(`Adding direct event listeners to ${logoutButtons.length} logout buttons`);
        
        logoutButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            console.log('Logout button clicked via direct DOM event');
            e.preventDefault();
            e.stopPropagation();
            
            // Close mobile menu if open
            mobileMenuOpen = false;
            
            // Use direct Firebase signout and forced navigation
            try {
              localStorage.removeItem('firebase:authUser:' + import.meta.env.VITE_FIREBASE_API_KEY);
              localStorage.removeItem('emailForSignIn');
              
              // Force a complete reload with parameters
              window.location.href = '/?logout=direct&ts=' + Date.now();
            } catch (err) {
              console.error('Error in direct logout handler:', err);
              window.location.href = '/?logout=error&ts=' + Date.now();
            }
          });
        });
      } else {
        console.warn('Could not find any logout buttons for direct event attachment');
      }
    }, 500);
  });
</script>

<nav class="relative">
  <!-- Hamburger button for mobile - hidden on medium and larger screens -->
  <div class="md:hidden">
    <button 
      class="flex items-center px-3 py-2 border rounded text-gray-600 border-gray-400 hover:border-gray-500"
      on:click={toggleMobileMenu}
      aria-label="Toggle menu"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>
  </div>

  <!-- Desktop navigation - hidden on small screens, visible on medium and larger -->
  <ul class="hidden md:flex md:space-x-4 md:items-center">
    <!-- Common navigation items -->
    <li>
      <a 
        href="/" 
        class="hover:opacity-80 transition {currentPath === '/' ? 'font-bold' : ''}"
      >
        Home
      </a>
    </li>
    
    {#if isAuthenticated}
      <!-- Authenticated user navigation -->
      <li>
        <a 
          href="/protected" 
          class="hover:opacity-80 transition {currentPath.startsWith('/protected') ? 'font-bold' : ''}"
        >
          Dashboard
        </a>
      </li>
      
      <!-- Role-specific navigation for system admins goes here -->
      
      <!-- Example navigation items based on other roles -->
      {#if rbacUtil.hasRole(claims, 'client')}
        <li>
          <a href="/client" class="hover:opacity-80 transition">
            Client Area
          </a>
        </li>
      {/if}
      
      {#if rbacUtil.hasRole(claims, 'consultant')}
        <li>
          <a href="/consultant" class="hover:opacity-80 transition">
            Consultant Area
          </a>
        </li>
      {/if}
      
      <!-- Logout button -->
      <li>
        <a 
          href="/?logout=true&ts={Date.now()}"
          on:click|preventDefault|stopPropagation={handleLogout}
          data-logout-button
          class="font-medium hover:opacity-80 px-3 py-2 rounded-md transition"
        >
          Logout
        </a>
      </li>
    {/if}
  </ul>

  <!-- Mobile menu, toggle based on menu state -->
  {#if mobileMenuOpen}
    <div class="md:hidden absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
      <a 
        href="/" 
        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 {currentPath === '/' ? 'font-bold bg-gray-50' : ''}"
        on:click={() => mobileMenuOpen = false}
      >
        Home
      </a>
      
      {#if isAuthenticated}
        <a 
          href="/protected" 
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 {currentPath.startsWith('/protected') ? 'font-bold bg-gray-50' : ''}"
          on:click={() => mobileMenuOpen = false}
        >
          Dashboard
        </a>
        
        {#if rbacUtil.hasRole(claims, 'client')}
          <a 
            href="/client" 
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            on:click={() => mobileMenuOpen = false}
          >
            Client Area
          </a>
        {/if}
        
        {#if rbacUtil.hasRole(claims, 'consultant')}
          <a 
            href="/consultant" 
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            on:click={() => mobileMenuOpen = false}
          >
            Consultant Area
          </a>
        {/if}
        
        <a 
          href="/?logout=true&ts={Date.now()}"
          on:click|preventDefault|stopPropagation={(e) => {
            mobileMenuOpen = false;
            handleLogout(e);
          }}
          data-logout-button
          class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          Logout
        </a>
      {/if}
    </div>
  {/if}
</nav>

<style>
  nav li {
    list-style: none;
    margin-left: 1rem;
    font-size: 1rem;
  }

  nav li a {
    text-decoration: none;
    color: var(--accent-color);
  }
  
  nav li a:hover {
    text-decoration: underline;
  }

  /* Apply styles only to desktop nav logout button */
  @media (min-width: 768px) {
    nav [data-logout-button] {
      background-color: var(--accent-color);
      color: var(--primary-light) !important;
      padding: 0.5rem 1rem;
      border-radius: 0.3rem;
      text-decoration: none;
    }
  
    nav [data-logout-button]:hover {
      background-color: var(--accent-light);
      color: var(--accent-color) !important;
    }
  }
</style>