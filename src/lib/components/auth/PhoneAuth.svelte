<!--
  src/lib/components/auth/PhoneAuth.svelte
  Phone Authentication Component with Design System Integration
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { AUTH_ROUTES } from '@xbg.solutions/bpsk-core';

  // Component props
  let {
    languageCode = undefined,
    recaptchaContainerId = 'recaptcha-container',
    redirectUrl = AUTH_ROUTES.SUCCESS
  }: {
    languageCode?: string | undefined;
    recaptchaContainerId?: string;
    redirectUrl?: string;
  } = $props();

  // Component state
  let phoneNumber = $state('');
  let verificationCode = $state('');
  let loading = $state(false);
  let error = $state('');
  let codeSent = $state(false);
  let auth: any = $state(null);

  // Component state for Firebase recaptcha
  let recaptchaVerifier: any = $state(null);
  let confirmationResult: any = $state(null);
  let recaptchaWidgetId: any = $state(null);

  // Define safe accessor functions for window properties
  function getWindowRecaptchaVerifier(): any {
    return typeof window !== 'undefined' ? (window as any).recaptchaVerifier : null;
  }

  function setWindowRecaptchaVerifier(value: any): void {
    if (typeof window !== 'undefined') {
      (window as any).recaptchaVerifier = value;
    }
  }

  function getWindowConfirmationResult(): any {
    return typeof window !== 'undefined' ? (window as any).confirmationResult : null;
  }

  function setWindowConfirmationResult(value: any): void {
    if (typeof window !== 'undefined') {
      (window as any).confirmationResult = value;
    }
  }

  function getWindowRecaptchaWidgetId(): any {
    return typeof window !== 'undefined' ? (window as any).recaptchaWidgetId : null;
  }

  function setWindowRecaptchaWidgetId(value: any): void {
    if (typeof window !== 'undefined') {
      (window as any).recaptchaWidgetId = value;
    }
  }

  function getWindowGrecaptcha(): any {
    return typeof window !== 'undefined' ? (window as any).grecaptcha : null;
  }

  // Initialize Firebase auth and clean up
  $effect(() => {
    // Initialize
    (async () => {
      try {
        const { getAuth } = await import('firebase/auth');
        auth = getAuth();

        if (languageCode && auth) {
          auth.languageCode = languageCode;
        }
      } catch (err) {
        console.error('Error initializing Firebase Auth:', err);
        error = 'Failed to initialize authentication. Please try again later.';
      }
    })();

    // Cleanup
    return () => {
      const verifier = getWindowRecaptchaVerifier();
      if (verifier && typeof verifier.clear === 'function') {
        try {
          verifier.clear();
        } catch (e) {
          console.error('Error clearing reCAPTCHA:', e);
        }
      }
    };
  });

  // Send verification code
  async function sendCode() {
    if (!phoneNumber) {
      error = 'Please enter a phone number';
      return;
    }

    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    loading = true;
    error = '';

    try {
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth');

      if (!auth) {
        const { getAuth } = await import('firebase/auth');
        auth = getAuth();

        if (languageCode && auth) {
          auth.languageCode = languageCode;
        }
      }

      if (!getWindowRecaptchaVerifier()) {
        const containerElement = document.getElementById(recaptchaContainerId);
        if (!containerElement) {
          throw new Error(`reCAPTCHA container ${recaptchaContainerId} not found in DOM`);
        }

        const newVerifier = new RecaptchaVerifier(auth, containerElement, {
          'size': 'normal',
          'callback': () => {
            if (!codeSent && !loading) {
              completePhoneSignIn();
            }
          },
          'expired-callback': () => {
            error = 'Security verification expired. Please try again.';
            resetRecaptcha();
          }
        });

        try {
          await newVerifier.render();
          setWindowRecaptchaVerifier(newVerifier);
        } catch (renderError) {
          throw new Error('Failed to initialize security verification. Please refresh and try again.');
        }
      }

      await completePhoneSignIn();
    } catch (err) {
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      resetRecaptcha();
    } finally {
      loading = false;
    }
  }

  // Complete phone sign-in
  async function completePhoneSignIn() {
    if (!auth) {
      throw new Error('Authentication not initialized');
    }

    const verifier = getWindowRecaptchaVerifier();
    if (!verifier) {
      throw new Error('reCAPTCHA not initialized');
    }

    try {
      const { signInWithPhoneNumber } = await import('firebase/auth');

      const result = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier
      );

      setWindowConfirmationResult(result);
      codeSent = true;
      error = '';
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as any).code;

        if (code === 'auth/invalid-phone-number') {
          error = 'Please enter a valid phone number with country code (e.g., +1 for USA)';
        } else if (code === 'auth/too-many-requests') {
          error = 'Too many requests. Please try again later.';
        } else if (code === 'auth/captcha-check-failed') {
          error = 'Security verification failed. Please try again.';
        } else {
          error = `Verification failed: ${code}`;
        }
      } else {
        error = err instanceof Error ? err.message : 'An unexpected error occurred';
      }

      throw err;
    }
  }

  // Verify code
  async function verifyCode() {
    if (!verificationCode) {
      error = 'Please enter the verification code';
      return;
    }

    loading = true;
    error = '';

    try {
      const confirmation = getWindowConfirmationResult();
      if (!confirmation) {
        throw new Error('Verification session expired. Please request a new code.');
      }

      const userCredential = await confirmation.confirm(verificationCode);

      // Force tab synchronization to update other tabs
      try {
        // Import necessary modules
        const { safeForceSync, safeBroadcastMessage } = await import('$lib/services/tab-sync');
        const { publish } = await import('$lib/services/events');
        const { AUTH_EVENTS } = await import('$lib/constants/auth.constants');
        const { authStore } = await import('$lib/stores/auth.store');
        const { tabSyncStore } = await import('$lib/stores/tab-sync.store');

        // First, ensure the local auth state is updated
        authStore.update(state => ({
          ...state,
          isAuthenticated: true,
          authMethod: 'phoneNumber'
        }));

        // Publish explicit login success event for event listeners
        publish(AUTH_EVENTS.LOGIN_SUCCESS, {
          method: 'phoneNumber',
          timestamp: Date.now(),
          source: 'phone-auth'
        }, 'PhoneAuth');

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
          method: 'phoneNumber',
          timestamp: Date.now()
        }, 'PhoneAuth');

        // Force a page reload in other tabs with multiple methods
        // Method 1: Use custom message via tab-sync
        await safeBroadcastMessage('auth:force-reload', {
          source: 'phone-auth',
          timestamp: Date.now(),
          authenticated: true
        });

        // Method 2: Use localStorage as a backup communication method
        localStorage.setItem('auth_sync_timestamp', Date.now().toString());
        localStorage.setItem('auth_sync_status', 'authenticated');

      } catch (err) {
        console.error('Error synchronizing tabs:', err);
      }

      // Give the auth state enough time to propagate
      // and synchronize across tabs before redirecting
      setTimeout(async () => {
        try {
          // Force a refresh of the Firebase auth state
          const { getFirebaseAuth } = await import('$lib/utils/firebase');
          const auth = await getFirebaseAuth();
          const currentUser = auth.currentUser;

          if (currentUser) {
            // Force a token refresh to ensure fresh auth state
            await currentUser.getIdToken(true);
            console.log('Phone auth successful, redirecting to', redirectUrl);
          }

          // Ensure the authStore is updated with the latest state
          const { authStore } = await import('$lib/stores/auth.store');
          authStore.update(state => ({
            ...state,
            isAuthenticated: true,
            authMethod: 'phoneNumber',
            lastAuthenticated: Date.now()
          }));

          // Use window.location.href for a full page navigation which is more reliable
          // than the SPA navigation when auth state might be in flux
          window.location.href = redirectUrl;
        } catch (err) {
          console.error('Error during redirect after phone auth:', err);
          // Fallback to goto if there was an error
          goto(redirectUrl);
        }
      }, 1500);
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as any).code;
        if (code === 'auth/invalid-verification-code') {
          error = 'The verification code is invalid. Please try again.';
        } else if (code === 'auth/code-expired') {
          error = 'The verification code has expired. Please request a new code.';
        } else {
          error = `Failed to verify code: ${code}`;
        }
      } else {
        error = err instanceof Error ? err.message : 'An unexpected error occurred';
      }
    } finally {
      loading = false;
    }
  }

  // Reset reCAPTCHA
  function resetRecaptcha() {
    try {
      const verifier = getWindowRecaptchaVerifier();
      const widgetId = getWindowRecaptchaWidgetId();
      const grecaptcha = getWindowGrecaptcha();

      if (verifier) {
        if (widgetId !== null && grecaptcha) {
          grecaptcha.reset(widgetId);
        } else if (typeof verifier.render === 'function') {
          verifier.render().then(function(newWidgetId: any) {
            setWindowRecaptchaWidgetId(newWidgetId);
            const updatedGrecaptcha = getWindowGrecaptcha();
            if (updatedGrecaptcha) {
              updatedGrecaptcha.reset(newWidgetId);
            }
          });
        }
      }
    } catch (e) {
      console.error('Error resetting reCAPTCHA:', e);
    }
  }

  // Reset form
  function resetForm() {
    codeSent = false;
    verificationCode = '';
    error = '';
    resetRecaptcha();
  }
</script>

<div class="auth-form">
  {#if error}
    <div class="error-message bg-red-50 text-red-600 p-4 rounded-lg mb-4 mx-8" role="alert">
      <p class="text-sm">{error}</p>
    </div>
  {/if}

  <div class="p-0">
    {#if !codeSent}
      <div class="bg-blue-50 text-blue-800 p-4 rounded-lg mb-4 mx-8">
        <p class="text-sm">
          We'll send a verification code to your phone. Enter the code to sign in.
        </p>
      </div>

      <div class="mb-4 mx-8">
        <label for="phone-number" class="block mb-2 font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          id="phone-number"
          bind:value={phoneNumber}
          placeholder="+1 555 555 5555"
          disabled={loading}
          class="w-full py-2 px-3 bg-white border border-primary-dark rounded-lg text-gray-900 focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-30"
          aria-required="true"
        />
      </div>

      <div class="mx-8 mb-4">
        <button
          class="w-full py-2 px-4 text-white rounded-lg flex items-center justify-center font-medium disabled:opacity-60 disabled:cursor-not-allowed bg-accent"
          onclick={sendCode}
          disabled={!phoneNumber || loading}
        >
          {#if loading}
            <span class="mr-2 h-4 w-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></span>
            Sending...
          {:else}
            Send Verification Code
          {/if}
        </button>
      </div>
    {:else}
      <div class="bg-green-50 text-green-800 p-4 rounded-lg mb-4 mx-8">
        <p class="text-sm">
          Code sent to <strong>{phoneNumber}</strong>. Enter the 6-digit verification code below.
        </p>
      </div>

      <div class="mb-4 mx-8">
        <label for="verification-code" class="block mb-2 font-medium text-gray-700">Verification Code</label>
        <input
          type="text"
          id="verification-code"
          bind:value={verificationCode}
          placeholder="123456"
          disabled={loading}
          class="w-full py-2 px-3 bg-white border border-primary-dark rounded-lg text-gray-900 focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-30"
          aria-required="true"
          maxlength="6"
          pattern="[0-9]*"
          inputmode="numeric"
        />
      </div>

      <div class="mx-8">
        <div class="mb-4">
          <button
            class="w-full py-2 px-4 text-white rounded-lg flex items-center justify-center font-medium disabled:opacity-60 disabled:cursor-not-allowed bg-accent"
            onclick={verifyCode}
            disabled={!verificationCode || loading}
          >
            {#if loading}
              <span class="mr-2 h-4 w-4 border-t-2 border-r-2 border-white rounded-full animate-spin"></span>
              Verifying...
            {:else}
              Verify Code
            {/if}
          </button>
        </div>

        <div class="mb-4">
          <button
            class="w-full py-2 px-4 bg-primary-mid text-gray-700 rounded-lg flex items-center justify-center font-medium hover:bg-primary-mid/80 transition-colors"
            onclick={resetForm}
            disabled={loading}
            type="button"
          >
            Change Phone Number
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .auth-form {
    width: 100%;
  }
</style>