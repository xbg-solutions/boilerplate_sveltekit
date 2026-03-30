<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Testimonial {
		quote: string;
		name: string;
		role?: string;
		company?: string;
		avatarUrl?: string;
		rating?: number;
	}

	interface Props {
		class?: string;
		testimonial?: Testimonial;
		imageUrl?: string;
	}

	const defaultTestimonial: Testimonial = {
		quote:
			'"Shadcn UI Kit for Figma has completely transformed our design process. It\'s incredibly intuitive and saves us so much time. The components are beautifully crafted and customizable."',
		name: 'Lando Norris',
		role: 'CEO',
		company: 'Acme Inc.',
		rating: 5
	};

	let {
		class: className,
		testimonial = defaultTestimonial,
		imageUrl
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center">
		<div class="aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center">
			{#if imageUrl}
				<img src={imageUrl} alt="testimonial" class="w-full h-full object-cover" />
			{:else}
				<div class="text-muted-foreground text-sm">Image placeholder</div>
			{/if}
		</div>

		<div>
			{#if testimonial.rating}
				<div class="flex gap-1 mb-4">
					{#each Array(5) as _, i}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill={i < testimonial.rating ? '#f59e0b' : 'none'}
							stroke="#f59e0b"
							stroke-width="2"
						>
							<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
						</svg>
					{/each}
				</div>
			{/if}

			<p class="text-lg font-medium italic leading-relaxed text-foreground">
				{testimonial.quote}
			</p>

			<p class="font-semibold text-foreground mt-4">{testimonial.name}</p>
			{#if testimonial.role || testimonial.company}
				<p class="text-sm text-muted-foreground">
					{testimonial.role}
					{#if testimonial.role && testimonial.company}
						·
					{/if}
					{testimonial.company}
				</p>
			{/if}
		</div>
	</div>
</section>
