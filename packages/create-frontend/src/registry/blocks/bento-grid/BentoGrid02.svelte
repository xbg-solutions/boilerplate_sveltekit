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

		<div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
			<!-- Row 1: span-2 cell + 1 cell -->
			<div class="rounded-xl border bg-background p-6 sm:col-span-2">
				<div class="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500/20 mb-4">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
						<circle cx="12" cy="12" r="1"/>
						<path d="M12 1v6m0 6v6"/>
						<path d="M4.22 4.22l4.24 4.24m2.12 5.08l4.24 4.24"/>
						<path d="M1 12h6m6 0h6"/>
						<path d="M4.22 19.78l4.24-4.24m5.08-2.12l4.24-4.24"/>
						<path d="M12 23v-6m0-6V5"/>
						<path d="M19.78 19.78l-4.24-4.24m-2.12-5.08l-4.24-4.24"/>
						<path d="M23 12h-6m-6 0H5"/>
						<path d="M19.78 4.22l-4.24 4.24m-5.08 2.12l-4.24 4.24"/>
					</svg>
				</div>
				<h3 class="text-lg font-semibold">Real-time Sync</h3>
				<p class="text-muted-foreground mt-2">Synchronize data instantly across all your devices.</p>
			</div>

			<!-- 1 cell -->
			<div class="rounded-xl border bg-background p-6">
				<div class="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-500/20 mb-4">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-purple-600">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
						<path d="M9 10h6M9 14h6"/>
					</svg>
				</div>
				<h3 class="font-semibold">Cloud Storage</h3>
				<p class="text-sm text-muted-foreground mt-1">Unlimited storage in the cloud.</p>
			</div>

			<!-- Row 2: 1 cell + span-2 cell -->
			<div class="rounded-xl border bg-background p-6">
				<div class="flex items-center justify-center h-12 w-12 rounded-lg bg-green-500/20 mb-4">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
						<path d="M10 17l-4-4m0 0l4-4m-4 4l8-8"/>
					</svg>
				</div>
				<h3 class="font-semibold">AI Integration</h3>
				<p class="text-sm text-muted-foreground mt-1">Smart features powered by AI.</p>
			</div>

			<div class="rounded-xl border bg-background p-6 sm:col-span-2">
				<div class="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-500/20 mb-4">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-orange-600">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
						<path d="M7 12l5 5 8-10"/>
					</svg>
				</div>
				<h3 class="text-lg font-semibold">Advanced Security</h3>
				<p class="text-muted-foreground mt-2">Enterprise-grade encryption and security features.</p>
			</div>
		</div>
	</div>
</section>
