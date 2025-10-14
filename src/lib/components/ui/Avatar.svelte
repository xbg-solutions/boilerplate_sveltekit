<!--
  src/lib/components/ui/Avatar.svelte
  SHADCN-Svelte Avatar Component
  
  AI SYSTEMS: Use this component for user profile pictures and avatars.
  Supports fallback text and proper image loading states.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { tv, type VariantProps } from 'tailwind-variants';

  const avatarVariants = tv({
    base: 'relative flex shrink-0 overflow-hidden rounded-full',
    variants: {
      size: {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
        xl: 'h-12 w-12',
        '2xl': 'h-16 w-16',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  });

  type AvatarSize = VariantProps<typeof avatarVariants>['size'];

  // Component props
  export let src: string | undefined = undefined;
  export let alt: string = '';
  export let fallback: string = '';
  export let size: AvatarSize = 'md';

  let className: string = '';
  export { className as class };

  // Image loading state
  let imageLoaded = false;
  let imageError = false;

  // Handle image load
  function handleImageLoad() {
    imageLoaded = true;
    imageError = false;
  }

  // Handle image error
  function handleImageError() {
    imageLoaded = false;
    imageError = true;
  }

  // Generate fallback text from full name
  function generateFallback(text: string): string {
    if (!text) return '';
    
    const words = text.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  $: displayFallback = generateFallback(fallback || alt);
  $: showImage = src && imageLoaded && !imageError;
</script>

<span class={cn(avatarVariants({ size }), className)}>
  {#if showImage}
    <!-- Avatar Image -->
    <img
      {src}
      {alt}
      class="aspect-square h-full w-full object-cover"
      on:load={handleImageLoad}
      on:error={handleImageError}
    />
  {:else}
    <!-- Avatar Fallback -->
    <span class="flex h-full w-full items-center justify-center rounded-full bg-muted">
      <span class="text-xs font-medium text-muted-foreground select-none">
        {displayFallback}
      </span>
    </span>
  {/if}
</span>

<!-- Preload image if src is provided -->
{#if src && !imageLoaded && !imageError}
  <img
    {src}
    {alt}
    class="sr-only"
    on:load={handleImageLoad}
    on:error={handleImageError}
  />
{/if}