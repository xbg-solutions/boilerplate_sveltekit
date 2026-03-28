# XBG Boilerplate SvelteKit — Components & Blocks

**Skill: `xbg_bpsk_components`**

Atomic UI components and pre-built page blocks. All are optional imports — consumers cherry-pick what they need.

---

## Architecture

Components are organized in two tiers:

1. **Atomic UI** (`$lib/components/ui/`) — Low-level building blocks (buttons, cards, inputs, etc.)
2. **Blocks** (`$lib/components/blocks/`) — Full page-level compositions assembled from atomic UI components

Blocks compose atomic components. Never duplicate atomic logic inside a block — import and use.

---

## Atomic UI Component Inventory

| Directory | Key Exports | Purpose |
|---|---|---|
| `ui/button` | `Button` | Primary action element with variants |
| `ui/card` | `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`, `CardFooter` | Content container |
| `ui/input` | `Input` | Text input field |
| `ui/label` | `Label` | Form label |
| `ui/badge` | `Badge` | Status/category indicator |
| `ui/checkbox` | `Checkbox` | Boolean toggle |
| `ui/radio-group` | `RadioGroup`, `RadioGroupItem` | Single-select option group |
| `ui/select` | `Select` | Dropdown select |
| `ui/dialog` | `Dialog`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` | Modal dialog |
| `ui/sheet` | `Sheet` | Slide-out panel |
| `ui/tabs` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Tab navigation |
| `ui/table` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | Data table |
| `ui/dropdown-menu` | `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`, `DropdownMenuSeparator` | Context menu |
| `ui/breadcrumb` | `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbSeparator` | Navigation breadcrumb |
| `ui/alert` | `Alert`, `AlertDescription`, `AlertTitle` | Alert message |
| `ui/progress` | `Progress` | Progress bar |
| `ui/nav` | `NavItem` | Icon navigation item with states |
| `ui/menu` | `MenuItem` | Menu navigation item (horizontal/vertical) |
| `ui/sidebar-item` | `SidebarItem` | Sidebar nav item with notification badge |
| `ui/statistic-card` | `StatisticCard` | Metric display card (value + change) |
| `ui/user-item` | `UserItem` | Avatar + name + email row |
| `ui/notification-badge` | `NotificationBadge` | Circular count badge |
| `ui/text-editor` | `TextEditor` | Rich text area with toolbar slot |
| `ui/uploader` | `Uploader` | File upload drop zone |
| `ui/settings-card` | `SettingsCard` | Settings form card wrapper |
| `ui/legend` | `Legend` | Chart legend |
| `ui/message` | `Message` | Message list item |
| `ui/otp-input` | `OtpInput` | Multi-digit OTP code entry |
| `ui/calendar` | `Calendar` | Date picker calendar grid |
| Loose files | `Textarea`, `Popover`, `Pagination`, `Avatar`, `Separator`, `Skeleton`, `AlertNew` | Additional atomic components |

### Import Pattern

```typescript
// Import from barrel
import { Button, Card, CardContent, Input, Label } from '$lib/components/ui';

// Import from specific component
import { StatisticCard } from '$lib/components/ui/statistic-card';
import { OtpInput } from '$lib/components/ui/otp-input';
```

### Component Conventions

Every atomic component follows:
- `tailwind-variants` (tv) for variant styling
- `cn()` from `$lib/utils/cn` for class merging
- `export let` props with TypeScript types
- `$$restProps` spread for extensibility
- `<slot />` for content projection
- `on:click` and other event forwarding

```svelte
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export let variant: 'default' | 'outline' = 'default';
  export { className as class };
</script>

<div class={cn('base-styles', className)} {...$$restProps}>
  <slot />
</div>
```

### Generating New Components

```bash
npm run generate:component -- MyComponent                                      # UI component (default)
npm run generate:component -- MyComponent --type=feature                       # Feature component
npm run generate:component -- MyComponent --type=page                          # Page component
npm run generate:component -- MyComponent --path=src/lib/components/blocks     # Custom path
npm run generate:component -- MyComponent --with-test                          # Include test file
npm run generate:component -- MyComponent --with-test --with-docs              # Test + docs
```

Generators produce starting-point templates following the boilerplate's conventions (`tailwind-variants`, `cn()`, `export let` props, `$$restProps`, `<slot />`). Customise the generated code to match your design spec -- generators are scaffolding, not final implementations.

---

## Block Inventory

Blocks are full page-level layouts. Import from `$lib/components/blocks` or `$blocks`.

| Category | Blocks | Purpose |
|---|---|---|
| `blocks/auth` | `LoginBlock01`–`05`, `SignupBlock01`–`05`, `OtpBlock01`–`05`, `AuthSplitScreen` | Authentication pages |
| `blocks/dashboard` | `DashboardBlock01`–`07`, `ChartsBlock01` | Dashboard layouts |
| `blocks/sidebar` | `SidebarLayout01`–`05` | Sidebar navigation layouts |
| `blocks/forms` | `SettingsBlock` | Settings/forms pages |
| `blocks/tasks` | `TasksBlock` | Task list with table + filters |
| `blocks/music` | `MusicBlock` | Media app layout |
| `blocks/playground` | `PlaygroundBlock01`–`02` | AI playground layouts |
| `blocks/calendar` | `CalendarBlock01`–`03` | Calendar/date picker pages |

### Import Pattern

```typescript
// From master barrel
import { LoginBlock01, DashboardBlock02 } from '$lib/components/blocks';

// From category barrel
import { LoginBlock01, SignupBlock01 } from '$blocks/auth';
import { DashboardBlock01 } from '$blocks/dashboard';

// Direct import
import LoginBlock01 from '$lib/components/blocks/auth/LoginBlock01.svelte';
```

### Using Blocks

Blocks accept data via props and emit events. They do NOT own business logic.

```svelte
<script lang="ts">
  import { LoginBlock01 } from '$lib/components/blocks';
  import { authService } from '$lib/services/auth';

  async function handleLogin(e) {
    const { email, password } = e.detail;
    await authService.signIn(email, password);
  }
</script>

<LoginBlock01
  on:submit={handleLogin}
  on:googleLogin={() => authService.signInWithGoogle()}
  on:forgotPassword={() => goto('/forgot-password')}
  on:signUp={() => goto('/signup')}
/>
```

### Block Variants

Many blocks come in numbered variants (01, 02, 03...) representing different layouts for the same purpose:

- **Login 01**: Simple centered card
- **Login 02**: With "OR CONTINUE WITH" divider
- **Login 03**: Minimal email-only
- **Login 04**: With phone number option
- **Login 05**: Alternative footer layout

Choose the variant that fits your design. All variants accept the same core props.

---

## Auth Blocks Detail

### LoginBlock01–05
```typescript
Props: onSubmit?, onGoogleLogin?, onForgotPassword?, onSignUp?, class?
Events: submit, googleLogin, forgotPassword, signUp
```

### SignupBlock01–05
```typescript
Props: onSubmit?, onGoogleSignup?, onSignIn?, class?
Events: submit, googleSignup, signIn
```

### OtpBlock01–05
```typescript
Props: onVerify?, onResend?, email?, class?
Events: verify, resend
```

### AuthSplitScreen
```typescript
Props: brandName?, brandLogo?, testimonialQuote?, testimonialAuthor?, class?
Slot: default (for auth form on right side)
```

---

## Dashboard Blocks Detail

### DashboardBlock01–07
```typescript
Props: stats? (array), transactions? (array), recentSales? (array), class?
Slots: chart (for chart rendering)
```

### ChartsBlock01
```typescript
Props: data? (metrics object), class?
Slots: multiple named slots for chart areas
```

---

## Common Anti-Patterns

| Don't | Do |
|---|---|
| Modify atomic components inside blocks | Import and compose atomic components |
| Hardcode data in blocks | Pass data via props |
| Put business logic in blocks | Handle events in parent, call services |
| Import blocks for atomic needs | Use atomic components directly |
| Create a new Button inside a block | `import { Button } from '$lib/components/ui'` |

---

## Figma Reference

All components and blocks are derived from the shadcn-ui-kit-for-Figma Pro Blocks library. To reference original designs:

```
// Use Figma MCP to get design context for any component
mcp__Figma__get_design_context({ nodeId: "15005:202990" }) // LoginBlock01
mcp__Figma__get_screenshot({ nodeId: "533:9413" })         // DashboardBlock01
```

Key Figma node IDs are documented in the plan file at `.claude/plans/`.
