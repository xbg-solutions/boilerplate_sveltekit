<!--
  AppShell03.svelte
  Navbar2 + breadcrumb + page title/description + inline search + stacked slots.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';
  import Navbar02 from '$lib/components/blocks/navbar/Navbar02.svelte';
  import type { Snippet } from 'svelte';

  let {
    class: className = '',
    title = 'Project alpha',
    description = 'Manage your project\'s details such as name, avatar, email and bio.',
    breadcrumbs = [{ label: 'Home', href: '#' }, { label: 'Settings', href: '#' }, { label: 'Profile details' }],
    searchPlaceholder = 'Search',
    onpublish = () => {},
    onedit = () => {},
    children,
    slots = 3
  }: {
    class?: string;
    title?: string;
    description?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    searchPlaceholder?: string;
    onpublish?: () => void;
    onedit?: () => void;
    children?: Snippet;
    slots?: number;
  } = $props();
</script>

<div class={cn('flex min-h-screen flex-col bg-muted/30', className)}>
  <Navbar02 />

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

    <!-- Page header with inline search -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold">{title}</h1>
        {#if description}<p class="mt-1 text-sm text-muted-foreground">{description}</p>{/if}
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <div class="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder={searchPlaceholder} class="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-40" />
        </div>
        <Button size="sm" onclick={onpublish}>Publish</Button>
        <Button variant="outline" size="sm" onclick={onedit}>Edit</Button>
      </div>
    </div>

    <!-- Stacked slots -->
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
