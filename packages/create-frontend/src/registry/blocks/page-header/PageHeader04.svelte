<!--
  PageHeader04.svelte
  Breadcrumb + title + description left, inline search bar right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    breadcrumbs = [{ label: 'Home', href: '#' }, { label: 'Settings', href: '#' }, { label: 'Profile details' }],
    title = 'Project alpha',
    description = 'Manage your profile details such as name, avatar, email and bio.',
    searchPlaceholder = 'Search'
  }: {
    class?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    title?: string;
    description?: string;
    searchPlaceholder?: string;
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
    <div class="flex shrink-0 items-center gap-2 rounded-md border bg-background px-3 py-1.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" placeholder={searchPlaceholder} class="w-44 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
    </div>
  </div>
</div>
