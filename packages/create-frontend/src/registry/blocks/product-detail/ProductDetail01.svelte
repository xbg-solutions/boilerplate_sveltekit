<!--
  ProductDetail01.svelte
  Standard 2-column product detail with image gallery and options.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    breadcrumb = ['Home', 'Electronics', 'Headphones'],
    name = 'Premium Wireless Headphones',
    rating = 4.7,
    reviewCount = 543,
    price = '$349.99',
    description = 'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality.',
    sizes = ['S', 'M', 'L', 'XL'],
    onAddToCart = () => {},
    onSave = () => {}
  }: {
    class?: string;
    breadcrumb?: string[];
    name?: string;
    rating?: number;
    reviewCount?: number;
    price?: string;
    description?: string;
    sizes?: string[];
    onAddToCart?: () => void;
    onSave?: () => void;
  } = $props();

  let activeImageIndex = $state(0);
  let selectedSize = $state(sizes[1]);
  let quantity = $state(1);

  const thumbnails = [0, 1, 2, 3];

  function renderStars(rate: number) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(rate);
      stars.push({ isFilled });
    }
    return stars;
  }

  function incrementQuantity() {
    quantity += 1;
  }

  function decrementQuantity() {
    if (quantity > 1) quantity -= 1;
  }
</script>

<div class={cn('grid grid-cols-1 md:grid-cols-2 gap-8', className)}>
  <!-- Left: Image Gallery -->
  <div>
    <!-- Main image -->
    <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>

    <!-- Thumbnails -->
    <div class="flex gap-2">
      {#each thumbnails as thumb, idx}
        <button
          onclick={() => (activeImageIndex = idx)}
          class={cn(
            'h-16 w-16 rounded-md border-2 bg-gray-100 flex items-center justify-center transition-all',
            activeImageIndex === idx ? 'border-foreground' : 'border-gray-200'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>
      {/each}
    </div>
  </div>

  <!-- Right: Details -->
  <div>
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-muted-foreground mb-4">
      {#each breadcrumb as item, idx}
        <span>{item}</span>
        {#if idx < breadcrumb.length - 1}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        {/if}
      {/each}
    </nav>

    <!-- Name -->
    <h1 class="text-2xl md:text-3xl font-bold">{name}</h1>

    <!-- Rating -->
    <div class="mt-3 flex items-center gap-2">
      <div class="flex gap-0.5">
        {#each renderStars(rating) as star}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={star.isFilled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" class={star.isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}>
            <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 19.85 24.29 12 18.77 4.15 24.29 6.23 16.01 0 10.35 8.91 10.26"/>
          </svg>
        {/each}
      </div>
      <span class="text-sm font-medium">{rating}</span>
      <span class="text-sm text-muted-foreground">({reviewCount} reviews)</span>
    </div>

    <!-- Price -->
    <p class="mt-4 text-3xl font-bold">{price}</p>

    <!-- Description -->
    <p class="mt-4 text-muted-foreground leading-relaxed">{description}</p>

    <!-- Size Selector -->
    <div class="mt-6">
      <p class="text-sm font-semibold mb-3">Size</p>
      <div class="flex gap-2">
        {#each sizes as size}
          <button
            onclick={() => (selectedSize = size)}
            class={cn(
              'px-4 py-2 rounded-md border-2 font-medium transition-all',
              selectedSize === size
                ? 'border-foreground bg-foreground text-background'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            {size}
          </button>
        {/each}
      </div>
    </div>

    <!-- Quantity Stepper -->
    <div class="mt-6">
      <p class="text-sm font-semibold mb-3">Quantity</p>
      <div class="flex items-center gap-2 border rounded-md w-fit">
        <button onclick={decrementQuantity} class="px-3 py-2 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <span class="px-4 font-medium">{quantity}</span>
        <button onclick={incrementQuantity} class="px-3 py-2 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-8 flex gap-3">
      <Button onclick={onAddToCart} class="flex-1">Add to cart</Button>
      <Button onclick={onSave} variant="outline" class="px-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </Button>
    </div>
  </div>
</div>
