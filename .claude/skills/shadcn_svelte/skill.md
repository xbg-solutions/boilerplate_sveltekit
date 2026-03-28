# shadcn-svelte Component Library

**Skill: `shadcn_svelte`**

Expert guidance for shadcn-svelte, a Svelte 5 port of shadcn/ui. Beautifully designed, accessible components built with Bits UI and Tailwind CSS.

**Source:** [antstanley/shadcn-svelte-skill](https://github.com/antstanley/shadcn-svelte-skill) — Covers 59 components, installation, theming, dark mode, forms, data tables, migration guides, and custom registries.

---

## When to Use This Skill

- Adding new shadcn-svelte components to the project
- Implementing forms with Superforms + Formsnap
- Setting up dark mode with mode-watcher
- Creating data tables with TanStack Table
- Theming with Tailwind CSS v4 and OKLCH colors
- Migrating from Svelte 4 or Tailwind v3
- Building custom component registries

---

## Quick Start

### Adding Components

```bash
# Initialize (already done in this boilerplate)
pnpm dlx shadcn-svelte@latest init

# Add individual components
pnpm dlx shadcn-svelte@latest add button card dialog
```

### Basic Usage

Components use namespace imports for compound components and named imports for simple ones:

```svelte
<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>Content here</Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card.Root>
```

---

## Import Patterns

### This Boilerplate's Convention

This project uses barrel imports from `$lib/components/ui`. All components use Svelte 5 runes syntax (`$props()`, `{@render}`, `$derived()`, etc.):

```typescript
// Preferred in this project — barrel import
import { Button, Card, CardContent, Input } from '$lib/components/ui';
```

### Standard shadcn-svelte Convention

When adding new components or working outside the barrel:

```svelte
<!-- Compound components (most components) -->
<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
</script>

<!-- Single/simple components -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
</script>
```

---

## Form Implementation (Superforms + Formsnap)

```svelte
<script lang="ts">
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { superForm } from "sveltekit-superforms";

  let { data } = $props();
  const form = superForm(data.form);
</script>

<form method="POST" use:form.enhance>
  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <Input {...props} type="email" />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Button type="submit">Submit</Button>
</form>
```

---

## Dark Mode

### Setup

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
</script>

<ModeWatcher />
{@render children()}
```

### Toggle

```typescript
import { toggleMode, setMode, resetMode } from "mode-watcher";

toggleMode();        // Toggle light/dark
setMode("dark");     // Force dark
setMode("light");    // Force light
resetMode();         // Reset to system preference
```

---

## Available Components (59)

**Layout:** Card, Dialog, Drawer, Sheet, Collapsible, Resizable, Scroll Area, Separator, Sidebar, Tabs, Aspect Ratio

**Forms:** Button, Input, Textarea, Checkbox, Radio Group, Select, Native Select, Switch, Slider, Toggle, Toggle Group, Input OTP, Input Group, Button Group, Field, Form, Label, Combobox

**Data Display:** Table, Data Table, Badge, Avatar, Calendar, Range Calendar, Date Picker, Hover Card, Tooltip, Progress, Skeleton, Spinner, Chart, Carousel, Pagination, Typography, Empty, Item, Kbd

**Navigation:** Breadcrumb, Command, Context Menu, Dropdown Menu, Menubar, Navigation Menu, Popover

**Feedback:** Alert, Alert Dialog, Sonner (toast)

### Finding Component Documentation

For any component, the source skill has detailed docs at `references/components/[name].md`:
- Button → `references/components/button.md`
- Dialog → `references/components/dialog.md`
- Data Table → `references/components/data-table.md`
- Form → `references/components/form.md`

---

## Theming

shadcn-svelte uses Tailwind CSS v4 with OKLCH color system. Theme customization is done via CSS variables.

For detailed theming guidance, consult the source skill's `references/theming.md`.

---

## Common Tasks Reference

| Task | How |
|---|---|
| Add a component | `pnpm dlx shadcn-svelte@latest add [name]` |
| Form validation | Superforms + Formsnap pattern (see above) |
| Data tables | TanStack Table + shadcn Table components |
| Theming/colors | CSS variables with OKLCH in Tailwind v4 |
| Dark mode | mode-watcher (see above) |
| Custom registry | See source skill `references/registry/getting-started.md` |

---

## Migration Notes

### Svelte 5 Migration

- Slots replaced by snippets: `{#snippet children()}...{/snippet}`
- `$:` reactive declarations replaced by `$derived()` and `$effect()`
- Props via `$props()` instead of `export let`

### Tailwind v4 Migration

- New OKLCH color system
- CSS-first configuration
- Updated dark mode handling

For detailed migration guidance, consult the source skill's `references/migration/svelte-5.md` and `references/migration/tailwind-v4.md`.
