<!--
  PageHeader06.svelte
  Avatar + name + email left, View/Share/Edit/Save action buttons right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    user = { name: 'John Doe', email: 'hi@example.com', avatar: '' },
    onview = () => {},
    onshare = () => {},
    onedit = () => {},
    onsave = () => {}
  }: {
    class?: string;
    user?: { name: string; email: string; avatar?: string };
    onview?: () => void;
    onshare?: () => void;
    onedit?: () => void;
    onsave?: () => void;
  } = $props();

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
</script>

<div class={cn('flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between', className)}>
  <!-- User info -->
  <div class="flex items-center gap-3">
    <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
      {#if user.avatar}
        <img src={user.avatar} alt={user.name} class="h-full w-full object-cover" />
      {:else}
        <div class="flex h-full w-full items-center justify-center bg-muted text-sm font-semibold">
          {initials(user.name)}
        </div>
      {/if}
    </div>
    <div>
      <p class="font-semibold">{user.name}</p>
      <p class="text-sm text-muted-foreground">{user.email}</p>
    </div>
  </div>

  <!-- Actions -->
  <div class="flex shrink-0 items-center gap-2">
    <Button variant="outline" size="sm" onclick={onview}>View</Button>
    <Button variant="outline" size="sm" onclick={onshare}>Share</Button>
    <Button variant="outline" size="sm" onclick={onedit}>Edit</Button>
    <Button size="sm" onclick={onsave}>Save</Button>
    <Button variant="ghost" size="icon" class="h-8 w-8">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
    </Button>
  </div>
</div>
