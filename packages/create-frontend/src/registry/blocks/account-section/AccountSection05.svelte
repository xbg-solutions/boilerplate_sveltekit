<!--
  AccountSection05.svelte
  Wishlist page: "My Wishlist (8)" heading.
  4-col grid of saved product cards with: image placeholder, name, price,
  "Move to cart" + remove (X) buttons.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const wishlistItems = [
    { id: 1, name: 'Premium Leather Jacket', price: '$189.99', category: 'Outerwear' },
    { id: 2, name: 'Classic White Sneakers', price: '$79.99', category: 'Shoes' },
    { id: 3, name: 'Wool Blend Trousers', price: '$129.99', category: 'Bottoms' },
    { id: 4, name: 'Silk Scarf', price: '$49.99', category: 'Accessories' },
    { id: 5, name: 'Cotton T-Shirt', price: '$29.99', category: 'Tops' },
    { id: 6, name: 'Designer Sunglasses', price: '$159.99', category: 'Accessories' },
    { id: 7, name: 'Canvas Tote Bag', price: '$89.99', category: 'Bags' },
    { id: 8, name: 'Cashmere Sweater', price: '$179.99', category: 'Tops' }
  ];
</script>

<div class={cn('w-full bg-gray-50 py-8', className)}>
  <div class="mx-auto max-w-7xl px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">My Wishlist ({wishlistItems.length})</h1>
      <p class="mt-2 text-gray-600">Items you've saved for later</p>
    </div>

    <!-- Products grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {#each wishlistItems as item}
        <div class="rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <!-- Product image placeholder -->
          <div class="relative aspect-square bg-gray-100">
            <button
              type="button"
              class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-red-500"><path d="M18 6 6 18M6 6 18 18"/></svg>
            </button>
            <div class="flex h-full items-center justify-center">
              <div class="text-center text-gray-400 text-sm">Product Image</div>
            </div>
          </div>

          <!-- Product details -->
          <div class="p-4">
            <p class="mb-1 text-xs font-medium text-gray-500 uppercase tracking-wide">{item.category}</p>
            <h3 class="mb-2 text-sm font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
            <p class="mb-4 text-lg font-bold text-gray-900">{item.price}</p>

            <button type="button" class="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Move to Cart
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Empty state (if no items) -->
    <!-- {#if wishlistItems.length === 0}
      <div class="rounded-lg border-2 border-dashed border-gray-300 bg-white py-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-gray-400"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <h3 class="mt-2 text-lg font-semibold text-gray-900">Your wishlist is empty</h3>
        <p class="mt-1 text-gray-600">Add items to your wishlist to save them for later</p>
        <a href="#" class="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Continue Shopping</a>
      </div>
    {/if} -->
  </div>
</div>
