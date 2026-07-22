<!--
  SidebarLayout09.svelte
  Three-panel inbox layout: email list left, content center, account/folder nav right.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { Input } from '$lib/components/ui';

  type Email = {
    id: string;
    from: string;
    subject: string;
    preview: string;
    time: string;
    read?: boolean;
  };
  type Folder = { label: string; href: string; active?: boolean };

  let {
    class: className = '',
    emails = [],
    folders = [],
    accountName = 'Acme Inc',
    accountType = 'Enterprise',
    inboxLabel = 'Inbox',
    showUnreadsToggle = true,
    user = { name: 'shadcn', email: 'm@example.com' },
    selectedEmailId = null,
    children
  }: {
    class?: string;
    emails?: Email[];
    folders?: Folder[];
    accountName?: string;
    accountType?: string;
    inboxLabel?: string;
    showUnreadsToggle?: boolean;
    user?: { name: string; email: string };
    selectedEmailId?: string | null;
    children?: Snippet;
  } = $props();

  let showUnreads = $state(false);
  let search = $state('');
  // svelte-ignore state_referenced_locally
  let activeEmailId = $state(selectedEmailId);

  let filteredEmails = $derived(
    emails.filter(e =>
      (!showUnreads || !e.read) &&
      (!search || e.from.toLowerCase().includes(search.toLowerCase()) || e.subject.toLowerCase().includes(search.toLowerCase()))
    )
  );
</script>

<div class={cn('flex h-screen', className)}>
  <!-- Email list panel -->
  <aside class="flex w-72 flex-col border-r bg-background">
    <!-- Header -->
    <div class="flex items-center justify-between border-b px-4 py-3">
      <h2 class="font-semibold">{inboxLabel}</h2>
      {#if showUnreadsToggle}
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground">Unreads</span>
          <button
            type="button"
            role="switch"
            aria-label="Show unreads only"
            aria-checked={showUnreads}
            class={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors', showUnreads ? 'bg-primary' : 'bg-muted')}
            onclick={() => (showUnreads = !showUnreads)}
          >
            <span class={cn('inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform', showUnreads ? 'translate-x-4' : 'translate-x-1')}></span>
          </button>
        </div>
      {/if}
    </div>

    <!-- Search -->
    <div class="px-3 py-2">
      <Input type="search" placeholder="Search" bind:value={search} class="h-8 text-sm" />
    </div>

    <!-- Email threads -->
    <ul class="flex-1 overflow-y-auto divide-y">
      {#each filteredEmails as email}
        <li>
          <button
            type="button"
            class={cn(
              'w-full px-4 py-3 text-left transition-colors hover:bg-muted',
              activeEmailId === email.id && 'bg-muted'
            )}
            onclick={() => (activeEmailId = email.id)}
          >
            <div class="mb-1 flex items-center justify-between">
              <span class={cn('text-sm', !email.read && 'font-semibold')}>{email.from}</span>
              <span class="text-xs text-muted-foreground">{email.time}</span>
            </div>
            <p class={cn('mb-1 text-sm', !email.read && 'font-medium')}>{email.subject}</p>
            <p class="line-clamp-2 text-xs text-muted-foreground">{email.preview}</p>
          </button>
        </li>
      {/each}
    </ul>
  </aside>

  <!-- Main content -->
  <main class="flex flex-1 flex-col overflow-hidden">
    <div class="flex items-center gap-2 border-b px-4 py-3">
      <span class="text-sm text-muted-foreground">All Inboxes</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      <span class="text-sm font-medium">{inboxLabel}</span>
    </div>
    <div class="flex-1 overflow-y-auto">
      {@render children?.()}
    </div>
  </main>

  <!-- Right account/folder nav -->
  <aside class="flex w-56 flex-col border-l bg-background">
    <!-- Account header -->
    <div class="flex items-center gap-2 border-b px-4 py-3">
      <div class="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
        {accountName.slice(0, 1)}
      </div>
      <div>
        <p class="text-sm font-semibold">{accountName}</p>
        <p class="text-xs text-muted-foreground">{accountType}</p>
      </div>
    </div>

    <!-- Folders -->
    <nav class="flex-1 overflow-y-auto px-2 py-2">
      <ul class="space-y-0.5">
        {#each folders as folder}
          <li>
            <a
              href={folder.href}
              class={cn(
                'flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors',
                folder.active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <!-- Generic folder icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
              {folder.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <!-- User footer -->
    <div class="flex items-center gap-3 border-t px-4 py-3">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {user.name.slice(0, 2).toUpperCase()}
      </div>
      <div class="flex-1 overflow-hidden">
        <p class="truncate text-sm font-medium">{user.name}</p>
        <p class="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <button type="button" aria-label="Switch account" class="text-muted-foreground hover:text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
      </button>
    </div>
  </aside>
</div>
