/**
 * src/routes/confirm/+page.ts
 * Email Confirmation Page Loader
 * 
 * This loader handles the email confirmation page loading logic,
 * including extraction of the returnUrl parameter and email for verification.
 * 
 * CRITICAL: This page must preserve email authentication data across navigation.
 */

import { browser } from '$app/environment';
import { safeRedirectUrl } from '$lib/utils/redirect';

export const load = ({ url }: { url: URL }) => {
  // Get the return URL from the query parameters.
  // Validated here so every downstream goto()/href in the confirm flow only
  // ever sees a safe in-app path (prevents open redirect via crafted links).
  const returnUrl = safeRedirectUrl(url.searchParams.get('returnUrl'), '/protected');
  
  // Get email from URL if present (as a fallback)
  const email = url.searchParams.get('email');
  
  console.log('Confirm page loading with returnUrl:', returnUrl);
  
  // For better UX, pre-check if email is stored
  let hasStoredEmail = false;
  
  if (browser) {
    try {
      // Check if email exists in any storage location
      hasStoredEmail = !!(
        localStorage.getItem('emailForSignIn') ||
        sessionStorage.getItem('emailForSignIn')
      );
      
      // If we have email in URL params but not in storage, store it now
      if (email && !hasStoredEmail && email.includes('@')) {
        try {
          localStorage.setItem('emailForSignIn', email);
          console.log('Stored email from URL params');
          hasStoredEmail = true;
        } catch (e) {
          console.error('Failed to store email from URL params:', e);
        }
      }
    } catch (e) {
      console.error('Error checking stored email:', e);
    }
  }
  
  return {
    returnUrl,
    email, // Pass email from URL as a fallback
    hasStoredEmail
  };
};