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

  let { class: className, testimonials = defaultTestimonials } = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4', className)}>
  <div class="mx-auto max-w-6xl grid grid-cols-1 gap-6 sm:grid-cols-3">
    {#each testimonials as t}
      <div class="rounded-lg border bg-background p-6">
        <div class="flex gap-1 mb-4">
          {#each Array(5) as _, i}
            <svg class="{i < (t.rating ?? 5) ? 'text-yellow-400' : 'text-muted'}" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          {/each}
        </div>

        <blockquote class="text-sm font-medium mb-4 line-clamp-3">
          {t.quote}
        </blockquote>

        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
            <div class="h-full w-full bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10"></div>
          </div>
          <div>
            <div class="font-medium text-sm">
              {t.author}
            </div>
            {#if t.role || t.company}
              <div class="text-xs text-muted-foreground">
                {t.role}{t.role && t.company ? ', ' : ''}{t.company}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</section>
