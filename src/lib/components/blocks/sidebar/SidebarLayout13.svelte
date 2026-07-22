<!--
  SidebarLayout13.svelte
  Settings modal/dialog: left nav list, right content panel, close button, breadcrumb.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  type SettingsItem = { label: string; href?: string; icon?: string; active?: boolean };

  let {
    class: className = '',
    items = [],
    title = 'Settings',
    onclose,
    children
  }: {
    class?: string;
    items?: SettingsItem[];
    title?: string;
    onclose?: () => void;
    children?: Snippet;
  } = $props();

  // Lucide-style icon paths for common settings items
  const ICONS: Record<string, string> = {
    notifications: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
    navigation: 'M3 12h18 M3 6h18 M3 18h18',
    home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    appearance: 'M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z M12 12a7 7 0 1 0 0 14A7 7 0 0 0 12 12z',
    messages: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    language: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    accessibility: 'M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M12 8l-4 1 M12 8l4 1 M8 9l-2 8 M16 9l2 8 M10 17l2 5 M14 17l-2 5',
    read: 'M20 6 9 17l-5-5',
    audio: 'M11 5 6 9H2v6h4l5 4V5z M15.54 8.46a5 5 0 0 1 0 7.07',
    accounts: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    privacy: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    advanced: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  };

  const activeItem = $derived(items.find(i => i.active)?.label ?? items[0]?.label ?? '');

  function iconPath(item: SettingsItem): string {
    if (!item.icon) return '';
    return ICONS[item.icon] ?? ICONS['advanced'];
  }
</script>

<!-- Modal overlay -->
<div class={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/50', className)}>
  <div class="relative flex h-[600px] w-[900px] max-w-[95vw] overflow-hidden rounded-xl border bg-background shadow-xl">
    <!-- Left nav -->
    <nav class="flex w-56 flex-col border-r bg-muted/30">
      <div class="border-b px-4 py-4">
        <h2 class="font-semibold">{title}</h2>
      </div>
      <ul class="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {#each items as item}
          <li>
            <a
              href={item.href ?? '#'}
              class={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                item.active || item.label === activeItem
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {#if item.icon}
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
                  <path d={iconPath(item)} />
                </svg>
              {/if}
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <!-- Right content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Content header -->
      <div class="flex items-center justify-between border-b px-6 py-4">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{title}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          <span class="font-medium text-foreground">{activeItem}</span>
        </div>
        <button
          type="button"
          class="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          onclick={onclose}
          aria-label="Close settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <!-- Slot content -->
      <div class="flex-1 overflow-y-auto p-6">
        {@render children?.()}
      </div>
    </div>
  </div>
</div>
