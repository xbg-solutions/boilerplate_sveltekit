<!--
  Card02.svelte
  Person card: avatar + name + badge + description. No action buttons.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    name = 'Title Text',
    badge = 'Admin',
    description = 'This is a card description.',
    avatar = ''
  }: {
    class?: string;
    name?: string;
    badge?: string;
    description?: string;
    avatar?: string;
  } = $props();

  function initials(n: string) {
    return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
</script>

<div class={cn('rounded-lg border bg-background p-4', className)}>
  <div class="flex items-start gap-3">
    <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
      {#if avatar}
        <img src={avatar} alt={name} class="h-full w-full object-cover" />
      {:else}
        <div class="flex h-full w-full items-center justify-center bg-muted text-xs font-semibold">
          {initials(name)}
        </div>
      {/if}
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <p class="font-semibold truncate">{name}</p>
        {#if badge}
          <span class="shrink-0 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background">{badge}</span>
        {/if}
      </div>
      {#if description}
        <p class="mt-0.5 text-sm text-muted-foreground">{description}</p>
      {/if}
    </div>
  </div>
</div>
