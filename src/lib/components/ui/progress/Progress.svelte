<!--
  Progress Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    value = 0,
    max = 100,
    showLabel = false,
    class: className = '',
    ...rest
  }: {
    value?: number;
    max?: number;
    showLabel?: boolean;
    class?: string;
    [key: string]: unknown;
  } = $props();

  let percentage = $derived(Math.min(Math.max((value / max) * 100, 0), 100));
</script>

<div
  class={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
  {...rest}
>
  <div
    class="h-full w-full flex-1 bg-primary transition-all"
    style="transform: translateX(-{100 - percentage}%)"
  ></div>
</div>
{#if showLabel}
  <span class="text-sm text-muted-foreground mt-1">{Math.round(percentage)}%</span>
{/if}
