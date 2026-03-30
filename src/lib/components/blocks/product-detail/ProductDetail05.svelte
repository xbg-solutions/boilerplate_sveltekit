<!--
  ProductDetail05.svelte
  Product detail with sticky sidebar for price and CTA.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    name = 'Ultra HD Monitor',
    price = '$599.99',
    rating = 4.8,
    description = 'Revolutionary ultra-high definition 32" monitor with 144Hz refresh rate and exceptional color accuracy.',
    specifications = [
      { label: 'Resolution', value: '4K (3840 x 2160)' },
      { label: 'Refresh Rate', value: '144Hz' },
      { label: 'Panel Type', value: 'IPS' },
      { label: 'Brightness', value: '400 nits' },
      { label: 'Response Time', value: '1ms' },
      { label: 'Input Ports', value: 'HDMI 2.1, DisplayPort' }
    ],
    reviews = [
      { author: 'John D.', rating: 5, text: 'Incredible color accuracy. Best monitor I have ever used!' },
      { author: 'Sarah M.', rating: 4, text: 'Great performance but gets expensive. Worth the investment.' }
    ],
    onAddToCart = () => {},
    onAddToWishlist = () => {}
  }: {
    class?: string;
    name?: string;
    price?: string;
    rating?: number;
    description?: string;
    specifications?: { label: string; value: string }[];
    reviews?: { author: string; rating: number; text: string }[];
    onAddToCart?: () => void;
    onAddToWishlist?: () => void;
  } = $props();

  let quantity = $state(1);
  let isWishlisted = $state(false);

  function incrementQuantity() {
    quantity += 1;
  }

  function decrementQuantity() {
    if (quantity > 1) quantity -= 1;
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

<div class={cn('grid grid-cols-1 lg:grid-cols-3 gap-8', className)}>
  <!-- Left: Scrollable content (2/3 width) -->
  <div class="lg:col-span-2 space-y-8">
    <!-- Image Gallery -->
    <div class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>

    <!-- Description -->
    <section>
      <h2 class="text-xl font-semibold mb-3">About this product</h2>
      <p class="text-muted-foreground leading-relaxed">{description}</p>
    </section>

    <!-- Specifications -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Specifications</h2>
      <div class="border rounded-lg divide-y">
        {#each specifications as spec}
          <div class="flex items-center justify-between p-4">
            <span class="font-medium text-sm">{spec.label}</span>
            <span class="text-muted-foreground text-sm">{spec.value}</span>
          </div>
        {/each}
      </div>
    </section>

    <!-- Reviews -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Customer Reviews</h2>
      <div class="space-y-4">
        {#each reviews as review}
          <div class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <p class="font-semibold text-sm">{review.author}</p>
              <div class="flex gap-0.5">
                {#each renderStars(review.rating) as star}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={star.isFilled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" class={star.isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}>
                    <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 19.85 24.29 12 18.77 4.15 24.29 6.23 16.01 0 10.35 8.91 10.26"/>
                  </svg>
                {/each}
              </div>
            </div>
            <p class="text-sm text-muted-foreground">{review.text}</p>
          </div>
        {/each}
      </div>
    </section>
  </div>

  <!-- Right: Sticky sidebar (1/3 width) -->
  <div class="lg:col-span-1">
    <div class="sticky top-6 space-y-6 border rounded-lg p-6 bg-background">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold">{name}</h1>
        <div class="mt-2 flex items-center gap-2">
          <div class="flex gap-0.5">
            {#each renderStars(rating) as star}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={star.isFilled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" class={star.isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}>
                <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 19.85 24.29 12 18.77 4.15 24.29 6.23 16.01 0 10.35 8.91 10.26"/>
              </svg>
            {/each}
          </div>
          <span class="text-sm font-medium">{rating}</span>
        </div>
      </div>

      <!-- Price -->
      <div class="border-t pt-4">
        <p class="text-3xl font-bold">{price}</p>
      </div>

      <!-- Quantity Selector -->
      <div class="space-y-2">
        <p class="text-sm font-semibold">Quantity</p>
        <div class="flex items-center gap-2 border rounded-md">
          <button onclick={decrementQuantity} class="px-3 py-2 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <span class="flex-1 text-center font-medium">{quantity}</span>
          <button onclick={incrementQuantity} class="px-3 py-2 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="space-y-2 pt-2">
        <Button onclick={onAddToCart} class="w-full">Add to cart</Button>
        <button
          onclick={() => {
            isWishlisted = !isWishlisted;
            onAddToWishlist();
          }}
          class={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border transition-colors',
            isWishlisted
              ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
              : 'border-gray-200 text-muted-foreground hover:border-gray-300'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {isWishlisted ? 'Saved' : 'Save for later'}
        </button>
      </div>
    </div>
  </div>
</div>
