<!--
  StoreNavbar01.svelte
  Standard e-commerce navbar: logo left, navigation links center (Men, Women, Kids, Sale, New Arrivals),
  icons right (search, wishlist heart, user, cart with badge count).
  Mobile: hamburger menu button. White bg with bottom border.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
    cartCount?: number;
    wishlistCount?: number;
  }

  let { class: className = '', cartCount = 3, wishlistCount = 2 }: Props = $props();

  let mobileOpen = $state(false);
</script>

<nav class={cn('w-full border-b bg-white', className)}>
  <!-- Desktop -->
  <div class="hidden h-14 items-center gap-8 px-6 md:flex">
    <!-- Logo -->
    <div class="flex items-center">
      <div class="text-lg font-bold">Store</div>
    </div>

    <!-- Nav links -->
    <div class="flex items-center gap-6">
      <a href="#" class="text-sm font-medium text-gray-700 hover:text-gray-900">Men</a>
      <a href="#" class="text-sm font-medium text-gray-700 hover:text-gray-900">Women</a>
      <a href="#" class="text-sm font-medium text-gray-700 hover:text-gray-900">Kids</a>
      <a href="#" class="text-sm font-medium text-gray-700 hover:text-gray-900">Sale</a>
      <a href="#" class="text-sm font-medium text-gray-700 hover:text-gray-900">New Arrivals</a>
    </div>

    <!-- Icons right -->
    <div class="ml-auto flex items-center gap-4">
      <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>

      <button type="button" class="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        {#if wishlistCount > 0}
          <span class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white">{wishlistCount}</span>
        {/if}
      </button>

      <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </button>

      <button type="button" class="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        {#if cartCount > 0}
          <span class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-0.5 text-[10px] font-bold text-white">{cartCount}</span>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile -->
  <div class="flex h-14 items-center justify-between px-4 md:hidden">
    <button type="button" onclick={() => (mobileOpen = !mobileOpen)} class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100">
      {#if mobileOpen}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      {/if}
    </button>
    <div class="text-lg font-bold">Store</div>
    <div class="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      {#if cartCount > 0}
        <span class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-0.5 text-[10px] font-bold text-white">{cartCount}</span>
      {/if}
    </div>
  </div>

  <!-- Mobile menu -->
  {#if mobileOpen}
    <div class="border-t bg-white px-4 pb-4 md:hidden">
      <a href="#" class="block rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100">Men</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100">Women</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100">Kids</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100">Sale</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100">New Arrivals</a>
      <hr class="my-3" />
      <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        Search
      </button>
      <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Account
      </button>
    </div>
  {/if}
</nav>
