<!--
  Alert Component
  
  A versatile alert component for displaying important messages.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  export let variant: 'default' | 'destructive' | 'success' | 'warning' = 'default';
  export let className = '';
  
  const variants = {
    default: 'bg-blue-50 border-blue-200 text-blue-700',
    destructive: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  };
</script>

<div 
  class={cn(
    'relative w-full rounded-lg border p-4 text-sm',
    variants[variant],
    className
  )}
  role="alert"
>
  <slot />
</div>