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

  let { class: className, testimonial = defaultTestimonials[0] } = $props();
</script>

<section class={cn('w-full bg-foreground text-background py-16 px-4 sm:py-24', className)}>
  <div class="mx-auto max-w-2xl text-center">
    <div class="flex gap-1 mb-6 justify-center">
      {#each Array(5) as _, i}
        <svg class="{i < (testimonial.rating ?? 5) ? 'text-yellow-400' : 'text-muted'}" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      {/each}
    </div>

    <blockquote class="text-xl sm:text-2xl font-medium leading-relaxed">
      {testimonial.quote}
    </blockquote>

    <div class="mt-8 flex flex-col items-center gap-2">
      <div class="h-12 w-12 rounded-full bg-background/20 overflow-hidden">
        <div class="h-full w-full bg-gradient-to-br from-background/40 to-background/20"></div>
      </div>
      <div class="font-medium text-sm">
        {testimonial.author}
        {#if testimonial.company}
          <span class="text-background/80">
            · {testimonial.company}
          </span>
        {/if}
      </div>
    </div>
  </div>
</section>
