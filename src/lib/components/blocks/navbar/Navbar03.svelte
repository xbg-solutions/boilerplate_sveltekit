<!--
  Navbar03.svelte
  Minimal: logo left, centred search bar, notification badge + avatar right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface User { name: string; email: string; avatar?: string; }

  let {
    class: className = '',
    searchPlaceholder = 'Search…',
    notificationCount = 2,
    user = { name: 'John Doe', email: 'hi@shadcndesign.com' }
  }: {
    class?: string;
    searchPlaceholder?: string;
    notificationCount?: number;
    user?: User;
  } = $props();

  let userMenuOpen = $state(false);
  function initials(n: string) { return n.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(); }
</script>

<nav class={cn('w-full border-b bg-background', className)}>
  <!-- Desktop -->
  <div class="hidden h-14 items-center gap-4 px-4 md:flex">
    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    </div>
    <!-- Search -->
    <div class="flex flex-1 items-center gap-2 rounded-md border px-3 py-1.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" placeholder={searchPlaceholder} class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
    </div>
    <div class="flex items-center gap-2">
      <!-- Notification bell -->
      <div class="relative">
        <button type="button" aria-label="View notifications" class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
        {#if notificationCount > 0}
          <span class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-bold text-background">{notificationCount}</span>
        {/if}
      </div>
      <!-- Avatar -->
      <div class="relative">
        <button type="button" onclick={() => (userMenuOpen = !userMenuOpen)} class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-border hover:opacity-80">
          <span class="text-xs font-semibold">{initials(user.name)}</span>
        </button>
        {#if userMenuOpen}
          <div class="absolute right-0 top-full z-20 mt-1 w-52 rounded-md border bg-background p-1 shadow-md">
            <div class="px-3 py-2"><p class="text-sm font-medium">{user.name}</p><p class="text-xs text-muted-foreground">{user.email}</p></div>
            <hr class="my-1" />
            <a href="#" class="block rounded-sm px-3 py-1.5 text-sm hover:bg-muted">My profile</a>
            <a href="#" class="block rounded-sm px-3 py-1.5 text-sm hover:bg-muted">Account settings</a>
            <hr class="my-1" />
            <button type="button" class="w-full rounded-sm px-3 py-1.5 text-left text-sm hover:bg-muted">Sign out</button>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Mobile -->
  <div class="flex h-14 items-center justify-between px-4 md:hidden">
    <div class="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    </div>
    <div class="flex items-center gap-2">
      <button type="button" aria-label="Search" class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>
      <div class="relative">
        <button type="button" aria-label="View notifications" class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
        {#if notificationCount > 0}
          <span class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-bold text-background">{notificationCount}</span>
        {/if}
      </div>
      <button type="button" class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-border">
        <span class="text-xs font-semibold">{initials(user.name)}</span>
      </button>
    </div>
  </div>
</nav>
