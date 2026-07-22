<!--
  EmptySection04.svelte
  Empty state: title + description + list of action items (avatar/icon + label + description + + button).
  Flat and card variants.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface ActionItem { label: string; description?: string; icon?: string; onclick?: () => void; }

  let {
    class: className = '',
    variant = 'flat' as 'flat' | 'card',
    title = 'Projects',
    description = 'Create your first project by selecting a template or starting from scratch.',
    actions = [
      { label: 'Create a list', description: 'Organize tasks into simple lists.' },
      { label: 'Create a gallery', description: 'Plan events with clear schedules.' },
      { label: 'Create a calendar', description: 'Plan events with clear schedules.' }
    ] as ActionItem[]
  }: {
    class?: string;
    variant?: 'flat' | 'card';
    title?: string;
    description?: string;
    actions?: ActionItem[];
  } = $props();
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

  <div class="mt-4 flex flex-col gap-2">
    {#each actions as action}
      <button
        type="button"
        onclick={action.onclick}
        class="flex items-center gap-3 rounded-md border bg-background px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
      >
        <!-- Avatar/icon -->
        <div class="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
          {#if action.icon}
            <img src={action.icon} alt="" class="h-full w-full object-cover" />
          {:else}
            <div class="flex h-full w-full items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          {/if}
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">{action.label}</p>
          {#if action.description}
            <p class="text-xs text-muted-foreground">{action.description}</p>
          {/if}
        </div>

        <span
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-muted-foreground hover:bg-muted"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </span>
      </button>
    {/each}
  </div>
</div>
