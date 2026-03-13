# Firebase Development

**Skill: `firebase`**

Guidance for working with Firebase services in this SvelteKit project. Covers authentication, Firestore, Cloud Functions, hosting, and local development.

**Sources (consult in priority order):**
1. **Primary:** [firebase/agent-skills](https://github.com/firebase/agent-skills) — Official Firebase skills covering auth, Firestore, hosting, App Hosting, Data Connect, AI Logic, Genkit, and local environment setup
2. **Secondary:** [SpillwaveSolutions/using-firebase](https://github.com/SpillwaveSolutions/using-firebase) — Comprehensive Firebase skill covering Cloud Functions (both generations), emulators, deployment, security rules, and GCP integration

---

## When to Use This Skill

- Setting up or configuring Firebase services
- Writing Firestore queries, security rules, or data models
- Creating or modifying Cloud Functions (TypeScript or Python)
- Configuring Firebase Authentication providers
- Setting up emulators for local development
- Deploying to Firebase Hosting or App Hosting
- Integrating Firebase AI Logic (Gemini API) or Genkit

---

## Firebase Local Environment Setup

Before any Firebase work, verify these prerequisites:

```bash
# Node.js >= 20
node --version

# Firebase CLI (always use latest)
npx -y firebase-tools@latest --version

# Verify authentication
npx -y firebase-tools@latest login:list

# Verify project connection
npx -y firebase-tools@latest projects:list
```

### Emulator Ports (Default)

| Service | Port |
|---|---|
| Auth | 9099 |
| Functions | 5001 |
| Firestore | 8080 |
| Storage | 9199 |
| Hosting | 5000 |
| Emulator UI | 4000 |

Start emulators:
```bash
npx -y firebase-tools@latest emulators:start
# Or selective:
npx -y firebase-tools@latest emulators:start --only auth,firestore,functions
```

In `.env` for local development:
```bash
VITE_FIREBASE_AUTH_EMULATOR_HOST="localhost"
VITE_FIREBASE_AUTH_EMULATOR_PORT="9099"
VITE_USE_EMULATORS="true"
```

---

## Firebase Authentication

### Identity Providers

| Provider | Type | Notes |
|---|---|---|
| Email/Password | Native | Basic credential auth |
| Email/Link (passwordless) | Native | **Primary method in this boilerplate** |
| Google Sign-In | Federated | OAuth 2.0 |
| Phone | Native | Requires reCAPTCHA; enable only if `features.phoneVerification = true` |
| Anonymous | Native | Temporary accounts |
| Custom Auth | Custom | Server-generated tokens |

### Tokens

- **ID Token**: Short-lived JWT containing user identity and custom claims. Passed in Authorization header.
- **Refresh Token**: Long-lived token for obtaining new ID tokens. Stored securely by the Firebase SDK.

### Provisioning via CLI

```json
// firebase.json
{
  "auth": {
    "providers": ["anonymous", "emailPassword", "googleSignIn"]
  }
}
```

### Integration with This Boilerplate

This project uses `authService` (see `xbg_bpsk_services` skill) as the Firebase Auth wrapper. Never call Firebase Auth SDK directly from components.

```typescript
// Correct — use the boilerplate's authService
import { authService } from '$lib/services/auth';
await authService.sendEmailLink(email);

// Wrong — don't use Firebase SDK directly
import { getAuth, signInWithEmailLink } from 'firebase/auth';
```

---

## Firestore

### Data Model Decisions

| Pattern | When to Use |
|---|---|
| **Embed** (nested objects) | Data always read together, rarely updated independently |
| **Reference** (document ID) | Frequently changing data, shared across documents |
| **Subcollection** | Parent-child relationship, independent querying of children |
| **Root collection** | Cross-document queries needed, no natural parent |

### Security Rules Pattern

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Admin access via custom claims
    match /admin/{document=**} {
      allow read, write: if request.auth.token.isAdmin == true;
    }
  }
}
```

### Firestore Editions

- **Firestore Standard**: Default for most projects. Pay-as-you-go pricing.
- **Firestore Enterprise (Native Mode)**: For enterprise workloads needing SLA guarantees and advanced features.

---

## Cloud Functions

### Generation Choice

| Generation | Use For |
|---|---|
| **2nd Gen (recommended)** | HTTP triggers, Firestore triggers, Storage triggers, Scheduled functions, Pub/Sub |
| **1st Gen (only when needed)** | Auth `onCreate`/`onDelete` triggers |

### 2nd Gen Examples (TypeScript)

```typescript
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

// Firestore trigger
export const onUserCreated = onDocumentCreated("users/{userId}", (event) => {
  const data = event.data?.data();
  console.log("New user:", event.params.userId, data);
});

// HTTP endpoint
export const api = onRequest({ cors: true }, (req, res) => {
  res.json({ status: "ok" });
});

// Scheduled function (every day at midnight)
export const dailyCleanup = onSchedule("every day 00:00", async (event) => {
  // cleanup logic
});
```

### 1st Gen Auth Trigger

```typescript
import * as functions from "firebase-functions";

export const onUserCreate = functions.auth.user().onCreate((user) => {
  console.log("New user:", user.uid, user.email);
});
```

---

## Firebase Hosting vs App Hosting

| Feature | Hosting (Classic) | App Hosting |
|---|---|---|
| Content type | Static / SPA | Full-stack SSR (Next.js, Angular) |
| Deploy | `firebase deploy --only hosting` | GitHub CI/CD |
| Billing | Spark (free) or Blaze | Blaze required |
| Dynamic content | Via Cloud Functions/Run rewrites | Native SSR |

**This boilerplate uses classic Hosting** (SPA mode with `/index.html` fallback).

```bash
npm run build
firebase deploy --only hosting
```

---

## Deployment Checklist

- [ ] Security rules tested in emulator
- [ ] Secrets configured via `firebase functions:secrets:set`
- [ ] Correct project selected (`firebase use <project-id>`)
- [ ] Functions tested locally with emulators
- [ ] Firestore indexes deployed (`firebase deploy --only firestore:indexes`)
- [ ] Dry-run verified (`firebase deploy --only hosting --dry-run`)
- [ ] Budget alerts configured in GCP Console

---

## Firebase AI Logic (Gemini API)

For AI features using Firebase AI Logic:

```typescript
// Two provider options:
// 1. Gemini Developer API (free tier, prototyping)
// 2. Vertex AI Gemini API (enterprise, production)

// Capabilities: text generation, multimodal input, chat sessions,
// streaming, image generation, search grounding
// Default model: gemini-flash-latest (unless specified otherwise)
```

---

## Quick Reference Commands

```bash
# Project management
firebase login
firebase projects:list
firebase use <project-id>

# Initialization
firebase init  # Interactive setup

# Deployment
firebase deploy                        # Deploy everything
firebase deploy --only hosting         # Hosting only
firebase deploy --only functions       # Functions only
firebase deploy --only firestore       # Rules + indexes

# Emulators
firebase emulators:start               # Start all
firebase emulators:start --only auth   # Auth only
firebase emulators:export ./seed-data  # Export emulator data
firebase emulators:start --import ./seed-data  # Import on start
```
