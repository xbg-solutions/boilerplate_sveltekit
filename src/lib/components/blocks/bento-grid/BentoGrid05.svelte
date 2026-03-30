<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
	}

	let { class: customClass = '', title = 'Build something amazing', description = '' }: Props = $props();

	const checkIcon = `<polyline points="20 6 9 17 4 12"/>`;
</script>

<section class={cn('w-full bg-foreground text-background py-16 px-4 sm:px-6', customClass)}>
	<div class="mx-auto max-w-7xl">
		<div class="text-center mb-12">
			<p class="text-sm font-semibold text-background/60 mb-2">Bento Grid</p>
			<h2 class="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
			{#if description}
				<p class="text-lg text-background/80 max-w-2xl mx-auto">{description}</p>
			{/if}
		</div>

		<div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
			<!-- Large Feature (2-col span) -->
			<div class="rounded-xl bg-background/10 border-background/10 border p-6 sm:col-span-2">
				<div class="aspect-video w-full rounded-lg bg-background/20 flex items-center justify-center">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-background/40">
						<rect x="3" y="3" width="18" height="18" rx="2"/>
						<circle cx="8.5" cy="8.5" r="1.5"/>
						<polyline points="21 15 16 10 5 21"/>
					</svg>
				</div>
				<h3 class="text-xl font-semibold mt-4">Ship faster</h3>
				<p class="text-background/80 mt-2">Deploy your ideas in minutes with our intuitive platform.</p>
			</div>

			<!-- Tall Feature (row-span-2) -->
			<div class="rounded-xl bg-background/10 border-background/10 border p-6 sm:row-span-2">
				<div class="flex items-center justify-center h-12 w-12 rounded-lg bg-background/20 mb-4">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-background">
						{checkIcon}
					</svg>
				</div>
				<h3 class="text-lg font-semibold mb-4">Beautiful UI</h3>
				<ul class="space-y-3">
					<li class="flex items-start gap-3">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-background flex-shrink-0 mt-0.5">
							{checkIcon}
						</svg>
						<span class="text-sm">Dark mode support</span>
					</li>
					<li class="flex items-start gap-3">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-background flex-shrink-0 mt-0.5">
							{checkIcon}
						</svg>
						<span class="text-sm">Fully typed</span>
					</li>
					<li class="flex items-start gap-3">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-background flex-shrink-0 mt-0.5">
							{checkIcon}
						</svg>
						<span class="text-sm">Responsive design</span>
					</li>
				</ul>
			</div>

			<!-- Small Cell 1 -->
			<div class="rounded-xl bg-background/10 border-background/10 border p-6">
				<div class="flex items-center justify-center h-10 w-10 rounded-lg bg-background/20 mb-3">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-background">
						{checkIcon}
					</svg>
				</div>
				<h3 class="font-semibold">Dark mode</h3>
				<p class="text-sm text-background/80 mt-1">Built-in dark theme support.</p>
			</div>

			<!-- Small Cell 2 -->
			<div class="rounded-xl bg-background/10 border-background/10 border p-6">
				<div class="flex items-center justify-center h-10 w-10 rounded-lg bg-background/20 mb-3">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-background">
						{checkIcon}
					</svg>
				</div>
				<h3 class="font-semibold">Fully typed</h3>
				<p class="text-sm text-background/80 mt-1">100% TypeScript support.</p>
			</div>
		</div>
	</div>
</section>
