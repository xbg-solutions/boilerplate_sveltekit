<!--
  ProductDetail04.svelte
  Dark-themed product detail layout.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    name = 'Premium Leather Backpack',
    price = '$249.99',
    rating = 4.6,
    description = 'Handcrafted Italian leather backpack with laptop compartment, ergonomic straps, and lifetime warranty.',
    capacity = '25L',
    weight = '2.2 lbs',
    material = '100% Full Grain Leather',
    onAddToCart = () => {},
    onViewDetails = () => {}
  }: {
    class?: string;
    name?: string;
    price?: string;
    rating?: number;
    description?: string;
    capacity?: string;
    weight?: string;
    material?: string;
    onAddToCart?: () => void;
    onViewDetails?: () => void;
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

<div class={cn('bg-gray-950 text-white rounded-lg overflow-hidden', className)}>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
    <!-- Left: Image -->
    <div class="aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-700">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>

    <!-- Right: Content -->
    <div class="flex flex-col justify-between">
      <!-- Header -->
      <div>
        <h1 class="text-3xl md:text-4xl font-bold">{name}</h1>

        <!-- Rating -->
        <div class="mt-3 flex items-center gap-2">
          <div class="flex gap-0.5">
            {#each renderStars(rating) as star}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={star.isFilled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" class={star.isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}>
                <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 19.85 24.29 12 18.77 4.15 24.29 6.23 16.01 0 10.35 8.91 10.26"/>
              </svg>
            {/each}
          </div>
          <span class="text-sm font-medium">{rating}</span>
        </div>

        <!-- Price -->
        <p class="mt-6 text-4xl font-bold">{price}</p>

        <!-- Description -->
        <p class="mt-4 text-gray-300 leading-relaxed">{description}</p>

        <!-- Specs -->
        <div class="mt-6 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">Capacity</span>
            <span class="font-medium">{capacity}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Weight</span>
            <span class="font-medium">{weight}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Material</span>
            <span class="font-medium">{material}</span>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="mt-8 flex gap-3">
        <Button onclick={onAddToCart} class="flex-1 bg-white text-black hover:bg-gray-100">
          Add to cart
        </Button>
        <Button onclick={onViewDetails} variant="outline" class="border-white text-white hover:bg-gray-900">
          View details
        </Button>
      </div>
    </div>
  </div>
</div>
