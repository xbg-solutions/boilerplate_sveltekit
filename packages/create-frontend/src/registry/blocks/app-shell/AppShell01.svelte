<!--
  AppShell01.svelte
  Navbar1 (with links + upgrade) + breadcrumb + page title/description +
  action buttons (Share, View, Edit, Publish) + slotted content area.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';
  import Navbar01 from '$lib/components/blocks/navbar/Navbar01.svelte';
  import type { Snippet } from 'svelte';

  let {
    class: className = '',
    title = 'Project alpha',
    description = 'Manage your project\'s details such as name, image, description and settings.',
    breadcrumbs = [{ label: 'Home', href: '#' }, { label: 'Settings', href: '#' }, { label: 'Profile details' }],
    onshare = () => {},
    onview = () => {},
    onedit = () => {},
    onpublish = () => {},
    children
  }: {
    class?: string;
    title?: string;
    description?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    onshare?: () => void;
    onview?: () => void;
    onedit?: () => void;
    onpublish?: () => void;
    children?: Snippet;
  } = $props();
</script>

<div class={cn('flex min-h-screen flex-col bg-muted/30', className)}>
  <Navbar01 />

  <div class="flex-1 px-4 py-6 md:px-8">
    <!-- Breadcrumb -->
    <nav class="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
      {#each breadcrumbs as crumb, i}
        {#if i > 0}<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>{/if}
        {#if crumb.href && i < breadcrumbs.length - 1}
          <a href={crumb.href} class="hover:text-foreground">{crumb.label}</a>
        {:else}
          <span class={i === breadcrumbs.length - 1 ? 'font-medium text-foreground' : ''}>{crumb.label}</span>
        {/if}
      {/each}
    </nav>

    <!-- Page header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

    <!-- Content slot -->
    {#if children}
      {@render children()}
    {:else}
      <div class="flex min-h-32 items-center justify-center rounded-lg border border-dashed bg-background text-sm text-muted-foreground">
        Slot (swap it with your content)
      </div>
    {/if}
  </div>
</div>
