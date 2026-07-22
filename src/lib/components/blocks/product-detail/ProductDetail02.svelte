<!--
  ProductDetail02.svelte
  Product detail with tabbed content (Description, Specifications, Reviews).
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  interface ColorOption {
    name: string;
    value: string;
  }

  let {
    class: className = '',
    name = 'Professional Camera',
    price = '$1,299.00',
    rating = 4.8,
    colors = [
      { name: 'Black', value: '#000000' },
      { name: 'Silver', value: '#c0c0c0' }
    ] as ColorOption[],
    sizes = ['24MP', '45MP'],
    description = 'Professional full-frame mirrorless camera with advanced autofocus system.',
    specifications = [
      { label: 'Sensor', value: 'Full-frame CMOS' },
      { label: 'Resolution', value: '45.7 MP' },
      { label: 'ISO Range', value: '100–32000' },
      { label: 'Video', value: '8K 24fps' }
    ],
    onAddToCart = () => {}
  }: {
    class?: string;
    name?: string;
    price?: string;
    rating?: number;
    colors?: ColorOption[];
    sizes?: string[];
    description?: string;
    specifications?: { label: string; value: string }[];
    onAddToCart?: () => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  let selectedColor = $state(colors[0]);
  // svelte-ignore state_referenced_locally
  let selectedSize = $state(sizes[0]);
  let activeTab = $state<'description' | 'specifications' | 'reviews'>('description');

  function renderStars(rate: number) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(rate);
      stars.push({ isFilled });
    }
    return stars;
  }
</script>

<div class={cn('space-y-8', className)}>
  <!-- Top Section: Image + Options -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- Left: Image -->
    <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>

    <!-- Right: Details & Options -->
    <div class="space-y-6">
      <!-- Name & Price -->
      <div>
        <h1 class="text-2xl md:text-3xl font-bold">{name}</h1>
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
        <p class="mt-3 text-3xl font-bold">{price}</p>
      </div>

      <!-- Color Selector -->
      <div>
        <p class="text-sm font-semibold mb-2">Color: {selectedColor.name}</p>
        <div class="flex gap-3">
          {#each colors as color}
            <button
              onclick={() => (selectedColor = color)}
              class={cn(
                'h-8 w-8 rounded-full border-2 transition-all',
                selectedColor.value === color.value
                  ? 'border-foreground ring-2 ring-offset-1 ring-foreground'
                  : 'border-gray-300 hover:border-gray-400'
              )}
              style={`background-color: ${color.value}`}
              title={color.name}
            ></button>
          {/each}
        </div>
      </div>

      <!-- Size Selector -->
      <div>
        <p class="text-sm font-semibold mb-2">Model: {selectedSize}</p>
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

      <!-- Add to Cart -->
      <Button onclick={onAddToCart} class="w-full">Add to cart</Button>
    </div>
  </div>

  <!-- Tabs Section -->
  <div class="border-t pt-8">
    <!-- Tab buttons -->
    <div class="flex gap-6 border-b mb-6">
      {#each ['description', 'specifications', 'reviews'] as tab}
        <button
          onclick={() => (activeTab = tab as typeof activeTab)}
          class={cn(
            'pb-3 font-medium transition-colors capitalize',
            activeTab === tab ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab}
        </button>
      {/each}
    </div>

    <!-- Tab content -->
    {#if activeTab === 'description'}
      <div class="prose prose-sm max-w-none">
        <p class="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    {:else if activeTab === 'specifications'}
      <div class="space-y-3">
        {#each specifications as spec}
          <div class="flex items-center justify-between border-b pb-3 last:border-b-0">
            <span class="font-medium text-sm">{spec.label}</span>
            <span class="text-muted-foreground text-sm">{spec.value}</span>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'reviews'}
      <div class="text-center py-8">
        <p class="text-muted-foreground">No reviews yet. Be the first to review this product.</p>
      </div>
    {/if}
  </div>
</div>
