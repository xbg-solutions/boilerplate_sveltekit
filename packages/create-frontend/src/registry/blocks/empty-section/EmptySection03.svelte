<!--
  EmptySection03.svelte
  Empty state: "Add members" title + description + email input + Send invite button
  + scrollable list of suggested people (avatar + name + role + + button).
  Flat and card variants.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  interface Person { name: string; role?: string; avatar?: string; }

  let {
    class: className = '',
    variant = 'flat' as 'flat' | 'card',
    title = 'Add members',
    description = 'Add the first person to start creating your team.',
    emailPlaceholder = 'Email',
    inviteLabel = 'Send invite',
    people = [
      { name: 'Kurt Bates', role: 'Innovation Specialist' },
      { name: 'Dennis Callis', role: 'Dennis Callis' },
      { name: 'Frances Swann', role: 'UI/UX Designer' }
    ] as Person[],
    oninvite = (_email: string) => {},
    onadd = (_name: string) => {}
  }: {
    class?: string;
    variant?: 'flat' | 'card';
    title?: string;
    description?: string;
    emailPlaceholder?: string;
    inviteLabel?: string;
    people?: Person[];
    oninvite?: (email: string) => void;
    onadd?: (name: string) => void;
  } = $props();

  let email = $state('');

  function initials(n: string) {
    return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
</script>

<div
  class={cn(
    variant === 'card' && 'rounded-lg border bg-background p-4 sm:p-6',
    className
  )}
>
  <!-- Icon + title + description -->
  <div class="flex flex-col items-center text-center">
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    </div>
    <p class="font-semibold">{title}</p>
    {#if description}
      <p class="mt-0.5 text-sm text-muted-foreground">{description}</p>
    {/if}
  </div>

  <!-- Email input + invite -->
  <div class="mt-4 flex gap-2">
    <input
      type="email"
      placeholder={emailPlaceholder}
      bind:value={email}
      class="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
    />
    <Button size="sm" onclick={() => { oninvite(email); email = ''; }}>{inviteLabel}</Button>
  </div>

  <!-- People list -->
  {#if people.length}
    <div class="mt-3 flex flex-col gap-1">
      {#each people as person}
        <div class="flex items-center gap-3 rounded-md border px-3 py-2">
          <div class="h-8 w-8 shrink-0 overflow-hidden rounded-full">
            {#if person.avatar}
              <img src={person.avatar} alt={person.name} class="h-full w-full object-cover" />
            {:else}
              <div class="flex h-full w-full items-center justify-center bg-muted text-xs font-semibold">{initials(person.name)}</div>
            {/if}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{person.name}</p>
            {#if person.role}<p class="text-xs text-muted-foreground truncate">{person.role}</p>{/if}
          </div>
          <button
            type="button"
            onclick={() => onadd(person.name)}
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-muted-foreground hover:bg-muted"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
