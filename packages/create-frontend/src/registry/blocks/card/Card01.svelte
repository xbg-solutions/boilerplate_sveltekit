<!--
  Card01.svelte
  Person card: avatar (circle) + name + badge + description + Email/Call action buttons.
  Desktop: horizontal layout. Mobile: stacked.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    name = 'Title Text',
    badge = 'Admin',
    description = 'This is a card description.',
    avatar = '',
    onemail = () => {},
    oncall = () => {}
  }: {
    class?: string;
    name?: string;
    badge?: string;
    description?: string;
    avatar?: string;
    onemail?: () => void;
    oncall?: () => void;
  } = $props();

  function initials(n: string) {
    return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
</script>

<div class={cn('rounded-lg border bg-background p-4', className)}>
  <!-- Header row -->
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

  <!-- Actions -->
  <div class="mt-4 flex items-center gap-0 divide-x rounded-md border">
    <Button variant="ghost" size="sm" onclick={onemail} class="flex-1 gap-1.5 rounded-r-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      Email
    </Button>
    <Button variant="ghost" size="sm" onclick={oncall} class="flex-1 gap-1.5 rounded-l-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      Call
    </Button>
  </div>
</div>
