<!--
  SidebarLayout01.svelte
  Documentation sidebar with grouped nav links, search, and breadcrumb.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Input, Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '$lib/components/ui';

  let className: string = '';
  export { className as class };

  export let sections: Array<{
    title: string;
    links: Array<{ label: string; href: string; active?: boolean }>;
  }> = [];

  export let breadcrumbs: Array<{ label: string; href?: string }> = [];
  export let logo: string = 'Docs';
  export let version: string = 'v1.0.0';

  let searchQuery = '';
</script>

<div class={cn('flex h-screen', className)}>
  <!-- Sidebar -->
  <aside class="flex w-64 flex-col border-r bg-background">
    <!-- Logo + Version -->
    <div class="flex items-center gap-2 border-b px-4 py-3">
      <!-- Lucide: BookOpen -->
      <span class="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground">D</span>
      <span class="font-semibold">{logo}</span>
      <span class="ml-auto text-xs text-muted-foreground">{version}</span>
    </div>

    <!-- Search -->
    <div class="p-4">
      <Input
        type="search"
        placeholder="Search documentation..."
        bind:value={searchQuery}
      />
    </div>

    <!-- Nav Sections -->
    <nav class="flex-1 overflow-y-auto px-3 pb-4">
      {#each sections as section}
        <div class="mb-4">
          <h4 class="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h4>
          <ul class="space-y-0.5">
            {#each section.links as link}
              <li>
                <a
                  href={link.href}
                  class={cn(
                    'block rounded-md px-2 py-1.5 text-sm transition-colors',
                    link.active
                      ? 'bg-muted font-semibold text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="flex flex-1 flex-col overflow-hidden">
    <!-- Breadcrumb -->
    {#if breadcrumbs.length > 0}
      <div class="border-b px-6 py-3">
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

    <!-- Content Slot -->
    <div class="flex-1 overflow-y-auto p-6">
      <slot />
    </div>
  </main>
</div>
