# Authentication Components

Components for user authentication flows including passwordless email links and phone authentication.

## Components

### EmailLinkAuth

Passwordless authentication via email magic links using Firebase Auth.

**Location**: `$lib/components/auth/EmailLinkAuth.svelte`

**Props:**
- `redirectUrl`: string - URL to redirect after successful authentication (default: '/')
- `infoText`: string - Information message displayed to users

**Events:**
- `on:success` - Dispatched when email link is successfully sent
  - `detail: { email: string }`
- `on:sent` - Dispatched after email is sent
  - `detail: { email: string }`
- `on:error` - Dispatched on authentication error
  - `detail: { error: string }`

**Usage:**
```svelte
<script>
  import { EmailLinkAuth } from '$lib/components/auth';

  function handleSuccess(event) {
    console.log('Link sent to:', event.detail.email);
  }
</script>

<EmailLinkAuth
  redirectUrl="/dashboard"
  on:success={handleSuccess}
/>
```

**Features:**
- Email validation
- Loading states with spinner
- Error handling with user-friendly messages
- Success feedback
- Email persistence in localStorage
- Integrates with `safeSendEmailLink` service

**State Management:**
- Validates email format
- Displays inline error messages
- Shows success confirmation
- Stores email for link confirmation flow

### PhoneAuth

Phone number authentication with SMS verification.

**Location**: `$lib/components/auth/PhoneAuth.svelte`

**Props:**
- Similar pattern to EmailLinkAuth
- Phone number formatting and validation
- SMS code verification

**Events:**
- `on:codeSent` - SMS verification code sent
- `on:verified` - Phone number verified
- `on:error` - Authentication error

**Usage:**
```svelte
<script>
  import { PhoneAuth } from '$lib/components/auth';
</script>

<PhoneAuth
  redirectUrl="/dashboard"
  on:verified={handleVerification}
/>
```

## Integration Patterns

### With Layout Components

```svelte
<script>
  import { EmailLinkAuth } from '$lib/components/auth';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
</script>

<Card class="max-w-md mx-auto">
  <CardHeader>
    <CardTitle>Sign In</CardTitle>
  </CardHeader>
  <CardContent>
    <EmailLinkAuth redirectUrl="/protected" />
  </CardContent>
</Card>
```

### With Auth Store

Auth components automatically integrate with the global auth store:

```typescript
import { authStore } from '$lib/stores/auth.store';

// Auth state is updated automatically after successful authentication
$: isAuthenticated = $authStore.isAuthenticated;
```

### Error Handling

Components provide comprehensive error handling:

```svelte
<EmailLinkAuth
  on:error={(e) => {
    // Handle specific error types
    const { error } = e.detail;
    if (error.includes('invalid-email')) {
      // Show custom error UI
    }
  }}
/>
```

## Authentication Flow

1. **Email Link Flow**:
   - User enters email
   - Component validates and sends magic link
   - Email is stored in localStorage
   - User clicks link in email
   - App confirms authentication at `/confirm` route
   - User is redirected to `redirectUrl`

2. **Phone Flow**:
   - User enters phone number
   - SMS code is sent
   - User enters verification code
   - Authentication is confirmed
   - User is redirected

## Service Integration

Auth components use the auth service layer:

```typescript
import { safeSendEmailLink, storeEmail } from '$lib/services/auth';

// Components call these safe, error-wrapped methods
const result = await safeSendEmailLink(email, options);
if (result.success) {
  storeEmail(email);
}
```

## Styling

Components use a mix of:
- Tailwind utility classes
- Design system colors (`bg-accent`, `text-primary-dark`)
- Custom CSS variables
- Responsive design

Customize by:
- Overriding CSS classes
- Modifying `infoText` prop
- Wrapping in layout components

## Accessibility

- Proper form labels with `for` attributes
- ARIA states for loading/disabled
- Keyboard navigation support
- Screen reader friendly error messages

## Best Practices

1. **Always provide redirectUrl** for proper navigation after auth
2. **Handle all event types** for complete UX
3. **Show loading states** to prevent duplicate submissions
4. **Display clear error messages** for user guidance
5. **Test email/phone format validation** across locales

## Component Count: 2

- EmailLinkAuth
- PhoneAuth
