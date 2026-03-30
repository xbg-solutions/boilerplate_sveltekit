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

  let { class: className, testimonials = defaultTestimonials.slice(0, 2) } = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4', className)}>
  <div class="mx-auto max-w-5xl grid grid-cols-1 gap-6 sm:grid-cols-2">
    {#each testimonials as t}
      <div class="flex flex-col items-center text-center p-6">
        <blockquote class="text-base font-medium">
          {t.quote}
        </blockquote>
        <div class="mt-6 h-12 w-12 rounded-full bg-muted overflow-hidden">
          <div class="h-full w-full bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10"></div>
        </div>
        <div class="mt-2 font-medium text-sm">
          {t.author}
        </div>
        {#if t.role || t.company}
          <div class="text-xs text-muted-foreground">
            {t.role}{t.role && t.company ? ', ' : ''}{t.company}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>
