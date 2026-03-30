# Security Hardening Skill

**Skill ID**: `bpsk/security_hardening`
**Category**: XBG Boilerplate SvelteKit - Security
**Status**: Production-ready boilerplate template

---

## Overview

This skill provides comprehensive security hardening documentation and implementation guidance for the XBG SvelteKit boilerplate. It covers all aspects of production-ready security including CSP/headers, Firebase security rules, App Check, CSRF protection, rate limiting, and deployment security.

**Key Capability**: The boilerplate is **pre-hardened** with security best practices. This skill helps users configure security for their specific projects.

---

## Skill Files

### 📖 README_SECURITY.md
**Purpose**: Navigation guide and quick reference
**Use When**: First time exploring security documentation or looking for a specific topic
**Content**:
- Documentation guide (which doc to read when)
- Quick reference table
- Security architecture summary
- Distinction between pre-configured vs needs-configuration

### 🚀 SECURITY_SETUP.md
**Purpose**: Setup guide for new projects using this boilerplate
**Use When**:
- Starting a new project from this boilerplate
- Configuring security for a specific Firebase project
- Customizing security rules for your data model
- Setting up App Check or other security features

**Content**:
- Initial setup steps (Firebase project, env vars)
- Security rules customization guide
- App Check configuration
- CSP customization for your domains
- RBAC setup for your roles
- Testing procedures
- Troubleshooting common issues

**Target Audience**: Developers using this boilerplate for a new project

### 🔒 SECURITY_HARDENING.md
**Purpose**: Technical reference of implemented security features
**Use When**:
- Understanding what security features are included
- Security review or audit
- Maintaining security over time
- Troubleshooting security issues

**Content**:
- Complete list of security improvements
- File-by-file implementation details
- Configuration requirements
- How to use security features (App Check, rate limiting, etc.)
- Testing the security improvements
- Maintenance guidelines

**Target Audience**: Security reviewers, auditors, team leads

### ✅ SECURITY_DEPLOYMENT_CHECKLIST.md
**Purpose**: Pre-production deployment verification
**Use When**:
- Before deploying to production
- Security verification before launch
- Post-deployment monitoring setup

**Content**:
- Critical pre-deployment tasks (MUST complete)
- Important pre-deployment tasks (SHOULD complete)
- Recommended best practices
- Testing checklist
- Pre-deployment commands
- Post-deployment verification (24-hour)
- Emergency rollback procedures

**Target Audience**: DevOps, deployment engineers, project managers

---

## Security Architecture

### What's Pre-Configured (Ready to Use)

The boilerplate includes these security features **already implemented**:

#### Application Security
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
  - Files: `firebase.json`, `src/hooks.server.ts`, `src/lib/config/security.ts`
- **CSRF Protection**: Automatic token generation and validation
  - Files: `src/lib/constants/csrf.constants.ts`, API request handlers
- **Input Sanitization**: Multiple levels (strict, medium, basic)
  - Files: `src/lib/utils/sanitizer.ts`
- **Secure Error Handling**: Production sanitization, no info leakage
  - Files: `src/lib/utils/error-handler.ts`

#### Firebase Security
- **Storage Rules Template**: User segregation, file validation, 50MB limits
  - Files: `storage.rules`
- **Firestore Rules Template**: RBAC, data isolation, audit logging
  - Files: `firestore.rules`
- **App Check Integration**: Bot protection for Firebase services
  - Files: `src/lib/utils/app-check.ts`, integrated in `src/lib/utils/firebase.ts`
- **Auth Security**: Secure session management, role-based access
  - Files: `src/lib/services/auth/auth.service.ts`

#### Development Security
- **Source Maps**: Disabled in production (code protection)
  - Files: `vite.config.ts`
- **Environment Variables**: Proper secret management patterns
  - Files: `.env.example`, `.gitignore`
- **Security Hooks**: SvelteKit middleware for defense-in-depth
  - Files: `src/hooks.server.ts`
- **Rate Limiting Utilities**: Client-side helpers (server-side needed)
  - Files: `src/lib/utils/rate-limiter.ts`

### What Users Need to Configure

When using this boilerplate for a new project:

1. **Firebase Project**: Create and configure their own Firebase project
2. **Environment Variables**: Set their Firebase credentials, API keys, domains
3. **Security Rules**: Customize `storage.rules` and `firestore.rules` for their data model
4. **App Check**: Enable in Firebase Console, configure reCAPTCHA
5. **CSP Domains**: Add their specific domains to CSP configuration
6. **RBAC Roles**: Configure roles in `app.config.ts` matching their needs
7. **Server-Side Rate Limiting**: Implement in Cloud Functions (client-side is UX only)
8. **API Key Restrictions**: Restrict Firebase API keys in Google Cloud Console

---

## Common Use Cases

### Use Case 1: New Project Setup

**Scenario**: Developer creates a new project from this boilerplate

**Steps**:
1. Read `README_SECURITY.md` - Understand documentation structure
2. Read `SECURITY_SETUP.md` - Follow setup instructions
3. Run `npm run setup` - Interactive configuration
4. Configure Firebase project
5. Customize security rules for their data model
6. Test locally with Firebase emulators

**Key Files**:
- `SECURITY_SETUP.md` - Primary guide
- `.env.example` - Environment variable template
- `storage.rules`, `firestore.rules` - Customize for data model

### Use Case 2: Security Review

**Scenario**: Security team reviews the boilerplate or a project using it

**Steps**:
1. Read `README_SECURITY.md` - Navigation guide
2. Read `SECURITY_HARDENING.md` - Complete implementation details
3. Review security rules: `storage.rules`, `firestore.rules`
4. Check security configuration: `src/lib/config/security.ts`
5. Review middleware: `src/hooks.server.ts`
6. Verify deployment checklist: `SECURITY_DEPLOYMENT_CHECKLIST.md`

**Key Files**:
- `SECURITY_HARDENING.md` - Technical reference
- All security implementation files

### Use Case 3: Pre-Production Deployment

**Scenario**: Team preparing to deploy their project to production

**Steps**:
1. Read `SECURITY_DEPLOYMENT_CHECKLIST.md`
2. Complete all critical tasks (Firebase rules, env vars, source maps)
3. Complete important tasks (rate limiting, monitoring, testing)
4. Run pre-deployment commands
5. Deploy security rules first, then hosting
6. Execute post-deployment verification

**Key Files**:
- `SECURITY_DEPLOYMENT_CHECKLIST.md` - Primary checklist
- `SECURITY_SETUP.md` - Deployment configuration reference

### Use Case 4: Customizing Security

**Scenario**: Developer needs to customize CSP, security rules, or RBAC

**Steps**:
1. Read `SECURITY_SETUP.md` → Customization Guide section
2. Edit `src/lib/config/security.ts` for CSP/headers
3. Edit `storage.rules` or `firestore.rules` for data access
4. Edit `src/lib/config/app.config.ts` for RBAC roles
5. Test with Firebase emulators
6. Deploy rules: `firebase deploy --only storage,firestore:rules`

**Key Files**:
- `SECURITY_SETUP.md` - Customization instructions
- `src/lib/config/security.ts` - CSP/headers config
- `storage.rules`, `firestore.rules` - Access control rules

### Use Case 5: Troubleshooting Security Issues

**Scenario**: CSP blocking resources, permission denied errors, App Check failures

**Steps**:
1. Check browser console for specific error
2. Read `SECURITY_SETUP.md` → Troubleshooting section
3. Check `SECURITY_HARDENING.md` → Troubleshooting section
4. Review relevant configuration file
5. Test fix locally with emulators
6. Deploy and verify

**Common Issues**:
- **CSP Violations**: Add domain to `security.ts`, update `firebase.json`
- **Permission Denied**: Check security rules, verify custom claims
- **App Check Failed**: Verify site key, check console configuration

---

## Important Notes

### This is a Boilerplate Template

- **Pre-hardened**: Security features are already implemented
- **Configuration Required**: Users must configure for their specific project
- **Customization Expected**: Security rules and CSP need per-project adaptation
- **Not Deployed**: This is a template, not a deployed application

### Client-Side Rate Limiting Warning

The rate limiting utilities in `src/lib/utils/rate-limiter.ts` are **CLIENT-SIDE ONLY**:

✅ **Good for**: UX improvements, preventing accidental spam
❌ **Bad for**: Security (easily bypassed by attackers)
🔒 **Solution**: Implement server-side rate limiting in Cloud Functions

Example server-side implementation shown in `SECURITY_SETUP.md`.

### Security Rules are Templates

The `storage.rules` and `firestore.rules` files are **templates** with common patterns:

- **User segregation**: Users can only access their own data
- **File validation**: Size limits, type checking, metadata validation
- **RBAC support**: Role-based access with admin override
- **Multi-tenant**: Support for accounts, projects, etc.

**Users must customize** these rules for their specific data model and access patterns.

---

## File Structure

```
.claude/skills/bpsk/security_hardening/
├── skill.md                          # This file - Skill documentation
├── README_SECURITY.md                # Navigation guide
├── SECURITY_SETUP.md                 # Setup for new projects
├── SECURITY_HARDENING.md             # Technical reference
└── SECURITY_DEPLOYMENT_CHECKLIST.md  # Pre-production checklist

[Root directory also contains:]
├── storage.rules                     # Firebase Storage security rules template
├── firestore.rules                   # Firestore security rules template
├── firebase.json                     # Security headers configuration
└── src/
    ├── hooks.server.ts               # SvelteKit security middleware
    └── lib/
        ├── config/
        │   └── security.ts           # Security configuration
        └── utils/
            ├── app-check.ts          # Firebase App Check
            ├── rate-limiter.ts       # Rate limiting utilities
            ├── sanitizer.ts          # Input sanitization
            └── error-handler.ts      # Secure error handling
```

---

## Quick Reference

### Security Feature Lookup

| Feature | Implementation File | Configuration File | Documentation |
|---------|-------------------|-------------------|---------------|
| Security Headers | `src/hooks.server.ts` | `firebase.json` | `SECURITY_HARDENING.md` |
| CSP | `src/lib/config/security.ts` | `firebase.json` | `SECURITY_SETUP.md` → Customization |
| CSRF Protection | Request handlers | `src/lib/constants/csrf.constants.ts` | `SECURITY_HARDENING.md` |
| Input Sanitization | `src/lib/utils/sanitizer.ts` | — | Code comments |
| App Check | `src/lib/utils/app-check.ts` | `.env` (site key) | `SECURITY_SETUP.md` → App Check |
| Storage Rules | `storage.rules` | — | `SECURITY_SETUP.md` → Customization |
| Firestore Rules | `firestore.rules` | — | `SECURITY_SETUP.md` → Customization |
| Rate Limiting | `src/lib/utils/rate-limiter.ts` | — | `SECURITY_HARDENING.md` → Using |
| Error Handling | `src/lib/utils/error-handler.ts` | — | Code comments |

### Environment Variables

New security-related environment variables added to `.env.example`:

```bash
# Firebase App Check
VITE_APP_CHECK_ENABLED="false"         # Enable for production
VITE_APP_CHECK_PROVIDER="recaptcha-v3" # or "recaptcha-enterprise"
VITE_APP_CHECK_DEBUG_TOKEN=""          # For local testing

# Already existed, now documented for security
VITE_RECAPTCHA_SITE_KEY="..."          # Used by App Check and phone auth
VITE_CSRF_ENABLED="true"               # CSRF protection
VITE_CSP_ENABLED="true"                # Content Security Policy
```

---

## Related Skills

- **`xbg_bpsk_setup`**: Deployment and Firebase configuration
- **`xbg_bpsk_config`**: Environment variables and app configuration
- **`xbg_bpsk_services`**: Services using security features (auth, API)
- **`xbg_bpsk_utils`**: Security utilities (sanitizer, error-handler)
- **`firebase`**: Firebase-specific security (Auth, rules, App Check)

---

## Maintenance

### Regular Security Updates

**Weekly**: Monitor Firebase Console for unusual activity
**Monthly**: `npm audit` and fix vulnerabilities
**Quarterly**: Full security review, update dependencies

### Updating This Skill

When security features change:
1. Update implementation files
2. Update relevant documentation file (`SECURITY_SETUP.md` or `SECURITY_HARDENING.md`)
3. Update this `skill.md` if structure changes
4. Update `.env.example` if new variables added
5. Update `SECURITY_DEPLOYMENT_CHECKLIST.md` if process changes

---

## Version

**Created**: 2026-03-14
**Last Updated**: 2026-03-14
**Boilerplate Version**: Compatible with all versions post-security-hardening
**Security Rating**: ⭐⭐⭐⭐⭐ (5/5) - Production-ready

---

**Status**: ✅ Complete and production-ready
