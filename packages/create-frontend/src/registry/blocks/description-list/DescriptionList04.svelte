<!--
  DescriptionList04.svelte
  Application information card: title + description + Edit button.
  Two-column layout for text rows. Full-width About row. Documents section with 2-col file cards.
  Desktop: 2-col grid layout. Mobile: stacked.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  interface DLFile { name: string; size?: string; }
  interface DLRow { label: string; value: string; }

  let {
    class: className = '',
    title = 'Application information',
    description = 'Personal details and general information.',
    rows = [
      { label: 'Full name', value: 'Alex Thompson' },
      { label: 'Email address', value: 'alex@example.com' },
      { label: 'Address', value: '123 Main Street, City, Country' },
      { label: 'Phone number', value: '+1 234 567 890' }
    ] as DLRow[],
    about = 'A seasoned software engineer with 5+ years of experience specializing in full-stack web development.',
    files = [
      { name: 'Resume.pdf' },
      { name: 'Portfolio.pdf' }
    ] as DLFile[],
    onedit = () => {},
    ondownload = (_: string) => {}
  }: {
    class?: string;
    title?: string;
    description?: string;
    rows?: DLRow[];
    about?: string;
    files?: DLFile[];
    onedit?: () => void;
    ondownload?: (filename: string) => void;
  } = $props();
</script>

<div class={cn('rounded-lg border bg-background', className)}>
  <!-- Header -->
  <div class="flex items-start justify-between p-4 sm:p-6">
    <div>
      <h2 class="font-semibold">{title}</h2>
      {#if description}<p class="mt-0.5 text-sm text-muted-foreground">{description}</p>{/if}
    </div>
    <Button variant="outline" size="sm" onclick={onedit}>Edit</Button>
  </div>

  <!-- 2-column rows -->
  <div class="grid grid-cols-1 gap-0 border-t sm:grid-cols-2">
    {#each rows as row, i}
      <div class={cn('flex flex-col gap-0.5 border-b px-4 py-3 sm:px-6', i % 2 === 1 && 'sm:border-l')}>
        <dt class="text-xs font-medium text-muted-foreground">{row.label}</dt>
        <dd class="text-sm">{row.value}</dd>
      </div>
    {/each}
  </div>

  <!-- About (full-width) -->
  {#if about}
    <div class="border-b px-4 py-3 sm:px-6">
      <dt class="text-xs font-medium text-muted-foreground">About</dt>
      <dd class="mt-1 text-sm leading-relaxed">{about}</dd>
    </div>
  {/if}

  <!-- Documents (2-column) -->
  {#if files.length}
    <div class="px-4 py-3 sm:px-6">
      <p class="mb-2 text-xs font-medium text-muted-foreground">Documents</p>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {#each files as file}
          <div class="flex items-center gap-2 rounded-md border px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="flex-1 text-sm font-medium truncate">{file.name}</span>
            <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" onclick={() => ondownload(file.name)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </Button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
