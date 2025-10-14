<!--
  Input Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  export let type = 'text';
  export let placeholder = '';
  export let value = '';
  export let disabled = false;
  export let className = '';
  export let size: 'sm' | 'default' | 'lg' = 'default';
  
  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    default: 'h-10 px-3',
    lg: 'h-12 px-4 text-lg'
  };
</script>

<input
  {type}
  {placeholder}
  {disabled}
  bind:value
  class={cn(
    'flex w-full rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    sizeClasses[size],
    className
  )}
  on:input
  on:change
  on:focus
  on:blur
  on:keydown
  on:keypress
  on:keyup
/>