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
		testimonials?: Testimonial[];
	}

	const defaultTestimonial: Testimonial = {
		quote:
			'"Shadcn UI Kit for Figma has completely transformed our design process. It\'s incredibly intuitive and saves us so much time. The components are beautifully crafted and customizable."',
		name: 'Lando Norris',
		role: 'CEO',
		company: 'Acme Inc.'
	};

	let { class: className, testimonials = [defaultTestimonial, defaultTestimonial] }: Props = $props();

	const getInitials = (name: string): string => {
		return name
			.split(' ')
			.map((w) => w[0])
			.join('')
			.toUpperCase();
	};
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-4xl grid grid-cols-1 gap-6 sm:grid-cols-2">
		{#each testimonials as testimonial}
			<div class="rounded-lg border bg-background p-8 text-center">
				<p class="text-base font-medium italic text-foreground">
					{testimonial.quote}
				</p>

				<div class="mt-6 flex flex-col items-center">
					{#if testimonial.avatarUrl}
						<img
							src={testimonial.avatarUrl}
							alt={testimonial.name}
							class="h-12 w-12 rounded-full object-cover"
						/>
					{:else}
						<div
							class="h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center text-muted-foreground text-xs font-semibold"
						>
							{getInitials(testimonial.name)}
						</div>
					{/if}

					<p class="font-semibold text-sm text-foreground mt-3">{testimonial.name}</p>
					{#if testimonial.role || testimonial.company}
						<p class="text-xs text-muted-foreground mt-1">
							{testimonial.role}
							{#if testimonial.role && testimonial.company}
								·
							{/if}
							{testimonial.company}
						</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>
