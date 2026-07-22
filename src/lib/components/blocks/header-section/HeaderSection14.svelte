<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		subtitle?: string;
		filters?: string[];
		onFilterChange?: (filter: string) => void;
		onSearch?: (query: string) => void;
	}

	let {
		class: className,
		title = 'Browse Resources',
		subtitle = 'Explore our comprehensive collection',
		filters = ['All', 'Articles', 'Guides', 'Tutorials', 'Case Studies'],
		onFilterChange,
		onSearch
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let activeFilter = $state(filters[0]);
	let searchQuery = $state('');

	function handleFilterClick(filter: string) {
		activeFilter = filter;
		onFilterChange?.(filter);
	}

	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;
		onSearch?.(searchQuery);
	}
</script>

<section class={cn('w-full bg-background px-4 py-16 sm:py-24', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="mb-12">
			{#if title}
				<h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-3">{title}</h1>
			{/if}

			{#if subtitle}
				<p class="text-lg text-muted-foreground">{subtitle}</p>
			{/if}
		</div>

		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
			<div class="flex flex-wrap gap-3">
				{#each filters as filter}
					<button
						onclick={() => handleFilterClick(filter)}
						class={cn(
							'px-4 py-2 rounded-full text-sm font-medium transition border',
							activeFilter === filter
								? 'bg-foreground text-background border-foreground'
								: 'bg-transparent text-foreground border-gray-300 hover:border-foreground'
						)}
					>
						{filter}
					</button>
				{/each}
			</div>

			<div class="flex-1 lg:flex-none lg:w-64">
				<input
					type="text"
					placeholder="Search resources..."
					value={searchQuery}
					onchange={handleSearch}
					class="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>
		</div>
	</div>
</section>
