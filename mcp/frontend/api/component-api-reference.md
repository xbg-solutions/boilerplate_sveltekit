# Component API Reference

**Purpose**: Authoritative reference for all SHADCN-Svelte components available in this boilerplate.  
**Audience**: Figma tool developers, AI code generators, human developers  
**Last Updated**: October 2025

---

## How to Use This Reference

Each component section includes:
1. **Import Statement** - Exact import syntax
2. **TypeScript Interface** - All available props
3. **Variants/Options** - Available configurations
4. **Usage Examples** - Minimal and complex usage
5. **Accessibility Notes** - ARIA requirements
6. **Common Patterns** - Typical use cases

**Central Import Path**: All components are available from `'$lib/components/ui'`

---

## Form Components

### Button

**Import**:
```typescript
import { Button } from '$lib/components/ui';
```

**Interface**:
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}
```

**Events**:
- `on:click` - Click handler
- Standard HTML button events

**Slots**:
- Default slot for button content

**Usage Examples**:

*Minimal*:
```svelte
<Button>Click me</Button>
```

*With variants*:
```svelte
<Button variant="destructive" size="lg">Delete Account</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

*With icons (using Lucide)*:
```svelte
<script>
  import { Plus } from 'lucide-svelte';
</script>

<Button>
  <Plus class="w-4 h-4 mr-2" />
  Add Item
</Button>
```

*Loading state*:
```svelte
<Button disabled={isLoading}>
  {#if isLoading}
    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
  {/if}
  Save Changes
</Button>
```

**Accessibility**:
- Supports all standard button ARIA attributes
- Automatically handles `aria-disabled` when disabled
- Focus management included

---

### Input

**Import**:
```typescript
import { Input } from '$lib/components/ui';
```

**Interface**:
```typescript
interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}
```

**Events**:
- `bind:value` - Two-way binding
- `on:input`, `on:change`, `on:focus`, `on:blur`

**Usage Examples**:

*Basic input*:
```svelte
<Input placeholder="Enter text..." bind:value={inputValue} />
```

*With Label*:
```svelte
<div class="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input type="email" placeholder="your@email.com" bind:value={email} />
</div>
```

*Sizes*:
```svelte
<Input size="sm" placeholder="Small input" />
<Input placeholder="Default input" />
<Input size="lg" placeholder="Large input" />
```

---

### Label

**Import**:
```typescript
import { Label } from '$lib/components/ui';
```

**Interface**:
```typescript
interface LabelProps {
  htmlFor?: string;
  className?: string;
}
```

**Usage Examples**:
```svelte
<Label htmlFor="username">Username</Label>
<Input id="username" bind:value={username} />
```

---

### Textarea

**Import**:
```typescript
import { Textarea } from '$lib/components/ui';
```

**Interface**:
```typescript
interface TextareaProps {
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}
```

**Usage Examples**:
```svelte
<Textarea 
  placeholder="Enter your message..." 
  bind:value={message} 
  rows={4} 
/>
```

---

### Checkbox

**Import**:
```typescript
import { Checkbox } from '$lib/components/ui';
```

**Interface**:
```typescript
interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
}
```

**Usage Examples**:
```svelte
<div class="flex items-center space-x-2">
  <Checkbox bind:checked={acceptTerms} />
  <Label htmlFor="terms">I agree to the terms and conditions</Label>
</div>
```

---

### RadioGroup & RadioGroupItem

**Import**:
```typescript
import { RadioGroup, RadioGroupItem } from '$lib/components/ui';
```

**Usage Examples**:
```svelte
<RadioGroup bind:value={selectedOption}>
  <div class="flex items-center space-x-2">
    <RadioGroupItem value="option1" />
    <Label htmlFor="option1">Option 1</Label>
  </div>
  <div class="flex items-center space-x-2">
    <RadioGroupItem value="option2" />
    <Label htmlFor="option2">Option 2</Label>
  </div>
</RadioGroup>
```

---

### Select

**Import**:
```typescript
import { Select } from '$lib/components/ui';
```

**Usage Examples**:
```svelte
<Select bind:value={selectedValue}>
  <option value="">Select an option</option>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</Select>
```

---

## Layout Components

### Card

**Import**:
```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui';
```

**Interface**:
```typescript
interface CardProps {
  className?: string;
}
```

**Usage Examples**:

*Basic card*:
```svelte
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
</Card>
```

*With footer*:
```svelte
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
  </CardHeader>
  <CardContent>
    <!-- Form content -->
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

---

### Separator

**Import**:
```typescript
import { Separator } from '$lib/components/ui';
```

**Usage Examples**:
```svelte
<div>
  <p>Above separator</p>
  <Separator className="my-4" />
  <p>Below separator</p>
</div>
```

---

## Data Display Components

### Badge

**Import**:
```typescript
import { Badge } from '$lib/components/ui';
```

**Interface**:
```typescript
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}
```

**Usage Examples**:
```svelte
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

---

### Avatar

**Import**:
```typescript
import { Avatar } from '$lib/components/ui';
```

**Interface**:
```typescript
interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}
```

**Usage Examples**:
```svelte
<Avatar 
  src="/avatars/user.jpg" 
  alt="User Name" 
  fallback="UN" 
/>
```

---

### Progress

**Import**:
```typescript
import { Progress } from '$lib/components/ui';
```

**Interface**:
```typescript
interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
}
```

**Usage Examples**:
```svelte
<Progress value={75} max={100} />
```

---

### Skeleton

**Import**:
```typescript
import { Skeleton } from '$lib/components/ui';
```

**Usage Examples**:
```svelte
<!-- Loading state -->
<div class="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-4/5" />
  <Skeleton className="h-4 w-3/5" />
</div>
```

---

## Table Components

### Table

**Import**:
```typescript
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '$lib/components/ui';
```

**Usage Examples**:
```svelte
<Table>
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
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.role}</TableCell>
      </TableRow>
    {/each}
  </TableBody>
</Table>
```

---

## Navigation Components

### Breadcrumb

**Import**:
```typescript
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '$lib/components/ui';
```

**Usage Examples**:
```svelte
<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem>
    <BreadcrumbLink href="/docs">Documentation</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem>
    Components
  </BreadcrumbItem>
</Breadcrumb>
```

---

### Pagination

**Import**:
```typescript
import { Pagination } from '$lib/components/ui';
```

**Interface**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}
```

**Usage Examples**:
```svelte
<Pagination 
  currentPage={currentPage} 
  totalPages={totalPages} 
  onPageChange={handlePageChange} 
/>
```

---

### Tabs

**Import**:
```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui';
```

**Usage Examples**:
```svelte
<Tabs defaultValue="account" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    Account settings content
  </TabsContent>
  <TabsContent value="password">
    Password settings content
  </TabsContent>
</Tabs>
```

---

## Overlay Components

### Dialog

**Import**:
```typescript
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui';
```

**Usage Examples**:
```svelte
<script>
  let dialogOpen = false;
</script>

<Button on:click={() => dialogOpen = true}>Open Dialog</Button>

{#if dialogOpen}
  <Dialog on:close={() => dialogOpen = false}>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Are you sure you want to continue?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" on:click={() => dialogOpen = false}>
        Cancel
      </Button>
      <Button variant="destructive" on:click={handleConfirm}>
        Delete
      </Button>
    </DialogFooter>
  </Dialog>
{/if}
```

---

### Sheet

**Import**:
```typescript
import { Sheet } from '$lib/components/ui';
```

**Interface**:
```typescript
interface SheetProps {
  open?: boolean;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}
```

**Usage Examples**:
```svelte
{#if sheetOpen}
  <Sheet side="right" on:close={() => sheetOpen = false}>
    <h2>Sheet Content</h2>
    <p>Side panel content goes here</p>
  </Sheet>
{/if}
```

---

### Popover

**Import**:
```typescript
import { Popover } from '$lib/components/ui';
```

**Usage Examples**:
```svelte
<Popover>
  <Button slot="trigger">Open Popover</Button>
  <div slot="content">
    <h4>Popover Title</h4>
    <p>Popover content goes here</p>
  </div>
</Popover>
```

---

### DropdownMenu

**Import**:
```typescript
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '$lib/components/ui';
```

**Usage Examples**:
```svelte
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem on:click={handleProfile}>
      Profile
    </DropdownMenuItem>
    <DropdownMenuItem on:click={handleSettings}>
      Settings
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem on:click={handleLogout}>
      Logout
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Feedback Components

### Alert

**Import**:
```typescript
import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui';
```

**Interface**:
```typescript
interface AlertProps {
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  className?: string;
}
```

**Usage Examples**:
```svelte
<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>
```

---

## Utility Functions

### cn (Class Name Utility)

**Import**:
```typescript
import { cn } from '$lib/components/ui';
```

**Usage**:
```typescript
// Combines class names with conditional logic
const buttonClasses = cn(
  'base-button-class',
  variant === 'primary' && 'primary-styles',
  disabled && 'disabled-styles',
  className
);
```

---

## Component Composition Patterns

### Form with Validation
```svelte
<script>
  import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui';
  
  let email = '';
  let password = '';
  let errors = {};
</script>

<Card className="w-full max-w-sm">
  <CardHeader>
    <CardTitle>Sign In</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div class="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input 
        id="email"
        type="email" 
        bind:value={email}
        className={errors.email ? 'border-red-500' : ''}
      />
      {#if errors.email}
        <p class="text-sm text-red-500">{errors.email}</p>
      {/if}
    </div>
    
    <div class="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input 
        id="password"
        type="password" 
        bind:value={password}
        className={errors.password ? 'border-red-500' : ''}
      />
      {#if errors.password}
        <p class="text-sm text-red-500">{errors.password}</p>
      {/if}
    </div>
    
    <Button className="w-full" on:click={handleSubmit}>
      Sign In
    </Button>
  </CardContent>
</Card>
```

### Data Table with Actions
```svelte
<script>
  import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button, Badge, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '$lib/components/ui';
  import { MoreHorizontal } from 'lucide-svelte';
</script>

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Role</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each users as user}
      <TableRow>
        <TableCell className="font-medium">{user.name}</TableCell>
        <TableCell>
          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
            {user.status}
          </Badge>
        </TableCell>
        <TableCell>{user.role}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem on:click={() => editUser(user.id)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem on:click={() => deleteUser(user.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    {/each}
  </TableBody>
</Table>
```

---

## Accessibility Guidelines

### General Principles
1. **Keyboard Navigation**: All interactive components support keyboard navigation
2. **Screen Reader Support**: Proper ARIA labels and descriptions
3. **Focus Management**: Visible focus indicators and logical tab order
4. **Color Contrast**: All text meets WCAG AA contrast requirements

### Component-Specific Notes
- **Forms**: Always associate labels with form controls
- **Buttons**: Use descriptive text or aria-label for icon-only buttons
- **Dialogs**: Focus management and escape key handling
- **Tables**: Use proper header associations
- **Alerts**: Appropriate ARIA roles for different alert types

---

## Figma Integration Notes

### Design Token Mapping
Components use CSS custom properties that can be mapped to Figma design tokens:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 98%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}
```

### Auto-Generation Guidelines
1. **Component Structure**: Always include proper semantic HTML structure
2. **Styling**: Use Tailwind classes + component variants, not custom CSS
3. **State Management**: Bind to reactive variables for dynamic content
4. **Event Handling**: Include standard event handlers
5. **Accessibility**: Include required ARIA attributes

---

## Version Information

- **SHADCN-Svelte Version**: Latest compatible with SvelteKit 2.x
- **Component Count**: 30+ components
- **Last Audit**: Phase 1 Cleanup (October 2025)
- **Dependencies**: Lucide Svelte for icons, Tailwind CSS for styling

---

*This reference is automatically updated as components are added or modified. For implementation questions, refer to the demo page at `/demo`.*