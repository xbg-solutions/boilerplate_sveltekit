# Security Hardening Summary

**Date**: 2026-03-14 (initial pass) · **Last Updated**: 2026-07-02 (second pass)
**Status**: ✅ Hardening Complete

This document summarizes the security hardening improvements made to the boilerplate frontend project, across two passes:

1. **2026-03 pass**: headers, hooks, rules templates, App Check, CSRF, rate limiting (sections 1–8)
2. **2026-07 pass**: CSP consolidation, open-redirect protection, XSS sink review, rules deployment wiring + claim-scheme alignment, dependency fixes (section 9)

---

## 🎯 Overview

The project has been hardened against common web security threats while maintaining its configurability patterns. All critical and important security issues from the audits have been addressed.

---

## ✅ Security Improvements Implemented

### 1. Production Security Headers (firebase.json)

**What Changed**: Added comprehensive security headers to Firebase Hosting configuration

**Files Modified**:
- `firebase.json`

**Headers Added**:
- `X-Frame-Options: DENY` - Prevents clickjacking attacks
- `X-Content-Type-Options: nosniff` - Prevents MIME-type sniffing
- `X-XSS-Protection: 0` - Legacy XSS auditor explicitly disabled (the auditor itself is exploitable; modern guidance is `0`)
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Disables unnecessary browser features
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` - Enforces HTTPS
- `Content-Security-Policy: frame-ancestors 'none'` - Anti-framing only; the FULL CSP is NOT in `firebase.json` (see section 9 — it is generated hash-mode by SvelteKit from `kit.csp` in `svelte.config.js` and delivered as a `<meta>` tag)

**Impact**: Protects against XSS, clickjacking, and other injection attacks

---

### 2. SvelteKit Server Hooks (NEW)

**What Changed**: Created server-side middleware for defense-in-depth

**Files Created**:
- `src/hooks.server.ts` (NEW)

**Features**:
- **Security Headers**: Applies security headers in the dev/preview server
- **Request Validation**: Validates Content-Type, URL patterns
- **CORS Handling**: Configurable CORS with a strict origin allowlist (never reflects Origin, adds `Vary: Origin`)
- **Rate Limit Headers**: Adds informational rate limit headers to responses
- **Environment Awareness**: Different CSP rules for development vs production

**Important (adapter-static)**: these hooks run only in the dev server and at prerender time — they are NOT active on the deployed static site. Production headers come from `firebase.json`; the production CSP comes from `kit.csp` in `svelte.config.js`.

**Impact**: Parity between dev and production security posture; better development experience

---

### 3. Source Maps Protection

**What Changed**: Disabled source maps in production builds

**Files Modified**:
- `vite.config.ts` - Changed `sourcemap: true` to `sourcemap: process.env.NODE_ENV === 'development'`

**Impact**: Prevents attackers from reverse-engineering your application code

---

### 4. Firebase Security Rules (NEW)

**What Changed**: Created comprehensive security rules for Storage and Firestore

**Files Created**:
- `storage.rules` (NEW) - Firebase Storage security rules
- `firestore.rules` (NEW) - Cloud Firestore security rules

**Storage Rules Features**:
- User-based file segregation (users can only access their own files)
- File size enforcement (50MB limit)
- File type validation (images, PDFs, Office documents only)
- Metadata validation (ensures proper metadata is set)
- Admin override capabilities
- Multi-tenant support (accounts, projects)

**Firestore Rules Features**:
- Default deny all (explicit allow required)
- Role-based access control (RBAC)
- User data isolation
- Timestamp validation (prevents backdating)
- Immutable audit logs
- Protected system collections

**Claim scheme (2026-07)**: the rules read the same custom-claim scheme the app and CLI use — a `roles` array of role names (`['client', 'admin']`) plus boolean flags (`isAdmin`, `isSysAdmin`, …) per `app.config.ts` `claimMap`; either form grants the role, and `sysadmin` inherits `admin`. Keep `firestore.rules`, `storage.rules`, `app.config.ts`, `src/lib/utils/rbac.ts`, and the bpsk `manage-auth-users` CLI in lockstep.

**Deployment wiring (2026-07)**: `firebase.json` now contains `"firestore"` and `"storage"` blocks pointing at the rule files, so `firebase deploy` (or `--only firestore:rules,storage`) actually ships them. Before this, the rules were never deployed and projects ran on whatever rules existed in the console.

**Impact**: Prevents unauthorized access to files and data at the database level

---

### 5. Enhanced CSRF Token Generation

**What Changed**: Improved token entropy using base64url encoding

**Files Modified**:
- `src/lib/config/security.ts` - Updated `generateSecureToken()` function

**Before**:
```typescript
// 62 possible characters, modulo bias
chars[byte % chars.length]
```

**After**:
```typescript
// Full entropy base64url encoding
btoa(String.fromCharCode(...array))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');
```

**Impact**: CSRF tokens now have maximum cryptographic strength

---

### 6. Firebase App Check Integration (NEW)

**What Changed**: Added bot protection for Firebase services

**Files Created**:
- `src/lib/utils/app-check.ts` (NEW)

**Files Modified**:
- `src/lib/utils/firebase.ts` - Integrated App Check initialization
- `.env.example` - Added App Check configuration variables

**Features**:
- reCAPTCHA v3 integration
- reCAPTCHA Enterprise support
- Debug token support for local development
- Automatic enablement in production
- Graceful degradation if App Check fails

**Environment Variables**:
- `VITE_APP_CHECK_ENABLED` - Enable/disable App Check
- `VITE_APP_CHECK_PROVIDER` - recaptcha-v3 or recaptcha-enterprise
- `VITE_APP_CHECK_DEBUG_TOKEN` - Debug token for local testing

**Impact**: Protects Cloud Functions, Storage, and Firestore from bot abuse

---

### 7. Rate Limiting Utilities (NEW)

**What Changed**: Added client-side rate limiting framework

**Files Created**:
- `src/lib/utils/rate-limiter.ts` (NEW)

**Features**:
- Generic rate limit checker
- Specialized limiters for:
  - Form submissions (5/minute)
  - API requests (100/15min)
  - Authentication attempts (3/5min)
  - File uploads (10/hour)
- Throttle and debounce utilities
- In-memory rate limit storage
- Configurable callbacks for limit exceeded events

**Important Note**: This is CLIENT-SIDE only. Server-side rate limiting must be implemented in your API backend (Cloud Functions).

**Impact**: Improves UX by preventing accidental spam; not a security control

---

### 8. Deployment Security Checklist (NEW)

**What Changed**: Created comprehensive pre-deployment checklist

**Files Created**:
- `SECURITY_DEPLOYMENT_CHECKLIST.md` (NEW)

**Sections**:
- ✅ Critical items (must complete before launch)
- ⚠️ Important items (should complete before launch)
- 💡 Recommended items (best practices)
- 🧪 Testing checklist
- 📋 Pre-deployment commands
- 🔍 Post-deployment verification
- 🚨 Emergency rollback procedure

**Impact**: Ensures consistent, secure deployments every time

---

### 9. 2026-07 Hardening Pass (Second Audit)

**What Changed**: A full-app security sweep (commit `4726d9f` and follow-ups) verified the client, server, Firebase, and secrets surfaces and fixed everything critical/high.

**CSP Consolidation**:
- The production CSP moved to `kit.csp` in `svelte.config.js` (hash mode — no `unsafe-inline`/`unsafe-eval` for scripts; SvelteKit's inline hydration script is hash-allowlisted)
- `firebase.json` now carries ONLY `frame-ancestors 'none'` as its CSP (a directive that must be an HTTP header) plus the non-CSP headers — do not re-add a full CSP there; it would intersect with the meta CSP and block hydration
- `X-XSS-Protection` set to `0` per modern guidance

**Open-Redirect Protection**:
- `src/lib/utils/redirect.ts` `safeRedirectUrl()` validates every user-influenced redirect target (rejects absolute URLs, protocol-relative `//`, scheme injection, backslash tricks)
- The email-link confirm flow (`src/routes/confirm/+page.ts`) runs `returnUrl` through it before any navigation

**XSS Sink Review**:
- All `{@html}` uses traced — every one renders hardcoded, developer-authored content (icon/SVG constants); no user- or remote-controlled data reaches an HTML sink
- `window.open` targets are protocol-checked (`https:`/`http:`/`blob:` only)
- All `target="_blank"` links carry `rel="noopener noreferrer"`
- Caution: `src/lib/utils/sanitizer.ts` is a hand-rolled sanitizer, NOT DOMPurify-grade — do not pipe its output into `{@html}` for untrusted HTML

**Firebase Rules — Deployment Wiring & Claim Alignment**:
- `firebase.json` gained `"firestore"`/`"storage"` blocks (rules now actually deploy) plus Firestore (8080) and Storage (9199) emulator entries
- Rules rewritten to the app's real claim scheme: `roles` array + boolean flags, `sysadmin` inherits `admin`; guarded `token.get(...)` access so claimless tokens deny cleanly instead of erroring
- Fixed a compile-blocking bug: `timestamp` is a reserved package name in the rules language and was used as a function parameter — the rules never compiled before this fix
- The bpsk `manage-auth-users` CLI now writes role NAMES (`'admin'`) into the `roles` claim, not flag names (`'isAdmin'`)
- Both rule files verified end-to-end against the emulators with `@firebase/rules-unit-testing` (21 grant/deny assertions)

**Impact**: The rules — which carry 100% of the authorization burden in this static-SPA architecture — now deploy, compile, and match the tokens the app actually issues.

---

## 📁 File Structure Changes

### New Files Created
```
/
├── src/
│   ├── hooks.server.ts                    # NEW - SvelteKit security hooks
│   └── lib/
│       └── utils/
│           ├── app-check.ts               # NEW - Firebase App Check
│           └── rate-limiter.ts            # NEW - Rate limiting utilities
├── storage.rules                          # NEW - Firebase Storage rules
├── firestore.rules                        # NEW - Firestore security rules
├── SECURITY_DEPLOYMENT_CHECKLIST.md       # NEW - Deployment checklist
└── SECURITY_HARDENING.md                  # NEW - This document
```

### Modified Files
```
/
├── firebase.json                          # Added security headers
├── vite.config.ts                         # Disabled prod source maps
├── .env.example                           # Added App Check variables
└── src/
    └── lib/
        ├── config/
        │   └── security.ts                # Enhanced token generation
        └── utils/
            └── firebase.ts                # Integrated App Check
```

---

## 🔧 Configuration Requirements

### New Environment Variables

Add these to your `.env` file:

```bash
# Firebase App Check (Bot Protection)
VITE_APP_CHECK_ENABLED="true"              # Enable in production
VITE_APP_CHECK_PROVIDER="recaptcha-v3"     # or "recaptcha-enterprise"
VITE_APP_CHECK_DEBUG_TOKEN=""              # Optional: for local testing
```

### Firebase Console Setup

1. **Enable App Check**:
   - Go to Firebase Console > App Check
   - Register your app
   - Get your reCAPTCHA site key
   - Configure enforcement for Storage, Firestore, Cloud Functions

2. **Deploy Security Rules** (wired into `firebase.json`, so these work out of the box):
   ```bash
   # Deploy both rule sets
   firebase deploy --only firestore:rules,storage

   # Or deploy everything (hosting + rules)
   firebase deploy
   ```
   Note: `npm run deploy` runs `firebase deploy --only hosting` and does NOT deploy rules — deploy them explicitly when they change.

3. **Configure Hosting Headers**:
   - Headers are already in `firebase.json`
   - Deploy with: `firebase deploy --only hosting`

---

## 🎓 How to Use These Security Features

### Using App Check

App Check is automatically initialized when Firebase initializes. No code changes required.

**Testing locally**:
1. Get a debug token from Firebase Console > App Check > Debug Tokens
2. Add to `.env`: `VITE_APP_CHECK_DEBUG_TOKEN="your-token-here"`
3. App Check will use the debug token instead of real reCAPTCHA

### Using Rate Limiting

**Example: Limit form submissions**:
```typescript
import { createFormSubmitLimiter } from '$lib/utils/rate-limiter';

function handleSubmit() {
  const limiter = createFormSubmitLimiter('contact-form');
  const result = limiter.check();

  if (!result.allowed) {
    const retrySeconds = Math.ceil(result.retryAfter! / 1000);
    alert(`Too many submissions. Try again in ${retrySeconds} seconds.`);
    return;
  }

  // Process form submission
}
```

**Example: Throttle API requests**:
```typescript
import { throttle } from '$lib/utils/rate-limiter';

const throttledSearch = throttle(
  async (query: string) => {
    const results = await apiService.get(`/search?q=${query}`);
    return results;
  },
  1000 // Maximum once per second
);
```

### Customizing Security Headers

**To add custom CSP rules** — the production CSP lives in `svelte.config.js`, not `security.ts`:

```javascript
// svelte.config.js — this is what ships to production (hash-mode meta CSP)
kit: {
  csp: {
    mode: 'hash',
    directives: {
      'script-src': ['self', 'https://your-custom-cdn.com'],  // Add here
      // ... rest of config
    }
  }
}
```

Also mirror the change in `src/lib/config/security.ts` so the dev-server CSP (applied by `src/hooks.server.ts`) stays consistent with production.

---

## 🧪 Testing the Security Improvements

### 1. Test Security Headers

```bash
# After deploying
curl -I https://your-domain.com

# Should see:
# x-frame-options: DENY
# x-content-type-options: nosniff
# strict-transport-security: max-age=31536000; includeSubDomains
# content-security-policy: frame-ancestors 'none'
#
# The FULL CSP is a <meta http-equiv> tag in the served HTML, not a header:
curl -s https://your-domain.com | grep -o 'http-equiv="content-security-policy"[^>]*' | head -c 200
```

### 2. Test CSP

1. Open your app in Chrome
2. Open DevTools > Console
3. Look for CSP violation errors
4. If you see violations, adjust `kit.csp` in `svelte.config.js` (production) and `security.ts` (dev)

### 3. Test Firebase Security Rules

```bash
# Use Firebase emulator
firebase emulators:start

# Try to access another user's file (should fail)
# Try to upload invalid file type (should fail)
# Try to upload > 50MB file (should fail)
```

### 4. Test App Check

1. Deploy your app
2. Check Firebase Console > App Check > Metrics
3. Should see successful verifications
4. Try accessing Storage/Firestore without App Check token (should fail in production)

### 5. Test Rate Limiting

1. Try submitting a form 6 times rapidly
2. Should see rate limit message on 6th attempt
3. Wait 1 minute and try again (should work)

---

## 🚀 Deployment Instructions

Follow these steps to deploy securely:

```bash
# 1. Install dependencies
npm install

# 2. Run security audit
npm audit
npm audit fix  # If needed

# 3. Set environment variables
cp .env.example .env
# Edit .env with production values

# 4. Test build locally
NODE_ENV=production npm run build
npm run preview

# 5. Deploy Firebase security rules FIRST
firebase deploy --only storage,firestore:rules

# 6. Deploy hosting with security headers
firebase deploy --only hosting

# 7. Verify deployment
curl -I https://your-domain.com
# Check for security headers

# 8. Monitor for 24 hours
# Check Firebase Console for errors
# Monitor App Check metrics
```

**Full checklist**: See `SECURITY_DEPLOYMENT_CHECKLIST.md`

---

## ⚠️ Important Notes & Limitations

### Client-Side Rate Limiting

The rate limiting in `rate-limiter.ts` is **CLIENT-SIDE ONLY**:
- ✅ Good for: UX improvements, preventing accidental spam
- ❌ Bad for: Security (easily bypassed by attackers)
- 🔒 Solution: Implement server-side rate limiting in your Cloud Functions

**Example server-side rate limiting**:
```javascript
// In your Cloud Functions
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests'
});

app.use('/api/', limiter);
```

### App Check Enforcement

App Check only protects services where enforcement is enabled:
1. Go to Firebase Console > App Check
2. Enable enforcement for:
   - Cloud Storage
   - Cloud Firestore
   - Cloud Functions (individual functions)

### CSP Strictness

The production CSP (`kit.csp` in `svelte.config.js`, hash mode) has NO `unsafe-inline`/`unsafe-eval` for scripts — SvelteKit's inline hydration script is covered by a generated hash. `style-src` does include `'unsafe-inline'`:
- This is needed for component-scoped styles in Svelte + Tailwind
- It permits style injection, not script execution — the one accepted soft spot
- Monitor CSP violations in browser console
- Known residual risk: `script-src` allowlists `https://*.google.com` / `*.googleapis.com` / `*.gstatic.com` wildcards (Firebase/reCAPTCHA); these host JSONP endpoints that could serve as CSP-bypass gadgets if an HTML-injection foothold ever exists. Narrow to exact hosts if your app allows.

### Source Maps

Source maps are disabled in production but enabled in development:
- Development: Full debugging with source maps
- Production: No source maps (protects code)
- Staging: Consider enabling for debugging, disable before launch

---

## 🔄 Maintaining Security

### Regular Security Tasks

**Weekly**:
- [ ] Review Firebase Console for unusual activity
- [ ] Check App Check metrics for anomalies
- [ ] Monitor error logs for security-related errors

**Monthly**:
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review Firebase security rules for any needed updates
- [ ] Test security headers still present (use SecurityHeaders.com)
- [ ] Review rate limiting metrics

**Quarterly**:
- [ ] Full security audit (re-run original audit)
- [ ] Update dependencies (`npm update`)
- [ ] Review and update CSP if needed
- [ ] Penetration testing (if applicable)
- [ ] Review OWASP Top 10 for new threats

### Updating Security Rules

When you modify security rules:

```bash
# 1. Test locally
firebase emulators:start

# 2. Run your test suite
npm test

# 3. Deploy to staging first
firebase use staging
firebase deploy --only storage,firestore:rules

# 4. Test staging thoroughly

# 5. Deploy to production
firebase use production
firebase deploy --only storage,firestore:rules

# 6. Monitor for errors
# Check Firebase Console > Storage/Firestore for access errors
```

---

## 📚 Additional Resources

### Documentation
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [SvelteKit Hooks](https://kit.svelte.dev/docs/hooks)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Testing Tools
- [SecurityHeaders.com](https://securityheaders.com/) - Test HTTP headers
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Test SSL/TLS configuration
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Evaluate CSP
- [Mozilla Observatory](https://observatory.mozilla.org/) - Comprehensive scan

### Monitoring
- Firebase Console > App Check - View verification metrics
- Firebase Console > Storage/Firestore - View access logs
- Browser DevTools > Console - View CSP violations
- Firebase Performance Monitoring - Track performance impact

---

## 🆘 Troubleshooting

### "App Check verification failed"

**Cause**: App Check enforcement enabled but token not present

**Solution**:
1. Ensure `VITE_APP_CHECK_ENABLED=true` in production
2. Verify reCAPTCHA site key is correct
3. Check Firebase Console > App Check > Debug Tokens for local dev
4. Ensure App Check is initialized before making requests

### "Permission denied" in Storage/Firestore

**Cause**: Security rules blocking legitimate access

**Solution**:
1. Check Firebase Console > Storage/Firestore > Rules
2. Review rules in `storage.rules` or `firestore.rules`
3. Ensure user has required custom claims — the rules expect a `roles` array of role names and/or boolean flags (`isAdmin`, …); set them with `npx @xbg.solutions/bpsk` manage-auth-users
4. Test with Firebase emulator to debug (`firebase emulators:start` — Firestore/Storage emulators are configured in `firebase.json`)

### CSP Blocking Resources

**Cause**: CSP too strict, blocking needed resources

**Solution**:
1. Check browser console for CSP violation messages
2. Add allowed domains to `kit.csp` in `svelte.config.js` (this is the production CSP)
3. Mirror the change in `src/lib/config/security.ts` (dev-server CSP)
4. Redeploy: `firebase deploy --only hosting`
5. Do NOT add a full CSP to `firebase.json` — it would intersect with the meta CSP and block hydration

### Rate Limiting Not Working

**Cause**: Client-side rate limiting can be bypassed

**Solution**:
1. Remember: Client-side rate limiting is for UX only
2. Implement server-side rate limiting in Cloud Functions
3. Use Firebase App Check to prevent bot abuse
4. Monitor for abuse in Firebase Console

---

## ✅ Security Hardening Checklist

- [x] Security headers configured (firebase.json)
- [x] SvelteKit server hooks created
- [x] Source maps disabled in production
- [x] Firebase Storage security rules created
- [x] Firebase Firestore security rules created
- [x] CSRF token generation enhanced
- [x] Firebase App Check integrated
- [x] Rate limiting utilities created
- [x] Deployment checklist created
- [x] Documentation completed
- [x] CSP consolidated to hash-mode `kit.csp` (2026-07)
- [x] Open-redirect protection via `safeRedirectUrl()` (2026-07)
- [x] XSS sinks audited — no user-controlled `{@html}` (2026-07)
- [x] Rules wired into `firebase.json` and deployable (2026-07)
- [x] Rules claim scheme aligned with app/CLI, emulator-verified (2026-07)

## 📖 Using This Boilerplate

**This is a template project** - When using this boilerplate for a new project:

1. Read `SECURITY_SETUP.md` - Setup guide for new projects
2. Run `npm run setup` - Interactive configuration wizard
3. Review and customize security rules for your data model
4. Configure your own Firebase project
5. Deploy security rules to your Firebase project
6. Before production, review `SECURITY_DEPLOYMENT_CHECKLIST.md`

**Important**: The security features are implemented and ready to use, but you need to configure them for YOUR specific Firebase project and requirements.

---

**Questions or Issues?**
- Review documentation in this file
- Check `SECURITY_DEPLOYMENT_CHECKLIST.md` for deployment help
- Consult Firebase documentation for platform-specific issues
- Run security audit again to verify improvements

---

**Maintained by**: Development Team
**Last Updated**: 2026-07-02
**Next Review**: 2026-10-02 (3 months)
