<!--
  Card07.svelte
  File/attachment card: link icon + filename + size + "Download" text button.
  Mobile: icon download button instead.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    filename = 'resume_1.pdf',
    size = '2,4mb',
    ondownload = () => {}
  }: {
    class?: string;
    filename?: string;
    size?: string;
    ondownload?: () => void;
  } = $props();
</script>

<div class={cn('flex items-center gap-3 rounded-lg border bg-background px-4 py-3', className)}>
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  <span class="flex-1 text-sm font-medium truncate">{filename}</span>
  {#if size}
    <span class="shrink-0 text-xs text-muted-foreground">{size}</span>
  {/if}
  <!-- Desktop: text button -->
  <Button variant="outline" size="sm" onclick={ondownload} class="hidden sm:inline-flex">Download</Button>
  <!-- Mobile: icon button -->
  <Button variant="ghost" size="icon" class="h-8 w-8 sm:hidden" onclick={ondownload}>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  </Button>
</div>
