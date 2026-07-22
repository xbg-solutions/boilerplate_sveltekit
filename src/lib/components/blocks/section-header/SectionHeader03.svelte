<!--
  SectionHeader03.svelte
  Title + Status badge + description left. View/Edit/Create New right. Segmented tabs below.
  Mobile: dropdown select for tabs.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    title = 'Storage',
    badge = 'Status',
    description = 'Read and write directly to databases and stores from your projects.',
    tabs = ['Tab 1', 'Tab 2', 'Tab 3', 'Tab 4'],
    activeTab = 'Tab 1',
    onview = () => {},
    onedit = () => {},
    oncreate = () => {}
  }: {
    class?: string;
    title?: string;
    badge?: string;
    description?: string;
    tabs?: string[];
    activeTab?: string;
    onview?: () => void;
    onedit?: () => void;
    oncreate?: () => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  let currentTab = $state(activeTab);
</script>

<div class={cn('py-4', className)}>
  <!-- Top row: title/desc left, actions right -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
    <div class="flex shrink-0 items-center gap-2">
      <Button variant="outline" size="sm" onclick={onview}>View</Button>
      <Button variant="outline" size="sm" onclick={onedit}>Edit</Button>
      <Button size="sm" onclick={oncreate}>Create new</Button>
      <Button variant="ghost" size="icon" class="h-8 w-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </Button>
    </div>
  </div>

  <!-- Tabs: pill/segmented on desktop, select on mobile -->
  <div class="mt-4">
    <!-- Desktop segmented tabs -->
    <div class="hidden grid-flow-col grid-cols-[repeat(auto-fit,minmax(0,1fr))] overflow-hidden rounded-md border bg-muted p-1 sm:grid">
      {#each tabs as tab}
        <button
          type="button"
          onclick={() => (currentTab = tab)}
          class={cn(
            'rounded-sm px-4 py-1.5 text-sm font-medium transition-colors',
            currentTab === tab
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >{tab}</button>
      {/each}
    </div>

    <!-- Mobile select -->
    <select
      class="sm:hidden w-full rounded-md border bg-background px-3 py-1.5 text-sm"
      value={currentTab}
      onchange={(e) => (currentTab = (e.target as HTMLSelectElement).value)}
    >
      {#each tabs as tab}
        <option value={tab}>{tab}</option>
      {/each}
    </select>
  </div>
</div>
