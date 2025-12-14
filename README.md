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
- **Agentic Development**: Constrained, opinionated architecture that railroads AI agents into one-shot success
- **AI-Assisted Development**: Consistent patterns and comprehensive documentation optimized for AI code generation
- **Rapid MVP Development**: 3-minute interactive setup wizard and 30+ ready-to-use atomic components
- **Design-to-Code Pipeline**: Optimized for Figma → AI → Svelte workflows with SHADCN components
- **Production Readiness**: 871 passing tests, accessibility compliance, and deployment infrastructure
- **Backend Integration**: Works standalone or pairs with [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend) for full-stack MVPs
- **Developer Experience**: Type-safe, well-documented, and following modern best practices

### The Agentic Development Workflow

```
1. Requirements Input       →  2. Agent Development    →  3. Deploy
   (MoSCoW + Figma/Designs)     (Constrained patterns)      (Production-ready)
   ↓                            ↓                           ↓
   • User journeys              • Update config             • 871 tests pass
   • Figma designs              • Build with SHADCN         • Accessibility ✓
   • API specs/Postman          • Connect backend           • Type-safe ✓
   • Feature requirements       • Generate tests            • Deploy!
```

**Designed for one-shot success**: Opinionated constraints guide AI agents to production-ready code without human intervention.

---

## ✨ Key Features

### Core Stack
- **SvelteKit 5**: Latest version with modern runes and enhanced SSR
- **TypeScript**: Strict mode enabled with comprehensive type definitions
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **SHADCN-Svelte**: 30+ accessible, customizable UI components
- **Firebase**: Authentication, hosting, and backend integration
- **Vitest**: Modern testing framework with 677 passing tests

### Agentic & AI-Optimized Architecture
- **Constrained by Design**: Opinionated architecture that railroads agents into best practices
- **Interactive Setup Wizard**: 3-minute configuration with automatic validation
- **Single Configuration File**: Edit one file (`src/lib/config/app.config.ts`) to customize everything
- **Atomic Components Only**: 30 SHADCN components for composition (no opinionated page layouts)
- **Consistent Import Patterns**: Standardized imports from `$lib/components/ui` and `$lib/config/app.config`
- **Agent-Specific Documentation**: [Agentic Development Guide](mcp/frontend/guides/agentic-development.md) for AI systems
- **Decision Trees**: Built-in guardrails eliminate ambiguity for one-shot success
- **Predictable Structure**: SHADCN component patterns for reliable code generation
- **Backend Integration**: Accepts Postman collections or direct API access (mono-repo)

### Production Features
- **871 Passing Tests**: Comprehensive behavioral testing with @testing-library/svelte (see [Testing Guide](mcp/frontend/guides/testing.md))
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

## 💡 Core Philosophy: Constrained for Agentic Success

### Atomic Components, Not Opinionated Pages

**What We Provide:**
- **30 SHADCN atomic components**: Button, Card, Input, Dialog, etc.
- **Authentication & routing**: Firebase auth, protected routes, role-based access
- **Testing infrastructure**: Behavioral test patterns, 871 passing tests
- **Backend integration**: Postman collection import, API client utilities
- **Type-safe APIs**: Full TypeScript with strict mode
- **Deployment pipelines**: CI/CD, multiple hosting options

**What We DON'T Provide:**
- ❌ Pre-built dashboards, user profiles, admin panels
- ❌ Opinionated page structures or layouts
- ❌ Complex composed components

**Why This Constraint?**

In **agentic development workflows**, AI agents:
1. **Receive requirements** (MoSCoW, Figma designs, API specs)
2. **Compose atomic components** into features using constrained patterns
3. **Generate production code** with one-shot success

**Constraints = Guardrails = Success**

By limiting choices, we:
- Eliminate decision paralysis for agents
- Ensure consistent, maintainable code
- Enable reliable, predictable code generation
- Accelerate from requirements to production

**Pairs with [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend)** for full-stack agentic development.

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
mcp/frontend/                      # MCP Knowledge Base (comprehensive documentation)
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

See [deployment-guide.md](mcp/frontend/guides/deployment.md) for comprehensive deployment documentation.

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
- **[Getting Started](mcp/frontend/overview/getting-started.md)**: Comprehensive setup and first feature guide ⭐ NEW
- **[Quick Start Guide](mcp/frontend/overview/quick-start.md)**: Get started in 15 minutes
- **[Testing Guide](mcp/frontend/guides/testing.md)**: Testing philosophy and 871-test suite details ⭐ NEW
- **[Configuration Guide](mcp/frontend/guides/configuration.md)**: Detailed configuration options
- **[API Documentation](mcp/frontend/api/api-documentation.md)**: Complete service API reference
- **[Component Interfaces](mcp/frontend/api/component-interfaces.md)**: TypeScript interfaces for all components
- **[Deployment Guide](mcp/frontend/guides/deployment.md)**: CI/CD and hosting setup
- **[Patterns Guide](mcp/frontend/guides/patterns.md)**: Development patterns and best practices

### For AI Agents
- **[Agentic Development Guide](mcp/frontend/guides/agentic-development.md)**: Complete agent workflow patterns ⭐ NEW
- **[MCP Knowledge Base](mcp/frontend/README.md)**: Query via Model Context Protocol ⭐ NEW
- **Consistent Imports**: All components from `$lib/components/ui`, config from `$lib/config/app.config`
- **Decision Trees**: Built-in guardrails for routing, components, imports, and testing
- **Type Exports**: All interfaces exported for AI code generation
- **Predictable Structure**: Follow established patterns for reliable generation

### MCP Integration
- **MCP Server**: Access comprehensive documentation via Model Context Protocol
- **Configuration**: `https://xbg.solutions/mcp/config.json`
- **Tools Available**: Query services, utilities, stores, components, and guides
- **78 Documentation Files**: Complete knowledge base for AI coding tools and agentic developers
- **Categories**: Services (14), Utilities (21), Stores (17), Components (81+)

### Backend Integration
- **[boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend)**: Companion backend boilerplate
- **Postman Integration**: Import API collections for automatic service generation
- **Mono-repo Support**: Direct backend access for full-stack development

---

## 🎯 AI Integration Patterns

### Using the MCP Knowledge Base

AI agents can query the comprehensive documentation via Model Context Protocol:

```typescript
// Example: Query service documentation
const authDocs = await mcpClient.callTool('get_service_docs', {
  service: 'auth'
});

// Example: Query utility documentation
const errorHandlerDocs = await mcpClient.callTool('get_utility_docs', {
  utility: 'error-handler'
});

// Example: Search across documentation
const results = await mcpClient.callTool('search_documentation', {
  query: 'authentication',
  category: 'all'
});
```

**Available MCP Tools:**
- `get_project_overview` - High-level project overview
- `get_sveltekit_architecture` - Complete architecture documentation
- `get_service_docs` - Service-specific documentation (14 services)
- `get_utility_docs` - Utility-specific documentation (21 utilities)
- `get_store_docs` - Store-specific documentation (17 stores)
- `get_component_docs` - Component category documentation (81+ components)
- `get_api_reference` - API reference and TypeScript interfaces
- `search_documentation` - Search across all documentation

**MCP Configuration URL:** `https://xbg.solutions/mcp/config.json`

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

- **871 Tests Passing**: Comprehensive behavioral test coverage ✅
- **100% TypeScript**: Strict mode with full type safety ✅
- **WCAG Level AA**: Accessibility compliance verified ✅
- **Production Ready**: Deployment infrastructure complete ✅
- **30+ Components**: Complete SHADCN atomic design system ✅
- **3-Minute Setup**: Interactive wizard for rapid onboarding ✅
- **Agentic Workflows**: Built-in guardrails for AI agent development ✅
- **Backend Compatible**: Pairs with [boilerplate_backend](https://github.com/xbg-solutions/boilerplate_backend) ✅

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
- **Documentation**: Comprehensive docs in `mcp/frontend/` (MCP Knowledge Base)
- **Website**: [https://xbg.solutions](https://xbg.solutions)

---

**Built with ❤️ by [XBG Solutions](https://xbg.solutions) for rapid MVP development and AI-assisted coding**

If this project helps you, please consider buying us a beer or two!
https://xbg.solutions/donations

---
