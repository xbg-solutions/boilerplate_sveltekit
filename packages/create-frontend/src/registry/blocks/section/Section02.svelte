<!--
  Section02.svelte
  Full section: SectionHeader02 (title + badge + description + search + actions) +
  one content slot + SectionFooter02 (info text + View/Edit/Save).
  Supports flat and card variants.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';
  import type { Snippet } from 'svelte';

  let {
    class: className = '',
    variant = 'flat' as 'flat' | 'card',
    title = 'Storage',
    badge = 'Status',
    description = 'Read and write directly to databases and stores from your projects.',
    searchPlaceholder = 'Search',
    footerText = 'This feature is available in the Pro Plan for additional $10 per month.',
    onview = () => {},
    onedit = () => {},
    oncreate = () => {},
    onsave = () => {},
    children
  }: {
    class?: string;
    variant?: 'flat' | 'card';
    title?: string;
    badge?: string;
    description?: string;
    searchPlaceholder?: string;
    footerText?: string;
    onview?: () => void;
    onedit?: () => void;
    oncreate?: () => void;
    onsave?: () => void;
    children?: Snippet;
  } = $props();
</script>

<div class={cn(variant === 'card' && 'rounded-lg border bg-background', className)}>
  <!-- Header -->
  <div class={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', variant === 'card' ? 'p-4' : 'py-4')}>
    <div>
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold">{title}</h2>
        {#if badge}
          <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">{badge}</span>
        {/if}
      </div>
      {#if description}
        <p class="mt-0.5 text-sm text-muted-foreground">{description}</p>
      {/if}
    </div>
    <div class="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
      <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder={searchPlaceholder} class="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" onclick={onview}>View</Button>
        <Button variant="outline" size="sm" onclick={onedit}>Edit</Button>
        <Button size="sm" onclick={oncreate}>Create new</Button>
      </div>
    </div>
  </div>

  <!-- Content slot -->
  <div class={cn(variant === 'card' ? 'border-t px-4 py-4' : 'py-4')}>
    {#if children}
      {@render children()}
    {:else}
      <div class="flex min-h-20 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
        Slot (swap it with your content)
      </div>
    {/if}
  </div>

  <!-- Footer -->
  <div class={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', variant === 'card' ? 'border-t px-4 py-3' : 'py-3')}>
    {#if footerText}
      <p class="text-sm text-muted-foreground">{footerText}</p>
    {/if}
    <div class="flex shrink-0 items-center gap-2">
      <Button variant="outline" size="sm" onclick={onview}>View</Button>
      <Button variant="outline" size="sm" onclick={onedit}>Edit</Button>
      <Button size="sm" onclick={onsave}>Save</Button>
    </div>
  </div>
</div>
