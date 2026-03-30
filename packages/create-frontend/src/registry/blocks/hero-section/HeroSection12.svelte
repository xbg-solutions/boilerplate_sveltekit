<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		secondaryLabel?: string;
		onPrimary?: () => void;
		onSecondary?: () => void;
		features?: Array<{ title: string; description: string }>;
	}

	let {
		class: className,
		title = 'Build your next big idea faster',
		subtitle = 'A comprehensive toolkit that helps you design, develop, and ship production-ready products at lightning speed.',
		primaryLabel = 'Get started',
		secondaryLabel = 'Learn more',
		onPrimary,
		onSecondary,
		features = [
			{ title: 'Fast Performance', description: 'Lightning-quick load times' },
			{ title: 'Secure by Design', description: 'Enterprise-grade security' },
			{ title: 'Fully Documented', description: 'Comprehensive guides and API docs' },
			{ title: 'Active Support', description: '24/7 community and professional support' },
		],
	}: Props = $props();
</script>

<section class={cn('w-full bg-background px-4 py-20 sm:py-28 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:items-center">
			<div>
				<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
					{title}
				</h1>
				<p class="mt-4 text-lg text-muted-foreground">
					{subtitle}
				</p>
				<div class="mt-8 flex flex-col sm:flex-row gap-3">
					<Button size="lg" onclick={onPrimary}>{primaryLabel}</Button>
					<Button variant="outline" size="lg" onclick={onSecondary}>{secondaryLabel}</Button>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				{#each features as feature, i}
					<div>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 mb-3"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="text-emerald-600 dark:text-emerald-400"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</div>
						<h3 class="font-semibold text-foreground">{feature.title}</h3>
						<p class="text-sm text-muted-foreground mt-1">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
