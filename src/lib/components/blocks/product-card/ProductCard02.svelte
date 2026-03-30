<!--
  ProductCard02.svelte
  Product card with badge, wishlist, and discounted pricing.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    category = 'Electronics',
    name = 'Classic Oxford Shirt',
    rating = 4.8,
    reviewCount = 256,
    originalPrice = '$79.99',
    salePrice = '$49.99',
    badge = 'Sale',
    isWishlisted = false,
    onAddToCart = () => {},
    onToggleWishlist = () => {}
  }: {
    class?: string;
    category?: string;
    name?: string;
    rating?: number;
    reviewCount?: number;
    originalPrice?: string;
    salePrice?: string;
    badge?: string;
    isWishlisted?: boolean;
    onAddToCart?: () => void;
    onToggleWishlist?: () => void;
  } = $props();

  let wishlisted = $state(isWishlisted);

  function handleWishlist() {
    wishlisted = !wishlisted;
    onToggleWishlist();
  }

  function renderStars(rate: number) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(rate);
      stars.push({ isFilled });
    }
    return stars;
  }
</script>

<div class={cn('rounded-lg border bg-background overflow-hidden relative', className)}>
  <!-- Badge overlay -->
  {#if badge}
    <div class="absolute top-3 left-3 z-10 bg-red-500 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
      {badge}
    </div>
  {/if}

  <!-- Wishlist button -->
  <button
    onclick={handleWishlist}
    class="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white shadow hover:bg-gray-50 flex items-center justify-center transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" class={wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-600'}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  </button>

  <!-- Image placeholder -->
  <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  </div>

  <!-- Content -->
  <div class="p-4">
    <!-- Category -->
    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">{category}</p>

    <!-- Name -->
    <h3 class="mt-2 font-semibold text-sm line-clamp-2">{name}</h3>

    <!-- Rating -->
    <div class="mt-2 flex items-center gap-1">
      <div class="flex gap-0.5">
        {#each renderStars(rating) as star}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={star.isFilled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" class={star.isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}>
            <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 19.85 24.29 12 18.77 4.15 24.29 6.23 16.01 0 10.35 8.91 10.26"/>
          </svg>
        {/each}
      </div>
      <span class="text-xs text-muted-foreground">{rating} ({reviewCount})</span>
    </div>

    <!-- Price -->
    <div class="mt-3 flex items-center gap-2">
      <p class="text-lg font-bold">{salePrice}</p>
      <p class="text-sm text-muted-foreground line-through">{originalPrice}</p>
    </div>

    <!-- Button -->
    <Button onclick={onAddToCart} class="mt-4 w-full">Add to cart</Button>
  </div>
</div>
