#!/usr/bin/env node

/**
 * Component Generator
 * 
 * Generates a new Svelte component with TypeScript support, tests, and documentation.
 * 
 * Usage:
 *   node __scripts__/generate-component.js <ComponentName> [options]
 *   npm run generate:component <ComponentName> [options]
 * 
 * Options:
 *   --path <path>       Custom path (default: src/lib/components/ui)
 *   --type <type>       Component type: ui|page|layout|feature (default: ui)
 *   --with-test         Generate test file
 *   --with-story        Generate Storybook story
 *   --with-docs         Generate documentation
 * 
 * Examples:
 *   node __scripts__/generate-component.js UserProfile --type=feature --with-test
 *   node __scripts__/generate-component.js Button --path=src/lib/components/custom
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const componentName = args[0];

if (!componentName) {
  console.error('❌ Component name is required!');
  console.log('Usage: node __scripts__/generate-component.js <ComponentName> [options]');
  process.exit(1);
}

// Parse options
const options = {
  path: 'src/lib/components/ui',
  type: 'ui',
  withTest: false,
  withStory: false,
  withDocs: false
};

args.slice(1).forEach(arg => {
  if (arg.startsWith('--path=')) {
    options.path = arg.split('=')[1];
  } else if (arg.startsWith('--type=')) {
    options.type = arg.split('=')[1];
  } else if (arg === '--with-test') {
    options.withTest = true;
  } else if (arg === '--with-story') {
    options.withStory = true;
  } else if (arg === '--with-docs') {
    options.withDocs = true;
  }
});

// Validate component name
if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
  console.error('❌ Component name must be PascalCase (e.g., UserProfile, DataTable)');
  process.exit(1);
}

// Generate file names
const kebabName = componentName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const componentDir = path.join(options.path, kebabName);
const componentFile = path.join(componentDir, `${componentName}.svelte`);
const indexFile = path.join(componentDir, 'index.ts');
const testFile = path.join(componentDir, `${componentName}.test.ts`);
const storyFile = path.join(componentDir, `${componentName}.stories.ts`);
const docFile = path.join(componentDir, `${componentName}.md`);

// Create directory
if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true });
}

// Generate component template based on type
function generateComponentTemplate() {
  const camelName = componentName.charAt(0).toLowerCase() + componentName.slice(1);
  const templates = {
    ui: `<script lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';
  import { cn } from '$lib/utils/cn';

  const ${camelName}Variants = tv({
    base: 'rounded-lg border transition-colors',
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
      },
      size: {
        sm: 'p-2 text-sm',
        md: 'p-4 text-base',
        lg: 'p-6 text-lg',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  });

  type Variant = VariantProps<typeof ${camelName}Variants>['variant'];
  type Size = VariantProps<typeof ${camelName}Variants>['size'];

  let className: string = '';
  export let variant: Variant = 'default';
  export let size: Size = 'md';
  export { className as class };

  $: classes = cn(${camelName}Variants({ variant, size }), className);
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>`,

    page: `<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  
  // Page data and state
  let loading = false;
  let error: string | null = null;
  
  // Authentication
  const user = authService.getUser();
  const claims = authService.getUserClaims();
  
  onMount(() => {
    loadData();
  });
  
  async function loadData() {
    loading = true;
    error = null;
    
    try {
      // Load page data
    } catch (err) {
      error = 'Failed to load data';
      console.error('${componentName} error:', err);
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>${componentName}</title>
  <meta name="description" content="${componentName} page" />
</svelte:head>

<div class="container mx-auto py-6">
  <div class="mb-6">
    <h1 class="text-3xl font-bold">${componentName}</h1>
    <p class="text-gray-600">Page description goes here</p>
  </div>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  {:else if error}
    <Card>
      <CardContent class="p-6">
        <p class="text-red-600">{error}</p>
        <Button on:click={loadData} variant="outline" class="mt-4">
          Try Again
        </Button>
      </CardContent>
    </Card>
  {:else}
    <Card>
      <CardHeader>
        <CardTitle>Content</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Your page content goes here.</p>
      </CardContent>
    </Card>
  {/if}
</div>`,

    layout: `<script lang="ts">
  import { page } from '$app/stores';
  import { authService } from '$lib/services/auth';
  import { Button } from '$lib/components/ui/button';
  
  // Layout props
  export let title: string = '';
  export let showHeader: boolean = true;
  export let showSidebar: boolean = true;
  
  const user = authService.getUser();
</script>

<div class="min-h-screen bg-gray-50">
  {#if showHeader}
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold">{title || '${componentName}'}</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            {#if $user}
              <span class="text-sm text-gray-600">Welcome, {$user.email}</span>
              <Button variant="outline" size="sm" on:click={() => authService.logout()}>
                Logout
              </Button>
            {:else}
              <Button href="/login" size="sm">
                Login
              </Button>
            {/if}
          </div>
        </div>
      </div>
    </header>
  {/if}
  
  <div class="flex">
    {#if showSidebar}
      <aside class="w-64 bg-white shadow-sm min-h-screen">
        <nav class="p-4">
          <div class="space-y-2">
            <a href="/dashboard" class="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
              Dashboard
            </a>
            <!-- Add more navigation items -->
          </div>
        </nav>
      </aside>
    {/if}
    
    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</div>`,

    feature: `<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { apiService } from '$lib/services/api';
  import { toastService } from '$lib/services/toast';
  import { normalizeError } from '$lib/utils/error-handler';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '$lib/components/ui/card';

  // Props
  export let data: any = null;
  export let readonly: boolean = false;

  // Events
  const dispatch = createEventDispatcher<{
    save: { data: any };
    delete: { id: string };
    cancel: void;
  }>();

  // State
  let loading = false;
  let error: string | null = null;
  let formData = data ? { ...data } : {};
  
  $: hasChanges = JSON.stringify(formData) !== JSON.stringify(data);

  onMount(() => {
    if (data?.id) {
      loadData();
    }
  });

  async function loadData() {
    if (!data?.id) return;

    loading = true;
    error = null;

    try {
      const response = await apiService.get(\`/api/items/\${data.id}\`);
      formData = response.data;
    } catch (err) {
      error = normalizeError(err).message;
    } finally {
      loading = false;
    }
  }

  async function handleSave() {
    if (readonly) return;

    loading = true;
    error = null;

    try {
      const response = data?.id
        ? await apiService.put(\`/api/items/\${data.id}\`, formData)
        : await apiService.post('/api/items', formData);

      dispatch('save', { data: response.data });
      toastService.success(\`${componentName} saved successfully\`);
    } catch (err) {
      error = normalizeError(err).message;
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    if (readonly || !data?.id) return;

    if (!confirm('Are you sure you want to delete this item?')) return;

    loading = true;
    error = null;

    try {
      await apiService.delete(\`/api/items/\${data.id}\`);
      dispatch('delete', { id: data.id });
      toastService.success(\`${componentName} deleted successfully\`);
    } catch (err) {
      error = normalizeError(err).message;
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    if (hasChanges && !confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }
    formData = data ? { ...data } : {};
    dispatch('cancel');
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>{data?.id ? 'Edit' : 'Create'} ${componentName}</CardTitle>
  </CardHeader>

  <CardContent>
    {#if error}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-red-600 text-sm">{error}</p>
      </div>
    {/if}

    <!-- Form fields go here -->
    <div class="space-y-4">
      <p class="text-gray-500">Add your form fields here</p>
    </div>
  </CardContent>

  {#if !readonly}
    <CardFooter class="flex justify-between">
      <div>
        {#if data?.id}
          <Button variant="destructive" on:click={handleDelete} disabled={loading}>
            Delete
          </Button>
        {/if}
      </div>

      <div class="flex space-x-2">
        <Button variant="outline" on:click={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button on:click={handleSave} disabled={loading || !hasChanges}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </CardFooter>
  {/if}
</Card>`
  };

  return templates[options.type] || templates.ui;
}

// Generate index file
function generateIndexTemplate() {
  return `export { default as ${componentName} } from './${componentName}.svelte';
export type { ComponentProps as ${componentName}Props } from './${componentName}.svelte';`;
}

// Generate test file
function generateTestTemplate() {
  return `import { render, fireEvent, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import ${componentName} from './${componentName}.svelte';

test('renders ${componentName} correctly', () => {
  render(${componentName});
  
  // Add your test assertions here
  expect(screen.getByRole('generic')).toBeInTheDocument();
});

test('handles props correctly', () => {
  const props = {
    // Add test props
  };
  
  render(${componentName}, { props });
  
  // Test prop handling
});

test('emits events correctly', async () => {
  const { component } = render(${componentName});
  
  const handleEvent = vi.fn();
  component.$on('event', handleEvent);
  
  // Trigger event and test
  // await fireEvent.click(screen.getByRole('button'));
  // expect(handleEvent).toHaveBeenCalledWith(expect.objectContaining({
  //   detail: expectedData
  // }));
});

test('handles accessibility requirements', () => {
  render(${componentName});
  
  // Test keyboard navigation
  // Test screen reader compatibility
  // Test focus management
});`;
}

// Generate Storybook story
function generateStoryTemplate() {
  return `import type { Meta, StoryObj } from '@storybook/svelte';
import ${componentName} from './${componentName}.svelte';

const meta: Meta<${componentName}> = {
  title: 'Components/${options.type}/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${componentName} component description.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    // Define argTypes for Storybook controls
  }
};

export default meta;
type Story = StoryObj<meta>;

export const Default: Story = {
  args: {
    // Default props
  }
};

export const Variants: Story = {
  args: {
    // Variant props
  }
};

export const Interactive: Story = {
  args: {
    // Interactive props
  },
  play: async ({ canvasElement }) => {
    // Interaction testing
  }
};`;
}

// Generate documentation
function generateDocTemplate() {
  return `# ${componentName}

${componentName} component description.

## Usage

\`\`\`svelte
<script>
  import { ${componentName} } from '$lib/components/${options.path.replace('src/lib/components/', '')}/${kebabName}';
</script>

<${componentName}>
  Content goes here
</${componentName}>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`class\` | \`string\` | \`undefined\` | Additional CSS classes |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| \`click\` | \`MouseEvent\` | Fired when component is clicked |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| default | - | Main content slot |

## Examples

### Basic Usage

\`\`\`svelte
<${componentName}>
  Hello World
</${componentName}>
\`\`\`

### With Props

\`\`\`svelte
<${componentName} variant="primary" size="lg">
  Large Primary Component
</${componentName}>
\`\`\`

## Accessibility

- Follows WAI-ARIA guidelines
- Supports keyboard navigation
- Compatible with screen readers

## Styling

This component uses Tailwind CSS classes and can be customized using the \`class\` prop or by modifying the component's default styles.`;
}

// Write files
try {
  console.log(`🚀 Generating ${componentName} component...`);
  
  // Write main component file
  fs.writeFileSync(componentFile, generateComponentTemplate());
  console.log(`✅ Created ${componentFile}`);
  
  // Write index file
  fs.writeFileSync(indexFile, generateIndexTemplate());
  console.log(`✅ Created ${indexFile}`);
  
  // Write test file if requested
  if (options.withTest) {
    fs.writeFileSync(testFile, generateTestTemplate());
    console.log(`✅ Created ${testFile}`);
  }
  
  // Write story file if requested
  if (options.withStory) {
    fs.writeFileSync(storyFile, generateStoryTemplate());
    console.log(`✅ Created ${storyFile}`);
  }
  
  // Write documentation if requested
  if (options.withDocs) {
    fs.writeFileSync(docFile, generateDocTemplate());
    console.log(`✅ Created ${docFile}`);
  }
  
  console.log(`\n🎉 ${componentName} component generated successfully!`);
  console.log(`\n📁 Files created in: ${componentDir}`);
  console.log(`\n📖 Import your component:`);
  console.log(`   import { ${componentName} } from '$lib/components/${options.path.replace('src/lib/components/', '')}/${kebabName}';`);
  
  if (options.withTest) {
    console.log(`\n🧪 Run tests:`);
    console.log(`   npm test ${testFile}`);
  }
  
} catch (error) {
  console.error('❌ Error generating component:', error.message);
  process.exit(1);
}