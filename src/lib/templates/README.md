# Layout Templates

Reusable layout templates for common page patterns. Designed to work with the shadcn-svelte component system.

## Available Templates

### DashboardLayout.svelte

Responsive dashboard with sidebar navigation. For admin panels and data-heavy apps.

```svelte
<script>
  import { DashboardLayout } from '$lib/templates';

  const navigation = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Users', href: '/users', icon: Users, badge: '12' },
  ];
  const user = { name: 'John Doe', email: 'john@example.com' };
</script>

<DashboardLayout {navigation} {user} notificationCount={5}>
  {#snippet header()}
    <h1>Page Title</h1>
  {/snippet}
  {#snippet headerActions()}
    <Button>Action</Button>
  {/snippet}

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Dashboard content -->
  </div>
</DashboardLayout>
```

**Props:** `navigation` (array), `user` (object), `showNotifications` (boolean), `notificationCount` (number)
**Snippets:** `children`, `header`, `headerActions`

---

### FormLayout.svelte

Centered form layout with optional sidebar. For auth pages, settings, data entry.

```svelte
<script>
  import { FormLayout } from '$lib/templates';
  import { Button, Input, Label } from '$lib/components/ui';
</script>

<FormLayout title="Sign In" description="Welcome back" showSidebar={true} maxWidth="lg">
  {#snippet form()}
    <form class="space-y-6">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" type="email" bind:value={email} />
      </div>
      <Button type="submit" class="w-full">Sign In</Button>
    </form>
  {/snippet}
  {#snippet sidebar()}
    <h3>Welcome back!</h3>
  {/snippet}
  {#snippet formFooter()}
    <a href="/signup">Don't have an account?</a>
  {/snippet}
</FormLayout>
```

**Props:** `title`, `description`, `showSidebar`, `sidebarWidth`, `maxWidth`, `centered`, `showLogo`, `logoSrc`, `logoAlt`, `backgroundColor`
**Snippets:** `form`, `sidebar`, `formFooter`, `footer`, `loading`

---

### ContentLayout.svelte

Content-focused layout for articles and documentation. Supports breadcrumbs, author metadata, and sidebar.

```svelte
<script>
  import { ContentLayout } from '$lib/templates';

  const author = { name: 'Jane Smith', bio: 'Senior Developer' };
  const tags = ['SvelteKit', 'TypeScript'];
</script>

<ContentLayout
  title="Building Scalable SvelteKit Applications"
  showBreadcrumbs={true}
  showSidebar={true}
  showMeta={true}
  {author}
  publishDate="2024-10-02"
  readTime="12 min read"
  {tags}
>
  {#snippet sidebar()}
    <nav><a href="#intro">Introduction</a></nav>
  {/snippet}

  <h2 id="intro">Introduction</h2>
  <p>Content here...</p>
</ContentLayout>
```

**Props:** `title`, `subtitle`, `showBreadcrumbs`, `breadcrumbs`, `showSidebar`, `sidebarPosition`, `maxWidth`, `showMeta`, `publishDate`, `readTime`, `tags`, `author`
**Snippets:** `children`, `actions`, `sidebar`, `footer`

---

## Usage Notes

- All templates use **Svelte 5 snippets** for content projection (`{#snippet}` / `{@render}`)
- Templates compose atomic components from `$lib/components/ui`
- Mobile-first responsive design with Tailwind breakpoints
- Uses the shadcn color system (`--primary`, `--secondary`, etc.)
- All interactive elements are keyboard accessible (WCAG AA)
