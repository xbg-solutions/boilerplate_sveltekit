# Production Security Deployment Checklist

**Project**: Boilerplate Frontend
**Last Updated**: 2026-03-14

This checklist must be completed before deploying to production. Check off each item as you complete it.

---

## 🔴 CRITICAL (Must Complete Before Launch)

### Firebase Configuration

- [ ] **Firebase Security Rules Deployed**
  ```bash
  # Deploy storage rules
  firebase deploy --only storage

  # Deploy Firestore rules (if using Firestore)
  firebase deploy --only firestore:rules
  ```
  - Verify rules are active in Firebase Console
  - Test with a non-admin account to ensure restrictions work
  - Document any custom rules added for your app

- [ ] **Firebase Hosting Headers Configured**
  - ✅ Security headers added to `firebase.json`
  - [ ] Verify headers are applied after deployment
  ```bash
  # Test with curl
  curl -I https://your-domain.com
  ```
  - [ ] Confirm CSP header is present and correct
  - [ ] Verify HSTS header is applied

- [ ] **Firebase App Check Enabled**
  - [ ] reCAPTCHA site key configured in environment
  - [ ] `VITE_APP_CHECK_ENABLED=true` in production `.env`
  - [ ] App Check enforced on backend services:
    ```bash
    # In your Cloud Functions
    firebase functions:config:set app.check_enabled=true
    ```
  - [ ] Test that unauthenticated requests are blocked

### Environment Variables

- [ ] **Production Environment File**
  - [ ] Create `.env.production` (DO NOT commit to git)
  - [ ] All `VITE_*` variables populated with production values
  - [ ] `NODE_ENV=production`
  - [ ] `PUBLIC_ENVIRONMENT=production`
  - [ ] Verify `.env.production` is in `.gitignore`

- [ ] **Secrets Management**
  - [ ] No secrets committed to repository (run `git log --all -S "secret" -p`)
  - [ ] Firebase config uses production project
  - [ ] API keys are restricted in Google Cloud Console:
    - [ ] HTTP referrers configured
    - [ ] API restrictions enabled
    - [ ] Usage quotas set

- [ ] **Remove Development Artifacts**
  - [ ] Delete `.env.development` from repository
  - [ ] Delete any `.env.local` files
  - [ ] Remove any test/debug credentials

### Build Configuration

- [ ] **Source Maps Disabled**
  - ✅ `vite.config.ts` updated to disable source maps in production
  - [ ] Verify production build doesn't include `.map` files:
    ```bash
    npm run build
    ls -la build/**/*.map  # Should return no files
    ```

- [ ] **Production Build Verified**
  ```bash
  npm run build
  npm run preview
  ```
  - [ ] No console errors
  - [ ] No build warnings about security
  - [ ] Bundle size is reasonable (check with `npm run analyze`)

### Security Headers

- [ ] **CSP Verified**
  - [ ] Test CSP doesn't break functionality
  - [ ] No inline scripts (or proper nonces if needed)
  - [ ] External resources properly whitelisted
  - [ ] Test with browser console (should show no CSP violations)

- [ ] **CORS Configuration**
  - [ ] Allowed origins configured in backend
  - [ ] `Access-Control-Allow-Credentials` only if needed
  - [ ] No wildcard (`*`) origins in production

---

## 🟡 IMPORTANT (Should Complete Before Launch)

### Authentication Security

- [ ] **Auth Configuration**
  - [ ] Email/password authentication disabled if not used
  - [ ] Sign-in methods properly configured in Firebase Console
  - [ ] Password requirements enforce strong passwords
  - [ ] Account enumeration protection enabled

- [ ] **Session Management**
  - [ ] Session timeout configured appropriately
  - [ ] Refresh token rotation enabled
  - [ ] Secure logout clears all tokens and sessions

- [ ] **Rate Limiting**
  - [ ] Backend rate limiting implemented (Cloud Functions)
  - [ ] Auth endpoints have strict limits:
    ```javascript
    // Example for Cloud Functions
    const rateLimit = require('express-rate-limit');

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 requests per window
      message: 'Too many authentication attempts'
    });

    app.use('/api/auth', authLimiter);
    ```
  - [ ] Test rate limits are enforced
  - [ ] Monitor rate limit violations

### Data Protection

- [ ] **Firestore Security** (if using Firestore)
  - [ ] Rules deny by default
  - [ ] User data segregated by UID
  - [ ] Admin operations require admin token
  - [ ] Test rules with Firebase emulator:
    ```bash
    npm run test:firestore-rules  # Add this script if needed
    ```

- [ ] **Storage Security**
  - [ ] File size limits enforced (client + server)
  - [ ] File type validation on backend
  - [ ] Malware scanning for uploads (if applicable)
  - [ ] Storage bucket CORS configured properly

- [ ] **Data Encryption**
  - [ ] Sensitive data encrypted at rest (Firebase default)
  - [ ] TLS/HTTPS enforced for all connections
  - [ ] No sensitive data in URLs or logs

### Monitoring & Logging

- [ ] **Error Monitoring**
  - [ ] Error reporting service configured (Sentry, etc.)
  - [ ] `VITE_ERROR_MONITORING_DSN` set
  - [ ] `VITE_ERROR_MONITORING_ENABLED=true`
  - [ ] Test error reporting works
  - [ ] PII excluded from error reports

- [ ] **Security Logging**
  - [ ] Failed auth attempts logged
  - [ ] Security events tracked (account changes, role changes)
  - [ ] Audit log for admin actions
  - [ ] Log retention policy defined

- [ ] **Performance Monitoring**
  - [ ] Firebase Performance Monitoring enabled
  - [ ] Custom traces for critical paths
  - [ ] Core Web Vitals tracked

---

## 🟢 RECOMMENDED (Best Practices)

### Additional Security Measures

- [ ] **Subresource Integrity (SRI)**
  - [ ] Add SRI hashes for external scripts
  - [ ] Use CDN with integrity checking

- [ ] **Security Scanning**
  - [ ] Run `npm audit` and fix vulnerabilities
  - [ ] Schedule regular dependency updates
  - [ ] Set up Dependabot/Renovate
  - [ ] Run OWASP ZAP or similar scanner

- [ ] **DNS Security**
  - [ ] CAA records configured
  - [ ] DNSSEC enabled (if provider supports)
  - [ ] SPF/DKIM/DMARC for email domain

### Compliance & Legal

- [ ] **Privacy Policy**
  - [ ] Privacy policy page created
  - [ ] Cookie consent implemented (if in EU/GDPR region)
  - [ ] Data processing agreement with Firebase/Google

- [ ] **Terms of Service**
  - [ ] ToS page created and linked
  - [ ] User acceptance tracked

- [ ] **Accessibility**
  - [ ] Run `npm run test:a11y`
  - [ ] WCAG 2.1 AA compliance verified
  - [ ] Keyboard navigation tested

### Performance Optimization

- [ ] **Caching**
  - [ ] Static assets have long cache times
  - [ ] Service worker configured (if using PWA)
  - [ ] CDN configured for static assets

- [ ] **Code Splitting**
  - [ ] Route-based code splitting implemented
  - [ ] Lazy loading for non-critical components
  - [ ] Bundle size analyzed and optimized

- [ ] **Image Optimization**
  - [ ] Images compressed and optimized
  - [ ] WebP format used where supported
  - [ ] Responsive images implemented

---

## 🧪 Testing Checklist

### Security Testing

- [ ] **Penetration Testing**
  - [ ] Auth bypass attempts (failed)
  - [ ] XSS injection attempts (blocked)
  - [ ] SQL injection attempts (not applicable/blocked)
  - [ ] CSRF attacks (prevented by tokens)
  - [ ] File upload attacks (size/type validation works)

- [ ] **User Testing**
  - [ ] Test with non-admin account
  - [ ] Attempt to access admin features (blocked)
  - [ ] Test role-based access control
  - [ ] Verify data isolation between users

### Functional Testing

- [ ] **Cross-Browser Testing**
  - [ ] Chrome/Edge (latest 2 versions)
  - [ ] Firefox (latest 2 versions)
  - [ ] Safari (latest 2 versions)
  - [ ] Mobile browsers (iOS Safari, Chrome Mobile)

- [ ] **Authentication Flows**
  - [ ] Email link sign-in works
  - [ ] Phone authentication works
  - [ ] Password reset works
  - [ ] Session persistence works
  - [ ] Sign-out works properly

- [ ] **Error Scenarios**
  - [ ] Network offline handling
  - [ ] Invalid credentials
  - [ ] Expired tokens
  - [ ] Rate limit exceeded
  - [ ] File upload errors

---

## 📋 Pre-Deployment Commands

Run these commands before deployment:

```bash
# 1. Audit dependencies
npm audit
npm audit fix  # Fix any vulnerabilities

# 2. Run all tests
npm test

# 3. Type checking
npm run typecheck

# 4. Linting
npm run lint

# 5. Build for production
NODE_ENV=production npm run build

# 6. Verify build output
ls -lah build/
du -sh build/  # Check bundle size

# 7. Test production build locally
npm run preview

# 8. Deploy Firebase rules first
firebase deploy --only storage,firestore:rules

# 9. Deploy hosting
firebase deploy --only hosting

# 10. Verify deployment
curl -I https://your-domain.com
```

---

## 🔍 Post-Deployment Verification

Within 24 hours of deployment:

- [ ] **SSL/TLS Certificate**
  - [ ] HTTPS enforced
  - [ ] SSL certificate valid
  - [ ] Test at https://www.ssllabs.com/ssltest/

- [ ] **Security Headers**
  - [ ] Test at https://securityheaders.com/
  - [ ] Grade A or higher

- [ ] **Performance**
  - [ ] Lighthouse score > 90
  - [ ] Core Web Vitals in green
  - [ ] No console errors in production

- [ ] **Monitoring**
  - [ ] Error reporting receiving events
  - [ ] Performance metrics collecting
  - [ ] Analytics tracking properly

- [ ] **Functionality**
  - [ ] Test critical user flows
  - [ ] Verify auth works in production
  - [ ] Check file uploads work
  - [ ] Test on multiple devices

---

## 🚨 Emergency Rollback Procedure

If critical issues are discovered:

```bash
# 1. Rollback to previous deployment
firebase hosting:rollback

# 2. If rules are the issue
firebase deploy --only storage,firestore:rules

# 3. Check Firebase Console > Hosting > Release History
# Can rollback to any previous version

# 4. Notify users (if needed)
# Update status page or send notification

# 5. Fix issues in development
# Test thoroughly before redeployment
```

---

## 📞 Emergency Contacts

- **Firebase Support**: https://firebase.google.com/support
- **Security Issues**: [your-security-email@domain.com]
- **On-Call DevOps**: [contact-info]

---

## ✅ Final Sign-Off

- [ ] Development team review complete
- [ ] Security review complete
- [ ] Product owner approval
- [ ] Deployment window scheduled
- [ ] Monitoring alerts configured
- [ ] Rollback procedure tested

**Deployment Approved By**: _______________
**Date**: _______________
**Deployment Window**: _______________

---

## 📚 Additional Resources

- [Firebase Security Documentation](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SvelteKit Security](https://kit.svelte.dev/docs/configuration#security)
- [Web.dev Security](https://web.dev/secure/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
