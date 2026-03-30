<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface ApiRow {
		name: string;
		date: string;
		status: 'Active' | 'Revoked' | 'Disabled' | 'Sent';
		actions?: () => void;
	}

	interface Props {
		class?: string;
		publicApis?: ApiRow[];
		privateApis?: ApiRow[];
		onNewPublic?: () => void;
		onNewPrivate?: () => void;
	}

	const {
		class: className,
		publicApis = [
			{ name: 'Table Cell Text', date: 'Sep 6, 2024 2:08 am', status: 'Active' },
			{ name: 'Table Cell Text', date: 'Sep 12, 2024 2:07 pm', status: 'Active' },
			{ name: 'User Data API', date: 'Aug 20, 2024 7:59 am', status: 'Revoked' }
		],
		privateApis = [
			{ name: 'Webhook Manager', date: 'Sep 10, 2024 3:45 pm', status: 'Active' },
			{ name: 'Analytics Engine', date: 'Sep 5, 2024 11:22 am', status: 'Active' },
			{ name: 'Billing API', date: 'Aug 19, 2024 8:51 pm', status: 'Disabled' }
		],
		onNewPublic,
		onNewPrivate
	}: Props = $props();

	function getStatusBadgeClass(status: string): string {
		if (status === 'Active') {
			return 'bg-foreground text-background text-xs px-2 py-0.5 rounded-full';
		} else if (status === 'Revoked') {
			return 'text-foreground text-xs';
		} else if (status === 'Disabled') {
			return 'text-destructive text-xs';
		}
		return 'text-xs';
	}

	// SVG Icons
	function MoreIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>`;
	}
</script>

<div class={cn('space-y-6', className)}>
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-semibold">API Settings</h2>
			<p class="mt-1 text-sm text-muted-foreground">Manage your API keys and integrations.</p>
		</div>
		<Button variant="outline">
			Contact Support
		</Button>
	</div>

	<!-- Public APIs Section -->
	<div class="rounded-lg border bg-background p-4 sm:p-6">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h3 class="text-lg font-semibold">Public APIs</h3>
				<p class="mt-1 text-sm text-muted-foreground">Your public API endpoints.</p>
			</div>
			<Button onclick={onNewPublic}>
				+ New
			</Button>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b">
						<th class="text-left text-xs text-muted-foreground font-medium pb-2">API Name</th>
						<th class="text-left text-xs text-muted-foreground font-medium pb-2">Date of Creation</th>
						<th class="text-left text-xs text-muted-foreground font-medium pb-2">Status</th>
						<th class="text-left text-xs text-muted-foreground font-medium pb-2">Head Text</th>
						<th class="text-left text-xs text-muted-foreground font-medium pb-2"></th>
					</tr>
				</thead>
				<tbody>
					{#each publicApis as api (api.name)}
						<tr class="border-b">
							<td class="py-3">{api.name}</td>
							<td class="py-3 text-muted-foreground">{api.date}</td>
							<td class="py-3">
								<span class={getStatusBadgeClass(api.status)}>
									{api.status}
								</span>
							</td>
							<td class="py-3 text-muted-foreground">—</td>
							<td class="py-3 text-right">
								<button class="text-muted-foreground hover:text-foreground transition-colors">
									{@html MoreIcon()}
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Private APIs Section -->
	<div class="rounded-lg border bg-background p-4 sm:p-6">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h3 class="text-lg font-semibold">Private APIs</h3>
				<p class="mt-1 text-sm text-muted-foreground">Your private API endpoints.</p>
			</div>
			<Button onclick={onNewPrivate}>
				+ New
			</Button>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b">
						<th class="text-left text-xs text-muted-foreground font-medium pb-2">API Name</th>
						<th class="text-left text-xs text-muted-foreground font-medium pb-2">Date of Creation</th>
						<th class="text-left text-xs text-muted-foreground font-medium pb-2">Status</th>
						<th class="text-left text-xs text-muted-foreground font-medium pb-2">Head Text</th>
						<th class="text-left text-xs text-muted-foreground font-medium pb-2"></th>
					</tr>
				</thead>
				<tbody>
					{#each privateApis as api (api.name)}
						<tr class="border-b">
							<td class="py-3">{api.name}</td>
							<td class="py-3 text-muted-foreground">{api.date}</td>
							<td class="py-3">
								<span class={getStatusBadgeClass(api.status)}>
									{api.status}
								</span>
							</td>
							<td class="py-3 text-muted-foreground">—</td>
							<td class="py-3 text-right">
								<button class="text-muted-foreground hover:text-foreground transition-colors">
									{@html MoreIcon()}
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
