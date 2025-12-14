# ⚙️ Configuration Guide

Complete reference for configuring the SvelteKit 5 boilerplate for your project.

## Core Configuration File

The main configuration is in `src/lib/config/app.config.ts`. This file contains all customizable settings for your application.

### Project Information

```typescript
export const APP_CONFIG = {
  project: {
    name: 'Your App Name',                    // FIXME: Application display name
    shortName: 'YourApp',                     // FIXME: Short name for icons/titles  
    description: 'Your app description',      // FIXME: App description for SEO
    version: '1.0.0',                        // FIXME: Current version
    domain: 'yourapp.com',                   // FIXME: Production domain
    url: isProd ? 'https://yourapp.com' : 'http://localhost:5173', // FIXME: Update domain
  },
  // ...
}
```

**What to change:**
- `name`: The full display name of your application
- `shortName`: Used for browser tabs and mobile app names
- `description`: Used for SEO meta tags and social sharing
- `version`: Your app version (semantic versioning recommended)
- `domain`: Your production domain name
- `url`: Full URL for your app (used in email links, etc.)

### API Configuration

```typescript
api: {
  baseUrl: {
    development: 'http://localhost:5001/your-project-id/us-central1/api', // FIXME: Update project ID
    production: 'https://us-central1-your-project-id.cloudfunctions.net/api', // FIXME: Update project ID
  },
  timeout: 30000,
  retryCount: 2,
  retryDelay: 1000,
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
},
```

**What to change:**
- Replace `your-project-id` with your actual Firebase project ID
- Update URLs to match your API endpoints
- Adjust timeout, retry settings as needed

### Firebase Configuration

```typescript
firebase: {
  projectId: 'your-project-id',             // FIXME: Firebase project ID
  apiKey: 'your-api-key',                   // FIXME: Firebase API key  
  authDomain: 'your-project-id.firebaseapp.com', // FIXME: Firebase auth domain
  storageBucket: 'your-project-id.appspot.com',  // FIXME: Firebase storage bucket
  messagingSenderId: '123456789',           // FIXME: Firebase messaging sender ID
  appId: 'your-app-id',                     // FIXME: Firebase app ID
},
```

**How to get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → General
4. Scroll to "Your apps" section
5. Copy the config object values

### Authentication & Roles

```typescript
auth: {
  // Available user roles in your application
  roles: {
    USER: 'user',           // Default user role
    CLIENT: 'client',       // FIXME: Add/remove roles as needed
    CONSULTANT: 'consultant', // FIXME: Add/remove roles as needed  
    ADMIN: 'admin',         // FIXME: Add/remove roles as needed
    SYS_ADMIN: 'sysadmin',  // FIXME: Add/remove roles as needed
  },
  
  // Role hierarchy (higher roles inherit lower role permissions)
  roleHierarchy: {
    sysadmin: ['admin', 'consultant', 'client', 'user'],
    admin: ['consultant', 'client', 'user'],
    consultant: ['client', 'user'],
    client: ['user'],
  },

  // Basic permissions matrix - customize as needed
  permissions: {
    user: ['editOwnProfile'],
    client: ['editOwnProfile', 'viewClientDashboard'],
    consultant: ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients'],
    admin: ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients', 'manageUsers'],
    sysadmin: ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients', 'manageUsers', 'systemAdmin'],
  }
}
```

**Customize for your app:**
1. Define roles that make sense for your business
2. Set up role hierarchy (optional)
3. Map permissions to each role

### Route Configuration

```typescript
routes: {
  // Public routes (no authentication required)
  public: [
    '/',
    '/about',
    '/contact',
    '/login',
    '/register',
    '/unauthorized',
  ],
  
  // Default routes for different scenarios
  default: {
    postLoginRoute: '/dashboard',      // Where to redirect after login
    postLogoutRoute: '/',             // Where to redirect after logout
    unauthorizedRoute: '/unauthorized', // Where to redirect when access denied
  },
  
  // Role-based route access
  protected: {
    '/admin': ['admin', 'sysadmin'],
    '/consultant': ['consultant', 'admin', 'sysadmin'],
    '/client': ['client', 'consultant', 'admin', 'sysadmin'],
  }
}
```

## Environment Variables

### Required Variables

Create a `.env` file based on `.env.example`:

```env
# Firebase Configuration
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="your-app-id"

# App Configuration
VITE_APP_NAME="Your App Name"
VITE_APP_DOMAIN="yourapp.com"

# API Configuration
VITE_API_BASE_URL_DEV="http://localhost:5001/your-project-id/us-central1/api"
VITE_API_BASE_URL_PROD="https://us-central1-your-project-id.cloudfunctions.net/api"

# reCAPTCHA (for phone auth)
VITE_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
```

### Optional Variables

```env
# Analytics
VITE_GA_TRACKING_ID="G-XXXXXXXXXX"
VITE_GA_ENABLED="true"

# Error Monitoring
VITE_ERROR_MONITORING_DSN="https://sentry-dsn"
VITE_ERROR_MONITORING_ENABLED="true"

# Development
VITE_DEBUG_MODE="false"
VITE_LOG_LEVEL="info"

# File Upload
VITE_STORAGE_MAX_FILE_SIZE="10485760"  # 10MB
VITE_STORAGE_ALLOWED_TYPES="image/*,application/pdf"

# Caching
VITE_CACHE_TTL="300000"  # 5 minutes
```

## Tailwind Configuration

### Custom Theme

Edit `tailwind.config.js` to customize the design system:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      // Custom colors
      colors: {
        // Your brand colors
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
        
        // Custom semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      
      // Custom fonts
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      
      // Custom spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
```

### CSS Custom Properties

Edit `src/app.css` to define custom CSS variables:

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

:root {
  /* Brand colors */
  --brand-primary: 59 130 246;
  --brand-secondary: 99 102 241;
  
  /* Semantic colors */
  --success: 16 185 129;
  --warning: 245 158 11;
  --error: 239 68 68;
  
  /* Layout */
  --header-height: 4rem;
  --sidebar-width: 16rem;
  --container-max-width: 1200px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  :root {
    --brand-primary: 96 165 250;
    --brand-secondary: 129 140 248;
  }
}

/* Custom utility classes */
@layer utilities {
  .text-brand {
    color: rgb(var(--brand-primary));
  }
  
  .bg-brand {
    background-color: rgb(var(--brand-primary));
  }
  
  .shadow-brand {
    box-shadow: 0 4px 14px 0 rgb(var(--brand-primary) / 0.2);
  }
}

/* Component styles */
@layer components {
  .btn-brand {
    @apply bg-brand text-white hover:opacity-90 transition-opacity;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md border border-gray-200;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary;
  }
}
```

## Vite Configuration

### Custom Build Settings

Edit `vite.config.ts` for build optimizations:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    sveltekit(),
    // Bundle analyzer (only in analyze mode)
    ...(process.env.ANALYZE ? [visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })] : [])
  ],
  
  build: {
    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-svelte': ['svelte', 'svelte/store'],
          'vendor-ui': ['lucide-svelte'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          
          // Feature chunks
          'auth': [
            './src/lib/services/auth',
            './src/lib/stores/auth.store.ts'
          ],
          'components': [
            './src/lib/components'
          ]
        }
      }
    },
    
    // Target modern browsers
    target: 'esnext',
    minify: 'terser',
    
    // Source maps for debugging
    sourcemap: process.env.NODE_ENV === 'development'
  },
  
  // Development server settings
  server: {
    port: 5173,
    host: true, // Allow external connections
    cors: true
  },
  
  // Path aliases
  resolve: {
    alias: {
      '$components': './src/lib/components',
      '$stores': './src/lib/stores',
      '$services': './src/lib/services',
      '$utils': './src/lib/utils'
    }
  }
});
```

## TypeScript Configuration

### Custom Types

Create `src/app.d.ts` for global type definitions:

```typescript
import type { User } from 'firebase/auth';

declare global {
  namespace App {
    interface Locals {
      user?: User;
      claims?: Record<string, any>;
    }
    
    interface PageData {
      user?: User;
      claims?: Record<string, any>;
    }
    
    interface Error {
      code?: string;
      details?: string;
    }
    
    interface Platform {}
  }
  
  // Custom environment variables
  interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
    readonly VITE_RECAPTCHA_SITE_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
```

### tsconfig.json Customization

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM"],
    
    // Path mapping
    "baseUrl": ".",
    "paths": {
      "$lib": ["src/lib"],
      "$lib/*": ["src/lib/*"],
      "$components": ["src/lib/components"],
      "$components/*": ["src/lib/components/*"],
      "$stores": ["src/lib/stores"],
      "$stores/*": ["src/lib/stores/*"],
      "$services": ["src/lib/services"],
      "$services/*": ["src/lib/services/*"],
      "$utils": ["src/lib/utils"],
      "$utils/*": ["src/lib/utils/*"]
    }
  },
  "include": [
    "src/**/*.d.ts",
    "src/**/*.js",
    "src/**/*.ts",
    "src/**/*.svelte"
  ],
  "exclude": [
    "node_modules",
    "build",
    ".svelte-kit"
  ]
}
```

## Package.json Scripts

### Custom Scripts

```json
{
  "scripts": {
    // Development
    "dev": "vite dev",
    "dev:host": "vite dev --host",
    "dev:debug": "DEBUG=* vite dev",
    
    // Building
    "build": "vite build",
    "build:analyze": "ANALYZE=true vite build",
    "preview": "vite preview",
    
    // Testing
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    
    // Code Quality
    "lint": "eslint . --ext .js,.ts,.svelte",
    "lint:fix": "eslint . --ext .js,.ts,.svelte --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    
    // Utilities
    "clean": "rm -rf build .svelte-kit",
    "reset": "rm -rf node_modules package-lock.json && npm install",
    "update": "npm update && npm audit fix",
    
    // Project specific
    "setup": "node scripts/setup.js",
    "generate:component": "node scripts/generate-component.js",
    "generate:route": "node scripts/generate-route.js"
  }
}
```

## ESLint Configuration

### .eslintrc.json

```json
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:svelte/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2020,
    "extraFileExtensions": [".svelte"]
  },
  "env": {
    "browser": true,
    "es2017": true,
    "node": true
  },
  "overrides": [
    {
      "files": ["*.svelte"],
      "parser": "svelte-eslint-parser",
      "parserOptions": {
        "parser": "@typescript-eslint/parser"
      }
    }
  ],
  "rules": {
    // Custom rules
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "svelte/no-at-html-tags": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

## Prettier Configuration

### .prettierrc

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "semi": true,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.svelte",
      "options": {
        "parser": "svelte"
      }
    }
  ]
}
```

## Security Configuration

### Content Security Policy

Add to `src/app.html`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://firebaseapp.com https://*.googleapis.com;
  frame-src 'self' https://recaptcha.google.com;
">
```

### Security Headers

Add to your hosting configuration:

```yaml
# firebase.json (Firebase Hosting)
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "SAMEORIGIN"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          }
        ]
      }
    ]
  }
}
```

## Performance Configuration

### Bundle Analysis

```bash
# Analyze bundle size
npm run build:analyze

# This generates a report at dist/bundle-analysis.html
```

### Preloading Critical Resources

Add to `src/app.html`:

```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>

<!-- DNS prefetch for external services -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//firebaseapp.com">
```

This configuration guide covers all major aspects of customizing the boilerplate. Use it as a reference when setting up new projects or making adjustments to existing ones.