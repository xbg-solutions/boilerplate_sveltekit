<!--
  src/lib/components/ui/legend/Legend.svelte
  Chart legend with colored dots and labels.

  Usage:
  <Legend items={[{ label: 'Revenue', color: '#3b82f6' }, { label: 'Expenses', color: '#ef4444' }]} />
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    items = [],
    class: className = '',
    ...rest
  }: {
    items?: Array<{ label: string; color: string }>;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<div class={cn('flex flex-wrap items-center gap-4', className)} {...rest}>
  {#each items as item}
    <div class="flex items-center gap-2">
      <span
        class="h-3 w-3 rounded-full flex-shrink-0"
        style:background-color={item.color}
      ></span>
      <span class="text-sm text-muted-foreground">{item.label}</span>
    </div>
  {/each}
</div>
