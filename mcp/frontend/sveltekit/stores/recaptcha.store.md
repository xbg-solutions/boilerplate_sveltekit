# reCAPTCHA Store

## Overview
Manages Google reCAPTCHA state, tracking whether reCAPTCHA is loaded and storing the current token. Used for bot protection in forms and authentication flows.

## Store Location
`src/lib/stores/recaptcha.ts`

## State Structure

```typescript
interface RecaptchaState {
  loaded: boolean;              // Whether reCAPTCHA script is loaded
  token: string | null;         // Current reCAPTCHA token
}
```

## Usage Examples

### Subscribe to reCAPTCHA State
```typescript
import { recaptchaStore } from '$lib/stores/recaptcha';

recaptchaStore.subscribe($recaptcha => {
  console.log('reCAPTCHA loaded:', $recaptcha.loaded);
  console.log('Current token:', $recaptcha.token);
});
```

### Mark as Loaded
```typescript
import { recaptchaStore } from '$lib/stores/recaptcha';

recaptchaStore.update(state => ({
  ...state,
  loaded: true
}));
```

### Set Token
```typescript
import { recaptchaStore } from '$lib/stores/recaptcha';

recaptchaStore.update(state => ({
  ...state,
  token: 'recaptcha-token-here'
}));
```

### Clear Token
```typescript
import { recaptchaStore } from '$lib/stores/recaptcha';

recaptchaStore.update(state => ({
  ...state,
  token: null
}));
```

### Reset State
```typescript
import { recaptchaStore } from '$lib/stores/recaptcha';

recaptchaStore.set({
  loaded: false,
  token: null
});
```

### Wait for reCAPTCHA to Load
```typescript
import { recaptchaStore } from '$lib/stores/recaptcha';
import { get } from 'svelte/store';

async function waitForRecaptcha(timeout = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeout);

    const unsubscribe = recaptchaStore.subscribe($recaptcha => {
      if ($recaptcha.loaded) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(true);
      }
    });
  });
}
```

### Execute reCAPTCHA
```typescript
import { recaptchaStore } from '$lib/stores/recaptcha';
import { get } from 'svelte/store';

async function executeRecaptcha(action: string): Promise<string | null> {
  const $recaptcha = get(recaptchaStore);

  if (!$recaptcha.loaded) {
    console.error('reCAPTCHA not loaded');
    return null;
  }

  try {
    const token = await grecaptcha.execute('YOUR_SITE_KEY', { action });

    recaptchaStore.update(state => ({
      ...state,
      token
    }));

    return token;
  } catch (error) {
    console.error('reCAPTCHA execution failed:', error);
    return null;
  }
}
```

### Form Submission with reCAPTCHA
```typescript
import { recaptchaStore } from '$lib/stores/recaptcha';
import { get } from 'svelte/store';

async function submitForm(formData: FormData) {
  // Execute reCAPTCHA
  const token = await executeRecaptcha('submit');

  if (!token) {
    throw new Error('reCAPTCHA verification failed');
  }

  // Include token in form submission
  formData.append('recaptcha_token', token);

  const response = await fetch('/api/submit', {
    method: 'POST',
    body: formData
  });

  // Clear token after use
  recaptchaStore.update(state => ({
    ...state,
    token: null
  }));

  return response;
}
```

### Load reCAPTCHA Script
```typescript
import { recaptchaStore } from '$lib/stores/recaptcha';

function loadRecaptcha(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (get(recaptchaStore).loaded) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      recaptchaStore.update(state => ({
        ...state,
        loaded: true
      }));
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA'));
    };

    document.head.appendChild(script);
  });
}
```

## Integration Points

- **Form Components** - Include reCAPTCHA tokens in submissions
- **Auth Service** - Protect authentication endpoints
- **API Service** - Attach tokens to sensitive requests
- **Loading Store** - Track reCAPTCHA loading state
- **Error Handler** - Handle reCAPTCHA failures

## Common Use Cases

### Login Form
```typescript
async function login(email: string, password: string) {
  const token = await executeRecaptcha('login');

  return fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, recaptcha_token: token })
  });
}
```

### Registration
```typescript
async function register(userData: UserData) {
  const token = await executeRecaptcha('register');

  return fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...userData, recaptcha_token: token })
  });
}
```

### Contact Form
```typescript
async function submitContactForm(formData: ContactFormData) {
  const token = await executeRecaptcha('contact');

  return fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...formData, recaptcha_token: token })
  });
}
```

## Component Usage

```svelte
<script>
  import { recaptchaStore } from '$lib/stores/recaptcha';
  import { onMount } from 'svelte';

  onMount(async () => {
    if (!$recaptchaStore.loaded) {
      await loadRecaptcha('YOUR_SITE_KEY');
    }
  });

  async function handleSubmit() {
    const token = await executeRecaptcha('submit');

    if (!token) {
      alert('reCAPTCHA verification failed');
      return;
    }

    // Submit form with token
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <!-- Form fields -->
  <button type="submit" disabled={!$recaptchaStore.loaded}>
    Submit
  </button>
</form>
```

## Best Practices

1. Load reCAPTCHA script early (in layout or +page.svelte)
2. Wait for `loaded` to be true before executing reCAPTCHA
3. Clear token after successful use
4. Use action-specific tokens for better analytics
5. Handle reCAPTCHA loading errors gracefully
6. Don't store tokens for extended periods
7. Verify tokens on the server side (never trust client)
8. Show loading state while reCAPTCHA executes
9. Provide fallback if reCAPTCHA fails to load
10. Use invisible reCAPTCHA for better UX

## Token Lifecycle

1. **Load**: reCAPTCHA script loads, `loaded` = true
2. **Execute**: User action triggers reCAPTCHA execution
3. **Store**: Token stored in `token` field
4. **Submit**: Token sent to server for verification
5. **Clear**: Token cleared after use
6. **Repeat**: New token generated for next action

## Security Notes

- Always verify tokens on the server side
- Tokens are single-use and expire quickly
- Don't expose site key in public repositories
- Use different actions for different operations
- Monitor reCAPTCHA dashboard for suspicious activity
