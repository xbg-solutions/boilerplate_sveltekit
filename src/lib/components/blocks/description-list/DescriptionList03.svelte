<!--
  DescriptionList03.svelte
  Editable form-style description list: title + description + "Save" button.
  Each row: label left + input/textarea right (editable).
  Desktop: 2-column. Mobile: stacked.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  interface DLField {
    label: string;
    key: string;
    value?: string;
    type?: 'text' | 'textarea' | 'email' | 'tel';
  }

  let {
    class: className = '',
    title = 'Profile Information',
    description = 'Personal details and general information.',
    fields = [
      { label: 'Full name', key: 'fullName', value: 'Alex Thompson', type: 'text' },
      { label: 'Address', key: 'address', value: '123 Main Street, City, Country', type: 'text' },
      { label: 'Email address', key: 'email', value: 'alex@example.com', type: 'email' },
      { label: 'Phone number', key: 'phone', value: '+1 234 567 890', type: 'tel' },
      { label: 'About', key: 'about', value: 'A motivated professional with 5+ years of experience in software development.', type: 'textarea' }
    ] as DLField[],
    onsave = (_values: Record<string, string>) => {}
  }: {
    class?: string;
    title?: string;
    description?: string;
    fields?: DLField[];
    onsave?: (values: Record<string, string>) => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  let values = $state(Object.fromEntries(fields.map(f => [f.key, f.value ?? ''])));
</script>

<div class={cn('rounded-lg border bg-background', className)}>
  <!-- Header -->
  <div class="flex items-start justify-between p-4 sm:p-6">
    <div>
      <h2 class="font-semibold">{title}</h2>
      {#if description}<p class="mt-0.5 text-sm text-muted-foreground">{description}</p>{/if}
    </div>
    <Button size="sm" onclick={() => onsave(values)}>Save</Button>
  </div>

  <!-- Editable rows -->
  <div class="border-t">
    {#each fields as field}
      <div class="flex flex-col gap-1.5 border-b px-4 py-3 last:border-0 sm:flex-row sm:items-start sm:gap-4 sm:px-6">
        <label for={field.key} class="w-40 shrink-0 pt-1.5 text-sm font-medium">{field.label}</label>
        {#if field.type === 'textarea'}
          <textarea
            id={field.key}
            rows={4}
            bind:value={values[field.key]}
            class="flex-1 resize-none rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          ></textarea>
        {:else}
          <input
            id={field.key}
            type={field.type ?? 'text'}
            bind:value={values[field.key]}
            class="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        {/if}
      </div>
    {/each}
  </div>
</div>
