<!--
  Label Component
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { for: htmlFor = '', class: className = '', children, ...rest }: { for?: string; class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<label
  for={htmlFor}
  class={cn(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    className
  )}
>
  {@render children?.()}
</label>