<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		eyebrow?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		onPrimary?: () => void;
		imageAspect?: 'square' | 'video';
	}

	let {
		class: className,
		eyebrow = 'New Solution',
		title = 'Transform Your Workflow',
		subtitle = 'Discover how our innovative approach can streamline your operations',
		primaryLabel = 'Learn More',
		onPrimary,
		imageAspect = 'video'
	}: Props = $props();
</script>

<section class={cn('w-full bg-background px-4 py-16 sm:py-24', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
			<div>
				{#if eyebrow}
					<div class="mb-4 inline-flex items-center px-3 py-1 rounded-full border bg-muted/50 text-xs font-medium">
						{eyebrow}
					</div>
				{/if}

				{#if title}
					<h1 class="text-5xl sm:text-6xl font-bold tracking-tight mb-6">{title}</h1>
				{/if}

				{#if subtitle}
					<p class="text-xl text-muted-foreground mb-8">{subtitle}</p>
				{/if}

				<Button onclick={onPrimary} size="lg">
					{primaryLabel}
				</Button>
			</div>

			<div>
				<div class={cn(
					'rounded-lg bg-gradient-to-br from-muted to-muted/50 border',
					imageAspect === 'square' ? 'aspect-square' : 'aspect-video'
				)}>
					<div class="w-full h-full flex items-center justify-center text-muted-foreground">
						<div class="text-center">
							<svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<p class="text-sm">Illustration or image</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
