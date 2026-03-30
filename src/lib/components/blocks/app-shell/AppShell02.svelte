<!--
  AppShell02.svelte
  Navbar2 + tabs below navbar + page title/description + action buttons +
  multiple stacked content slots.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';
  import Navbar02 from '$lib/components/blocks/navbar/Navbar02.svelte';
  import type { Snippet } from 'svelte';

  let {
    class: className = '',
    title = 'Project alpha',
    description = 'Manage your profile details such as name, avatar, email and bio.',
    tabs = ['Profile','Reports','Analytics','Notifications','Help Center'],
    activeTab = 'Profile',
    onedit = () => {},
    onpublish = () => {},
    children,
    slots = 3
  }: {
    class?: string;
    title?: string;
    description?: string;
    tabs?: string[];
    activeTab?: string;
    onedit?: () => void;
    onpublish?: () => void;
    children?: Snippet;
    slots?: number;
  } = $props();

  let currentTab = $state(activeTab);
</script>

<div class={cn('flex min-h-screen flex-col bg-muted/30', className)}>
  <Navbar02 />

  <!-- Tab bar -->
  <div class="border-b bg-background px-4 md:px-8">
    <div class="flex gap-0 overflow-x-auto">
      {#each tabs as tab}
        <button
          type="button"
          onclick={() => (currentTab = tab)}
          class={cn(
            'shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
            currentTab === tab
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >{tab}</button>
      {/each}
    </div>
  </div>

  <div class="flex-1 px-4 py-6 md:px-8">
    <!-- Page header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold">{title}</h1>
        {#if description}<p class="mt-1 text-sm text-muted-foreground">{description}</p>{/if}
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <Button size="sm" onclick={onpublish}>Publish</Button>
        <Button variant="outline" size="sm" onclick={onedit}>Edit</Button>
        <Button variant="ghost" size="icon" class="h-8 w-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </Button>
      </div>
    </div>

    <!-- Stacked content slots -->
    {#if children}
      {@render children()}
    {:else}
      <div class="flex flex-col gap-4">
        {#each Array(slots) as _}
          <div class="flex min-h-24 items-center justify-center rounded-lg border border-dashed bg-background text-sm text-muted-foreground">
            Slot (swap it with your content)
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
