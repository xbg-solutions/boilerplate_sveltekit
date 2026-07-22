<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		tabs?: string[];
		onTabChange?: (tab: string) => void;
		onExport?: () => void;
	}

	const {
		class: className,
		title = 'Table name',
		description = 'Read and write directly to databases and stores from your projects.',
		tabs = ['All', 'Sent', 'Paid', 'Unpaid'],
		onTabChange,
		onExport
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let activeTab = $state(tabs[0]);
	let searchQuery = $state('');

	function handleTabChange(tab: string) {
		activeTab = tab;
		onTabChange?.(tab);
	}

	// SVG Icons
	const SearchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>`;

	const ExportIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
</script>

<div class={cn('flex flex-col gap-4', className)}>
	<!-- Row 1: Title + Description -->
	<div>
		<h2 class="font-semibold">{title}</h2>
		<p class="text-sm text-muted-foreground">{description}</p>
	</div>

	<!-- Row 2: Tab filters LEFT, Search + Export RIGHT (Desktop) -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<!-- Tabs -->
		<div class="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
			{#each tabs as tab}
				<button
					class={cn(
						'px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors',
						activeTab === tab
							? 'bg-foreground text-background'
							: 'text-muted-foreground hover:text-foreground'
					)}
					onclick={() => handleTabChange(tab)}
				>
					{tab}
				</button>
			{/each}
		</div>

		<!-- Desktop: Search + Export -->
		<div class="hidden sm:flex items-center gap-2">
			<!-- Search Input -->
			<div class="relative w-56">
				<div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
					{@html SearchIcon}
				</div>
				<input
					type="text"
					placeholder="Search..."
					bind:value={searchQuery}
					class="w-full pl-8 pr-3 py-2 border rounded-md bg-background text-sm"
				/>
			</div>

			<!-- Export Button -->
			<Button variant="outline" size="sm" onclick={onExport}>
				<span class="mr-1">{@html ExportIcon}</span>
				Export
			</Button>
		</div>
	</div>

	<!-- Mobile: Search + Export below tabs -->
	<div class="sm:hidden flex flex-col gap-2">
		<!-- Search Input -->
		<div class="relative w-full">
			<div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
				{@html SearchIcon}
			</div>
			<input
				type="text"
				placeholder="Search..."
				bind:value={searchQuery}
				class="w-full pl-8 pr-3 py-2 border rounded-md bg-background text-sm"
			/>
		</div>

		<!-- Export Button -->
		<Button variant="outline" size="sm" onclick={onExport} class="w-full justify-center">
			<span class="mr-1">{@html ExportIcon}</span>
			Export
		</Button>
	</div>
</div>
