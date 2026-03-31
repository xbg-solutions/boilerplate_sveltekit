# BPSK — Contributing to the Boilerplate

**Skill: `bpsk/contributing`**

How to extend the boilerplate itself — adding components, updating the registry, maintaining the component manifest, and evolving the CLI. This skill is for agents developing the boilerplate, not consuming it.

---

## Overview

The boilerplate has three main artifacts that must stay in sync:

1. **Source components** — `src/lib/components/` (the canonical implementations)
2. **CLI registry** — `packages/create-frontend/src/registry/` + `manifest.json` (what `npx @xbg.solutions/bpsk add` copies from)
3. **Component manifest** — `component-manifest/` (presentation layer consumed by the requirements platform via MCP)

When you add or modify components, all three must be updated.

---

## Adding a New Extended Atom

Extended atoms are complex UI primitives with significant logic (e.g., OtpInput, Calendar, DataTable). They live in the CLI registry and are installed via `npx @xbg.solutions/bpsk add <name>`.

### Step 1: Create the component

```
src/lib/components/ui/<name>/
├── <Name>.svelte      # The component
└── index.ts           # Barrel export
```

**Requirements:**
- Use Svelte 5 runes syntax (`$props()`, `$derived()`, `$effect()`, `$state()`, `$bindable()`)
- Import `cn` from `$lib/utils/cn` — **never** from `@xbg.solutions/bpsk-core`
- Use `tailwind-variants` (`tv`) for variant styling
- Accept `class` prop and spread `{...rest}` for extensibility
- Use `{@render children?.()}` with `Snippet` type for content projection
- Use callback props (`onSubmit`, `onChange`) not `createEventDispatcher`

**index.ts pattern:**
```typescript
export { default as <Name> } from './<Name>.svelte';
```

### Step 2: Add to barrel export

Edit `src/lib/components/ui/index.ts`:
```typescript
export { <Name> } from './<name>';
```

### Step 3: Decide: basic or extended?

| Criteria | Basic (agent-coded) | Extended (registry) |
|---|---|---|
| Lines of code | < 50 | > 50 |
| Custom logic | Minimal (just styling variants) | Significant (keyboard nav, state, focus management) |
| Dependencies | None beyond cn/tv | May compose other atoms |
| Customization | Heavily customized per project | Used mostly as-is |

If **basic**: stop here — agents code basic atoms themselves. Don't add to registry.

If **extended**: continue to step 4.

### Step 4: Update the registry

```bash
node packages/create-frontend/scripts/populate-registry.cjs
```

This script:
- Reads the extended atom list in its `BASIC_ATOMS` exclusion array
- If your new component directory isn't in `BASIC_ATOMS`, it copies it to `registry/atoms/<name>/`
- Regenerates `packages/create-frontend/src/manifest.json` with dependency analysis

**If your atom is new:** verify it's NOT in the `BASIC_ATOMS` array in `packages/create-frontend/scripts/populate-registry.cjs`. If it is, remove it.

### Step 5: Update the component manifest

```bash
# Add stub entry to component-meta.json (non-destructive)
npm run generate-manifest:update-meta --prefix packages/create-frontend

# Regenerate the full manifest
npm run generate-manifest --prefix packages/create-frontend
```

Then edit `packages/create-frontend/scripts/component-meta.json` to fill in:
- `title` — human-readable name
- `description` — what it does, when to use it
- `tags` — searchable keywords
- `figmaNodeId` — if there's a Figma design (from the shadcn-ui-kit Pro Blocks file)

### Step 6: Capture screenshots (optional)

```bash
npm run generate-manifest:images --prefix packages/create-frontend -- <FIGMA_ACCESS_TOKEN>
```

Only fetches images for components with a `figmaNodeId` in `component-meta.json`.

---

## Adding a New Block Category

Blocks are full page-level compositions. Each category has numbered variants (e.g., HeroSection01, HeroSection02, ...).

### Step 1: Create the block category

```
src/lib/components/blocks/<category>/
├── <Category>01.svelte
├── <Category>02.svelte
├── ...
└── index.ts
```

**Requirements:**
- Import `cn` from `$lib/utils/cn` — **never** from `@xbg.solutions/bpsk-core`
- Import atoms from `$lib/components/ui` (barrel) or `$lib/components/ui/<name>` (specific)
- Blocks do NOT own business logic — they accept data via props and emit via callback props
- Use Svelte 5 runes syntax throughout
- Each variant is a different layout for the same purpose

**index.ts pattern:**
```typescript
export { default as <Category>01 } from './<Category>01.svelte';
export { default as <Category>02 } from './<Category>02.svelte';
// ...
```

### Step 2: Add to blocks barrel export

Edit `src/lib/components/blocks/index.ts`:
```typescript
export * from './<category>';
```

### Step 3: Update the registry

```bash
node packages/create-frontend/scripts/populate-registry.cjs
```

The script auto-discovers all directories under `src/lib/components/blocks/` and copies them to `registry/blocks/<category>/`. The manifest key will be `block-<category>`.

### Step 4: Update the component manifest

```bash
npm run generate-manifest:update-meta --prefix packages/create-frontend
npm run generate-manifest --prefix packages/create-frontend
```

Fill in metadata in `component-meta.json` for each new variant.

---

## Adding New Block Variants to an Existing Category

To add e.g., `HeroSection08` to an existing `hero-section` category:

1. Create `src/lib/components/blocks/hero-section/HeroSection08.svelte`
2. Add export to `src/lib/components/blocks/hero-section/index.ts`
3. Run `node packages/create-frontend/scripts/populate-registry.cjs`
4. Run `npm run generate-manifest:update-meta --prefix packages/create-frontend`
5. Run `npm run generate-manifest --prefix packages/create-frontend`

---

## Adding an Advanced Component

Advanced components (ChartWrapper, DataTable, FormWizard, ImageUpload) live in `src/lib/components/advanced/`. Same process as extended atoms but the target is `registry/advanced/`.

---

## The Three Manifests

### 1. CLI Registry Manifest (`packages/create-frontend/src/manifest.json`)

**Purpose:** Tells the `npx @xbg.solutions/bpsk add` command what to copy and where.

**Generated by:** `node packages/create-frontend/scripts/populate-registry.cjs`

**Structure:**
```json
{
  "version": 1,
  "basicAtoms": ["button", "card", ...],
  "atoms": { "<name>": { "registryPath", "targetPath", "files", "dependencies" } },
  "advanced": { ... },
  "blocks": { "block-<category>": { ... } }
}
```

**When to regenerate:** After any change to components in `src/lib/components/`.

### 2. Component Presentation Manifest (`component-manifest/manifest.json`)

**Purpose:** Consumed by the XBG requirements platform (via MCP) to present components in a GUI for requirements gathering. Includes titles, descriptions, tags, Figma references, playground URLs, and thumbnail availability.

**Generated by:** `node packages/create-frontend/scripts/generate-component-manifest.cjs`

**Structure:**
```json
{
  "version": 1,
  "generatedAt": "...",
  "figmaFileKey": "...",
  "summary": { "atomGroups", "advancedComponents", "blockGroups", "totalVariants", "imagesAvailable" },
  "atoms": { "<name>": { "id", "category", "title", "description", "tags", "variants": [...] } },
  "advanced": { ... },
  "blocks": { ... }
}
```

Each variant includes: `id`, `name`, `title`, `description`, `tags`, `figmaNodeId`, `thumbnailUrl`, `thumbnailAvailable`, `playgroundUrl`.

**When to regenerate:** After adding components, or after editing `component-meta.json`.

### 3. Component Metadata (`packages/create-frontend/scripts/component-meta.json`)

**Purpose:** Human-curated metadata (titles, descriptions, tags, Figma node IDs) that enriches the auto-generated manifests.

**Edited by:** Humans or agents manually. The `--update-meta` flag adds stubs for missing components without overwriting existing entries.

**When to edit:** After adding new components, to provide meaningful descriptions and tags.

---

## The Component Manifest Assets

### `component-manifest/code/<category>/<Component>.json`

Per-component JSON with: `id`, `name`, `category`, `group`, `title`, `description`, `tags`, `source` (the .svelte source code), `imports` (parsed import statements), `figmaNodeId`, `playgroundUrl`.

Used by the requirements platform to show source code, understand dependencies, and generate implementation scaffolds/mocks.

### `component-manifest/images/<category>/<Component>.png`

Figma screenshots of each component. Fetched via the Figma API using node IDs from `component-meta.json`.

---

## Registry Scripts Reference

All scripts run from repo root:

| Command | What it does |
|---|---|
| `node packages/create-frontend/scripts/populate-registry.cjs` | Copy components from src → registry, regenerate CLI manifest |
| `npm run generate-manifest --prefix packages/create-frontend` | Regenerate `component-manifest/` from registry + meta |
| `npm run generate-manifest:update-meta --prefix packages/create-frontend` | Add stubs for new components to `component-meta.json` |
| `npm run generate-manifest:images --prefix packages/create-frontend -- <TOKEN>` | Fetch Figma screenshots for components with `figmaNodeId` |

### Full pipeline after adding components:

```bash
# 1. Populate the CLI registry from source
node packages/create-frontend/scripts/populate-registry.cjs

# 2. Add metadata stubs for new components
npm run generate-manifest:update-meta --prefix packages/create-frontend

# 3. Edit component-meta.json to fill in titles/descriptions/tags

# 4. Regenerate the presentation manifest
npm run generate-manifest --prefix packages/create-frontend

# 5. (Optional) Fetch Figma screenshots
npm run generate-manifest:images --prefix packages/create-frontend -- <FIGMA_TOKEN>
```

---

## Import Convention for Components

**Critical rule:** All components in `src/lib/components/` must use `$lib/` imports:

```typescript
// Correct — works when copied into consuming projects
import { cn } from '$lib/utils/cn';
import { Button, Card } from '$lib/components/ui';

// WRONG — breaks when copied to a consuming project
import { cn } from '@xbg.solutions/bpsk-core';
```

The `@xbg.solutions/bpsk-core` import is for runtime code (services, stores, types, utils) that consumers import from `node_modules`. Components are copy-on-install — they must use project-local `$lib/` paths.

---

## Classifying Components: Basic vs Extended

The `BASIC_ATOMS` array in `populate-registry.cjs` determines which atoms are excluded from the registry:

```javascript
const BASIC_ATOMS = [
  'button', 'card', 'input', 'label', 'badge', 'checkbox',
  'radio-group', 'sheet', 'tabs', 'table', 'dropdown-menu',
  'breadcrumb', 'alert', 'progress',
];
```

Loose files in `src/lib/components/ui/` (e.g., `Textarea.svelte`, `Avatar.svelte`) are also excluded.

Everything else in `src/lib/components/ui/<name>/` is treated as an extended atom and copied to the registry.

To reclassify a component: add or remove its directory name from `BASIC_ATOMS`, then re-run `populate-registry.cjs`.

---

## Common Mistakes When Contributing

| Mistake | Fix |
|---|---|
| Using `@xbg.solutions/bpsk-core` for `cn` in a component | Use `$lib/utils/cn` — components are copied to consuming projects |
| Forgetting to update barrel exports (index.ts) | Add export to `ui/index.ts` or `blocks/index.ts` |
| Forgetting to run populate-registry after adding components | Always run: `node packages/create-frontend/scripts/populate-registry.cjs` |
| Adding a block without updating component-meta.json | Run `--update-meta` to add stubs, then fill in metadata |
| Using Svelte 4 syntax in new components | Use Svelte 5 runes: `$props()`, `$derived()`, `{@render}`, `onclick` |
| Creating extended atoms with no real logic | If < 50 lines with just styling variants, it's a basic atom — don't registry it |
| Editing registry files directly | Edit source in `src/lib/components/`, then run populate-registry |
