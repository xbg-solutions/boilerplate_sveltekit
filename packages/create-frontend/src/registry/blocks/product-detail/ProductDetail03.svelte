<!--
  ProductDetail03.svelte
  Minimal full-width product detail layout.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    name = 'Luxury Watch',
    rating = 4.9,
    price = '$899.00',
    description = 'Handcrafted luxury timepiece with Swiss movement and premium leather strap. Water-resistant up to 100m.',
    sizes = ['38mm', '42mm'],
    colors = ['Gold', 'Silver', 'Rose Gold'],
    onAddToCart = () => {}
  }: {
    class?: string;
    name?: string;
    rating?: number;
    price?: string;
    description?: string;
    sizes?: string[];
    colors?: string[];
    onAddToCart?: () => void;
  } = $props();

  let selectedSize = $state(sizes[0]);
  let selectedColor = $state(colors[0]);
  let quantity = $state(1);

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

<div class={cn('space-y-8', className)}>
  <!-- Full-width image at top -->
  <div class="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  </div>

  <!-- 3-column layout -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <!-- Left: Description -->
    <div class="space-y-4">
      <div>
        <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h2>
        <p class="text-sm leading-relaxed text-foreground">{description}</p>
      </div>
    </div>

    <!-- Center: Options & Price -->
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold">{name}</h1>
        <div class="mt-2 flex items-center gap-2">
          <div class="flex gap-0.5">
            {#each renderStars(rating) as star}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={star.isFilled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" class={star.isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}>
                <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 19.85 24.29 12 18.77 4.15 24.29 6.23 16.01 0 10.35 8.91 10.26"/>
              </svg>
            {/each}
          </div>
          <span class="text-sm font-medium">{rating}</span>
        </div>
      </div>

      <!-- Size -->
      <div>
        <p class="text-xs font-semibold text-muted-foreground mb-2 uppercase">Size</p>
        <div class="flex gap-2">
          {#each sizes as size}
            <button
              onclick={() => (selectedSize = size)}
              class={cn(
                'px-3 py-2 rounded-md border text-sm font-medium transition-all',
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

      <!-- Color -->
      <div>
        <p class="text-xs font-semibold text-muted-foreground mb-2 uppercase">Color</p>
        <div class="flex gap-2">
          {#each colors as color}
            <button
              onclick={() => (selectedColor = color)}
              class={cn(
                'px-3 py-2 rounded-md border text-sm font-medium transition-all',
                selectedColor === color
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              {color}
            </button>
          {/each}
        </div>
      </div>

      <!-- Price -->
      <p class="text-3xl font-bold">{price}</p>
    </div>

    <!-- Right: Actions -->
    <div class="space-y-4">
      <!-- Quantity -->
      <div>
        <p class="text-xs font-semibold text-muted-foreground mb-2 uppercase">Quantity</p>
        <div class="flex items-center gap-2 border rounded-md w-fit">
          <button onclick={decrementQuantity} class="px-3 py-2 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <span class="px-3 font-medium">{quantity}</span>
          <button onclick={incrementQuantity} class="px-3 py-2 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Buttons -->
      <div class="space-y-2">
        <Button onclick={onAddToCart} class="w-full">Add to cart</Button>
        <Button variant="outline" class="w-full">View reviews</Button>
      </div>
    </div>
  </div>
</div>
