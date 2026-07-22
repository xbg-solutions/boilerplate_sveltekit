<!--
  Navbar01.svelte
  Full app navbar: logo left, nav links with badge + dropdown centre-left,
  search + avatar + upgrade button right. Mobile: hamburger → slide-down menu
  with collapsible Settings sub-items + user profile footer.
-->
<script module lang="ts">
  export interface NavItem {
    label: string;
    href?: string;
    badge?: number | string;
    children?: NavItem[];
  }
</script>

<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  interface User {
    name: string;
    email: string;
    avatar?: string;
  }

  let {
    class: className = '',
    logo,
    navItems = defaultNavItems(),
    user = { name: 'John Doe', email: 'hi@shadcndesign.com' },
    upgradeLabel = 'Upgrade',
    onupgrade = () => {},
    children
  }: {
    class?: string;
    logo?: Snippet;
    navItems?: NavItem[];
    user?: User;
    upgradeLabel?: string;
    onupgrade?: () => void;
    children?: Snippet;
  } = $props();

  function defaultNavItems(): NavItem[] {
    return [
      { label: 'Dashboard', href: '#' },
      { label: 'Orders', href: '#', badge: 2 },
      { label: 'Products', href: '#' },
      { label: 'Customers', href: '#' },
      {
        label: 'Settings',
        children: [
          { label: 'General', href: '#' },
          { label: 'Security', href: '#' },
          { label: 'API', href: '#' },
          { label: 'Advanced', href: '#' }
        ]
      }
    ];
  }

  let mobileOpen = $state(false);
  let openDropdown = $state<string | null>(null);
  let userMenuOpen = $state(false);

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
</script>

<nav class={cn('w-full border-b bg-background', className)}>
  <!-- Desktop -->
  <div class="hidden h-14 items-center gap-6 px-4 md:flex">
    <!-- Logo -->
    <div class="flex shrink-0 items-center">
      {#if logo}
        {@render logo()}
      {:else}
        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        </div>
      {/if}
    </div>

    <!-- Nav links -->
    <div class="flex items-center gap-1">
      {#each navItems as item}
        {#if item.children}
          <div class="relative">
            <button
              type="button"
              onclick={() => (openDropdown = openDropdown === item.label ? null : item.label)}
              class="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm hover:bg-muted"
            >
              {item.label}
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {#if openDropdown === item.label}
              <div class="absolute left-0 top-full z-20 mt-1 min-w-[160px] rounded-md border bg-background p-1 shadow-md">
                {#each item.children as child}
                  <a href={child.href ?? '#'} class="block rounded-sm px-3 py-1.5 text-sm hover:bg-muted">{child.label}</a>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <a
            href={item.href ?? '#'}
            class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm hover:bg-muted"
          >
            {item.label}
            {#if item.badge}
              <span class="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">{item.badge}</span>
            {/if}
          </a>
        {/if}
      {/each}
    </div>

    <div class="ml-auto flex items-center gap-2">
      <!-- Search -->
      <button type="button" aria-label="Search" class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>
      <!-- Avatar -->
      <div class="relative">
        <button type="button" onclick={() => (userMenuOpen = !userMenuOpen)} class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-border hover:opacity-80">
          {#if user.avatar}
            <img src={user.avatar} alt={user.name} class="h-full w-full object-cover" />
          {:else}
            <span class="text-xs font-semibold">{initials(user.name)}</span>
          {/if}
        </button>
        {#if userMenuOpen}
          <div class="absolute right-0 top-full z-20 mt-1 w-52 rounded-md border bg-background p-1 shadow-md">
            <div class="px-3 py-2 text-sm font-medium">{user.name}</div>
            <div class="px-3 pb-2 text-xs text-muted-foreground">{user.email}</div>
            <hr class="my-1" />
            <a href="#" class="block rounded-sm px-3 py-1.5 text-sm hover:bg-muted">My profile</a>
            <a href="#" class="block rounded-sm px-3 py-1.5 text-sm hover:bg-muted">Account settings</a>
            <a href="#" class="block rounded-sm px-3 py-1.5 text-sm hover:bg-muted">Billing</a>
            <hr class="my-1" />
            <button type="button" class="w-full rounded-sm px-3 py-1.5 text-left text-sm hover:bg-muted">Sign out</button>
          </div>
        {/if}
      </div>
      <!-- Upgrade -->
      <button
        type="button"
        onclick={onupgrade}
        class="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-foreground/90"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        {upgradeLabel}
      </button>
    </div>
  </div>

  <!-- Mobile closed -->
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
    <div class="flex items-center gap-2">
      <button type="button" aria-label="Search" class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>
      <button type="button" onclick={onupgrade} class="flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        {upgradeLabel}
      </button>
      <button type="button" onclick={() => (userMenuOpen = !userMenuOpen)} class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-border">
        <span class="text-xs font-semibold">{initials(user.name)}</span>
      </button>
    </div>
  </div>

  <!-- Mobile drawer -->
  {#if mobileOpen}
    <div class="border-t px-4 pb-4 md:hidden">
      {#each navItems as item}
        {#if item.children}
          <div>
            <button
              type="button"
              onclick={() => (openDropdown = openDropdown === item.label ? null : item.label)}
              class="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-muted"
            >
              {item.label}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cn('transition-transform', openDropdown === item.label && 'rotate-180')}><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {#if openDropdown === item.label}
              <div class="ml-4 flex flex-col">
                {#each item.children as child}
                  <a href={child.href ?? '#'} class="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted">{child.label}</a>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <a href={item.href ?? '#'} class="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
            {item.label}
            {#if item.badge}
              <span class="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">{item.badge}</span>
            {/if}
          </a>
        {/if}
      {/each}
      <hr class="my-3" />
      <div class="flex items-center gap-3 px-2 py-2">
        <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-border">
          <span class="text-xs font-semibold">{initials(user.name)}</span>
        </div>
        <div>
          <p class="text-sm font-medium">{user.name}</p>
          <p class="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <a href="#" class="block rounded-md px-2 py-2 text-sm hover:bg-muted">My profile</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm hover:bg-muted">Account settings</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm hover:bg-muted">Billing</a>
      <button type="button" class="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted">Sign out</button>
    </div>
  {/if}
</nav>

{#if children}
  {@render children()}
{/if}
