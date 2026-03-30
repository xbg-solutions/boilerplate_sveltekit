<!--
  StoreNavbar05.svelte
  Mobile-first collapsible store navbar: compact nav with logo + hamburger.
  When open: full-width mobile menu with search, nav links, user/cart links.
  Smooth transform animation.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
    cartCount?: number;
  }

  let { class: className = '', cartCount = 2 }: Props = $props();

  let isOpen = $state(false);
  let searchQuery = $state('');
</script>

<nav class={cn('w-full border-b bg-white', className)}>
  <!-- Header -->
  <div class="flex h-14 items-center justify-between px-4">
    <button type="button" onclick={() => (isOpen = !isOpen)} class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100">
      {#if isOpen}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      {/if}
    </button>

    <div class="text-base font-bold">Store</div>

    <div class="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      {#if cartCount > 0}
        <span class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-0.5 text-[10px] font-bold text-white">{cartCount}</span>
      {/if}
    </div>
  </div>

  <!-- Collapsible menu -->
  {#if isOpen}
    <div class="origin-top animate-in fade-in slide-in-from-top-2 border-t bg-white px-4 py-4 duration-300">
      <!-- Search -->
      <div class="mb-4 flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search..."
          class="ml-2 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-500"
        />
      </div>

      <!-- Nav links -->
      <div class="space-y-1 mb-4">
        <a href="#" class="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Men</a>
        <a href="#" class="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Women</a>
        <a href="#" class="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Kids</a>
        <a href="#" class="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">New Arrivals</a>
        <a href="#" class="block rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Sale</a>
      </div>

      <hr class="my-3" />

      <!-- User and cart links -->
      <div class="space-y-1">
        <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Account
        </button>
        <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          Wishlist
        </button>
      </div>
    </div>
  {/if}
</nav>
