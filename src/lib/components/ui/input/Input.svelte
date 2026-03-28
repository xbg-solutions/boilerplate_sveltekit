<!--
  Input Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    type = 'text',
    placeholder = '',
    value = $bindable(''),
    disabled = false,
    class: className = '',
    size = 'default' as 'sm' | 'default' | 'lg',
    ...rest
  }: {
    type?: string;
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    class?: string;
    size?: 'sm' | 'default' | 'lg';
    [key: string]: unknown;
  } = $props();

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
  {...rest}
/>
