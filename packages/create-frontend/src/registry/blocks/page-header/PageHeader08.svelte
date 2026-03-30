<!--
  PageHeader08.svelte
  Search top-left + avatar top-right, then title + description + Share/View/Edit/Publish below.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    searchPlaceholder = 'Search',
    user = { name: 'shadcn', email: 'm@example.com', avatar: '' },
    title = 'Project alpha',
    description = 'Manage your project\'s details such as name, image, description and settings.',
    onshare = () => {},
    onview = () => {},
    onedit = () => {},
    onpublish = () => {}
  }: {
    class?: string;
    searchPlaceholder?: string;
    user?: { name: string; email: string; avatar?: string };
    title?: string;
    description?: string;
    onshare?: () => void;
    onview?: () => void;
    onedit?: () => void;
    onpublish?: () => void;
  } = $props();

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
</script>

<div class={cn('py-4', className)}>
  <!-- Top bar: search + avatar -->
  <div class="mb-6 flex items-center justify-between gap-4">
    <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" placeholder={searchPlaceholder} class="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
    </div>
    <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border">
      {#if user.avatar}
        <img src={user.avatar} alt={user.name} class="h-full w-full object-cover" />
      {:else}
        <span class="text-xs font-semibold">{initials(user.name)}</span>
      {/if}
    </div>
  </div>

  <!-- Page header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold">{title}</h1>
      {#if description}<p class="mt-1 text-sm text-muted-foreground">{description}</p>{/if}
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <Button variant="outline" size="sm" onclick={onshare}>Share</Button>
      <Button variant="outline" size="sm" onclick={onview}>View</Button>
      <Button variant="outline" size="sm" onclick={onedit}>Edit</Button>
      <Button size="sm" onclick={onpublish}>Publish</Button>
      <Button variant="ghost" size="icon" class="h-8 w-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </Button>
    </div>
  </div>
</div>
