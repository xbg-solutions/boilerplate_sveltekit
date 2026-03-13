# Svelte 5 & SvelteKit Development

**Skill: `svelte5_sveltekit`**

Comprehensive guidance for Svelte 5 runes, SvelteKit routing and data flow, and Tailwind CSS v4 integration.

**Sources (consult in priority order):**
1. **Primary:** [claude-skills/sveltekit-svelte5-tailwind-skill](https://github.com/claude-skills/sveltekit-svelte5-tailwind-skill) — SvelteKit 2 + Svelte 5 + Tailwind v4 integration with 24 guides covering setup, core concepts, forms, deployment, and troubleshooting
2. **Secondary:** [splinesreticulating/claude-svelte5-skill](https://github.com/splinesreticulating/claude-svelte5-skill) — Svelte 5 runes reference, SvelteKit routing, component patterns, and best practices
3. **Tertiary:** [spences10/svelte-claude-skills](https://github.com/spences10/svelte-claude-skills) — Svelte 5 runes (90% verified), SvelteKit data flow (95% verified), SvelteKit structure (92% verified). Note: archived in favor of [svelte-skills-kit](https://github.com/spences10/svelte-skills-kit)

---

## When to Use This Skill

- Writing Svelte 5 components with runes (`$state`, `$derived`, `$effect`, `$props`)
- Setting up SvelteKit routing, layouts, and load functions
- Implementing form actions and data flow patterns
- Integrating Tailwind CSS v4 with SvelteKit
- Migrating from Svelte 4 to Svelte 5
- Troubleshooting SSR, hydration, or HMR issues

---

## Svelte 5 Runes Quick Reference

### `$state` — Reactive State

```svelte
<script lang="ts">
  // Simple state
  let count = $state(0);

  // Object state (deep reactivity by default)
  let user = $state({ name: 'Alice', age: 30 });

  // Array state (deep reactivity)
  let items = $state<string[]>([]);

  // Raw state (no deep reactivity — use for large objects/arrays)
  let rawData = $state.raw(largeDataset);

  // Class with reactive fields
  class Counter {
    count = $state(0);
    doubled = $derived(this.count * 2);
    increment() { this.count++; }
  }
</script>

<button onclick={() => count++}>{count}</button>
```

### `$derived` — Computed Values

```svelte
<script lang="ts">
  let count = $state(0);

  // Simple derived
  let doubled = $derived(count * 2);

  // Complex derived (use .by() for multi-statement)
  let stats = $derived.by(() => {
    const total = items.reduce((a, b) => a + b, 0);
    return { total, average: total / items.length };
  });
</script>
```

**Svelte 5.25+ breaking change:** `$derived` values can now be reassigned (but recalculate when dependencies change). Use `const` for truly read-only derived values.

### `$effect` — Side Effects

```svelte
<script lang="ts">
  let count = $state(0);

  // Runs when dependencies change
  $effect(() => {
    console.log('count changed:', count);

    // Return cleanup function (optional)
    return () => {
      console.log('cleanup');
    };
  });

  // Pre-effect (runs before DOM updates)
  $effect.pre(() => {
    // scroll position adjustments, etc.
  });
</script>
```

**When NOT to use `$effect`:**
- Deriving values → use `$derived` instead
- Synchronizing state → use `$derived` instead
- One-time setup → use `onMount` instead

**Decision rule:** If you're setting state inside `$effect`, you probably want `$derived`.

### `$props` — Component Props

```svelte
<script lang="ts">
  // Basic props with defaults
  let { name, age = 25 }: { name: string; age?: number } = $props();

  // Rest props
  let { class: className, ...rest }: { class?: string; [key: string]: any } = $props();

  // With PageProps (SvelteKit)
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>
```

### `$bindable` — Two-Way Binding

```svelte
<!-- Parent -->
<Child bind:value={parentValue} />

<!-- Child.svelte -->
<script lang="ts">
  let { value = $bindable() }: { value: string } = $props();
</script>
<input bind:value />
```

---

## SvelteKit Routing

### File Structure

```
src/routes/
├── +page.svelte              # / (home page)
├── +page.ts                  # Universal load function
├── +page.server.ts           # Server-only load + form actions
├── +layout.svelte            # Root layout
├── +layout.ts                # Layout load function
├── +layout.server.ts         # Server layout load
├── +error.svelte             # Error boundary
├── +server.ts                # API endpoint (GET, POST, etc.)
├── about/
│   └── +page.svelte          # /about
├── posts/
│   ├── +page.svelte          # /posts
│   └── [id]/
│       └── +page.svelte      # /posts/:id (dynamic)
├── (auth)/                   # Layout group (no URL impact)
│   ├── +layout.svelte
│   ├── login/+page.svelte
│   └── register/+page.svelte
└── [...rest]/
    └── +page.svelte          # Catch-all route
```

### Load Functions

**Server load** (`+page.server.ts`) — for DB access, secrets, server-only APIs:
```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const user = await db.users.get(params.id);
  return { user }; // Must be JSON-serializable (no class instances)
};
```

**Universal load** (`+page.ts`) — runs on server AND client:
```typescript
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, fetch }) => {
  // `data` comes from server load (if both exist)
  const extra = await fetch('/api/extra');
  return { ...data, extra: await extra.json() };
};
```

**Key rule:** Server load data flows to universal load via the `data` parameter.

### Form Actions

Form actions ONLY live in `+page.server.ts`:

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email');

    if (!email) return fail(400, { email, missing: true });

    await updateEmail(String(email));
    throw redirect(303, '/success');  // ALWAYS throw redirect, never return
  }
};
```

**Critical rules:**
- ALWAYS `throw redirect()` and `throw error()` (not return)
- Form actions ONLY in `+page.server.ts`
- No class instances or functions from server load (not serializable)

---

## Svelte 5 Component Patterns

### Snippets (Replaces Slots)

```svelte
<!-- Parent -->
<Card>
  {#snippet header()}
    <h2>Title</h2>
  {/snippet}
  {#snippet default()}
    <p>Content</p>
  {/snippet}
</Card>

<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { header, children }: { header?: Snippet; children: Snippet } = $props();
</script>

<div class="card">
  {#if header}{@render header()}{/if}
  {@render children()}
</div>
```

### Conditional Rendering

```svelte
{#if condition}
  <p>True</p>
{:else if other}
  <p>Other</p>
{:else}
  <p>Fallback</p>
{/if}
```

### Lists with Keys

```svelte
{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}
```

### Async/Await (Svelte 5.36+)

```svelte
{#await fetchData()}
  <p>Loading...</p>
{:then data}
  <p>{data.name}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

---

## Tailwind CSS v4 Integration

### Critical Setup Note

The Tailwind plugin MUST come before the SvelteKit plugin in `vite.config.js`:

```javascript
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default {
  plugins: [
    tailwindcss(),  // MUST be first
    sveltekit()
  ]
};
```

### Environment Variables

```typescript
// Public (available in browser)
import { PUBLIC_API_URL } from '$env/static/public';

// Private (server-only)
import { DATABASE_URL } from '$env/static/private';

// Dynamic
import { env } from '$env/dynamic/public';
import { env } from '$env/dynamic/private';
```

---

## Common Issues & Quick Fixes

| Issue | Fix |
|---|---|
| CSS not loading | Ensure Tailwind plugin is before SvelteKit in vite config |
| Runes SSR errors | Guard browser APIs with `import { browser } from '$app/environment'` |
| Form state loss | Use `enhance` action for progressive enhancement |
| HMR breaking | Check for circular dependencies or improper `$effect` usage |
| Tailwind classes not working | Verify content paths in Tailwind config |
| `goto()` in load function | Use `throw redirect()` from `@sveltejs/kit` instead |
| Non-serializable data from server load | Only return plain objects, arrays, strings, numbers, booleans |

---

## Best Practices

1. **Prefer `$derived` over `$effect`** for computing values — if you're setting state inside an effect, refactor to derived
2. **Use `goto()` instead of `<a href>` for programmatic navigation** — especially with remote function calls
3. **Type components with `PageProps`/`LayoutProps`** from `./$types` for full type safety
4. **Always `throw` redirect/error** — never return them from load functions or actions
5. **Guard browser APIs** — wrap `window`, `localStorage`, `document` access in `browser` checks
6. **Server load for secrets, universal load for client APIs** — choose the right load function type
7. **Error boundaries above failing routes** — place `+error.svelte` in the parent directory
