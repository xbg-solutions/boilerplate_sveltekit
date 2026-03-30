<!--
  ProductCard03.svelte
  Horizontal product card layout for list views.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    category = 'Fashion',
    name = 'Premium Linen Blazer',
    rating = 4.6,
    reviewCount = 92,
    description = 'High-quality linen blend with classic tailoring.',
    price = '$129.00',
    onAddToCart = () => {}
  }: {
    class?: string;
    category?: string;
    name?: string;
    rating?: number;
    reviewCount?: number;
    description?: string;
    price?: string;
    onAddToCart?: () => void;
  } = $props();

  function renderStars(rate: number) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(rate);
      stars.push({ isFilled });
    }
    return stars;
  }
</script>

<div class={cn('rounded-lg border bg-background overflow-hidden', className)}>
  <div class="flex flex-col sm:flex-row gap-4 p-4">
    <!-- Image -->
    <div class="shrink-0 w-full sm:w-24 aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col">
      <!-- Category & Name -->
      <div>
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">{category}</p>
        <h3 class="mt-1 font-semibold">{name}</h3>
      </div>

      <!-- Rating -->
      <div class="mt-2 flex items-center gap-1">
        <div class="flex gap-0.5">
          {#each renderStars(rating) as star}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={star.isFilled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" class={star.isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}>
              <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 19.85 24.29 12 18.77 4.15 24.29 6.23 16.01 0 10.35 8.91 10.26"/>
            </svg>
          {/each}
        </div>
        <span class="text-xs text-muted-foreground">{rating} ({reviewCount})</span>
      </div>

      <!-- Description -->
      <p class="mt-2 text-sm text-muted-foreground line-clamp-2">{description}</p>

      <!-- Price & Button -->
      <div class="mt-3 flex items-center gap-3">
        <p class="text-lg font-bold">{price}</p>
        <Button size="sm" onclick={onAddToCart}>Add to cart</Button>
      </div>
    </div>
  </div>
</div>
