<!--
  PageHeader02.svelte
  Breadcrumb + title + description left, Share/View/Edit/Publish actions right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    breadcrumbs = [{ label: 'Home', href: '#' }, { label: 'Settings', href: '#' }, { label: 'Profile details' }],
    title = 'Project alpha',
    description = "Manage your project's details such as name, image, description and settings.",
    onshare = () => {},
    onview = () => {},
    onedit = () => {},
    onpublish = () => {}
  }: {
    class?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    title?: string;
    description?: string;
    onshare?: () => void;
    onview?: () => void;
    onedit?: () => void;
    onpublish?: () => void;
  } = $props();
</script>

<div class={cn('py-4', className)}>
  <!-- Breadcrumb -->
  <nav class="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
    {#each breadcrumbs as crumb, i}
      {#if i > 0}
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      {/if}
      {#if crumb.href && i < breadcrumbs.length - 1}
        <a href={crumb.href} class="hover:text-foreground">{crumb.label}</a>
      {:else}
        <span class={i === breadcrumbs.length - 1 ? 'font-medium text-foreground' : ''}>{crumb.label}</span>
      {/if}
    {/each}
  </nav>

  <!-- Header row -->
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
    </div>
  </div>
</div>
