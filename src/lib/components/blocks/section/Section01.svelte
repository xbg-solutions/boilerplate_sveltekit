<!--
  Section01.svelte
  Layout wrapper: N stacked content slots. Supports flat (no border) and card (white bg + border) variants.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  let {
    class: className = '',
    variant = 'flat' as 'flat' | 'card',
    slots = 3,
    children
  }: {
    class?: string;
    variant?: 'flat' | 'card';
    slots?: number;
    children?: Snippet;
  } = $props();
</script>

<div
  class={cn(
    'flex flex-col gap-4',
    variant === 'card' && 'rounded-lg border bg-background p-4',
    className
  )}
>
  {#if children}
    {@render children()}
  {:else}
    {#each Array(slots) as _}
      <div class="flex min-h-16 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
        Slot (swap it with your content)
      </div>
    {/each}
  {/if}
</div>
