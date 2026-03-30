<!--
  SectionHeader01.svelte
  Minimal two-slot horizontal layout: wide left slot + narrow right slot.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  let {
    class: className = '',
    left,
    right
  }: {
    class?: string;
    left?: Snippet;
    right?: Snippet;
  } = $props();
</script>

<div class={cn('flex items-center gap-4 py-4', className)}>
  <div class="flex-1">
    {#if left}
      {@render left()}
    {:else}
      <div class="flex min-h-10 items-center justify-center rounded-lg border border-dashed bg-background text-sm text-muted-foreground">
        Slot (swap it with your content)
      </div>
    {/if}
  </div>
  <div class="w-44 shrink-0">
    {#if right}
      {@render right()}
    {:else}
      <div class="flex min-h-10 items-center justify-center rounded-lg border border-dashed bg-background text-sm text-muted-foreground">
        Slot (swap it with your content)
      </div>
    {/if}
  </div>
</div>
