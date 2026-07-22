<!--
  SidebarLayout11.svelte
  File explorer sidebar (VS Code-style): Changes section and expandable Files tree.
-->
<script module lang="ts">
  export type FileNode = { name: string; type: 'file' | 'dir'; children?: FileNode[] };
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '$lib/components/ui';

  type FileStatus = 'modified' | 'untracked' | 'added' | 'deleted';
  type ChangedFile = { path: string; status: FileStatus };

  let {
    class: className = '',
    changes = [],
    files = [],
    breadcrumbs = [],
    children
  }: {
    class?: string;
    changes?: ChangedFile[];
    files?: FileNode[];
    breadcrumbs?: Array<{ label: string; href?: string }>;
    children?: Snippet;
  } = $props();

  let openDirs = $state<Set<string>>(new Set(['app', 'components']));

  function toggleDir(path: string) {
    openDirs = openDirs.has(path)
      ? new Set([...openDirs].filter(p => p !== path))
      : new Set([...openDirs, path]);
  }

  const STATUS_BADGE: Record<FileStatus, { label: string; color: string }> = {
    modified: { label: 'M', color: 'text-amber-500' },
    untracked: { label: 'U', color: 'text-green-500' },
    added: { label: 'A', color: 'text-green-500' },
    deleted: { label: 'D', color: 'text-red-500' },
  };
</script>

{#snippet fileTree(nodes: FileNode[], depth: number, parentPath: string)}
  {#each nodes as node}
    {@const path = `${parentPath}/${node.name}`}
    {#if node.type === 'dir'}
      <li>
        <button
          type="button"
          class="flex w-full items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          style="padding-left: {8 + depth * 12}px"
          onclick={() => toggleDir(path)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cn('shrink-0 transition-transform', openDirs.has(path) && 'rotate-90')}>
            <path d="m9 18 6-6-6-6"/>
          </svg>
          <!-- Folder icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"/>
          </svg>
          <span>{node.name}</span>
        </button>
        {#if openDirs.has(path) && node.children}
          <ul>{@render fileTree(node.children, depth + 1, path)}</ul>
        {/if}
      </li>
    {:else}
      <li>
        <a
          href="#"
          class="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          style="padding-left: {8 + depth * 12 + 13}px"
        >
          <!-- File icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
          </svg>
          <span>{node.name}</span>
        </a>
      </li>
    {/if}
  {/each}
{/snippet}

<div class={cn('flex h-screen', className)}>
  <aside class="flex w-64 flex-col border-r bg-background text-sm">
    <!-- Changes -->
    {#if changes.length > 0}
      <div class="border-b">
        <div class="flex items-center justify-between px-3 py-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Changes</span>
        </div>
        <ul class="pb-2">
          {#each changes as file}
            <li class="flex items-center justify-between px-3 py-0.5 hover:bg-muted">
              <span class="truncate text-xs text-foreground">{file.path}</span>
              <span class={cn('ml-2 shrink-0 text-xs font-semibold', STATUS_BADGE[file.status].color)}>
                {STATUS_BADGE[file.status].label}
              </span>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Files tree -->
    <div class="flex-1 overflow-y-auto">
      <div class="flex items-center justify-between px-3 py-2">
        <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Files</span>
      </div>
      <ul>
        {@render fileTree(files, 0, '')}
      </ul>
    </div>
  </aside>

  <main class="flex flex-1 flex-col overflow-hidden">
    {#if breadcrumbs.length > 0}
      <div class="flex items-center gap-2 border-b px-6 py-3">
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
      </div>
    {/if}
    <div class="flex-1 overflow-y-auto p-6">{@render children?.()}</div>
  </main>
</div>
