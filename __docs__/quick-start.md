# 🚀 Quick Start Guide

Get your SvelteKit 5 boilerplate up and running in 15 minutes.

> **For comprehensive guide**: See [Getting Started](__docs__/getting-started.md) for detailed agentic development workflows and building your first feature.

> **For AI agents**: See [Agentic Development Guide](__docs__/agentic-development-guide.md) for constrained patterns and decision trees.

## Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Firebase Account** ([Create free account](https://firebase.google.com/))
- **Git** (for version control)

### Optional (for Backend Integration)

- **Backend Repository**: [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend) for full-stack MVPs
- **Postman**: For API collection import and testing
- **Mono-repo Setup**: For direct backend access

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-username/your-project-name.git
cd your-project-name

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

## Step 2: Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter your project name
4. Enable/disable Google Analytics (optional)

### Enable Required Services

1. **Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" and "Phone" providers
   - Add your domain to authorized domains

2. **Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (or production mode with rules)

3. **Storage**
   - Go to Storage
   - Click "Get started"
   - Choose security rules (start in test mode)

### Get Configuration

1. Go to Project Settings → General
2. Scroll down to "Your apps"
3. Click "Web app" (</>) icon
4. Register your app
5. Copy the config object

## Step 3: Environment Configuration

Edit your `.env` file with the Firebase configuration:

```env
# Required Firebase Config
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc..."

# App Configuration
VITE_APP_NAME="Your App Name"
VITE_APP_DOMAIN="yourapp.com"

# API Configuration
VITE_API_BASE_URL_DEV="http://localhost:5001/your-project-id/us-central1/api"
VITE_API_BASE_URL_PROD="https://us-central1-your-project-id.cloudfunctions.net/api"
```

## Step 4: reCAPTCHA Setup (for Phone Auth)

1. Go to [Google Cloud Console reCAPTCHA](https://console.cloud.google.com/security/recaptcha)
2. Create a new key:
   - Label: Your app name
   - Type: reCAPTCHA v2 ("I'm not a robot")
   - Domains: localhost, your-domain.com
3. Copy the Site Key to your `.env`:

```env
VITE_RECAPTCHA_SITE_KEY="6Le..."
```

## Step 5: Start Development

```bash
# Start the development server
npm run dev

# Open browser to http://localhost:5173
```

## Step 6: Test Authentication

1. Navigate to `/login`
2. Try email link authentication
3. Try phone authentication
4. Check Firebase Console → Authentication → Users

## Step 7: Customize for Your Project

### Update App Configuration

Edit `src/lib/config/app.config.ts`:

```typescript
export const APP_CONFIG = {
  project: {
    name: 'Your Awesome App',           // ← Change this
    shortName: 'AwesomeApp',            // ← Change this
    description: 'My awesome MVP',       // ← Change this
    domain: 'yourdomain.com',           // ← Change this
  },
  // ... rest of config
}
```

### Define User Roles

In the same config file, customize roles for your app:

```typescript
auth: {
  roles: {
    USER: 'user',
    PREMIUM: 'premium',     // ← Add your roles
    ADMIN: 'admin',
  },
  // Define what each role can do
  permissions: {
    user: ['editOwnProfile'],
    premium: ['editOwnProfile', 'accessPremiumFeatures'],
    admin: ['editOwnProfile', 'accessPremiumFeatures', 'manageUsers'],
  }
}
```

## Next Steps

### Build Your First Route

Create `src/routes/dashboard/+page.svelte`:

```svelte
<script lang="ts">
  import { authService } from '$lib/services/auth';
  import { Button } from '$lib/components/ui/button';
  
  const user = authService.getUser();
  const claims = authService.getUserClaims();
</script>

<div class="container mx-auto py-8">
  <h1 class="text-3xl font-bold mb-4">Dashboard</h1>
  
  {#if $user}
    <p>Welcome, {$user.email}!</p>
    <p>Your role: {$claims?.roles?.join(', ') || 'user'}</p>
    
    <Button>Get Started</Button>
  {/if}
</div>
```

### Customize Styles

Edit `src/app.css` to match your brand:

```css
/* Add your custom styles */
:root {
  --primary: 220 14.3% 95.9%;    /* Your brand colors */
  --primary-foreground: 220.9 39.3% 11%;
}

/* Your custom utility classes */
.brand-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## Available Components

The boilerplate includes 34+ pre-built components:

- **Forms**: Button, Input, Textarea, Checkbox, Select
- **Layout**: Card, Dialog, Sheet, Tabs, Accordion  
- **Navigation**: Breadcrumb, Pagination, Menu
- **Feedback**: Toast, Alert, Loading, Progress
- **Data**: Table, Badge, Avatar

See [COMPONENTS.md](./COMPONENTS.md) for usage examples.

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # Check TypeScript

# Analysis
npm run analyze          # Analyze bundle size
```

## Project Structure

```
src/
├── lib/
│   ├── components/ui/   # Reusable UI components
│   ├── services/        # Business logic services
│   ├── stores/          # Svelte stores
│   ├── utils/           # Utility functions
│   └── config/          # App configuration
├── routes/              # Your app routes
└── app.html            # HTML template
```

## Getting Help

- **Documentation**: Check the `__docs__/` folder
- **Getting Started**: See [getting-started.md](__docs__/getting-started.md) for comprehensive guide
- **Agentic Development**: See [agentic-development-guide.md](__docs__/agentic-development-guide.md) for AI patterns
- **Testing**: See [testing-guide.md](__docs__/testing-guide.md) for testing philosophy
- **Components**: See `__docs__/components.md`
- **Configuration**: See `__docs__/configuration.md`
- **Patterns**: See `__docs__/patterns.md`
- **Backend Integration**: See [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend)

## Production Deployment

When ready for production:

1. Update environment variables for production
2. Run the production build: `npm run build`
3. Deploy to your hosting provider
4. See `docs/DEPLOYMENT.md` for detailed instructions

---

🎉 **Congratulations!** You now have a fully functional SvelteKit 5 application with authentication, components, and best practices built-in.

Focus on building your unique features while the boilerplate handles the infrastructure!