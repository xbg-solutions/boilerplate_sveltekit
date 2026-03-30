<!--
  ProductCard01.svelte
  Standard e-commerce product card with image, category, name, rating, and price.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    category = 'Electronics',
    name = 'Premium Leather Wallet',
    rating = 4.5,
    reviewCount = 128,
    price = '$49.99',
    onAddToCart = () => {}
  }: {
    class?: string;
    category?: string;
    name?: string;
    rating?: number;
    reviewCount?: number;
    price?: string;
    onAddToCart?: () => void;
  } = $props();

  function renderStars(rate: number) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(rate);
      const isHalf = i === Math.ceil(rate) && rate % 1 !== 0;
      stars.push({ isFilled, isHalf });
    }
    return stars;
  }
</script>

<div class={cn('rounded-lg border bg-background overflow-hidden', className)}>
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
    <p class="mt-3 text-lg font-bold">{price}</p>

    <!-- Button -->
    <Button onclick={onAddToCart} class="mt-4 w-full">Add to cart</Button>
  </div>
</div>
