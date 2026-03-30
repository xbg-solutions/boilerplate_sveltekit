<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Testimonial {
    quote: string;
    author: string;
    role?: string;
    company?: string;
    avatarUrl?: string;
    rating?: number;
  }

  const defaultTestimonials: Testimonial[] = [
    {
      quote: '"Shadcn UI Kit for Figma has completely transformed our design process. It\'s incredibly intuitive and saves us so much time. The components are beautifully crafted and customizable."',
      author: 'Lando Norris',
      role: 'CEO',
      company: 'Acme Inc.',
      rating: 5,
    },
    {
      quote: '"We absolutely love how the Shadcn UI Kit blends functionality and aesthetics seamlessly. It fits perfectly into our design workflow and gives us the flexibility to create stunning, professional and high-quality designs effortlessly."',
      author: 'Lando Norris',
      role: 'CEO',
      company: 'Acme Inc.',
      rating: 5,
    },
    {
      quote: '"This UI kit has been a game changer for our team. The quality is outstanding and the time savings are incredible."',
      author: 'Jane Smith',
      role: 'Founder',
      company: 'Acme Inc.',
      rating: 5,
    },
  ];

  let { class: className, testimonial = defaultTestimonials[0], imageUrl } = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4', className)}>
  <div class="mx-auto max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center">
    <div>
      {#if imageUrl}
        <img src={imageUrl} alt="Testimonial" class="aspect-[4/3] w-full rounded-xl object-cover" />
      {:else}
        <div class="aspect-[4/3] w-full rounded-xl bg-muted flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-muted-foreground">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      {/if}
    </div>

    <div>
      <div class="flex gap-1 mb-4">
        {#each Array(5) as _, i}
          <svg class="{i < (testimonial.rating ?? 5) ? 'text-yellow-400' : 'text-muted'}" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        {/each}
      </div>

      <blockquote class="text-lg font-medium mb-4">
        {testimonial.quote}
      </blockquote>

      <div class="font-medium text-sm">
        {testimonial.author}
      </div>
      {#if testimonial.role || testimonial.company}
        <div class="text-xs text-muted-foreground">
          {testimonial.role}{testimonial.role && testimonial.company ? ', ' : ''}{testimonial.company}
        </div>
      {/if}
    </div>
  </div>
</section>
