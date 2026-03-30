<!--
  DescriptionList01.svelte
  Card with title + description + Edit button. Rows of label/value (read-only).
  Last row can show downloadable file items.
  Desktop: label left / value right. Mobile: stacked.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  interface DLFile { name: string; size?: string; }
  interface DLRow { label: string; value?: string; files?: DLFile[]; }

  let {
    class: className = '',
    title = 'Application information',
    description = 'Personal details and general information',
    rows = [
      { label: 'Full name', value: 'Alex Thompson' },
      { label: 'Address', value: '123 Main Street, City, Country' },
      { label: 'Email address', value: 'alex@example.com' },
      { label: 'Phone number', value: '+1 234 567 890' },
      { label: 'About', value: 'A motivated professional with 5+ years of experience in software development.' },
      { label: 'Documents', files: [{ name: 'CV.pdf', size: '2,51mb' }, { name: 'Portfolio.pdf', size: '11,24mb' }] }
    ] as DLRow[],
    onedit = () => {},
    ondownload = (_: string) => {}
  }: {
    class?: string;
    title?: string;
    description?: string;
    rows?: DLRow[];
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

  <!-- Rows -->
  <div class="border-t">
    {#each rows as row}
      <div class="flex flex-col gap-1 border-b px-4 py-3 last:border-0 sm:flex-row sm:gap-4 sm:px-6">
        <dt class="w-40 shrink-0 text-sm font-medium text-muted-foreground">{row.label}</dt>
        <dd class="flex-1 text-sm">
          {#if row.files}
            <div class="flex flex-col gap-2">
              {#each row.files as file}
                <div class="flex items-center gap-2 rounded-md border px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span class="flex-1 font-medium">{file.name}</span>
                  {#if file.size}<span class="text-xs text-muted-foreground">{file.size}</span>{/if}
                  <Button variant="ghost" size="sm" onclick={() => ondownload(file.name)} class="hidden sm:inline-flex">Download</Button>
                  <Button variant="ghost" size="icon" class="h-7 w-7 sm:hidden" onclick={() => ondownload(file.name)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </Button>
                </div>
              {/each}
            </div>
          {:else}
            {row.value ?? ''}
          {/if}
        </dd>
      </div>
    {/each}
  </div>
</div>
