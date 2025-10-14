<!--
  src/lib/components/auth/EmailLinkAuth.svelte
  Email Link Authentication Component with Design System Integration
-->
<script lang="ts">
  /**
   * Email Link Authentication component
   * Provides passwordless sign-in via email links
   */
  
  import { createEventDispatcher } from 'svelte';
  import { safeSendEmailLink } from '$lib/services/auth';
  import { Button } from '$lib/components/ui';
  
  // Event dispatcher for component events
  const dispatch = createEventDispatcher();
  
  // Component props
  export let redirectUrl: string = '/';
  export let infoText: string = "We'll send a secure link to your email. Click the link to sign in without a password.";
  
  // Form state
  let email = '';
  let emailError = '';
  let successMessage = '';
  let isLoading = false;
  
  // Function to validate email
  function isValidEmail(email: string): boolean {
    return /\S+@\S+\.\S+/.test(email);
  }
  
  // Function to handle email link authentication
  async function handleEmailLogin() {
    // Reset error and success states
    emailError = '';
    successMessage = '';
    isLoading = true;
    
    // Validate email
    if (!email) {
      emailError = 'Please enter your email address';
      isLoading = false;
      return;
    }
    
    if (!isValidEmail(email)) {
      emailError = 'Please enter a valid email address';
      isLoading = false;
      return;
    }
    
    try {
      // Send email link using the auth service
      const result = await safeSendEmailLink(email, {
        actionCodeSettings: {
          url: `${typeof window !== 'undefined' ? window.location.origin : ''}/confirm?returnUrl=${encodeURIComponent(redirectUrl)}&email=${encodeURIComponent(email)}`,
          handleCodeInApp: true
        },
        rememberEmail: true
      });
      
      if (result.success) {
        try {
          const { storeEmail } = await import('$lib/services/auth');
          storeEmail(email);
          dispatch('success', { email });
        } catch (e) {
          console.error('Failed to store email directly:', e);
        }
        
        successMessage = `Authentication link sent to ${email}. Please check your inbox.`;
        dispatch('sent', { email });
        email = '';
      } else if (result.error) {
        emailError = result.error.userMessage || 'Failed to send email link';
        dispatch('error', { error: emailError });
      }
    } catch (error) {
      console.error('Email login error:', error);
      emailError = 'An unexpected error occurred. Please try again.';
      dispatch('error', { error: emailError });
    } finally {
      isLoading = false;
    }
  }
</script>

<form on:submit|preventDefault={handleEmailLogin} class="auth-form">
  <div class="bg-blue-50 text-blue-800 p-4 rounded-lg mb-4 mx-8">
    <p class="text-sm">
      {infoText}
    </p>
  </div>
  
  <div class="mb-4 mx-8">
    <label for="email" class="block mb-2 font-medium text-gray-700">Email Address</label>
    <input 
      type="email" 
      id="email" 
      bind:value={email}
      placeholder="your@email.com" 
      disabled={isLoading}
      required
      class="w-full py-2 px-3 bg-white border border-primary-dark rounded-lg text-gray-900 focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-30"
    />
    {#if emailError}
      <p class="text-red-600 text-sm mt-1">{emailError}</p>
    {/if}
  </div>
  
  <div class="mx-8 mb-4">
    <button 
      type="submit" 
      class="w-full py-2 px-4 text-white rounded-lg flex items-center justify-center font-medium disabled:opacity-60 disabled:cursor-not-allowed bg-accent"
      disabled={!email || isLoading}
    >
      {#if isLoading}
        <span class="mr-2 h-4 w-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></span>
        Sending...
      {:else}
        Send Sign-in Link
      {/if}
    </button>
  </div>
  
  {#if successMessage}
    <div class="mt-2 mx-8 bg-green-50 text-green-800 p-4 rounded-lg">
      <p class="text-sm">{successMessage}</p>
    </div>
  {/if}
</form>

<style>
  .auth-form {
    width: 100%;
  }
</style>