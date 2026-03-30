<!--
  Navbar02.svelte
  Logo-only left, right-aligned nav links + Upgrade button + avatar.
  Mobile: hamburger → full-screen menu.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface NavItem { label: string; href?: string; current?: boolean; }
  interface User { name: string; email: string; avatar?: string; }

  let {
    class: className = '',
    navItems = defaultNav(),
    user = { name: 'John Doe', email: 'hi@shadcndesign.com' },
    upgradeLabel = 'Upgrade',
    onupgrade = () => {}
  }: {
    class?: string;
    navItems?: NavItem[];
    user?: User;
    upgradeLabel?: string;
    onupgrade?: () => void;
  } = $props();

  function defaultNav(): NavItem[] {
    return [
      { label: 'Dashboard', href: '#', current: true },
      { label: 'Orders', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Customers', href: '#' },
      { label: 'Settings', href: '#' }
    ];
  }

  let mobileOpen = $state(false);
  let userMenuOpen = $state(false);
  function initials(n: string) { return n.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(); }
</script>

<nav class={cn('w-full border-b bg-background', className)}>
  <!-- Desktop -->
  <div class="hidden h-14 items-center justify-between px-4 md:flex">
    <div class="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    </div>
    <div class="flex items-center gap-1">
      {#each navItems as item}
        <a
          href={item.href ?? '#'}
          class={cn('rounded-md px-3 py-1.5 text-sm hover:bg-muted', item.current && 'bg-muted font-medium')}
        >{item.label}</a>
      {/each}
      <button type="button" onclick={onupgrade} class="ml-2 flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-foreground/90">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        {upgradeLabel}
      </button>
      <div class="relative ml-1">
        <button type="button" onclick={() => (userMenuOpen = !userMenuOpen)} class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-border hover:opacity-80">
          <span class="text-xs font-semibold">{initials(user.name)}</span>
        </button>
        {#if userMenuOpen}
          <div class="absolute right-0 top-full z-20 mt-1 w-52 rounded-md border bg-background p-1 shadow-md">
            <div class="px-3 py-2"><p class="text-sm font-medium">{user.name}</p><p class="text-xs text-muted-foreground">{user.email}</p></div>
            <hr class="my-1" />
            <a href="#" class="block rounded-sm px-3 py-1.5 text-sm hover:bg-muted">My profile</a>
            <a href="#" class="block rounded-sm px-3 py-1.5 text-sm hover:bg-muted">Account settings</a>
            <a href="#" class="block rounded-sm px-3 py-1.5 text-sm hover:bg-muted">Billing</a>
            <hr class="my-1" />
            <button type="button" class="w-full rounded-sm px-3 py-1.5 text-left text-sm hover:bg-muted">Sign out</button>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Mobile -->
  <div class="flex h-14 items-center justify-between px-4 md:hidden">
    <button type="button" onclick={() => (mobileOpen = !mobileOpen)} class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
      {#if mobileOpen}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      {/if}
    </button>
    <div class="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    </div>
    <button type="button" onclick={onupgrade} class="flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
      {upgradeLabel}
    </button>
  </div>

  {#if mobileOpen}
    <div class="border-t px-4 pb-4 md:hidden">
      {#each navItems as item}
        <a href={item.href ?? '#'} class={cn('block rounded-md px-2 py-2 text-sm hover:bg-muted', item.current && 'font-medium')}>{item.label}</a>
      {/each}
      <hr class="my-3" />
      <div class="flex items-center gap-3 px-2 py-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border"><span class="text-xs font-semibold">{initials(user.name)}</span></div>
        <div><p class="text-sm font-medium">{user.name}</p><p class="text-xs text-muted-foreground">{user.email}</p></div>
      </div>
      <a href="#" class="block rounded-md px-2 py-2 text-sm hover:bg-muted">My profile</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm hover:bg-muted">Account settings</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm hover:bg-muted">Billing</a>
      <button type="button" class="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted">Sign out</button>
    </div>
  {/if}
</nav>
