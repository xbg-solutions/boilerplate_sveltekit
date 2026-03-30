<!--
  SectionHeader05.svelte
  Title + description left. Labeled toggle switch right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    title = 'Storage',
    description = 'Read and write directly to databases and stores from your projects.',
    toggleLabel = 'Enabled',
    enabled = false,
    ontoggle = (_: boolean) => {}
  }: {
    class?: string;
    title?: string;
    description?: string;
    toggleLabel?: string;
    enabled?: boolean;
    ontoggle?: (value: boolean) => void;
  } = $props();

  let isEnabled = $state(enabled);

  function handleToggle() {
    isEnabled = !isEnabled;
    ontoggle(isEnabled);
  }
</script>

<div class={cn('py-4', className)}>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <!-- Left -->
    <div>
      <h2 class="text-lg font-semibold">{title}</h2>
      {#if description}
        <p class="mt-0.5 text-sm text-muted-foreground">{description}</p>
      {/if}
    </div>

    <!-- Right: toggle -->
    <div class="flex shrink-0 items-center gap-2">
      <span class="text-sm text-muted-foreground">{toggleLabel}</span>
      <button
        type="button"
        role="switch"
        aria-checked={isEnabled}
        onclick={handleToggle}
        class={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isEnabled ? 'bg-foreground' : 'bg-input'
        )}
      >
        <span
          class={cn(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
            isEnabled ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  </div>
</div>
