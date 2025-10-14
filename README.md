# SvelteKit 5 AI-Compatible Boilerplate

An experiment by [XBG Solutions](https://xbg.solutions) aided by [Claude Code](https://www.claude.com/product/claude-code).

**Production-ready SvelteKit foundation optimized for AI-assisted design-to-code workflows.**

Build and launch MVPs in **days, not months** using modern AI-assisted development patterns.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-677%20Passing-green)](./tests)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

---

## 🎯 What Makes This Different

This boilerplate is specifically designed for:
- **AI-Assisted Development**: Consistent patterns and comprehensive documentation optimized for AI code generation
- **Rapid MVP Development**: 3-minute interactive setup wizard and 30+ ready-to-use atomic components
- **Design-to-Code Pipeline**: Optimized for Figma → AI → Svelte workflows with SHADCN components
- **Production Readiness**: 677 passing tests, accessibility compliance, and deployment infrastructure
- **Developer Experience**: Type-safe, well-documented, and following modern best practices

### The Modern Development Workflow

```
1. Design in Figma          →  2. AI Generates Code    →  3. Deploy
   (SHADCN components)          (Figma MCP export)          (Firebase/Vercel)
   ↓                            ↓                           ↓
   Sketches + AI design         +page.svelte files          npm run deploy
   UX team refinement           API integration             Done!
```

---

## ✨ Key Features

### Core Stack
- **SvelteKit 5**: Latest version with modern runes and enhanced SSR
- **TypeScript**: Strict mode enabled with comprehensive type definitions
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **SHADCN-Svelte**: 30+ accessible, customizable UI components
- **Firebase**: Authentication, hosting, and backend integration
- **Vitest**: Modern testing framework with 677 passing tests

### AI-Optimized Architecture
- **Interactive Setup Wizard**: 3-minute configuration with automatic validation ⭐ NEW
- **Single Configuration File**: Edit one file (`src/lib/config/app.config.ts`) to customize everything
- **Atomic Components**: 30 SHADCN components perfect for AI composition (not opinionated page layouts)
- **Consistent Import Patterns**: Standardized imports from `$lib/components/ui` and `$lib/config/app.config`
- **Comprehensive Documentation**: AI-specific comments and patterns throughout codebase
- **Predictable Structure**: SHADCN component patterns for reliable code generation

### Production Features
- **677 Passing Tests**: Comprehensive behavioral testing with @testing-library/svelte
- **Accessibility Compliance**: WCAG Level AA with all build warnings resolved
- **Performance Optimized**: Bundle analysis, code splitting, and performance monitoring
- **Security First**: CSRF protection, input sanitization, secure authentication
- **Deployment Ready**: CI/CD pipelines, Docker support, multiple hosting options

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Firebase account ([Create free](https://firebase.google.com/))
- Git

### Setup (3 Minutes)

```bash
# 1. Clone and install
git clone https://github.com/xbg-solutions/boilerplate_frontend.git
cd boilerplate_frontend
npm install

# 2. Run interactive setup wizard ⭐ NEW
npm run setup

# The wizard will:
#   • Ask 6 simple questions about your project
#   • Auto-detect Firebase config (or help you enter it)
#   • Generate your .env file automatically
#   • Update app.config.ts with your values
#   • Validate everything works

# 3. Validate setup (optional but recommended)
npm run validate

# 4. Start developing!
npm run dev
```

Visit `http://localhost:5173` - you're ready to build! 🎉

### Alternative: Manual Configuration

If you prefer manual setup, edit the configuration file directly:

```typescript
// src/lib/config/app.config.ts

export const APP_CONFIG = {
  app: {
    name: 'Your App Name',        // FIXME: Set your app name
    domain: 'your-domain.com',    // FIXME: Set your domain
    supportEmail: 'support@your-domain.com' // FIXME: Set support email
  },
  firebase: {
    projectId: 'your-firebase-project', // FIXME: Firebase project ID
    apiKey: 'your-api-key',             // FIXME: Firebase API key
    // ... other Firebase config
  },
  api: {
    baseUrl: {
      development: 'http://localhost:5001',     // FIXME: Dev API URL
      production: 'https://api.your-domain.com' // FIXME: Prod API URL
    }
  }
  // All other configuration follows...
}
```

Then create your `.env` file with the corresponding environment variables.

---

## 💡 Core Philosophy: Atomic Components, Not Opinionated Pages

### What We Provide

**Atomic Building Blocks:**
- Button, Card, Input, Dialog (30 SHADCN components)
- Authentication service, routing, state management
- Testing infrastructure, deployment pipelines
- Type-safe APIs and error handling

### What We DON'T Provide

**Pre-built Opinionated Layouts:**
- ❌ Pre-built dashboards, user profiles, admin panels
- ❌ Opinionated page structures
- ❌ Complex composed components

### Why?

In modern AI-assisted workflows:
1. **You design pages in Figma** using our SHADCN component library
2. **AI generates the composed components** (DashboardStats, UserTable, etc.)
3. **Our boilerplate provides the atoms** that AI composes together

This gives you **maximum flexibility** while maintaining **design system consistency**.

```svelte
<!-- AI generates this FROM Figma designs, using YOUR 30 base components -->
<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  
  export let stats: DashboardStats;
</script>

<Card class="w-full">
  <CardHeader>
    <CardTitle class="flex items-center gap-2">
      User Analytics
      <Badge variant="outline">Live</Badge>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div class="grid gap-4">
      <div class="text-3xl font-bold">{stats.totalUsers}</div>
      <Button>View Details</Button>
    </div>
  </CardContent>
</Card>
```

---

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── config/
│   │   └── app.config.ts          # 🎯 Single source of truth - edit this file
│   ├── components/
│   │   ├── animations/            # Advanced transition components
│   │   ├── ui/                    # 30+ SHADCN components (atomic)
│   │   ├── auth/                  # Authentication components
│   │   └── layout/                # Layout and navigation
│   ├── services/                  # Business logic and API integration
│   ├── stores/                    # Svelte stores for state management
│   ├── utils/                     # Utility functions and helpers
│   ├── types/                     # TypeScript type definitions
│   └── docs/                      # API and component documentation
├── routes/                        # SvelteKit routes
└── app.html                       # HTML template

__scripts__/                       # CLI tools and generators
├── setup.cjs                      # ⭐ Interactive setup wizard
├── validate-setup.cjs             # ⭐ Configuration validation
├── generate-component.js          # Component scaffolding
├── generate-route.js              # Route generation
└── generate-service.js            # Service creation

__tests__/                         # 677 behavioral tests ✅
__docs__/                          # Comprehensive documentation
```

---

## 🎨 UI Components

30+ production-ready SHADCN components with full TypeScript support:

```svelte
<script lang="ts">
  import { Button, Card, CardContent, CardHeader, Dialog, Input } from '$lib/components/ui';
</script>

<Card class="max-w-md">
  <CardHeader>
    <h2>User Profile</h2>
  </CardHeader>
  <CardContent>
    <Input label="Email" type="email" bind:value={email} />
    <Button class="mt-4" on:click={handleSave}>Save Changes</Button>
  </CardContent>
</Card>
```

**Available Components:**

**Form Components:**
- Button, Input, Label, Select, Checkbox, RadioGroup, Textarea

**Layout Components:**
- Card, Dialog, Sheet, Tabs, Breadcrumb, Pagination

**Data Display:**
- Table, Avatar, Badge, Progress, Skeleton

**Feedback:**
- Alert, Toast, LoadingOverlay

**Navigation:**
- HeaderNav, AuthGuard, PageTransition

See `/demo` route for live examples of all components.

---

## 🔐 Authentication

Built-in Firebase authentication with multiple methods:

```typescript
import { authService } from '$lib/services/auth';

// Email/password authentication
const user = await authService.signInWithEmailAndPassword(email, password);

// Phone authentication
const user = await authService.signInWithPhoneNumber(phoneNumber);

// Email link authentication (passwordless)
await authService.sendSignInLinkToEmail(email);

// Get current user and claims
const user = authService.getUser();
const claims = authService.getUserClaims();
```

### Protected Routes

```typescript
// +page.ts
import { routeHandler } from '$lib/utils/route-handler';

export const load = routeHandler.createLoadFunction({
  requireAuth: true,
  requiredRoles: ['admin'],
  redirectTo: '/login'
});
```

---

## 🤖 AI-Assisted Development

### Component & Route Generation

```bash
# Generate new component
npm run generate:component UserProfile --type=feature --with-test

# Generate route with authentication
npm run generate:route dashboard --auth --roles=user,admin --with-load

# Generate service
npm run generate:service analytics
```

### Figma → Svelte Workflow (Future Enhancement)

1. **Design in Figma** using SHADCN component library
   - Start from sketches or design references
   - Use AI (Claude API) to generate initial designs
   - UX team refines spacing, colors, interactions

2. **Export via Figma MCP** (when integrated)
   ```bash
   npm run export-svelte -- \
     --figma-url "https://figma.com/file/abc123" \
     --output "./src/routes/dashboard"
   ```

3. **Generated Output**
   - `+page.svelte` with your design
   - Custom composed components
   - Uses your 30 base SHADCN components
   - Type-safe with TypeScript

4. **Connect to API**
   - Add load functions for data fetching
   - Integrate with backend via API documentation
   - Use route generators for consistent patterns

---

## 🧪 Testing Philosophy

**"Test WHAT, Not HOW"** - Behavioral testing principles:

```typescript
// ✅ Good - Test behavior
test('user can log in with valid credentials', async () => {
  render(LoginPage);
  
  await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));
  
  expect(screen.getByText('Welcome back!')).toBeInTheDocument();
});

// ❌ Bad - Test implementation
test('signIn calls firebase.auth().signInWithEmailAndPassword', async () => {
  const spy = vi.spyOn(firebase.auth(), 'signInWithEmailAndPassword');
  await authService.signIn();
  expect(spy).toHaveBeenCalled();
});
```

### Test Commands

```bash
npm test                    # Run all 677 tests
npm run test:coverage       # Run with coverage report  
npm run test:watch          # Watch mode
npm run test:a11y           # Accessibility tests
npm run test:components     # Component tests only
npm run test:integration    # Integration tests
```

---

## ⚙️ Configuration

### Interactive Setup (Recommended)

```bash
npm run setup
```

The wizard will guide you through configuration and automatically:
- Generate your `.env` file
- Update `app.config.ts` with your values
- Validate Firebase configuration
- Test your setup

### Validation

```bash
npm run validate        # Full validation (includes build and tests)
npm run validate:quick  # Quick validation (skips slow checks)
```

The validator checks:
- ✅ Environment variables configured
- ✅ Firebase setup valid
- ✅ Dependencies installed
- ✅ Build succeeds
- ✅ Tests passing
- ⚠️ Warns about placeholder values

### Manual Configuration

All configuration lives in **one file**: `src/lib/config/app.config.ts`

```typescript
export const APP_CONFIG = {
  app: {
    name: import.meta.env.VITE_APP_NAME,
    domain: import.meta.env.VITE_APP_DOMAIN,
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL
  },
  
  firebase: {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    // ... other Firebase config
  },
  
  api: {
    baseUrl: {
      development: import.meta.env.VITE_API_BASE_URL_DEV,
      production: import.meta.env.VITE_API_BASE_URL_PROD,
    }
  },
  
  features: {
    authentication: true,
    emailVerification: true,
    phoneVerification: false,
    analytics: false,
  }
};
```

---

## 📊 Performance & Analytics

Built-in performance monitoring:

```typescript
import { performanceMonitor } from '$lib/utils/performance';

// Automatic Web Vitals tracking
performanceMonitor.recordMetric('api-response-time', 150);

// Bundle analysis
npm run analyze             # Generate bundle analysis report

// Performance audit
npm run perf:audit          # Lighthouse audit
```

---

## 🚀 Deployment

### Firebase Hosting (Recommended)

```bash
npm run build
firebase deploy --only hosting
```

Or use the deploy script:

```bash
npm run deploy
```

### Other Platforms

**Vercel:**
```bash
npm run build
# Connect repository for automatic deployments
```

**Netlify:**
```bash
npm run build
# Drag and drop `build/` folder or connect repository
```

**Docker:**
```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

See [__docs__/deployment-guide.md](__docs__/deployment-guide.md) for comprehensive deployment documentation.

---

## 🔧 Development Tools

```bash
# Code quality
npm run lint              # ESLint
npm run typecheck         # TypeScript check
npm run format            # Prettier formatting

# Testing
npm test                  # All tests
npm run test:coverage     # Coverage report
npm run test:watch        # Watch mode

# Performance
npm run analyze           # Bundle analysis
npm run perf:audit        # Performance audit

# Setup & Validation
npm run setup             # Interactive setup wizard ⭐
npm run validate          # Validate configuration ⭐

# Generators
npm run generate:component <name>  # Generate component
npm run generate:route <path>      # Generate route
npm run generate:service <name>    # Generate service

# Build
npm run build             # Production build
npm run preview           # Preview build
```

---

## 📚 Documentation

### For Developers
- **[Quick Start Guide](__docs__/quick-start.md)**: Get started in minutes
- **[Configuration Guide](__docs__/configuration.md)**: Detailed configuration options
- **[API Documentation](src/lib/docs/api-documentation.md)**: Complete service API reference
- **[Component Interfaces](src/lib/docs/component-interfaces.md)**: TypeScript interfaces for all components
- **[Production Readiness Checklist](__docs__/production-readiness-checklist.md)**: Pre-deployment validation
- **[Deployment Guide](__docs__/deployment-guide.md)**: CI/CD and hosting setup

### For AI Systems
- **[AI Patterns](src/lib/docs/ai-patterns.md)**: AI-specific development patterns and examples
- **Consistent Imports**: All components from `$lib/components/ui`, config from `$lib/config/app.config`
- **Type Exports**: All interfaces exported for AI code generation
- **Predictable Structure**: Follow established patterns for reliable generation

---

## 🎯 AI Integration Patterns

### Quick Customization via Setup Wizard

```bash
npm run setup
# Answer 6 questions, wizard handles the rest
```

### Finding Customization Points

```bash
# Find all customization points
grep -r "FIXME:" src/lib/config/

# Common patterns for AI systems
import { APP_CONFIG } from '$lib/config/app.config';
import { Button, Card } from '$lib/components/ui';
import { authService } from '$lib/services/auth';
```

### Component Generation Pattern

```svelte
<!-- AI-friendly component pattern -->
<script lang="ts">
  import { Button, Card, CardContent, CardHeader } from '$lib/components/ui';
  
  export let title: string;
  export let onSave: () => void;
</script>

<Card>
  <CardHeader>{title}</CardHeader>
  <CardContent>
    <slot />
    <Button on:click={onSave}>Save</Button>
  </CardContent>
</Card>
```

---

## 📊 Project Status

- **677 Tests Passing**: Comprehensive test coverage ✅
- **100% TypeScript**: Strict mode with full type safety ✅
- **WCAG Level AA**: Accessibility compliance verified ✅
- **Production Ready**: Deployment infrastructure complete ✅
- **30+ Components**: Complete SHADCN atomic design system ✅
- **3-Minute Setup**: Interactive wizard for rapid onboarding ✅

---

## 🤝 Contributing

1. Follow existing patterns and conventions
2. Add tests for new functionality (behavioral testing principles)
3. Update documentation for any new features
4. Ensure accessibility compliance
5. Run full test suite before submitting (`npm run validate`)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/xbg-solutions/boilerplate_frontend/issues)
- **Discussions**: Community support via [GitHub Discussions](https://github.com/xbg-solutions/boilerplate_frontend/discussions)
- **Documentation**: Comprehensive docs in `__docs__/` and `src/lib/docs/`
- **Website**: [https://xbg.solutions](https://xbg.solutions)

---

**Built with ❤️ by [XBG Solutions](https://xbg.solutions) for rapid MVP development and AI-assisted coding**

*Ready to build your next project? Run `npm run setup` and start coding!*