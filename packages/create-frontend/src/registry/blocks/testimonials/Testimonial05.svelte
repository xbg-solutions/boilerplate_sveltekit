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
	}

	const defaultTestimonial: Testimonial = {
		quote:
			'"Shadcn UI Kit for Figma has completely transformed our design process. It\'s incredibly intuitive and saves us so much time. The components are beautifully crafted and customizable."',
		name: 'Lando Norris',
		role: 'CEO',
		company: 'Acme Inc.'
	};

	let { class: className, testimonial = defaultTestimonial }: Props = $props();

	const getInitials = (name: string): string => {
		return name
			.split(' ')
			.map((w) => w[0])
			.join('')
			.toUpperCase();
	};
</script>

<section class={cn('w-full bg-foreground text-background py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-2xl text-center">
		<div class="mb-8 flex justify-center">
			<span class="text-4xl text-background/30 font-serif leading-none">"</span>
		</div>

		<p class="text-xl sm:text-2xl font-medium italic leading-relaxed text-background">
			{testimonial.quote}
		</p>

		<div class="mt-10 flex flex-col items-center">
			{#if testimonial.avatarUrl}
				<img
					src={testimonial.avatarUrl}
					alt={testimonial.name}
					class="h-16 w-16 rounded-full object-cover"
				/>
			{:else}
				<div
					class="h-16 w-16 rounded-full bg-background/20 overflow-hidden flex items-center justify-center text-background/60 text-sm font-semibold"
				>
					{getInitials(testimonial.name)}
				</div>
			{/if}

			<p class="mt-4 font-semibold text-sm text-background">{testimonial.name}</p>
			{#if testimonial.role || testimonial.company}
				<p class="text-xs text-background/60 mt-1">
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
