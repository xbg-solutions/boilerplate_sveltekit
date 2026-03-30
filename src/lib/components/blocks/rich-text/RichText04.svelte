<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		body?: string;
		ctaLabel?: string;
		onCta?: () => void;
	}

	const {
		class: className,
		title = 'Stay Updated',
		body = 'Get the latest insights and updates delivered to your inbox.',
		ctaLabel = 'Learn more',
		onCta
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-24 px-4', className)}>
	<div class="mx-auto max-w-xl text-center">
		<div class="mb-8 flex justify-center">
			<div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
				<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
					<polyline points="13 2 13 9 20 9" />
				</svg>
			</div>
		</div>

		<h2 class="text-2xl font-bold">{title}</h2>
		<p class="mt-4 text-muted-foreground">{body}</p>

		<div class="mt-8">
			<Button onclick={onCta}>{ctaLabel}</Button>
		</div>

		<p class="mt-8 text-xs text-muted-foreground">
			We respect your privacy. Unsubscribe at any time.
		</p>
	</div>
</section>
