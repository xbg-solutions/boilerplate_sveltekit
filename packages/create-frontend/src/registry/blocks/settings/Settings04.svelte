<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Integration {
		name: string;
		description?: string;
		logoUrl?: string;
		enabled?: boolean;
		href?: string;
	}

	interface Props {
		class?: string;
		integrations?: Integration[];
		onCreate?: () => void;
		onExport?: () => void;
	}

	const defaultIntegrations: Integration[] = [
		{ name: 'Facebook', enabled: false },
		{ name: 'GitHub', enabled: false },
		{ name: 'WhatsApp', enabled: false },
		{ name: 'Figma', enabled: false },
		{ name: 'Google', enabled: false },
		{ name: 'Pinterest', enabled: false },
		{ name: 'Messenger', enabled: false },
		{ name: 'PayPal', enabled: false },
		{ name: 'Vimeo', enabled: false }
	];

	const {
		class: className,
		integrations = defaultIntegrations,
		onCreate,
		onExport
	}: Props = $props();

	let activeFilter = $state<'All' | 'Active' | 'Inactive'>('All');
	let searchQuery = $state('');
	let enabledStates = $state<Record<string, boolean>>(
		Object.fromEntries(integrations.map((int, idx) => [`${idx}`, int.enabled ?? false]))
	);

	$derived filteredIntegrations = integrations.filter((int, idx) => {
		const isEnabled = enabledStates[`${idx}`];
		const matchesFilter =
			activeFilter === 'All' ||
			(activeFilter === 'Active' && isEnabled) ||
			(activeFilter === 'Inactive' && !isEnabled);

		const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesFilter && matchesSearch;
	});

	// SVG Icons
	function ExternalLinkIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
	}

	function SettingsIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/></svg>`;
	}

	function toggleIntegration(idx: number) {
		enabledStates[`${idx}`] = !enabledStates[`${idx}`];
	}
</script>

<div class={cn('space-y-6', className)}>
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold">Integrations</h2>
		<div class="flex gap-2">
			<Button variant="outline" onclick={onExport}>
				Export
			</Button>
			<Button onclick={onCreate}>
				Create new
			</Button>
		</div>
	</div>

	<!-- Filter Tabs and Search -->
	<div class="flex items-center justify-between gap-4">
		<div class="flex gap-1 p-1 bg-muted rounded-md">
			<button
				onclick={() => (activeFilter = 'All')}
				class={cn(
					'px-3 py-1 rounded text-sm font-medium transition-colors',
					activeFilter === 'All' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
				)}
			>
				All
			</button>
			<button
				onclick={() => (activeFilter = 'Active')}
				class={cn(
					'px-3 py-1 rounded text-sm font-medium transition-colors',
					activeFilter === 'Active' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
				)}
			>
				Active
			</button>
			<button
				onclick={() => (activeFilter = 'Inactive')}
				class={cn(
					'px-3 py-1 rounded text-sm font-medium transition-colors',
					activeFilter === 'Inactive' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
				)}
			>
				Inactive
			</button>
		</div>

		<input
			type="search"
			bind:value={searchQuery}
			placeholder="Search integrations..."
			class="w-48 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
		/>
	</div>

	<!-- Integration Cards Grid -->
	<div class="grid gap-4 sm:grid-cols-3">
		{#each filteredIntegrations as integration, idx (integration.name)}
			{@const globalIdx = integrations.indexOf(integration)}
			<div class="rounded-lg border bg-background p-4">
				<!-- Top Row with Logo and External Link -->
				<div class="flex items-center justify-between mb-4">
					<div class="w-8 h-8 rounded bg-muted flex-shrink-0"></div>
					<button class="text-muted-foreground hover:text-foreground transition-colors">
						{@html ExternalLinkIcon()}
					</button>
				</div>

				<!-- Title and Description -->
				<div class="mb-4">
					<h3 class="text-sm font-semibold">{integration.name}</h3>
					<p class="text-xs text-muted-foreground mt-1">{integration.description || 'Connect and manage integrations'}</p>
				</div>

				<!-- Bottom Row with Settings Button and Toggle -->
				<div class="flex items-center justify-between">
					<Button variant="outline" size="sm">
						⚙ Settings
					</Button>

					<!-- Custom Toggle Switch -->
					<button
						onclick={() => toggleIntegration(globalIdx)}
						class={cn(
							'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
							enabledStates[`${globalIdx}`] ? 'bg-foreground' : 'bg-muted'
						)}
					>
						<span
							class={cn(
								'inline-block h-4 w-4 transform rounded-full bg-background transition-transform',
								enabledStates[`${globalIdx}`] ? 'translate-x-4' : 'translate-x-0.5'
							)}
						></span>
					</button>
				</div>
			</div>
		{/each}
	</div>

	{#if filteredIntegrations.length === 0}
		<div class="text-center py-12">
			<p class="text-muted-foreground">No integrations found</p>
		</div>
	{/if}
</div>
