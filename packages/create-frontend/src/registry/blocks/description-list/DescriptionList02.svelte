<!--
  DescriptionList02.svelte
  Card with title + description. Each row has label + value + individual "Edit" button.
  Desktop: label left / value center / edit right. Mobile: stacked with Edit below.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  interface DLRow { label: string; value: string; key?: string; }

  let {
    class: className = '',
    title = 'Profile Information',
    description = 'Personal details and general information.',
    rows = [
      { label: 'Full name', value: 'Alex Thompson', key: 'fullName' },
      { label: 'Address', value: '123 Main Street, City, Country', key: 'address' },
      { label: 'Email address', value: 'alex@example.com', key: 'email' },
      { label: 'Phone number', value: '+1 234 567 890', key: 'phone' },
      { label: 'About', value: 'A motivated professional with 5+ years of experience in software development.', key: 'about' }
    ] as DLRow[],
    onedit = (_key: string) => {}
  }: {
    class?: string;
    title?: string;
    description?: string;
    rows?: DLRow[];
    onedit?: (key: string) => void;
  } = $props();
</script>

<div class={cn('rounded-lg border bg-background', className)}>
  <!-- Header -->
  <div class="p-4 sm:p-6">
    <h2 class="font-semibold">{title}</h2>
    {#if description}<p class="mt-0.5 text-sm text-muted-foreground">{description}</p>{/if}
  </div>

  <!-- Rows -->
  <div class="border-t">
    {#each rows as row}
      <div class="flex flex-col gap-1 border-b px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <dt class="w-40 shrink-0 text-sm font-medium">{row.label}</dt>
        <dd class="flex-1 text-sm text-muted-foreground">{row.value}</dd>
        <Button variant="outline" size="sm" onclick={() => onedit(row.key ?? row.label)} class="self-start sm:self-auto">Edit</Button>
      </div>
    {/each}
  </div>
</div>
