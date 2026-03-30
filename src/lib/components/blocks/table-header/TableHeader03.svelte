<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		searchPlaceholder?: string;
		newLabel?: string;
		exportLabel?: string;
		onNew?: () => void;
		onExport?: () => void;
	}

	const {
		class: className,
		title = 'Table name',
		description = 'Read and write directly to databases and stores from your projects.',
		searchPlaceholder = 'Search...',
		newLabel = 'New',
		exportLabel = 'Export',
		onNew,
		onExport
	}: Props = $props();

	let searchQuery = $state('');

	// SVG Icons
	const SearchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>`;

	const ExportIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;

	const PlusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
</script>

<div class={cn('flex flex-col gap-4', className)}>
	<!-- Row 1: Title + Description LEFT, Export + New RIGHT -->
	<div class="flex items-start justify-between">
		<div class="flex-1">
			<h2 class="font-semibold">{title}</h2>
			<p class="text-sm text-muted-foreground">{description}</p>
		</div>

		<!-- Desktop: Right side buttons -->
		<div class="hidden sm:flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={onExport}>
				<span class="mr-1">{@html ExportIcon}</span>
				{exportLabel}
			</Button>
			<Button onclick={onNew}>
				<span class="mr-1">{@html PlusIcon}</span>
				{newLabel}
			</Button>
		</div>
	</div>

	<!-- Row 2: Search LEFT (Desktop) -->
	<div class="hidden sm:flex items-center gap-2">
		<div class="relative w-64">
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

	<!-- Mobile Layout -->
	<div class="sm:hidden space-y-2 w-full">
		<!-- New + Export buttons -->
		<div class="flex gap-2">
			<Button onclick={onNew} class="flex-1">
				<span class="mr-1">{@html PlusIcon}</span>
				{newLabel}
			</Button>
			<Button variant="outline" onclick={onExport}>
				<span>{@html ExportIcon}</span>
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
