<!--
  ProductCard04.svelte
  Minimal product card with hover effect showing quick add button.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    name = 'Ceramic Coffee Mug',
    price = '$24.99',
    onQuickAdd = () => {}
  }: {
    class?: string;
    name?: string;
    price?: string;
    onQuickAdd?: () => void;
  } = $props();

  let isHovering = $state(false);
</script>

<div
  class={cn('rounded-lg overflow-hidden bg-background', className)}
  onmouseenter={() => (isHovering = true)}
  onmouseleave={() => (isHovering = false)}
>
  <!-- Image container -->
  <div class="relative aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>

    <!-- Hover overlay button -->
    {#if isHovering}
      <div class="absolute inset-0 bg-black/50 flex items-end justify-center p-4 animate-in fade-in">
        <Button onclick={onQuickAdd} variant="secondary" class="w-full">Quick add</Button>
      </div>
    {/if}
  </div>

  <!-- Content -->
  <div class="p-3">
    <h3 class="font-semibold text-sm line-clamp-1">{name}</h3>
    <p class="mt-2 text-lg font-bold">{price}</p>
  </div>
</div>
