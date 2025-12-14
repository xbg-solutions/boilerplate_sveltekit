# Class Name Utility

## Overview

Utility for merging Tailwind CSS classes with intelligent conflict resolution using clsx and tailwind-merge.

**Location:** `src/lib/utils/cn.ts`

## Function

### cn
Merge classes with Tailwind conflict resolution.

```typescript
function cn(...inputs: ClassValue[]): string
```

## Usage

```typescript
import { cn } from '$lib/utils/cn';

// Basic usage
cn('px-4 py-2', 'bg-blue-500')
// → 'px-4 py-2 bg-blue-500'

// With conditionals
cn('base-class', isActive && 'active-class', className)
// → 'base-class active-class custom-class'

// Tailwind conflict resolution
cn('px-4 px-6') 
// → 'px-6' (later class wins)

cn('bg-red-500', 'bg-blue-500')
// → 'bg-blue-500'

// Array of classes
cn(['text-sm', 'font-bold'], 'text-blue-500')
// → 'text-sm font-bold text-blue-500'

// Objects
cn({ 'text-red': hasError, 'text-green': !hasError })
// → 'text-red' or 'text-green'
```

## Common Patterns

### Component Props
```svelte
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  export let className: string = '';
  export let variant: 'primary' | 'secondary' = 'primary';
</script>

<button
  class={cn(
    'px-4 py-2 rounded',
    variant === 'primary' && 'bg-blue-500 text-white',
    variant === 'secondary' && 'bg-gray-200 text-gray-800',
    className
  )}
>
  <slot />
</button>
```

### State-Based Classes
```svelte
<div
  class={cn(
    'p-4 border rounded',
    isActive && 'border-blue-500 bg-blue-50',
    isDisabled && 'opacity-50 cursor-not-allowed',
    hasError && 'border-red-500 bg-red-50'
  )}
>
  Content
</div>
```

### With CVA (Class Variance Authority)
```typescript
import { cva } from 'class-variance-authority';
import { cn } from '$lib/utils/cn';

const buttonVariants = cva(
  'px-4 py-2 rounded',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white',
        secondary: 'bg-gray-200 text-gray-800'
      },
      size: {
        sm: 'text-sm',
        lg: 'text-lg'
      }
    }
  }
);

// Use with cn
<button class={cn(buttonVariants({ variant, size }), className)}>
  Button
</button>
```

## Why Use cn()?

1. **Conflict Resolution**: Tailwind classes override correctly
2. **Conditional Classes**: Clean conditional logic
3. **Type Safety**: TypeScript support via ClassValue
4. **shadcn Compatible**: Standard for shadcn-svelte components
5. **Performance**: Optimized class merging

## AI System Note

This is the standard utility for ALL conditional class name construction. Always use `cn()` instead of manual string concatenation or template literals for classes.

```typescript
// ✅ Good
cn('base', condition && 'conditional', className)

// ❌ Bad
`base ${condition ? 'conditional' : ''} ${className}`
```
