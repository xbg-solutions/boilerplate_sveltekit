<!--
  StoreNavbar02.svelte
  Navbar with search bar: logo left, center full search input with search icon,
  right: user icon, cart icon with badge.
  Below: category nav strip (All | Clothing | Shoes | Bags | Accessories | Sale)
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
    cartCount?: number;
  }

  let { class: className = '', cartCount = 2 }: Props = $props();

  let searchQuery = $state('');
</script>

<nav class={cn('w-full border-b bg-white', className)}>
  <!-- Main navbar -->
  <div class="flex h-14 items-center gap-4 px-6 md:gap-6">
    <!-- Logo -->
    <div class="flex items-center">
      <div class="text-lg font-bold">Store</div>
    </div>

    <!-- Search bar center -->
    <div class="flex flex-1 items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search for products..."
        class="ml-2 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-gray-500"
      />
    </div>

    <!-- Icons right -->
    <div class="flex items-center gap-4">
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

  <!-- Category strip -->
  <div class="border-t bg-gray-50 px-6">
    <div class="flex gap-6">
      <a href="#" class="rounded-none py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-900">All</a>
      <a href="#" class="rounded-none py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-900">Clothing</a>
      <a href="#" class="rounded-none py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-900">Shoes</a>
      <a href="#" class="rounded-none py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-900">Bags</a>
      <a href="#" class="rounded-none py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-900">Accessories</a>
      <a href="#" class="rounded-none py-2 text-sm font-medium text-red-600 hover:text-red-700 border-b-2 border-transparent hover:border-red-700">Sale</a>
    </div>
  </div>
</nav>
