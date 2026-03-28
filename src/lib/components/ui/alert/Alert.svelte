<!--
  Alert Component

  A versatile alert component for displaying important messages.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let {
    variant = 'default',
    class: className = '',
    children,
    ...rest
  }: {
    variant?: 'default' | 'destructive' | 'success' | 'warning';
    class?: string;
    children?: Snippet;
    [key: string]: any;
  } = $props();

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
  {...rest}
>
  {@render children?.()}
</div>