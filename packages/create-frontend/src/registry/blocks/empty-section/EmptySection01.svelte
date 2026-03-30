<!--
  EmptySection01.svelte
  Empty state: centered icon + title + description + Create new / Learn more buttons.
  Flat and card variants.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    variant = 'flat' as 'flat' | 'card',
    title = 'No databases added',
    description = 'Read and write directly to databases and stores from your projects.',
    createLabel = 'Create new',
    learnLabel = 'Learn more',
    oncreate = () => {},
    onlearn = () => {}
  }: {
    class?: string;
    variant?: 'flat' | 'card';
    title?: string;
    description?: string;
    createLabel?: string;
    learnLabel?: string;
    oncreate?: () => void;
    onlearn?: () => void;
  } = $props();
</script>

<div
  class={cn(
    'flex flex-col items-center justify-center py-12 text-center',
    variant === 'card' && 'rounded-lg border bg-background px-4',
    className
  )}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-3 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  <p class="font-semibold">{title}</p>
  {#if description}
    <p class="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
  {/if}
  <div class="mt-4 flex w-full max-w-xs flex-col gap-2 sm:flex-row sm:justify-center">
    <Button size="sm" onclick={oncreate} class="sm:flex-1">{createLabel}</Button>
    <Button variant="outline" size="sm" onclick={onlearn} class="sm:flex-1">{learnLabel}</Button>
  </div>
</div>
