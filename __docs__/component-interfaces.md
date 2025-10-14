# Component Interfaces Documentation

## UI Components

### Button Component

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  href?: string; // Makes button act as link
  target?: '_blank' | '_self';
  leftIcon?: string; // Icon name or component
  rightIcon?: string;
  fullWidth?: boolean;
  onClick?: (event: MouseEvent) => void;
}
```

**Usage:**
```svelte
<Button variant="primary" size="lg" loading={isSubmitting} on:click={handleSubmit}>
  Save Changes
</Button>
```

### Card Component

```typescript
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  clickable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  header?: string;
  footer?: boolean;
}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: boolean; // Slot for action buttons
}

interface CardFooterProps {
  align?: 'left' | 'center' | 'right' | 'between';
}
```

**Usage:**
```svelte
<Card variant="elevated" padding="lg">
  <CardHeader title="User Profile" description="Manage your account settings" />
  <CardContent>
    <!-- Main content -->
  </CardContent>
  <CardFooter align="right">
    <Button variant="outline">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>
```

### Input Component

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: string | number;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: string;
  rightIcon?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autocomplete?: string;
  onChange?: (value: string) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocus?: (event: FocusEvent) => void;
}
```

**Usage:**
```svelte
<Input
  label="Email Address"
  type="email"
  required
  error={validationErrors.email}
  bind:value={formData.email}
  on:change={handleEmailChange}
/>
```

### Dialog Component

```typescript
interface DialogProps {
  open: boolean;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeable?: boolean;
  persistent?: boolean; // Prevents closing on backdrop click
  loading?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogHeaderProps {
  title: string;
  description?: string;
  showCloseButton?: boolean;
}

interface DialogFooterProps {
  align?: 'left' | 'center' | 'right' | 'between';
  sticky?: boolean; // Sticks to bottom on scroll
}
```

**Usage:**
```svelte
<Dialog bind:open={showDialog} size="md" title="Confirm Action">
  <p>Are you sure you want to delete this item?</p>
  <DialogFooter align="right">
    <Button variant="outline" on:click={() => showDialog = false}>Cancel</Button>
    <Button variant="destructive" on:click={handleDelete}>Delete</Button>
  </DialogFooter>
</Dialog>
```

### Toast Component

```typescript
interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description?: string;
  duration?: number; // Auto dismiss time in ms
  persistent?: boolean; // Prevents auto dismiss
  closeable?: boolean;
  actions?: ToastAction[];
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}
```

**Usage:**
```typescript
import { toastService } from '$services/toast';

toastService.show({
  type: 'success',
  title: 'Profile Updated',
  description: 'Your changes have been saved successfully.',
  duration: 5000
});
```

## Layout Components

### HeaderNav Component

```typescript
interface HeaderNavProps {
  brand?: string;
  brandHref?: string;
  navigation?: NavItem[];
  user?: User | null;
  showUserMenu?: boolean;
  sticky?: boolean;
  transparent?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  children?: NavItem[]; // For dropdown menus
  roles?: string[]; // Required roles to see item
}
```

### AuthGuard Component

```typescript
interface AuthGuardProps {
  required?: boolean; // Requires authentication
  roles?: string[]; // Required roles
  redirect?: string; // Redirect URL if unauthorized
  fallback?: string; // Fallback component/content
  showLogin?: boolean; // Show login form instead of redirect
}
```

**Usage:**
```svelte
<AuthGuard roles={['admin', 'moderator']} redirect="/unauthorized">
  <AdminPanel />
</AuthGuard>
```

### LoadingOverlay Component

```typescript
interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  spinner?: 'default' | 'dots' | 'pulse' | 'ring';
  backdrop?: boolean;
  blur?: boolean;
  dim?: boolean;
}
```

## Animation Components

### Transition Components

```typescript
interface TransitionProps {
  show: boolean;
  duration?: number;
  delay?: number;
  easing?: (t: number) => number;
}

interface FadeTransitionProps extends TransitionProps {}

interface SlideTransitionProps extends TransitionProps {
  axis?: 'x' | 'y';
  direction?: 'up' | 'down' | 'left' | 'right';
}

interface ScaleTransitionProps extends TransitionProps {
  start?: number; // Starting scale (0-1)
  origin?: string; // Transform origin
}
```

### StaggeredAnimation Component

```typescript
interface StaggeredAnimationProps {
  items: any[];
  staggerDelay?: number;
  initialDelay?: number;
  animation?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight';
  duration?: number;
  show: boolean;
}
```

**Usage:**
```svelte
<StaggeredAnimation 
  items={menuItems} 
  animation="slideUp" 
  staggerDelay={100}
  let:item
  let:index
>
  <MenuItem data={item} />
</StaggeredAnimation>
```

## Form Components

### Form Component

```typescript
interface FormProps {
  onSubmit?: (data: FormData) => void | Promise<void>;
  validation?: ValidationSchema;
  loading?: boolean;
  disabled?: boolean;
  autocomplete?: 'on' | 'off';
  noValidate?: boolean;
}

interface ValidationSchema {
  [fieldName: string]: ValidationRule[];
}

interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}
```

### Select Component

```typescript
interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  placeholder?: string;
  label?: string;
  error?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: string | number | (string | number)[]) => void;
}

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}
```

## Data Display Components

### Table Component

```typescript
interface TableProps {
  data: any[];
  columns: TableColumn[];
  loading?: boolean;
  empty?: string; // Empty state message
  selectable?: boolean;
  sortable?: boolean;
  pagination?: PaginationConfig;
  onRowClick?: (row: any, index: number) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
}

interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => string;
  component?: any; // Svelte component for custom rendering
}

interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
}
```

### Avatar Component

```typescript
interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string; // For fallback initials
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  shape?: 'circle' | 'square';
  fallbackIcon?: string;
  loading?: boolean;
  onClick?: () => void;
}
```

### Badge Component

```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  pill?: boolean; // Rounded pill shape
  dot?: boolean; // Small dot indicator
  count?: number; // Notification count
  max?: number; // Max count to display (99+)
  showZero?: boolean;
}
```

## Utility Components

### ClientOnly Component

```typescript
interface ClientOnlyProps {
  fallback?: any; // Component to show during SSR
}
```

**Usage:**
```svelte
<ClientOnly fallback={LoadingSpinner}>
  <InteractiveComponent />
</ClientOnly>
```

### Portal Component

```typescript
interface PortalProps {
  target?: string | HTMLElement; // Where to render (default: body)
  disabled?: boolean;
}
```

### ErrorBoundary Component

```typescript
interface ErrorBoundaryProps {
  fallback?: any; // Component to show on error
  onError?: (error: Error, info: any) => void;
  resetOnPropsChange?: boolean;
}
```

**Usage:**
```svelte
<ErrorBoundary fallback={ErrorFallback} onError={handleError}>
  <RiskyComponent />
</ErrorBoundary>
```

## Event Interfaces

```typescript
// Component Events
interface ComponentEvents {
  click: CustomEvent<MouseEvent>;
  change: CustomEvent<any>;
  input: CustomEvent<any>;
  focus: CustomEvent<FocusEvent>;
  blur: CustomEvent<FocusEvent>;
  submit: CustomEvent<FormData>;
}

// Custom Events
interface CustomEvents {
  'toast:show': CustomEvent<ToastProps>;
  'modal:open': CustomEvent<{ id: string }>;
  'modal:close': CustomEvent<{ id: string }>;
  'auth:login': CustomEvent<{ user: User }>;
  'auth:logout': CustomEvent<{}>;
  'navigation:change': CustomEvent<{ url: string }>;
}
```

## Type Guards and Utilities

```typescript
// Type guards for component props
export function isButtonProps(props: any): props is ButtonProps {
  return typeof props === 'object' && props !== null;
}

export function isValidVariant<T>(
  value: any, 
  variants: readonly T[]
): value is T {
  return variants.includes(value);
}

// Component prop validators
export const validators = {
  size: ['xs', 'sm', 'md', 'lg', 'xl'] as const,
  variant: ['primary', 'secondary', 'outline', 'ghost'] as const,
  position: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const,
};
```