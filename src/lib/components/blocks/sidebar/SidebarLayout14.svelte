<!--
  SidebarLayout14.svelte
  Right-side table of contents: main content left, sticky TOC panel on right.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '$lib/components/ui';

  type TocEntry = { label: string; href: string; level?: number; active?: boolean };
  type TocSection = { title: string; items: TocEntry[] };

  let {
    class: className = '',
    tocSections = [],
    breadcrumbs = [],
    showPanelToggle = true,
    children
  }: {
    class?: string;
    tocSections?: TocSection[];
    breadcrumbs?: Array<{ label: string; href?: string }>;
    showPanelToggle?: boolean;
    children?: Snippet;
  } = $props();
</script>

<div class={cn('flex h-screen', className)}>
  <!-- Main content -->
  <main class="flex flex-1 flex-col overflow-hidden">
    {#if breadcrumbs.length > 0}
      <div class="flex items-center gap-2 border-b px-6 py-3">
        {#if showPanelToggle}
          <button type="button" aria-label="Toggle sidebar" class="text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
          </button>
        {/if}
        <Breadcrumb>
          {#each breadcrumbs as crumb, i}
            <BreadcrumbItem>
              {#if crumb.href}<BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              {:else}<span class="text-sm text-foreground">{crumb.label}</span>
              {/if}
            </BreadcrumbItem>
            {#if i < breadcrumbs.length - 1}<BreadcrumbSeparator />{/if}
          {/each}
        </Breadcrumb>
        <!-- Right-side panel toggle -->
        {#if showPanelToggle}
          <div class="ml-auto">
            <button type="button" aria-label="Toggle right panel" class="text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>
            </button>
          </div>
        {/if}
      </div>
    {/if}
    <div class="flex-1 overflow-y-auto p-6">{@render children?.()}</div>
  </main>

  <!-- Right TOC panel -->
  <aside class="flex w-56 flex-col border-l bg-background">
    <div class="overflow-y-auto px-4 py-4">
      {#each tocSections as section}
        <div class="mb-4">
          <p class="mb-2 text-xs font-semibold text-foreground">{section.title}</p>
          <ul class="space-y-1">
            {#each section.items as item}
              <li>
                <a
                  href={item.href}
                  class={cn(
                    'block text-sm transition-colors leading-snug',
                    item.level && item.level > 1 ? 'pl-3' : '',
                    item.active
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >{item.label}</a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </aside>
</div>
