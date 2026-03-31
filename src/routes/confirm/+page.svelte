<!--
  src/routes/confirm/+page.svelte
  Email Confirmation Page with Standardized Spinner
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { Card, Alert, AlertDescription, Button, Label, Input } from '$lib/components/ui';
  import { safeVerifyEmailLink, isEmailSignInLink, getStoredEmail, storeEmail } from '@xbg.solutions/bpsk-utils-firebase-auth';
  import { AUTH_ROUTES } from '@xbg.solutions/bpsk-core';
  import { safeForceSync } from '@xbg.solutions/bpsk-utils-tab-sync';
  import { AUTH_EVENTS } from '@xbg.solutions/bpsk-core';
  import { publish } from '@xbg.solutions/bpsk-core';
  import { tabSyncStore } from '@xbg.solutions/bpsk-utils-tab-sync';
  import type { EmailLinkVerifyOptions } from '@xbg.solutions/bpsk-core';

  // Get data from page load function
  let { data = {} }: { data?: {
    returnUrl?: string,
    email?: string,
    hasStoredEmail?: boolean
  } } = $props();

  // Use the returnUrl from data
  let returnUrl = $derived(data?.returnUrl || '/protected');

  // Use the email from data if available
  let emailFromData = $derived(data?.email);

  // State variables
  let error = $state('');
  let verifying = $state(true);
  let verificationStarted = $state(false);
  let emailInput = $state('');
  let showEmailForm = $state(false);

  // Track if we've already verified this link
  let linkVerified = $state(false);
  
  // Verify the link on mount
  $effect(() => {
    // Prevent multiple verification attempts if component remounts
    if (verificationStarted || linkVerified) {
      console.log('Verification already started or completed, preventing duplicate attempts');
      return;
    }

    verificationStarted = true;
    console.log('Confirm page mounted, checking for email sign-in link');

    (async () => {
    try {
      // Check if this is a sign-in link - now properly awaiting the async function
      const isValid = await isEmailSignInLink();
      console.log('Is email sign-in link?', isValid);
      
      if (!isValid) {
        console.error('Invalid authentication link detected');
        error = 'Invalid authentication link. Please request a new link.';
        verifying = false;
        
        // Redirect to unauthorized after a short delay to show the error
        setTimeout(() => {
          goto(AUTH_ROUTES.UNAUTHORIZED);
        }, 2000);
        return;
      }
      
      // If user is already authenticated, just redirect to success page
      // This prevents attempting to verify an already used link
      const auth = await import('firebase/auth').then(module => module.getAuth());
      if (auth && auth.currentUser) {
        console.log('User already authenticated, redirecting to success page');
        linkVerified = true;
        setTimeout(() => {
          goto(returnUrl || AUTH_ROUTES.SUCCESS);
        }, 500);
        return;
      }
      
      // Try to get the stored email from all possible locations
      let storedEmail = getStoredEmail();
      console.log('Stored email found?', !!storedEmail);
      
      // If we don't have stored email, try email from page data (from the URL)
      if (!storedEmail && emailFromData && emailFromData.includes('@')) {
        console.log('Using email from URL parameters:', emailFromData);
        storedEmail = emailFromData;
        
        // Store it for Firebase compatibility and future use
        storeEmail(emailFromData);
      }
      
      // If still no email found, try one last direct check of URL params
      if (!storedEmail) {
        console.log('No stored email found in any storage mechanism, checking URL params');
        
        // Check if email is passed as URL parameter (some services may append it)
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const emailParam = urlParams.get('email');
          
          if (emailParam && emailParam.includes('@')) {
            console.log('Found email in URL parameters, using it for verification');
            storedEmail = emailParam;
            // Store it first for Firebase compatibility
            storeEmail(emailParam);
          }
        } catch (e) {
          console.error('Error parsing URL parameters:', e);
        }
      }
      
      // If we have an email, proceed with verification
      if (storedEmail) {
        // Attempt to verify with the stored email
        console.log('Verifying with email:', storedEmail);
        await verifyEmail(storedEmail);
        return;
      }
      
      // If we get here, show email input form as last resort
      console.log('No stored email found anywhere, showing email input form');
      showEmailForm = true;
      verifying = false;
    } catch (err) {
      console.error('Error during confirmation page initialization:', err);
      error = 'An unexpected error occurred during authentication initialization';
      verifying = false;
    }
    })();
  });
  
  // Function to verify the email link
  async function verifyEmail(emailToUse: string) {
    // Don't attempt verification if already verified
    if (linkVerified) {
      console.log('Link already verified, skipping verification');
      return;
    }
    
    try {
      verifying = true;
      
      // Log verification attempt
      console.log('Verifying email link with:', { 
        email: emailToUse, 
        returnUrl: returnUrl,
        href: typeof window !== 'undefined' ? window.location.href : ''
      });
      
      // Store the email in both storage mechanisms for redundancy
      // This ensures the email is available when the service needs it
      storeEmail(emailToUse);
      
      // Check if already authenticated first to avoid trying to use an already-used link
      const auth = await import('firebase/auth').then(module => module.getAuth());
      if (auth && auth.currentUser) {
        console.log('User already authenticated, skipping verification and redirecting');
        linkVerified = true;
        
        // Redirect to protected area
        setTimeout(() => {
          goto(returnUrl || AUTH_ROUTES.SUCCESS);
        }, 500);
        return;
      }
      
      // Verify the email link using the auth service
      const options: EmailLinkVerifyOptions = {
        email: emailToUse,
        link: window.location.href,
        returnUrl: returnUrl // Pass the returnUrl directly
      };
      
      const result = await safeVerifyEmailLink(options);
      
      if (result.success) {
        // Mark as verified to prevent additional attempts
        linkVerified = true;
        
        // Successful verification - let the token processing complete
        console.log('Email link verification successful, waiting for redirect');
        
        // Force tab synchronization to update other tabs
        try {
          console.log('Forcing tab synchronization after successful login');
          
          // Import necessary modules
          const { authStore } = await import('$lib/stores/auth.store');
          
          // First, ensure the local auth state is updated
          authStore.update(state => ({
            ...state,
            isAuthenticated: true,
            authMethod: 'emailLink'
          }));
          
          // Publish explicit login success event for event listeners
          // This will trigger the auth state change event
          publish(AUTH_EVENTS.LOGIN_SUCCESS, {
            method: 'emailLink',
            timestamp: Date.now(),
            source: 'confirm-page'
          }, 'ConfirmPage');
          
          // Directly update tab sync store
          tabSyncStore.update(state => ({
            ...state,
            isAuthenticated: true,
            lastAuthStateUpdate: Date.now()
          }));
          
          // Force sync to other tabs - this broadcasts our auth state
          await safeForceSync();
          
          // Triple-ensure: Send a direct auth state change event
          publish(AUTH_EVENTS.STATE_CHANGED, {
            isAuthenticated: true,
            method: 'emailLink',
            timestamp: Date.now()
          }, 'ConfirmPage');
          
          // Force a page reload in other tabs with multiple methods
          try {
            // Method 1: Use custom message via tab-sync 
            const { safeBroadcastMessage } = await import('$lib/services/tab-sync');
            await safeBroadcastMessage('auth:force-reload', {
              source: 'confirm-page',
              timestamp: Date.now(),
              authenticated: true
            });
            
            // Method 2: Use localStorage as a backup communication method
            localStorage.setItem('auth_sync_timestamp', Date.now().toString());
            localStorage.setItem('auth_sync_status', 'authenticated');
            
            console.log('Broadcast auth change to other tabs through multiple channels');
          } catch (err) {
            console.warn('Error in cross-tab communication:', err);
          }
        } catch (e) {
          console.error('Error synchronizing tabs:', e);
        }
        
        // The token service will handle redirecting automatically
      } else if (result.error) {
        // Check if it's an invalid-action-code error, which could mean
        // the link was already used but the auth worked
        if ((result.error as any)?.firebaseCode === 'auth/invalid-action-code') {
          // Check if we've become authenticated anyway
          const authCheck = await import('firebase/auth').then(module => module.getAuth());
          if (authCheck && authCheck.currentUser) {
            console.log('Link already used but user is authenticated, redirecting...');
            linkVerified = true;
            
            // Redirect to protected area
            setTimeout(() => {
              goto(returnUrl || AUTH_ROUTES.SUCCESS);
            }, 500);
            return;
          }
        }
        
        // Show error and redirect to unauthorized
        error = (result.error as any)?.firebaseCode === 'auth/invalid-action-code'
          ? 'This link has already been used or has expired. Please request a new link.'
          : result.error.userMessage || 'Authentication failed. Please try again.';
        
        verifying = false;
        
        // Redirect after a short delay to show the error
        setTimeout(() => {
          goto(AUTH_ROUTES.UNAUTHORIZED);
        }, 2000);
      }
    } catch (err) {
      console.error('Email verification error:', err);
      error = 'An unexpected error occurred during authentication.';
      verifying = false;
      
      // Redirect after a short delay to show the error
      setTimeout(() => {
        goto(AUTH_ROUTES.UNAUTHORIZED);
      }, 2000);
    }
  }
  
  // Function to handle email form submission
  async function handleEmailSubmit() {
    if (!emailInput || !emailInput.includes('@')) {
      error = 'Please enter a valid email address';
      return;
    }
    
    // Store the email to help with potential retries
    storeEmail(emailInput);
    
    // Clear any errors
    error = '';
    
    // Verify with provided email
    await verifyEmail(emailInput);
  }
</script>

<svelte:head>
  <!-- Add special meta tags to prevent browser loading indicators -->
  <meta name="theme-color" content="#ffffff" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <!-- This preconnect helps Firebase load faster -->
  <link rel="preconnect" href="https://www.googleapis.com" crossorigin="anonymous" />
  <link rel="preconnect" href="https://identitytoolkit.googleapis.com" crossorigin="anonymous" />
  <link rel="preconnect" href="https://securetoken.googleapis.com" crossorigin="anonymous" />
  <style>
    /* Comprehensive styles to prevent ANY loading indicators */
    :global(progress),
    :global([role="progressbar"]),
    :global(.progress-bar),
    :global(.loading-indicator),
    :global(html):before, :global(html):after,
    :global(body):before, :global(body):after {
      display: none !important;
      content: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
    }
    
    /* Ensure immediate rendering */
    :global(body) {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      background-color: #ffffff;
    }
    
    /* Safari and Firefox specific fixes */
    @supports (-webkit-appearance:none) {
      :global(body)::before {
        display: none !important;
        content: none !important;
      }
    }
    
    /* Ensure our loading overlay appears immediately with no transition delay */
    :global(.loading-overlay) {
      transition: none !important;
    }
  </style>
  <script>
    // Immediate script execution to hide any loading indicators
    document.documentElement.style.setProperty('--spinner-size', '0', 'important');
    document.documentElement.style.setProperty('--spinner-color', 'transparent', 'important');
    
    // Use mutation observer to catch and remove any dynamically added indicators
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
              if (node.tagName === 'PROGRESS' || 
                  (node.getAttribute && node.getAttribute('role') === 'progressbar')) {
                node.style.display = 'none';
                node.style.visibility = 'hidden';
                node.style.opacity = '0';
              }
            });
          }
        });
      });
      
      // Start observing once DOM is ready
      observer.observe(document.documentElement, { 
        childList: true, 
        subtree: true 
      });
    }
  </script>
</svelte:head>

<div class="max-w-md mx-auto pt-10 px-4">
  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold mb-2" style="color: var(--accent)">Email Verification</h1>
    <p class="text-gray-600">We're validating your sign-in link</p>
  </div>

  <Card class="shadow-lg border-0 overflow-hidden">
    {#if showEmailForm}
      <div class="p-6">
        <h2 class="text-xl font-semibold mb-4">Enter your email address</h2>
        
        {#if error}
          <Alert class="mb-4 border-red-200 bg-red-50">
            <AlertDescription class="flex items-center text-red-800">
              <span class="material-symbols-rounded mr-2">error</span>
              <span class="font-medium">{error}</span>
            </AlertDescription>
          </Alert>
        {/if}
        
        <div class="bg-blue-50 text-blue-800 p-4 rounded-lg mb-5 flex items-start">
          <span class="material-symbols-rounded mr-3 text-blue-600">info</span>
          <p class="text-sm">
            We need the same email address you used when requesting the login link.
          </p>
        </div>
        
        <form onsubmit={(e: Event) => { e.preventDefault(); handleEmailSubmit(); }}>
          <div class="mb-4">
            <Label for="email" class="mb-2 font-medium text-gray-700">Email Address</Label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              </div>
              <Input 
                id="email" 
                type="email" 
                placeholder="your@email.com" 
                bind:value={emailInput} 
                required
                class="pl-10"
              />
            </div>
          </div>
          
          <Button type="submit" class="w-full py-3 font-medium" style="background-color: var(--accent); border: none; color: white;">
            <div class="flex items-center justify-center">
              <span>Continue</span>
            </div>
          </Button>
        </form>
      </div>
    {:else if error}
      <div class="p-6 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-rounded text-red-600 text-3xl">error</span>
        </div>
        
        <Alert class="mb-6 border-red-200 bg-red-50">
          <AlertDescription class="flex items-center text-red-800">
            <span class="material-symbols-rounded mr-2">error</span>
            <span class="font-medium">{error}</span>
          </AlertDescription>
        </Alert>
        
        <p class="text-sm text-gray-500">Redirecting you...</p>
      </div>
    {:else}
      <div class="py-10 px-6 h-32 flex flex-col items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p class="text-sm text-gray-600">Verifying your sign-in link...</p>
      </div>
    {/if}
  </Card>
</div>

<style>
  /* Style for Material Symbols icons */
  :global(.material-symbols-rounded) {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 1.25rem;
    line-height: 1;
  }
</style>