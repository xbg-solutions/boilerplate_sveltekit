# Security Setup for Your Project

**This is a boilerplate template** - This guide helps you configure security for YOUR project using this boilerplate.

---

## 🚀 Quick Start (For New Projects Using This Boilerplate)

When you clone/fork this boilerplate for a new project:

### 1. Initial Setup

```bash
# Clone or fork this boilerplate
git clone <your-boilerplate-repo>
cd your-new-project

# Install dependencies
npm install

# Run the setup wizard (recommended)
npm run setup
```

The setup wizard will guide you through:
- Project name and configuration
- Firebase project connection
- Environment variables
- Role-based access control setup

### 2. Configure Firebase (Your Own Project)

1. **Create a Firebase Project**:
   - Go to https://console.firebase.google.com
   - Click "Add project"
   - Follow the setup wizard

2. **Get Your Firebase Config**:
   - Go to Project Settings > General
   - Scroll to "Your apps"
   - Click "Web app" (</> icon)
   - Copy the configuration values

3. **Update Your `.env` File**:
   ```bash
   # The setup wizard does this for you, or manually:
   cp .env.example .env

   # Edit .env with your Firebase config:
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_API_KEY="your-api-key"
   # ... etc
   ```

### 3. Deploy Security Rules (To Your Firebase Project)

The boilerplate includes security rules templates. Deploy them to YOUR Firebase project:

```bash
# Make sure you're logged into Firebase CLI
firebase login

# Initialize Firebase in your project (first time only)
firebase init

# Select:
# - Hosting
# - Storage
# - Firestore (if using)

# Deploy the security rules
firebase deploy --only storage,firestore:rules
```

**Important**: Review and customize the rules in:
- `storage.rules` - File access rules
- `firestore.rules` - Database access rules

These templates use generic patterns. Customize them for your app's specific needs.

### 4. Configure App Check (Optional but Recommended)

1. **Enable App Check in Firebase Console**:
   - Go to Firebase Console > App Check
   - Click "Get Started"
   - Register your web app

2. **Get reCAPTCHA Site Key**:
   - Go to https://console.cloud.google.com/security/recaptcha
   - Create a new reCAPTCHA v3 key
   - Add your domain(s)

3. **Update Your `.env`**:
   ```bash
   VITE_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
   VITE_APP_CHECK_ENABLED="true"  # Enable for production
   ```

4. **Configure Enforcement**:
   - In Firebase Console > App Check
   - Enable enforcement for:
     - Cloud Storage
     - Cloud Firestore
     - Cloud Functions (when you add them)

---

## 📋 What's Already Configured (Out of the Box)

This boilerplate comes with security hardening already implemented:

### ✅ Security Headers
- **Location**: `firebase.json`, `src/hooks.server.ts`
- **What**: CSP, HSTS, X-Frame-Options, etc.
- **Action Needed**: None - already configured
- **Customization**: Edit `src/lib/config/security.ts` to add your domains to CSP

### ✅ Firebase Security Rules Templates
- **Location**: `storage.rules`, `firestore.rules`
- **What**: User segregation, file validation, RBAC
- **Action Needed**: Review and customize for your app
- **Deploy**: `firebase deploy --only storage,firestore:rules`

### ✅ App Check Integration
- **Location**: `src/lib/utils/app-check.ts`
- **What**: Bot protection for Firebase services
- **Action Needed**: Configure in Firebase Console, add keys to `.env`
- **Auto-Enabled**: In production when `VITE_APP_CHECK_ENABLED=true`

### ✅ CSRF Protection
- **Location**: `src/lib/constants/csrf.constants.ts`, request handlers
- **What**: Automatic CSRF token generation and validation
- **Action Needed**: None - works automatically
- **Note**: Tokens use enhanced cryptographic entropy

### ✅ Input Sanitization
- **Location**: `src/lib/utils/sanitizer.ts`
- **What**: XSS prevention, HTML sanitization
- **Action Needed**: None - use sanitizer functions in your code
- **Usage**: `import { sanitize } from '$lib/utils/sanitizer'`

### ✅ Rate Limiting (Client-Side)
- **Location**: `src/lib/utils/rate-limiter.ts`
- **What**: UX improvements, prevent accidental spam
- **Action Needed**: Add server-side rate limiting in your API
- **Note**: Client-side only - not a security control

### ✅ Secure Error Handling
- **Location**: `src/lib/utils/error-handler.ts`
- **What**: Sanitizes errors in production, prevents info leakage
- **Action Needed**: None - works automatically
- **Customization**: Add custom error types if needed

---

## 🔧 Customization Guide

### Adding Your Domain to CSP

Edit `src/lib/config/security.ts`:

```typescript
export const productionSecurityConfig: SecurityConfig = {
  csp: {
    connectSrc: [
      "'self'",
      "https://*.googleapis.com",
      "https://your-api-domain.com",  // Add your API domain
      // ... rest
    ],
    // ... rest
  }
}
```

### Customizing Security Rules

**Storage Rules** (`storage.rules`):

The template assumes this structure:
```
uploads/{resourceType}/{resourceId}/{fileName}
```

If your app uses different paths, update the rules:

```javascript
// Example: Simple user-only uploads
match /uploads/{userId}/{fileName} {
  allow read, write: if request.auth.uid == userId;
}
```

**Firestore Rules** (`firestore.rules`):

Customize for your data model:

```javascript
// Example: Public blog posts
match /posts/{postId} {
  allow read: if true;  // Anyone can read
  allow write: if request.auth.uid == resource.data.authorId;  // Only author can edit
}
```

### Customizing RBAC (Roles)

The boilerplate supports role-based access. Configure roles in `src/lib/config/app.config.ts`:

```typescript
export const APP_CONFIG = {
  auth: {
    roles: ['user', 'admin', 'moderator'],  // Your roles
    roleHierarchy: {
      admin: ['moderator', 'user'],
      moderator: ['user']
    },
    // ... permissions
  }
}
```

Then update Firestore rules to use your roles:

```javascript
function hasRole(role) {
  return request.auth.token.role == role;
}
```

---

## 🧪 Testing Your Security Setup

### 1. Test Locally with Emulators

```bash
# Start Firebase emulators
firebase emulators:start

# Your app will connect to local emulators
# Test without affecting production data
```

### 2. Test Security Rules

```bash
# Create test cases in __tests__/firebase-rules/
# Example: storage.test.ts

import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

test('users can only read their own files', async () => {
  const alice = testEnv.authenticatedContext('alice');
  const bob = testEnv.authenticatedContext('bob');

  // Alice can read her file
  await assertSucceeds(alice.storage().ref('uploads/users/alice/file.pdf').getDownloadURL());

  // Alice cannot read Bob's file
  await assertFails(alice.storage().ref('uploads/users/bob/file.pdf').getDownloadURL());
});
```

### 3. Test Security Headers (After Deployment)

```bash
# Test your deployed app
curl -I https://your-domain.com

# Should see:
# x-frame-options: DENY
# content-security-policy: ...
# strict-transport-security: ...
```

### 4. Test App Check

1. Deploy your app
2. Check Firebase Console > App Check > Metrics
3. Should see successful verifications
4. Try accessing Storage without App Check (should fail if enforcement enabled)

---

## 🚨 Important Security Considerations

### 1. Server-Side Rate Limiting Required

The boilerplate includes **client-side** rate limiting only. This is NOT a security control.

**You MUST implement server-side rate limiting** in your Cloud Functions:

```javascript
// Example: In your Cloud Functions
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});

exports.api = functions.https.onRequest((req, res) => {
  const app = express();
  app.use(limiter);
  // ... your API routes
});
```

### 2. API Key Restrictions

In Google Cloud Console, restrict your Firebase API key:

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your API key
3. Set restrictions:
   - **HTTP referrers**: Add your domain(s)
   - **API restrictions**: Only enable APIs you use
   - **Usage quotas**: Set appropriate limits

### 3. Environment Variables

**NEVER commit** these files to git:
- `.env`
- `.env.local`
- `.env.production`
- `.env.development`

They're already in `.gitignore` but double-check!

For CI/CD, use environment secrets (GitHub Secrets, etc.)

### 4. Custom Claims Setup

If using RBAC, you need to set custom claims via Cloud Functions:

```javascript
// Example: Set user role on account creation
exports.setUserRole = functions.auth.user().onCreate(async (user) => {
  await admin.auth().setCustomUserClaims(user.uid, {
    role: 'user'  // Default role
  });
});
```

---

## 📚 Documentation Structure

This boilerplate includes several security documents:

```
📁 Your Project
├── SECURITY_SETUP.md              ← YOU ARE HERE (Setup for new projects)
├── SECURITY_HARDENING.md          ← What security features are implemented
├── SECURITY_DEPLOYMENT_CHECKLIST.md  ← Pre-deployment verification
├── storage.rules                  ← Firebase Storage security rules template
├── firestore.rules                ← Firestore security rules template
└── src/
    ├── hooks.server.ts            ← SvelteKit security middleware
    └── lib/
        ├── config/security.ts     ← Security configuration
        └── utils/
            ├── app-check.ts       ← Firebase App Check integration
            ├── rate-limiter.ts    ← Rate limiting utilities
            ├── sanitizer.ts       ← Input sanitization
            └── error-handler.ts   ← Secure error handling
```

**When to read what**:
- **SECURITY_SETUP.md** (this file): When setting up a new project from this boilerplate
- **SECURITY_HARDENING.md**: To understand what security features are included
- **SECURITY_DEPLOYMENT_CHECKLIST.md**: Before deploying to production

---

## 🎯 Next Steps for Your Project

1. **Complete Setup**:
   ```bash
   npm run setup  # Run the interactive wizard
   ```

2. **Review Security Rules**:
   - Read `storage.rules` and `firestore.rules`
   - Customize for your data model
   - Test with Firebase emulators

3. **Configure Firebase Console**:
   - Enable App Check
   - Set API key restrictions
   - Configure authentication methods

4. **Test Locally**:
   ```bash
   npm run dev  # Start dev server
   firebase emulators:start  # In another terminal
   ```

5. **Customize for Your App**:
   - Update CSP with your domains
   - Configure RBAC roles
   - Add custom security rules

6. **Before Production**:
   - Review `SECURITY_DEPLOYMENT_CHECKLIST.md`
   - Run full test suite
   - Deploy security rules first
   - Monitor for 24 hours after launch

---

## 🆘 Troubleshooting

### "Firebase not configured"
- Make sure you've run `npm run setup`
- Check `.env` file exists and has correct values
- Verify Firebase project ID matches your console

### "App Check verification failed"
- Ensure reCAPTCHA site key is correct in `.env`
- Check App Check is enabled in Firebase Console
- Use debug token for local development

### "Permission denied" in Storage/Firestore
- Deploy security rules: `firebase deploy --only storage,firestore:rules`
- Check user is authenticated
- Verify user has required custom claims (if using RBAC)

### CSP blocking resources
- Check browser console for violation messages
- Add allowed domains to `src/lib/config/security.ts`
- Update CSP in both `security.ts` and `firebase.json`

---

## ✅ Checklist for New Projects

When starting a new project with this boilerplate:

- [ ] Run `npm install`
- [ ] Run `npm run setup` (interactive wizard)
- [ ] Create Firebase project in console
- [ ] Update `.env` with your Firebase config
- [ ] Review and customize `storage.rules` and `firestore.rules`
- [ ] Deploy security rules to your Firebase project
- [ ] Configure App Check in Firebase Console
- [ ] Restrict API keys in Google Cloud Console
- [ ] Test locally with `npm run dev` and Firebase emulators
- [ ] Customize CSP for your domains
- [ ] Configure RBAC roles (if needed)
- [ ] Add server-side rate limiting to Cloud Functions
- [ ] Review `SECURITY_DEPLOYMENT_CHECKLIST.md` before production

---

**Questions?**
- Check `SECURITY_HARDENING.md` for implementation details
- Read Firebase documentation for platform-specific questions
- Review code comments in security utility files

**This boilerplate is production-ready** - just configure it for your specific project!
