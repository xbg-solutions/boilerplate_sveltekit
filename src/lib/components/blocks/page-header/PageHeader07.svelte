<!--
  PageHeader07.svelte
  Title + description + Share/View/Edit/Publish right, tabs row below.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    title = 'Profile details',
    description = 'Manage your profile details such as name, avatar, email and bio.',
    tabs = ['Profile', 'Reports', 'Analytics', 'Notifications', 'Help Center'],
    activeTab = 'Profile',
    onshare = () => {},
    onview = () => {},
    onedit = () => {},
    onpublish = () => {}
  }: {
    class?: string;
    title?: string;
    description?: string;
    tabs?: string[];
    activeTab?: string;
    onshare?: () => void;
    onview?: () => void;
    onedit?: () => void;
    onpublish?: () => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  let currentTab = $state(activeTab);
</script>

<div class={cn('', className)}>
  <!-- Header row -->
  <div class="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold">{title}</h1>
      {#if description}<p class="mt-1 text-sm text-muted-foreground">{description}</p>{/if}
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <Button variant="outline" size="sm" onclick={onshare}>Share</Button>
      <Button variant="outline" size="sm" onclick={onview}>View</Button>
      <Button variant="outline" size="sm" onclick={onedit}>Edit</Button>
      <Button size="sm" onclick={onpublish}>Publish</Button>
    </div>
  </div>

  <!-- Tabs below header -->
  <div class="flex gap-0 overflow-x-auto border-b">
    {#each tabs as tab}
      <button
        type="button"
        onclick={() => (currentTab = tab)}
        class={cn(
          'shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
          currentTab === tab
            ? 'border-foreground text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        )}
      >{tab}</button>
    {/each}
  </div>
</div>
