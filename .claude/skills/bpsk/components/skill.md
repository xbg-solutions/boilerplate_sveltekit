# BPSK — Components & Blocks

**Skill: `bpsk/components`**

Three-tier component system: basic atoms (agent-coded), extended atoms (registry), and blocks (registry).

---

## Three-Tier Component Model

### Tier 1: Basic Atoms — Agent-coded

Simple shadcn-style components that agents code directly following the Svelte 5 runes + `tv()` + `cn()` pattern. These are NOT in the registry.

**Basic atoms:** Button, Card (+ CardHeader, CardContent, CardTitle, CardDescription, CardFooter), Input, Label, Badge, Checkbox, RadioGroup (+ RadioGroupItem), Sheet, Tabs (+ TabsList, TabsTrigger, TabsContent), Table (+ TableHeader, TableBody, TableRow, TableHead, TableCell), DropdownMenu (+ DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator), Breadcrumb (+ BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator), Alert (+ AlertTitle, AlertDescription), Progress, Textarea, Popover, Pagination, Avatar, Separator, Skeleton.

### Tier 2: Extended Atoms — From Registry

Complex components with significant custom logic. Install via:

```bash
npx xbg-frontend add otp-input calendar select statistic-card
```

Copies source into `src/lib/components/ui/<name>/`. You own the code — customize freely.

### Tier 3: Blocks — From Registry

Full page-level compositions assembled from atoms. Install via:

```bash
npx xbg-frontend add block-auth block-dashboard block-sidebar
```

Copies all variants for a category into `src/lib/components/blocks/<category>/`.

---

## Installing Components

```bash
# Add specific extended atoms
npx xbg-frontend add otp-input calendar

# Add block categories (copies all variants)
npx xbg-frontend add block-auth block-dashboard block-hero-section

# Add advanced components
npx xbg-frontend add chart-wrapper data-table form-wizard

# Non-interactive (for agents — auto-accept prompts)
npx xbg-frontend add block-auth block-dashboard --yes

# Overwrite existing
npx xbg-frontend add block-auth --force

# List all available components
npx xbg-frontend add list
```

The `add` command:
- Resolves dependencies (blocks that need extended atoms)
- Warns about missing basic atoms (you code those yourself)
- Ensures `src/lib/utils/cn.ts` exists
- Copies `.svelte` + `index.ts` files to the correct paths
- Updates barrel exports

---

## Extended Atom Inventory

| Name | Component | Key Features |
|---|---|---|
| `otp-input` | `OtpInput` | Multi-digit code entry, auto-focus, paste handling |
| `calendar` | `Calendar` | Date picker grid, month navigation, selection binding |
| `select` | `Select` | Dropdown with keyboard nav, size variants, form integration |
| `dialog` | `Dialog` + sub-components | Modal with focus trap, scroll lock, escape handling |
| `statistic-card` | `StatisticCard` | Dashboard metric display with change indicator |
| `user-item` | `UserItem` | Avatar + name + email row |
| `notification-badge` | `NotificationBadge` | Circular count badge |
| `sidebar-item` | `SidebarItem` | Nav item with state variants, notification badge |
| `nav` | `NavItem` | Icon navigation with 4 state variants |
| `menu` | `MenuItem` | Menu item with direction variants |
| `message` | `Message` | Message list item with sender/subject/preview |
| `legend` | `Legend` | Chart legend with colored dots |
| `settings-card` | `SettingsCard` | Settings form card wrapper |
| `text-editor` | `TextEditor` | Rich text area with toolbar snippet |
| `uploader` | `Uploader` | Drag-and-drop file upload |
| `icon` | `BrandIcon`, `DynamicIcon` | SVG brand logos, Lucide icon wrapper |

### Advanced Components

| Name | Component | Key Features |
|---|---|---|
| `chart-wrapper` | `ChartWrapper` | Multiple chart types, responsive |
| `data-table` | `DataTable` | Sorting, filtering, pagination (644 lines) |
| `form-wizard` | `FormWizard` | Multi-step form with validation (545 lines) |
| `image-upload` | `ImageUpload` | Image upload with preview, cropping (662 lines) |

---

## Block Inventory

Blocks come in numbered variants (01, 02, 03...) representing different layouts for the same purpose.

| Category | Command | Variants | Purpose |
|---|---|---|---|
| `block-auth` | `npx xbg-frontend add block-auth` | LoginBlock01-05, SignupBlock01-05, OtpBlock01-05, AuthSplitScreen | Authentication pages |
| `block-dashboard` | `npx xbg-frontend add block-dashboard` | DashboardBlock01-07, ChartsBlock01 | Dashboard layouts |
| `block-sidebar` | `npx xbg-frontend add block-sidebar` | SidebarLayout01-15 | Sidebar navigation |
| `block-calendar` | `npx xbg-frontend add block-calendar` | CalendarBlock01-32 | Calendar/date views |
| `block-hero-section` | `npx xbg-frontend add block-hero-section` | HeroSection variants | Landing page heroes |
| `block-pricing-section` | `npx xbg-frontend add block-pricing-section` | PricingSection variants | Pricing tables |
| `block-testimonials` | `npx xbg-frontend add block-testimonials` | Testimonials01-07 | Social proof sections |
| `block-team-section` | `npx xbg-frontend add block-team-section` | TeamSection01-04 | Team member displays |
| `block-feature-section` | `npx xbg-frontend add block-feature-section` | FeatureSection variants | Feature showcases |
| `block-faq-section` | `npx xbg-frontend add block-faq-section` | FAQSection variants | FAQ accordions |
| `block-footer` | `npx xbg-frontend add block-footer` | Footer variants | Page footers |
| `block-navbar` | `npx xbg-frontend add block-navbar` | Navbar variants | Navigation bars |
| `block-cta` | `npx xbg-frontend add block-cta` | CTA variants | Call-to-action sections |
| `block-contact-section` | `npx xbg-frontend add block-contact-section` | ContactSection variants | Contact forms |
| `block-blog-section` | `npx xbg-frontend add block-blog-section` | BlogSection variants | Blog layouts |
| `block-stats-section` | `npx xbg-frontend add block-stats-section` | StatsSection01-07 | Statistics displays |
| `block-forms` | `npx xbg-frontend add block-forms` | SettingsBlock | Settings/forms pages |
| `block-tasks` | `npx xbg-frontend add block-tasks` | TasksBlock | Task list with filters |
| `block-mail` | `npx xbg-frontend add block-mail` | Mail variants | Email client layouts |
| `block-music` | `npx xbg-frontend add block-music` | MusicBlock | Media app layout |
| `block-playground` | `npx xbg-frontend add block-playground` | PlaygroundBlock01-02 | AI playground layouts |
| `block-sign-in` | `npx xbg-frontend add block-sign-in` | SignIn variants | Sign-in pages |
| `block-sign-up` | `npx xbg-frontend add block-sign-up` | SignUp variants | Sign-up pages |
| `block-cart` | `npx xbg-frontend add block-cart` | Cart variants | Shopping cart |
| `block-checkout` | `npx xbg-frontend add block-checkout` | Checkout variants | Checkout flows |
| `block-product-card` | `npx xbg-frontend add block-product-card` | ProductCard variants | Product displays |
| `block-product-detail` | `npx xbg-frontend add block-product-detail` | ProductDetail variants | Product pages |
| `block-product-listing` | `npx xbg-frontend add block-product-listing` | ProductListing variants | Product grids |
| `block-bento-grid` | `npx xbg-frontend add block-bento-grid` | BentoGrid variants | Bento grid layouts |
| `block-gallery-section` | `npx xbg-frontend add block-gallery-section` | GallerySection variants | Image galleries |
| `block-banner` | `npx xbg-frontend add block-banner` | Banner variants | Announcement banners |
| `block-comparison-section` | `npx xbg-frontend add block-comparison-section` | ComparisonSection variants | Feature comparisons |

Run `npx xbg-frontend add list` to see all available components with current variant counts.

---

## Import Patterns

### After adding components

```typescript
// From barrel export
import { Button, Card, CardContent, Input, Label } from '$lib/components/ui';

// From specific component directory
import { OtpInput } from '$lib/components/ui/otp-input';
import { StatisticCard } from '$lib/components/ui/statistic-card';

// Blocks — from master barrel
import { LoginBlock01, DashboardBlock02 } from '$lib/components/blocks';

// Blocks — from category barrel
import { LoginBlock01, SignupBlock01 } from '$blocks/auth';
import { DashboardBlock01 } from '$blocks/dashboard';

// Direct import
import LoginBlock01 from '$lib/components/blocks/auth/LoginBlock01.svelte';
```

---

## Coding Basic Atoms

When coding basic atoms yourself, follow this template:

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tv, type VariantProps } from 'tailwind-variants';
  import { cn } from '$lib/utils/cn';

  const myComponentVariants = tv({
    base: 'inline-flex items-center justify-center rounded-md text-sm font-medium',
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  });

  type MyVariants = VariantProps<typeof myComponentVariants>;

  let {
    variant = 'default',
    size = 'default',
    class: className = '',
    children,
    ...rest
  }: {
    variant?: MyVariants['variant'];
    size?: MyVariants['size'];
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  } = $props();

  let classes = $derived(cn(myComponentVariants({ variant, size }), className));
</script>

<div class={classes} {...rest}>
  {@render children?.()}
</div>
```

### Required conventions:
- `$props()` destructuring with TypeScript types
- `tailwind-variants` (`tv`) for variant styling
- `cn()` from `$lib/utils/cn` for class merging
- `{...rest}` spread for extensibility
- `{@render children?.()}` with `Snippet` type for content projection
- `onclick` event handlers (not `on:click`)
- `$derived()` for computed values
- `$bindable()` for two-way bindable props

---

## Using Blocks

Blocks accept data via props and callback props. They do NOT own business logic.

```svelte
<script lang="ts">
  import { LoginBlock01 } from '$lib/components/blocks';
  import { authService } from '$lib/services/auth';

  async function handleLogin(detail: { email: string; password: string }) {
    await authService.signIn(detail.email, detail.password);
  }
</script>

<LoginBlock01
  onSubmit={handleLogin}
  onGoogleLogin={() => authService.signInWithGoogle()}
  onForgotPassword={() => goto('/forgot-password')}
  onSignUp={() => goto('/signup')}
/>
```

---

## Common Anti-Patterns

| Don't | Do |
|---|---|
| Rebuild components that are in the registry | `npx xbg-frontend add <name>` |
| Modify atomic components inside blocks | Import and compose atomic components |
| Hardcode data in blocks | Pass data via props |
| Put business logic in blocks | Handle callbacks in parent, call services |
| Import blocks for atomic needs | Use atomic components directly |
| Use `export let` / `<slot />` / `on:click` (Svelte 4) | Use `$props()` / `{@render}` / `onclick` (Svelte 5) |
| Use `createEventDispatcher` | Use callback props (`onSubmit`, `onChange`, etc.) |
| Use `$$restProps` | Use `{...rest}` from `$props()` destructuring |
| Import `cn` from `@xbg.solutions/frontend-core` in components | Import from `$lib/utils/cn` |
