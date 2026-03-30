<!--
  StoreNavbar04.svelte
  Navbar with mega menu: standard nav with hover states. Women category shows
  mega menu dropdown panel below nav with 3 cols (New Arrivals / Clothing / Accessories)
  and featured image placeholder on right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
    cartCount?: number;
  }

  let { class: className = '', cartCount = 4 }: Props = $props();

  let activeMegaMenu = $state<string | null>(null);
</script>

<nav class={cn('w-full border-b bg-white', className)}>
  <!-- Main navbar -->
  <div class="flex h-14 items-center gap-8 px-6">
    <!-- Logo -->
    <div class="flex items-center">
      <div class="text-lg font-bold">Store</div>
    </div>

    <!-- Nav links -->
    <div class="flex items-center gap-6">
      <a href="#" class="text-sm font-medium text-gray-700 hover:text-gray-900">Men</a>

      <div class="relative">
        <button
          type="button"
          onmouseenter={() => (activeMegaMenu = 'women')}
          onmouseleave={() => (activeMegaMenu = null)}
          class="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Women
        </button>
      </div>

      <a href="#" class="text-sm font-medium text-gray-700 hover:text-gray-900">Kids</a>
      <a href="#" class="text-sm font-medium text-gray-700 hover:text-gray-900">New</a>
      <a href="#" class="text-sm font-medium text-gray-700 hover:text-gray-900">Sale</a>
    </div>

    <!-- Icons right -->
    <div class="ml-auto flex items-center gap-4">
      <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>

      <button type="button" class="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        {#if cartCount > 0}
          <span class="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-0.5 text-[10px] font-bold text-white">{cartCount}</span>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mega menu panel -->
  {#if activeMegaMenu === 'women'}
    <div
      onmouseenter={() => (activeMegaMenu = 'women')}
      onmouseleave={() => (activeMegaMenu = null)}
      class="border-t bg-white px-6 py-8"
    >
      <div class="grid grid-cols-4 gap-8">
        <!-- Column 1: New Arrivals -->
        <div>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">New Arrivals</h3>
          <div class="space-y-2">
            <a href="#" class="block text-sm text-gray-700 hover:text-gray-900">Latest Styles</a>
            <a href="#" class="block text-sm text-gray-700 hover:text-gray-900">Trending Now</a>
            <a href="#" class="block text-sm text-gray-700 hover:text-gray-900">Just In</a>
          </div>
        </div>

        <!-- Column 2: Clothing -->
        <div>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Clothing</h3>
          <div class="space-y-2">
            <a href="#" class="block text-sm text-gray-700 hover:text-gray-900">Dresses</a>
            <a href="#" class="block text-sm text-gray-700 hover:text-gray-900">Tops</a>
            <a href="#" class="block text-sm text-gray-700 hover:text-gray-900">Bottoms</a>
            <a href="#" class="block text-sm text-gray-700 hover:text-gray-900">Outerwear</a>
          </div>
        </div>

        <!-- Column 3: Accessories -->
        <div>
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Accessories</h3>
          <div class="space-y-2">
            <a href="#" class="block text-sm text-gray-700 hover:text-gray-900">Bags</a>
            <a href="#" class="block text-sm text-gray-700 hover:text-gray-900">Shoes</a>
            <a href="#" class="block text-sm text-gray-700 hover:text-gray-900">Jewelry</a>
            <a href="#" class="block text-sm text-gray-700 hover:text-gray-900">Scarves</a>
          </div>
        </div>

        <!-- Column 4: Featured image -->
        <div class="flex items-center justify-center bg-gray-100 rounded-lg h-48">
          <div class="text-center text-gray-500 text-sm">Featured Image</div>
        </div>
      </div>
    </div>
  {/if}
</nav>
