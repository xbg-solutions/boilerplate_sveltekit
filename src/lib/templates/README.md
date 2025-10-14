# Layout Templates

This directory contains reusable layout templates for common page patterns in the SvelteKit boilerplate. These templates are designed to work seamlessly with the SHADCN-Svelte component system and provide consistent, accessible layouts.

## Available Templates

### 1. DashboardLayout.svelte

A responsive dashboard layout with sidebar navigation, perfect for admin panels and data-heavy applications.

**Features:**
- Responsive sidebar that collapses on mobile
- Active navigation state management  
- User profile section
- Notification support
- Customizable navigation items

**Usage:**
```svelte
<script>
  import { DashboardLayout } from '$lib/templates';
  
  const navigation = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Users', href: '/users', icon: Users, badge: '12' },
    { label: 'Settings', href: '/settings', icon: Settings }
  ];
  
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatars/john.jpg'
  };
</script>

<DashboardLayout {navigation} {user} notificationCount={5}>
  <h1 slot="header">Page Title</h1>
  <div slot="header-actions">
    <Button>Action</Button>
  </div>
  
  <!-- Main page content -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Dashboard widgets -->
  </div>
</DashboardLayout>
```

**Props:**
- `navigation`: Array of navigation items with `label`, `href`, optional `icon` and `badge`
- `user`: User object with `name`, `email`, optional `avatar`
- `showNotifications`: Boolean to show/hide notification bell
- `notificationCount`: Number of unread notifications

**Slots:**
- `default`: Main content area
- `header`: Page title/header content
- `header-actions`: Action buttons in the header

---

### 2. FormLayout.svelte

A centered form layout with optional sidebar, ideal for authentication pages, settings forms, and data entry.

**Features:**
- Responsive design with optional sidebar
- Multiple layout configurations
- Logo support
- Customizable backgrounds
- Form validation styling support

**Usage:**
```svelte
<script>
  import { FormLayout } from '$lib/templates';
  import { Button, Input, Label, Card } from '$lib/components/ui';
  
  let email = '';
  let password = '';
</script>

<FormLayout 
  title="Sign In" 
  description="Welcome back to your account"
  showSidebar={true}
  maxWidth="lg"
>
  <form slot="form" class="space-y-6">
    <div class="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" bind:value={email} />
    </div>
    
    <div class="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" bind:value={password} />
    </div>
    
    <Button type="submit" className="w-full">Sign In</Button>
  </form>
  
  <div slot="sidebar">
    <h3>Welcome back!</h3>
    <p>Access your dashboard and manage your account.</p>
  </div>
  
  <div slot="form-footer">
    <a href="/signup" class="text-primary hover:underline">
      Don't have an account? Sign up
    </a>
  </div>
</FormLayout>
```

**Props:**
- `title`: Form title
- `description`: Form description/subtitle
- `showSidebar`: Boolean to show sidebar
- `sidebarWidth`: Sidebar width (`sm`, `md`, `lg`)
- `maxWidth`: Maximum form width (`sm`, `md`, `lg`, `xl`, `2xl`)
- `centered`: Whether to center the form vertically
- `showLogo`: Show logo at top of form
- `logoSrc`: Logo image source
- `logoAlt`: Logo alt text
- `backgroundColor`: Background style (`white`, `gray`, `gradient`)

**Slots:**
- `form`: Main form content
- `sidebar`: Sidebar content (when `showSidebar={true}`)
- `form-footer`: Content below the form
- `footer`: Content below the card
- `loading`: Loading overlay

---

### 3. ContentLayout.svelte

A content-focused layout for articles, documentation, and long-form content with optional sidebar and metadata.

**Features:**
- Responsive typography with prose styling
- Automatic breadcrumb generation
- Author and metadata support
- Table of contents sidebar
- Flexible content width
- SEO-optimized structure

**Usage:**
```svelte
<script>
  import { ContentLayout } from '$lib/templates';
  
  const author = {
    name: 'Jane Smith',
    avatar: '/avatars/jane.jpg',
    bio: 'Senior Developer'
  };
  
  const tags = ['SvelteKit', 'TypeScript', 'Components'];
</script>

<ContentLayout
  title="Building Scalable SvelteKit Applications"
  subtitle="A comprehensive guide to architecture and best practices"
  showBreadcrumbs={true}
  showSidebar={true}
  showMeta={true}
  {author}
  publishDate="2024-10-02"
  readTime="12 min read"
  {tags}
  maxWidth="4xl"
>
  <div slot="actions">
    <Button variant="outline" size="sm">Share</Button>
    <Button variant="outline" size="sm">Bookmark</Button>
  </div>
  
  <div slot="sidebar">
    <Card className="p-6">
      <h3 class="font-semibold mb-4">Table of Contents</h3>
      <nav class="space-y-2">
        <a href="#introduction">Introduction</a>
        <a href="#architecture">Architecture</a>
        <a href="#components">Components</a>
      </nav>
    </Card>
  </div>
  
  <!-- Main content -->
  <h2 id="introduction">Introduction</h2>
  <p>This article covers the essential patterns for building scalable SvelteKit applications...</p>
  
  <h2 id="architecture">Architecture</h2>
  <p>Let's explore the recommended project structure...</p>
</ContentLayout>
```

**Props:**
- `title`: Page/article title
- `subtitle`: Page description
- `showBreadcrumbs`: Auto-generate breadcrumbs from route
- `breadcrumbs`: Custom breadcrumb array
- `showSidebar`: Show sidebar
- `sidebarPosition`: Sidebar position (`left`, `right`)
- `maxWidth`: Content max width (`sm` to `6xl`, `full`)
- `showMeta`: Show author/date metadata
- `publishDate`: Publication date (ISO string)
- `readTime`: Estimated read time
- `tags`: Array of tag strings
- `author`: Author object with `name`, optional `avatar` and `bio`

**Slots:**
- `default`: Main content area
- `actions`: Header action buttons
- `sidebar`: Sidebar content
- `footer`: Footer content

---

## Styling Guidelines

### Responsive Design

All templates use a mobile-first approach with Tailwind CSS breakpoints:

```css
/* Mobile first, then enhance */
.template-class {
  @apply px-4 py-6;                    /* Mobile */
  @apply sm:px-6 sm:py-8;              /* Small screens (640px+) */
  @apply md:px-8 md:py-12;             /* Medium screens (768px+) */
  @apply lg:px-12 lg:py-16;            /* Large screens (1024px+) */
}
```

### Color System

Templates use the SHADCN color system:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 98%;
  --muted: 210 40% 96%;
  --border: 214.3 31.8% 91.4%;
}
```

### Typography

Content layouts include prose styling for optimal readability:

```css
.prose {
  line-height: 1.75;
  font-size: 1rem;
}

.prose h1 { font-size: 1.875rem; }
.prose h2 { font-size: 1.5rem; }
.prose h3 { font-size: 1.25rem; }
```

## Accessibility Features

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order maintained
- Skip links available where appropriate

### Screen Reader Support
- Proper heading hierarchy
- ARIA labels and descriptions
- Landmark regions for navigation

### Color Contrast
- All text meets WCAG AA contrast requirements
- Focus indicators are clearly visible
- Color is not the only means of conveying information

## Customization

### Theme Variables

Override CSS custom properties to customize appearance:

```css
:root {
  --primary: 210 100% 50%;        /* Custom blue */
  --radius: 0.75rem;              /* Larger border radius */
}
```

### Component Variants

Create template variants by extending the base templates:

```svelte
<!-- CustomDashboard.svelte -->
<script>
  import { DashboardLayout } from '$lib/templates';
  // Custom logic
</script>

<DashboardLayout {navigation} {user} class="custom-dashboard">
  <!-- Custom content -->
</DashboardLayout>

<style>
  :global(.custom-dashboard) {
    /* Custom styles */
  }
</style>
```

### Slot Customization

Templates are designed to be flexible through slots:

```svelte
<FormLayout>
  <form slot="form">
    <!-- Replace entire form section -->
  </form>
  
  <CustomSidebar slot="sidebar" />
  
  <div slot="footer">
    <!-- Custom footer content -->
  </div>
</FormLayout>
```

## Integration with Figma Tools

These templates are optimized for code generation from Figma designs:

### Design Token Mapping
- Layout templates map to Figma auto-layout frames
- Spacing uses consistent 8px grid system
- Colors reference CSS custom properties

### Component Recognition
- Templates use standard SHADCN components
- Layout patterns follow predictable structures
- Responsive breakpoints align with common design systems

### Code Generation Guidelines
1. **Identify Layout Pattern**: Match Figma frame to template type
2. **Extract Content**: Map text, images, and interactive elements
3. **Configure Props**: Set template props based on design requirements
4. **Generate Slots**: Create slot content from design sections
5. **Apply Responsive Rules**: Use Tailwind classes for responsive behavior

## Best Practices

### Performance
- Use lazy loading for heavy content
- Implement proper code splitting
- Optimize images and assets

### SEO
- Include proper meta tags
- Use semantic HTML structure
- Implement structured data where appropriate

### Maintenance
- Keep templates focused on layout, not business logic
- Use TypeScript for prop validation
- Document customization patterns
- Test across different devices and browsers

---

## Contributing

When adding new templates:

1. Follow the existing naming convention
2. Include comprehensive TypeScript types
3. Add responsive behavior
4. Ensure accessibility compliance
5. Update this README with usage examples
6. Add to the main template index file

## Resources

- [SHADCN-Svelte Components](../components/ui/)
- [Component API Reference](../../__docs__/component-api-reference.md)
- [Figma Integration Guide](../../__docs__/figma-tool-integration.md)