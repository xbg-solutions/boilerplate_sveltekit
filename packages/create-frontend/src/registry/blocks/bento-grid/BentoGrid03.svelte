<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
	}

	let { class: customClass = '', title = 'Build something amazing', description = '' }: Props = $props();
</script>

<section class={cn('w-full py-16 px-4 sm:px-6', customClass)}>
	<div class="mx-auto max-w-7xl">
		<div class="text-center mb-12">
			<p class="text-sm font-semibold text-foreground/60 mb-2">Bento Grid</p>
			<h2 class="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
			{#if description}
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
			{/if}
		</div>

		<div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
			<!-- Large feature card (2x2) -->
			<div class="rounded-xl border bg-background p-6 sm:col-span-2 sm:row-span-2">
				<div class="aspect-video w-full rounded-lg bg-muted/60 flex items-center justify-center mb-4">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground/40">
						<rect x="3" y="3" width="18" height="18" rx="2"/>
						<circle cx="8.5" cy="8.5" r="1.5"/>
						<polyline points="21 15 16 10 5 21"/>
					</svg>
				</div>
				<h3 class="text-lg font-semibold">Featured Solution</h3>
				<p class="text-muted-foreground mt-2">Our flagship product designed for maximum impact.</p>
			</div>

			<!-- 4 smaller cells -->
			<div class="rounded-xl border bg-background p-6">
				<div class="flex items-center justify-center h-10 w-10 rounded-lg bg-foreground/10 mb-3">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground">
						<path d="M12 2v20m-8-8h16"/>
					</svg>
				</div>
				<h3 class="font-semibold text-sm">Feature One</h3>
				<p class="text-xs text-muted-foreground mt-1">Quick description here.</p>
			</div>

			<div class="rounded-xl border bg-background p-6">
				<div class="flex items-center justify-center h-10 w-10 rounded-lg bg-foreground/10 mb-3">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground">
						<path d="M12 2v20m-8-8h16"/>
					</svg>
				</div>
				<h3 class="font-semibold text-sm">Feature Two</h3>
				<p class="text-xs text-muted-foreground mt-1">Quick description here.</p>
			</div>

			<div class="rounded-xl border bg-background p-6">
				<div class="flex items-center justify-center h-10 w-10 rounded-lg bg-foreground/10 mb-3">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground">
						<path d="M12 2v20m-8-8h16"/>
					</svg>
				</div>
				<h3 class="font-semibold text-sm">Feature Three</h3>
				<p class="text-xs text-muted-foreground mt-1">Quick description here.</p>
			</div>

			<div class="rounded-xl border bg-background p-6">
				<div class="flex items-center justify-center h-10 w-10 rounded-lg bg-foreground/10 mb-3">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground">
						<path d="M12 2v20m-8-8h16"/>
					</svg>
				</div>
				<h3 class="font-semibold text-sm">Feature Four</h3>
				<p class="text-xs text-muted-foreground mt-1">Quick description here.</p>
			</div>
		</div>
	</div>
</section>
