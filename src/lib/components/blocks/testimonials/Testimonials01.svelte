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

<section class={cn('w-full bg-background py-16 px-4 sm:py-24', className)}>
  <div class="mx-auto max-w-2xl text-center">
    <blockquote class="text-xl sm:text-2xl font-medium leading-relaxed">
      {testimonial.quote}
    </blockquote>

    <div class="mt-8 flex flex-col items-center gap-2">
      <div class="h-12 w-12 rounded-full bg-muted overflow-hidden">
        <div class="h-full w-full bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10"></div>
      </div>
      <div class="font-medium text-sm">
        {testimonial.author}
        {#if testimonial.role || testimonial.company}
          <span class="text-muted-foreground">
            · {testimonial.role}{testimonial.role && testimonial.company ? ',' : ''} {testimonial.company}
          </span>
        {/if}
      </div>
    </div>
  </div>
</section>
