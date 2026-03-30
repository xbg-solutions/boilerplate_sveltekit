<!--
  SidebarLayout06.svelte
  Documentation sidebar with flat section nav and newsletter subscription at bottom.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { Input, Button, Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '$lib/components/ui';

  let {
    class: className = '',
    sections = [],
    breadcrumbs = [],
    logo = 'Documentation',
    version = 'v1.0.1',
    children
  }: {
    class?: string;
    sections?: Array<{
      title?: string;
      links: Array<{ label: string; href: string; active?: boolean; options?: boolean }>;
    }>;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    logo?: string;
    version?: string;
    children?: Snippet;
  } = $props();

  let email = $state('');
</script>

<div class={cn('flex h-screen', className)}>
  <!-- Sidebar -->
  <aside class="flex w-64 flex-col border-r bg-background">
    <!-- Logo + Version -->
    <div class="flex items-center gap-2 border-b px-4 py-3">
      <span class="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
        D
      </span>
      <span class="font-semibold text-sm">{logo}</span>
      <span class="ml-auto text-xs text-muted-foreground">{version}</span>
      <!-- Lucide: ChevronsUpDown -->
      <button type="button" class="text-muted-foreground hover:text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
      </button>
    </div>

    <!-- Nav Sections -->
    <nav class="flex-1 overflow-y-auto px-2 py-3">
      {#each sections as section}
        {#if section.title}
          <p class="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</p>
        {/if}
        <ul class="mb-4 space-y-0.5">
          {#each section.links as link}
            <li>
              <a
                href={link.href}
                class={cn(
                  'flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors',
                  link.active
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{link.label}</span>
                {#if link.options}
                  <button type="button" class="text-muted-foreground hover:text-foreground" onclick={(e) => e.preventDefault()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      {/each}
    </nav>

    <!-- Newsletter Subscription -->
    <div class="border-t p-4">
      <p class="mb-1 text-sm font-semibold">Subscribe to our newsletter</p>
      <p class="mb-3 text-xs text-muted-foreground">Opt-in to receive updates and news about the sidebar.</p>
      <Input
        type="email"
        placeholder="Email"
        bind:value={email}
        class="mb-2"
      />
      <Button class="w-full" size="sm">Subscribe</Button>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex flex-1 flex-col overflow-hidden">
    <!-- Breadcrumb bar -->
    {#if breadcrumbs.length > 0}
      <div class="flex items-center gap-2 border-b px-6 py-3">
        <!-- Lucide: PanelLeft -->
        <button type="button" class="text-muted-foreground hover:text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
        </button>
        <Breadcrumb>
          {#each breadcrumbs as crumb, i}
            <BreadcrumbItem>
              {#if crumb.href}
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              {:else}
                <span class="text-sm text-foreground">{crumb.label}</span>
              {/if}
            </BreadcrumbItem>
            {#if i < breadcrumbs.length - 1}
              <BreadcrumbSeparator />
            {/if}
          {/each}
        </Breadcrumb>
      </div>
    {/if}
    <div class="flex-1 overflow-y-auto p-6">
      {@render children?.()}
    </div>
  </main>
</div>
