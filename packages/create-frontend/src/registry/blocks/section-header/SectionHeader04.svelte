<!--
  SectionHeader04.svelte
  Title + description left. Search + more (…) button right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    title = 'Storage',
    description = 'Read and write directly to databases and stores from your projects.',
    searchPlaceholder = 'Search',
    onmore = () => {}
  }: {
    class?: string;
    title?: string;
    description?: string;
    searchPlaceholder?: string;
    onmore?: () => void;
  } = $props();
</script>

<div class={cn('py-4', className)}>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <!-- Left -->
    <div>
      <h2 class="text-lg font-semibold">{title}</h2>
      {#if description}
        <p class="mt-0.5 text-sm text-muted-foreground">{description}</p>
      {/if}
    </div>

    <!-- Right: search + more -->
    <div class="flex shrink-0 items-center gap-2">
      <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder={searchPlaceholder} class="w-36 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <Button variant="ghost" size="icon" class="h-8 w-8" onclick={onmore}>
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </Button>
    </div>
  </div>
</div>
