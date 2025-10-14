# 🎨 Component Library Reference

The boilerplate includes 30+ pre-built, accessible components using SHADCN-Svelte.

## Import Patterns

```typescript
// Individual component imports (recommended)
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Card } from '$lib/components/ui/card';

// Use in your Svelte components
```

## Form Components

### Button

Versatile button component with multiple variants.

```svelte
<script>
  import { Button } from '$lib/components/ui/button';
</script>

<!-- Basic usage -->
<Button>Click me</Button>

<!-- Variants -->
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<!-- Sizes -->
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

<!-- States -->
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>

<!-- With icons -->
<Button>
  <Plus class="w-4 h-4 mr-2" />
  Add Item
</Button>
```

### Input

Text input with validation and styling.

```svelte
<script>
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  
  let email = '';
  let hasError = false;
</script>

<!-- Basic input -->
<Label for="email">Email</Label>
<Input 
  id="email" 
  type="email" 
  placeholder="Enter your email"
  bind:value={email}
/>

<!-- Input with validation -->
<Input 
  bind:value={email}
  type="email"
  placeholder="Email"
  class={hasError ? 'border-red-500' : ''}
  required
/>

<!-- Input with different types -->
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="Age" />
<Input type="tel" placeholder="Phone" />
```

### Textarea

Multi-line text input.

```svelte
<script>
  import { Textarea } from '$lib/components/ui/textarea';
  
  let message = '';
</script>

<Textarea 
  placeholder="Enter your message..."
  bind:value={message}
  rows={4}
/>
```

### Select

Dropdown selection component.

```svelte
<script>
  import { Select } from '$lib/components/ui/select';
  
  let selected = '';
  
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];
</script>

<Select 
  bind:value={selected}
  placeholder="Choose an option"
>
  {#each options as option}
    <option value={option.value}>{option.label}</option>
  {/each}
</Select>
```

### Checkbox

Checkbox input with label.

```svelte
<script>
  import { Checkbox } from '$lib/components/ui/checkbox';
  
  let accepted = false;
</script>

<div class="flex items-center space-x-2">
  <Checkbox id="terms" bind:checked={accepted} />
  <Label for="terms">Accept terms and conditions</Label>
</div>
```

## Layout Components

### Card

Container for content with consistent styling.

```svelte
<script>
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
</script>

<Card class="w-96">
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
    <CardDescription>Manage your account settings</CardDescription>
  </CardHeader>
  
  <CardContent>
    <p>Your profile information goes here.</p>
  </CardContent>
  
  <CardFooter>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

### Dialog

Modal dialog component.

```svelte
<script>
  import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  
  let open = false;
</script>

<Dialog bind:open>
  <DialogTrigger asChild let:builder>
    <Button builders={[builder]}>Open Dialog</Button>
  </DialogTrigger>
  
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to proceed?
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex justify-end gap-2">
      <Button variant="outline" on:click={() => open = false}>Cancel</Button>
      <Button on:click={() => open = false}>Confirm</Button>
    </div>
  </DialogContent>
</Dialog>
```

### Sheet

Slide-out panel component.

```svelte
<script>
  import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '$lib/components/ui/sheet';
  import { Button } from '$lib/components/ui/button';
</script>

<Sheet>
  <SheetTrigger asChild let:builder>
    <Button builders={[builder]}>Open Sheet</Button>
  </SheetTrigger>
  
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Settings</SheetTitle>
      <SheetDescription>
        Manage your account settings here.
      </SheetDescription>
    </SheetHeader>
    
    <!-- Sheet content -->
  </SheetContent>
</Sheet>
```

### Tabs

Tabbed interface component.

```svelte
<script>
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
</script>

<Tabs value="profile" class="w-full">
  <TabsList class="grid w-full grid-cols-3">
    <TabsTrigger value="profile">Profile</TabsTrigger>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  
  <TabsContent value="profile">
    <p>Profile settings content</p>
  </TabsContent>
  
  <TabsContent value="account">
    <p>Account settings content</p>
  </TabsContent>
  
  <TabsContent value="password">
    <p>Password settings content</p>
  </TabsContent>
</Tabs>
```

## Navigation Components

### Breadcrumb

Navigation breadcrumb component.

```svelte
<script>
  import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '$lib/components/ui/breadcrumb';
</script>

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/products">Products</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <span>Current Page</span>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Pagination

Pagination component for data tables.

```svelte
<script>
  import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '$lib/components/ui/pagination';
  
  let currentPage = 1;
  let totalPages = 10;
</script>

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="?page={currentPage - 1}" />
    </PaginationItem>
    
    {#each Array(totalPages) as _, i}
      <PaginationItem>
        <PaginationLink 
          href="?page={i + 1}"
          isActive={currentPage === i + 1}
        >
          {i + 1}
        </PaginationLink>
      </PaginationItem>
    {/each}
    
    <PaginationItem>
      <PaginationNext href="?page={currentPage + 1}" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

## Feedback Components

### Toast

Notification toast system.

```svelte
<script>
  import { toast } from '$lib/services/toast';
  import { Button } from '$lib/components/ui/button';
  
  function showSuccessToast() {
    toast.success('Operation completed successfully!');
  }
  
  function showErrorToast() {
    toast.error('Something went wrong!');
  }
  
  function showInfoToast() {
    toast.info('Here is some information.');
  }
</script>

<div class="space-x-2">
  <Button on:click={showSuccessToast}>Success</Button>
  <Button on:click={showErrorToast}>Error</Button>
  <Button on:click={showInfoToast}>Info</Button>
</div>

<!-- Toast container (add to your layout) -->
<Toaster />
```

### Alert

Alert message component.

```svelte
<script>
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import { AlertTriangle, CheckCircle, Info } from 'lucide-svelte';
</script>

<!-- Success alert -->
<Alert variant="default">
  <CheckCircle class="h-4 w-4" />
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Your changes have been saved successfully.
  </AlertDescription>
</Alert>

<!-- Warning alert -->
<Alert variant="destructive">
  <AlertTriangle class="h-4 w-4" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    This action cannot be undone.
  </AlertDescription>
</Alert>
```

### Progress

Progress indicator component.

```svelte
<script>
  import { Progress } from '$lib/components/ui/progress';
  
  let progress = 60;
</script>

<div class="w-full">
  <Progress value={progress} class="w-full" />
  <p class="text-sm text-gray-500 mt-2">{progress}% complete</p>
</div>
```

## Data Display Components

### Table

Data table component.

```svelte
<script>
  import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];
</script>

<Table>
  <TableCaption>A list of users in your system</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each users as user}
      <TableRow>
        <TableCell class="font-medium">{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.role}</TableCell>
      </TableRow>
    {/each}
  </TableBody>
</Table>
```

### Badge

Badge component for status indicators.

```svelte
<script>
  import { Badge } from '$lib/components/ui/badge';
</script>

<!-- Different variants -->
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>

<!-- Status indicators -->
<Badge variant="default" class="bg-green-500">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Inactive</Badge>
```

### Avatar

User avatar component.

```svelte
<script>
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
</script>

<!-- Avatar with image -->
<Avatar>
  <AvatarImage src="https://example.com/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

<!-- Avatar with initials fallback -->
<Avatar>
  <AvatarFallback>AB</AvatarFallback>
</Avatar>
```

## Advanced Components

### Command

Command palette component.

```svelte
<script>
  import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '$lib/components/ui/command';
</script>

<Command>
  <CommandInput placeholder="Type a command..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Actions">
      <CommandItem>Create New</CommandItem>
      <CommandItem>Edit</CommandItem>
      <CommandItem>Delete</CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem>Preferences</CommandItem>
      <CommandItem>Account</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

### Popover

Popover component for additional content.

```svelte
<script>
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
  import { Button } from '$lib/components/ui/button';
</script>

<Popover>
  <PopoverTrigger asChild let:builder>
    <Button builders={[builder]} variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div class="p-4">
      <h4 class="font-medium">Popover Title</h4>
      <p class="text-sm text-gray-600">
        Additional information or actions go here.
      </p>
    </div>
  </PopoverContent>
</Popover>
```

## Loading States

### Skeleton

Loading skeleton component.

```svelte
<script>
  import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<!-- Loading card skeleton -->
<div class="space-y-3">
  <Skeleton class="h-4 w-full" />
  <Skeleton class="h-4 w-4/5" />
  <Skeleton class="h-4 w-3/5" />
</div>

<!-- Avatar skeleton -->
<div class="flex items-center space-x-4">
  <Skeleton class="h-12 w-12 rounded-full" />
  <div class="space-y-2">
    <Skeleton class="h-4 w-[250px]" />
    <Skeleton class="h-4 w-[200px]" />
  </div>
</div>
```

## Styling Guidelines

### Custom CSS Classes

Add your custom component styles to `src/app.css`:

```css
/* Component variants */
.btn-gradient {
  @apply bg-gradient-to-r from-blue-500 to-purple-600 text-white;
}

.card-elevated {
  @apply shadow-lg border-0 bg-white dark:bg-gray-800;
}

/* Utility classes */
.text-brand {
  @apply text-blue-600 dark:text-blue-400;
}
```

### Theme Customization

Customize the theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

## Accessibility Features

All components include:
- ✅ Proper ARIA labels
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Color contrast compliance

## Best Practices

1. **Import only what you need** for better tree-shaking
2. **Use semantic HTML** elements when possible
3. **Test keyboard navigation** for all interactive elements
4. **Provide meaningful labels** for screen readers
5. **Handle loading and error states** gracefully

## Custom Components

To create custom components following the same patterns:

```svelte
<!-- src/lib/components/ui/my-component/MyComponent.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { ComponentProps } from 'svelte';
  
  type $$Props = ComponentProps<'div'> & {
    variant?: 'default' | 'special';
  };
  
  let className: $$Props['class'] = undefined;
  export { className as class };
  export let variant: $$Props['variant'] = 'default';
  
  const variants = {
    default: 'bg-white border',
    special: 'bg-blue-50 border-blue-200',
  };
</script>

<div 
  class={cn(
    'p-4 rounded-lg',
    variants[variant],
    className
  )}
  {...$$restProps}
>
  <slot />
</div>
```

---

This component library provides everything you need to build beautiful, accessible user interfaces. Focus on your business logic while these components handle the presentation layer!