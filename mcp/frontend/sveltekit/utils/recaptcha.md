# reCAPTCHA Utility

## Overview

Firebase reCAPTCHA integration for phone authentication with support for invisible and visible reCAPTCHA widgets.

**Location:** `src/lib/utils/recaptcha.ts`

## Key Functions

### createRecaptchaVerifier
Creates a Firebase reCAPTCHA verifier.

```typescript
const verifier = await createRecaptchaVerifier({
  containerId: 'recaptcha-container',
  size: 'normal',
  theme: 'light',
  callback: () => console.log('Verified'),
  expiredCallback: () => console.log('Expired'),
  errorCallback: (error) => console.error('Error:', error)
});
```

### createInvisibleRecaptcha
Creates an invisible reCAPTCHA verifier.

```typescript
const verifier = await createInvisibleRecaptcha(
  () => console.log('Verified'),
  'en' // language code
);
```

### createVisibleRecaptcha
Creates a visible reCAPTCHA widget.

```typescript
const verifier = await createVisibleRecaptcha('recaptcha-container', {
  size: 'compact',
  theme: 'dark',
  callback: onVerified
});
```

### clearRecaptchaVerifier
Clears a reCAPTCHA verifier.

```typescript
await clearRecaptchaVerifier(verifier);
```

### Safe Wrappers
```typescript
const { success, data } = await safeCreateRecaptchaVerifier(options);
const { success, data } = await safeCreateInvisibleRecaptcha();
const { success, data } = await safeCreateVisibleRecaptcha(id);
const { success } = await safeClearRecaptchaVerifier(verifier);
```

## Options

```typescript
interface RecaptchaOptions {
  containerId?: string;
  callback?: () => void;
  expiredCallback?: () => void;
  errorCallback?: (error: Error) => void;
  languageCode?: string;
  isInvisible?: boolean;
  size?: 'normal' | 'compact';
  theme?: 'light' | 'dark';
  auth?: Auth;
}
```

## Common Patterns

### Phone Authentication
```svelte
<script>
  import { createRecaptchaVerifier, clearRecaptchaVerifier } from '$lib/utils/recaptcha';
  import { signInWithPhoneNumber } from 'firebase/auth';
  
  let verifier;
  
  async function sendCode(phoneNumber) {
    // Create verifier
    verifier = await createRecaptchaVerifier({
      containerId: 'recaptcha',
      size: 'normal'
    });
    
    // Send code
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      verifier
    );
    
    // Store for verification
    return confirmationResult;
  }
  
  onDestroy(() => {
    if (verifier) {
      clearRecaptchaVerifier(verifier);
    }
  });
</script>

<div id="recaptcha"></div>
<button on:click={() => sendCode(phone)}>Send Code</button>
```

### Invisible reCAPTCHA
```typescript
import { createInvisibleRecaptcha } from '$lib/utils/recaptcha';

async function verifyUser() {
  const verifier = await createInvisibleRecaptcha(
    () => {
      console.log('reCAPTCHA verified');
    }
  );
  
  // Use verifier for phone auth
  const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  
  return result;
}
```

### With Error Handling
```typescript
const { success, data: verifier, error } = await safeCreateRecaptchaVerifier({
  containerId: 'recaptcha-container',
  errorCallback: (error) => {
    showToast('reCAPTCHA error: ' + error.message);
  }
});

if (!success) {
  console.error('Failed to create verifier:', error);
  return;
}

// Use verifier...
```

## Integration Points

- **Firebase Utility**: Uses Firebase Auth
- **Auth Service**: For phone authentication
- **Event System**: Publishes reCAPTCHA events
- **Logger Service**: Logs all operations

## Events

The utility publishes these events:
- `auth:recaptcha-rendered` - When reCAPTCHA is created
- `auth:recaptcha-error` - When reCAPTCHA fails

## Best Practices

1. Clean up verifiers with `clearRecaptchaVerifier`
2. Use invisible reCAPTCHA for better UX
3. Handle expired callbacks
4. Provide error feedback
5. Set appropriate language
6. Test in different browsers
7. Handle container visibility

## Troubleshooting

- Container must be visible (not `display: none`)
- Only one verifier per container
- Clean up before creating new verifier
- Check Firebase project configuration
- Verify reCAPTCHA keys in console
