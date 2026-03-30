<!--
  Section03.svelte
  Full section with empty-state content area: SectionHeader02 + empty state
  (icon + title + description + Create new / Learn more) + SectionFooter02.
  Supports flat and card variants.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    variant = 'flat' as 'flat' | 'card',
    title = 'Storage',
    badge = 'Status',
    description = 'Read and write directly to databases and stores from your projects.',
    searchPlaceholder = 'Search',
    emptyTitle = 'No databases added',
    emptyDescription = 'Read and write directly to databases and stores from your projects.',
    footerText = 'This feature is available in the Pro Plan for additional $10 per month.',
    onview = () => {},
    onedit = () => {},
    oncreate = () => {},
    onlearnmore = () => {},
    onsave = () => {}
  }: {
    class?: string;
    variant?: 'flat' | 'card';
    title?: string;
    badge?: string;
    description?: string;
    searchPlaceholder?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    footerText?: string;
    onview?: () => void;
    onedit?: () => void;
    oncreate?: () => void;
    onlearnmore?: () => void;
    onsave?: () => void;
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

  <!-- Empty state content -->
  <div class={cn('flex flex-col items-center justify-center py-12 text-center', variant === 'card' ? 'border-t px-4' : '')}>
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-3 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    <p class="font-semibold">{emptyTitle}</p>
    {#if emptyDescription}
      <p class="mt-1 max-w-xs text-sm text-muted-foreground">{emptyDescription}</p>
    {/if}
    <div class="mt-4 flex items-center gap-2">
      <Button size="sm" onclick={oncreate}>Create new</Button>
      <Button variant="outline" size="sm" onclick={onlearnmore}>Learn more</Button>
    </div>
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
