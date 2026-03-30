<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		searchPlaceholder?: string;
		newLabel?: string;
		onNew?: () => void;
		onFilter?: () => void;
	}

	const {
		class: className,
		title = 'Table name',
		description = 'Read and write directly to databases and stores from your projects.',
		searchPlaceholder = 'Search...',
		newLabel = 'New',
		onNew,
		onFilter
	}: Props = $props();

	let searchQuery = $state('');

	// SVG Icons
	const SearchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>`;

	const FilterIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M7 12h10M11 18h2"></path></svg>`;

	const PlusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
</script>

<div class={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
	<!-- Left: Title and Description -->
	<div class="flex-1">
		<h2 class="font-semibold">{title}</h2>
		<p class="text-sm text-muted-foreground">{description}</p>
	</div>

	<!-- Right: Search, Filter, New (Desktop) -->
	<div class="hidden sm:flex items-center gap-2">
		<!-- Search Input -->
		<div class="relative">
			<div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
				{@html SearchIcon}
			</div>
			<input
				type="text"
				placeholder={searchPlaceholder}
				bind:value={searchQuery}
				class="pl-8 pr-3 py-2 border rounded-md bg-background text-sm w-64"
			/>
		</div>

		<!-- Filter Button -->
		<Button variant="outline" size="sm" onclick={onFilter}>
			<span class="mr-1">{@html FilterIcon}</span>
			Filters
		</Button>

		<!-- New Button -->
		<Button onclick={onNew}>
			<span class="mr-1">{@html PlusIcon}</span>
			{newLabel}
		</Button>
	</div>

	<!-- Mobile Layout -->
	<div class="sm:hidden space-y-2 w-full">
		<!-- New and Filter buttons row -->
		<div class="flex gap-2">
			<Button onclick={onNew} class="flex-1">
				<span class="mr-1">{@html PlusIcon}</span>
				{newLabel}
			</Button>
			<Button variant="outline" onclick={onFilter}>
				<span>{@html FilterIcon}</span>
			</Button>
		</div>

		<!-- Search Input -->
		<div class="relative w-full">
			<div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
				{@html SearchIcon}
			</div>
			<input
				type="text"
				placeholder={searchPlaceholder}
				bind:value={searchQuery}
				class="w-full pl-8 pr-3 py-2 border rounded-md bg-background text-sm"
			/>
		</div>
	</div>
</div>
