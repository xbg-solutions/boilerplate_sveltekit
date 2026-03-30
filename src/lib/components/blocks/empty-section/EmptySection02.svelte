<!--
  EmptySection02.svelte
  Empty state with action grid: title + description + 2x3 grid of action items
  (icon + label + description + arrow button).
  Desktop: 3-col grid. Mobile: single-col list. Flat and card variants.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface ActionItem {
    icon?: string;
    label: string;
    description?: string;
    href?: string;
    onclick?: () => void;
  }

  let {
    class: className = '',
    variant = 'flat' as 'flat' | 'card',
    title = 'Products',
    description = 'Create your first project by selecting a template or starting from scratch.',
    actions = [
      { label: 'Create a list', description: 'Organize tasks into simple lists.' },
      { label: 'Create a gallery', description: 'Showcase items visually and neatly.' },
      { label: 'Create a calendar', description: 'Plan events with clear schedules.' },
      { label: 'Create a board', description: 'Manage projects with visual boards.' },
      { label: 'Create a team', description: 'Collaborate effectively with your team.' },
      { label: 'Create a timeline', description: 'Track progress with chronological views.' }
    ] as ActionItem[]
  }: {
    class?: string;
    variant?: 'flat' | 'card';
    title?: string;
    description?: string;
    actions?: ActionItem[];
  } = $props();

  const iconPaths: Record<string, string> = {
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    gallery: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z',
    calendar: 'M3 4h18v18H3V4zM16 2v4M8 2v4M3 10h18',
    board: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z',
    team: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    timeline: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'
  };

  function getIconPath(label: string): string {
    const key = label.toLowerCase();
    if (key.includes('list')) return iconPaths.list;
    if (key.includes('gallery')) return iconPaths.gallery;
    if (key.includes('calendar')) return iconPaths.calendar;
    if (key.includes('board')) return iconPaths.board;
    if (key.includes('team')) return iconPaths.team;
    if (key.includes('timeline')) return iconPaths.timeline;
    return 'M12 5v14M5 12h14';
  }
</script>

<div
  class={cn(
    variant === 'card' && 'rounded-lg border bg-background p-4 sm:p-6',
    className
  )}
>
  <h2 class="font-semibold">{title}</h2>
  {#if description}
    <p class="mt-0.5 text-sm text-muted-foreground">{description}</p>
  {/if}

  <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
    {#each actions as action}
      <button
        type="button"
        onclick={action.onclick}
        class="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d={getIconPath(action.label)} />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">{action.label}</p>
          {#if action.description}
            <p class="text-xs text-muted-foreground truncate">{action.description}</p>
          {/if}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    {/each}
  </div>
</div>
