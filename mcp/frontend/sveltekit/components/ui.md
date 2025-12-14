# UI Components (SHADCN-Svelte)

Comprehensive SHADCN component library for building consistent, accessible user interfaces.

**Reference**: See [overview/components.md](../overview/components.md) for detailed integration patterns.

## Import Patterns

```typescript
// Individual components
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';

// Multiple components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '$lib/components/ui/card';
```

## Component Categories

### Form Controls

#### Button
Action buttons with variants and states.

**Props:**
- `variant`: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
- `size`: 'default' | 'sm' | 'lg' | 'icon'
- `disabled`: boolean
- `loading`: boolean
- `href`: string (renders as link)

**Usage:**
```svelte
<Button variant="default">Click Me</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="outline" loading>Loading...</Button>
```

#### Input
Text input field with validation states.

**Props:**
- `type`: string
- `placeholder`: string
- `disabled`: boolean
- `value`: string

**Usage:**
```svelte
<Input type="email" placeholder="Enter email" bind:value={email} />
```

#### Textarea
Multi-line text input.

**Props:**
- `placeholder`: string
- `disabled`: boolean
- `rows`: number

#### Checkbox
Boolean selection input.

**Props:**
- `checked`: boolean
- `indeterminate`: boolean
- `disabled`: boolean

**Usage:**
```svelte
<Checkbox bind:checked={isChecked} />
<Label>Accept Terms</Label>
```

#### RadioGroup
Single selection from multiple options.

**Components:**
- `RadioGroup`: Container
- `RadioGroupItem`: Individual radio option

**Usage:**
```svelte
<RadioGroup bind:value={selected}>
  <RadioGroupItem value="option1" />
  <RadioGroupItem value="option2" />
</RadioGroup>
```

#### Label
Form field labels with accessibility.

**Usage:**
```svelte
<Label for="email">Email Address</Label>
<Input id="email" />
```

#### Select
Dropdown selection input.

**Usage:**
```svelte
<Select bind:value={selected}>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>
```

### Layout Components

#### Card
Container for grouped content.

**Components:**
- `Card`: Main container
- `CardHeader`: Header section
- `CardTitle`: Title text
- `CardDescription`: Subtitle text
- `CardContent`: Main content area
- `CardFooter`: Footer section

**Usage:**
```svelte
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Separator
Visual divider between content.

**Usage:**
```svelte
<Separator />
<Separator orientation="vertical" />
```

#### Tabs
Tab-based navigation and content switching.

**Components:**
- `Tabs`: Container
- `TabsList`: Tab navigation list
- `TabsTrigger`: Individual tab button
- `TabsContent`: Content panel for each tab

**Usage:**
```svelte
<Tabs value="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Data Display

#### Table
Structured data display.

**Components:**
- `Table`: Main table container
- `TableHeader`: Header section
- `TableBody`: Body section
- `TableRow`: Row container
- `TableHead`: Header cell
- `TableCell`: Data cell

**Usage:**
```svelte
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Badge
Status indicators and labels.

**Props:**
- `variant`: 'default' | 'secondary' | 'destructive' | 'outline'

**Usage:**
```svelte
<Badge>New</Badge>
<Badge variant="destructive">Error</Badge>
```

#### Avatar
User profile images.

**Props:**
- `src`: string
- `alt`: string
- `fallback`: string

**Usage:**
```svelte
<Avatar src="/avatar.jpg" alt="User" />
```

#### Skeleton
Loading placeholders.

**Usage:**
```svelte
<Skeleton class="w-full h-4" />
<Skeleton class="w-24 h-24 rounded-full" />
```

### Feedback Components

#### Alert
Important user notifications.

**Components:**
- `Alert`: Container
- `AlertTitle`: Title text
- `AlertDescription`: Description text

**Props:**
- `variant`: 'default' | 'destructive'

**Usage:**
```svelte
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

#### Progress
Progress indicators.

**Props:**
- `value`: number (0-100)
- `max`: number

**Usage:**
```svelte
<Progress value={60} />
```

### Navigation Components

#### Breadcrumb
Navigation hierarchy indicator.

**Components:**
- `Breadcrumb`: Container
- `BreadcrumbItem`: Individual item
- `BreadcrumbLink`: Clickable link
- `BreadcrumbSeparator`: Visual separator

**Usage:**
```svelte
<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem>
    <BreadcrumbLink href="/products">Products</BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>
```

#### Pagination
Page navigation controls.

**Props:**
- `currentPage`: number
- `totalPages`: number
- `onPageChange`: (page: number) => void

**Usage:**
```svelte
<Pagination currentPage={2} totalPages={10} on:change={handlePageChange} />
```

#### DropdownMenu
Context menus and action lists.

**Components:**
- `DropdownMenu`: Container
- `DropdownMenuTrigger`: Trigger element
- `DropdownMenuContent`: Menu content
- `DropdownMenuItem`: Menu item
- `DropdownMenuSeparator`: Visual separator

**Usage:**
```svelte
<DropdownMenu>
  <DropdownMenuTrigger asChild let:builder>
    <Button builders={[builder]}>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Overlay Components

#### Dialog
Modal dialogs.

**Components:**
- `Dialog`: Container
- `DialogHeader`: Header section
- `DialogTitle`: Title
- `DialogDescription`: Description
- `DialogFooter`: Footer section

**Usage:**
```svelte
<Dialog open={isOpen}>
  <DialogHeader>
    <DialogTitle>Confirm Action</DialogTitle>
    <DialogDescription>Are you sure?</DialogDescription>
  </DialogHeader>
  <DialogFooter>
    <Button on:click={() => isOpen = false}>Cancel</Button>
    <Button variant="destructive">Confirm</Button>
  </DialogFooter>
</Dialog>
```

#### Sheet
Slide-out panels.

**Usage:**
```svelte
<Sheet open={isOpen}>
  <slot />
</Sheet>
```

#### Popover
Floating content containers.

**Usage:**
```svelte
<Popover>
  <PopoverTrigger>Click me</PopoverTrigger>
  <PopoverContent>
    Popover content here
  </PopoverContent>
</Popover>
```

## Common Props Patterns

### Styling
All components accept:
- `class`: Additional CSS classes
- `$$restProps`: Spread to underlying element

### Events
Components forward native DOM events:
- `on:click`
- `on:change`
- `on:input`
- `on:submit`

### Accessibility
Components include ARIA attributes:
- `aria-label`
- `aria-disabled`
- `role`
- `tabindex`

## Component Composition

SHADCN components are designed to be composed:

```svelte
<Card>
  <CardHeader>
    <div class="flex justify-between items-center">
      <CardTitle>User Profile</CardTitle>
      <Badge>Active</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <div class="flex items-center gap-4">
      <Avatar src={user.avatar} />
      <div>
        <Label>Email</Label>
        <Input bind:value={user.email} />
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

## Styling with Tailwind Variants

Components use `tailwind-variants` for type-safe styling:

```typescript
import { tv } from 'tailwind-variants';

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md',
  variants: {
    variant: {
      default: 'bg-primary text-white',
      outline: 'border border-input'
    }
  }
});
```

## Total Components: 55+

- **Form Controls**: 7 components
- **Layout**: 14 components
- **Data Display**: 18 components
- **Feedback**: 5 components
- **Navigation**: 6 components
- **Overlay**: 5 components
