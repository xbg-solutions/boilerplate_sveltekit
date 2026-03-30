<!--
  StoreNavbar03.svelte
  Dark e-commerce navbar: dark bg, logo left, nav links center (white text),
  right: search icon, cart with badge, "Sign in" text button. White/light text throughout.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
    cartCount?: number;
  }

  let { class: className = '', cartCount = 1 }: Props = $props();

  let mobileOpen = $state(false);
</script>

<nav class={cn('w-full border-b bg-gray-950', className)}>
  <!-- Desktop -->
  <div class="hidden h-14 items-center gap-8 px-6 md:flex">
    <!-- Logo -->
    <div class="flex items-center">
      <div class="text-lg font-bold text-white">Store</div>
    </div>

    <!-- Nav links -->
    <div class="flex items-center gap-6">
      <a href="#" class="text-sm font-medium text-gray-300 hover:text-white">Men</a>
      <a href="#" class="text-sm font-medium text-gray-300 hover:text-white">Women</a>
      <a href="#" class="text-sm font-medium text-gray-300 hover:text-white">Kids</a>
      <a href="#" class="text-sm font-medium text-gray-300 hover:text-white">New</a>
      <a href="#" class="text-sm font-medium text-gray-300 hover:text-white">Sale</a>
    </div>

    <!-- Icons and button right -->
    <div class="ml-auto flex items-center gap-4">
      <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-800">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>

      <button type="button" class="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-800">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        {#if cartCount > 0}
          <span class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-0.5 text-[10px] font-bold text-gray-950">{cartCount}</span>
        {/if}
      </button>

      <button type="button" class="text-sm font-medium text-gray-300 hover:text-white">Sign in</button>
    </div>
  </div>

  <!-- Mobile -->
  <div class="flex h-14 items-center justify-between px-4 md:hidden">
    <button type="button" onclick={() => (mobileOpen = !mobileOpen)} class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-800">
      {#if mobileOpen}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      {/if}
    </button>
    <div class="text-lg font-bold text-white">Store</div>
    <div class="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-800">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      {#if cartCount > 0}
        <span class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-0.5 text-[10px] font-bold text-gray-950">{cartCount}</span>
      {/if}
    </div>
  </div>

  <!-- Mobile menu -->
  {#if mobileOpen}
    <div class="border-t border-gray-800 bg-gray-950 px-4 pb-4 md:hidden">
      <a href="#" class="block rounded-md px-2 py-2 text-sm text-gray-300 hover:bg-gray-800">Men</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm text-gray-300 hover:bg-gray-800">Women</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm text-gray-300 hover:bg-gray-800">Kids</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm text-gray-300 hover:bg-gray-800">New</a>
      <a href="#" class="block rounded-md px-2 py-2 text-sm text-gray-300 hover:bg-gray-800">Sale</a>
      <hr class="my-3 border-gray-800" />
      <button type="button" class="w-full text-left rounded-md px-2 py-2 text-sm text-gray-300 hover:bg-gray-800">Sign in</button>
    </div>
  {/if}
</nav>
