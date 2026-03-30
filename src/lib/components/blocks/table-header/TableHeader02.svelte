<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		dateRange?: string;
		newLabel?: string;
		onNew?: () => void;
		onFilter?: () => void;
		onDateRangeClick?: () => void;
	}

	const {
		class: className,
		title = 'Table name',
		description = 'Read and write directly to databases and stores from your projects.',
		dateRange = 'Jan 20, 2022 – Feb 09, 2022',
		newLabel = 'New',
		onNew,
		onFilter,
		onDateRangeClick
	}: Props = $props();

	// SVG Icons
	const CalendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;

	const FilterIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M7 12h10M11 18h2"></path></svg>`;

	const PlusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
</script>

<div class={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
	<!-- Left: Title and Description -->
	<div class="flex-1">
		<h2 class="font-semibold">{title}</h2>
		<p class="text-sm text-muted-foreground">{description}</p>
	</div>

	<!-- Right: Date Range, Filter, New (Desktop) -->
	<div class="hidden sm:flex items-center gap-2">
		<!-- Date Range Button -->
		<Button variant="outline" size="sm" onclick={onDateRangeClick} class="flex items-center gap-2">
			<span>{@html CalendarIcon}</span>
			{dateRange}
		</Button>

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
		<!-- New and Filters buttons row -->
		<div class="flex gap-2">
			<Button onclick={onNew} class="flex-1">
				<span class="mr-1">{@html PlusIcon}</span>
				{newLabel}
			</Button>
			<Button variant="outline" onclick={onFilter}>
				<span>{@html FilterIcon}</span>
			</Button>
		</div>

		<!-- Date Range Button -->
		<Button
			variant="outline"
			onclick={onDateRangeClick}
			class="w-full flex items-center justify-center gap-2"
		>
			<span>{@html CalendarIcon}</span>
			{dateRange}
		</Button>
	</div>
</div>
