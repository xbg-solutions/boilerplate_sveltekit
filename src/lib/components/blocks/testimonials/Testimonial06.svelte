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
		title?: string;
		description?: string;
		testimonials?: Testimonial[];
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
		title = 'What our customers say',
		description,
		testimonials = [
			defaultTestimonial,
			defaultTestimonial,
			defaultTestimonial,
			defaultTestimonial
		]
	}: Props = $props();

	const getInitials = (name: string): string => {
		return name
			.split(' ')
			.map((w) => w[0])
			.join('')
			.toUpperCase();
	};
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div>
			<p class="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
				Testimonials Section
			</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-foreground">{title}</h2>
			{#if description}
				<p class="mt-4 text-base text-muted-foreground">{description}</p>
			{/if}
		</div>

		<div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
			{#each testimonials as testimonial}
				<div class="rounded-lg border bg-background p-6">
					<div class="flex gap-1">
						{#each Array(5) as _, i}
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill={i < (testimonial.rating || 5) ? '#f59e0b' : 'none'}
								stroke="#f59e0b"
								stroke-width="2"
							>
								<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
							</svg>
						{/each}
					</div>

					<p class="text-sm text-muted-foreground mt-3">{testimonial.quote}</p>

					<div class="mt-4 pt-4 flex items-center gap-3">
						{#if testimonial.avatarUrl}
							<img
								src={testimonial.avatarUrl}
								alt={testimonial.name}
								class="h-10 w-10 rounded-full object-cover"
							/>
						{:else}
							<div
								class="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center text-muted-foreground text-xs font-semibold"
							>
								{getInitials(testimonial.name)}
							</div>
						{/if}

						<div>
							<p class="font-semibold text-sm text-foreground">{testimonial.name}</p>
							{#if testimonial.role || testimonial.company}
								<p class="text-xs text-muted-foreground">
									{testimonial.role}
									{#if testimonial.role && testimonial.company}
										·
									{/if}
									{testimonial.company}
								</p>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
