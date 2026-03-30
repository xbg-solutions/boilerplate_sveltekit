<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Invoice {
		id: string;
		name: string;
		status: 'Paid' | 'Due' | 'Sent';
		date: string;
		plan: string;
	}

	interface Props {
		class?: string;
		invoices?: Invoice[];
		onUpgrade?: () => void;
		onDownloadAll?: () => void;
	}

	const {
		class: className,
		invoices = [
			{ id: '2', name: 'Invoice #2', status: 'Paid', date: 'Sep 5 2024', plan: 'Pro' },
			{ id: '5', name: 'Invoice #5', status: 'Paid', date: 'Aug 26 2024', plan: 'Pro' },
			{ id: '4', name: 'Invoice #4', status: 'Paid', date: 'Sep 18 2024', plan: 'Pro' },
			{ id: '3', name: 'Invoice #3', status: 'Due', date: 'Sep 11 2024', plan: 'Pro' },
			{ id: '12', name: 'Invoice #12', status: 'Sent', date: 'Sep 19 2024', plan: 'Pro' },
			{ id: '13', name: 'Invoice #13', status: 'Sent', date: 'Sep 19 2024', plan: 'Pro' }
		],
		onUpgrade,
		onDownloadAll
	}: Props = $props();

	let searchQuery = $state('');
	let currentPage = $state(1);
	let selectedCheckboxes = $state<Set<string>>(new Set());

	const itemsPerPage = 5;
	const filteredInvoices = $derived(
		invoices.filter((inv) => inv.name.toLowerCase().includes(searchQuery.toLowerCase()))
	);
	const totalPages = $derived(Math.ceil(filteredInvoices.length / itemsPerPage));
	const paginatedInvoices = $derived(
		filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	function toggleCheckbox(id: string) {
		if (selectedCheckboxes.has(id)) {
			selectedCheckboxes.delete(id);
		} else {
			selectedCheckboxes.add(id);
		}
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}

	const pages = $derived.by(() => {
		const result: (number | string)[] = [];
		for (let i = 1; i <= totalPages; i++) {
			if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
				result.push(i);
			} else if (result[result.length - 1] !== '...') {
				result.push('...');
			}
		}
		return result;
	});

	// SVG Icons
	const ExternalLinkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

	const ChevronLeftIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;

	const ChevronRightIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
</script>

<div class={cn('space-y-6', className)}>
	<!-- Header -->
	<div class="flex items-start justify-between">
		<div>
			<h2 class="text-2xl font-semibold">Billing & Invoices</h2>
			<p class="text-sm text-muted-foreground mt-1">Manage your billing and view invoices</p>
		</div>
		<Button variant="outline">Contact support</Button>
	</div>

	<!-- Your Plan Section -->
	<div class="border rounded-lg p-6 space-y-4">
		<div>
			<h3 class="text-lg font-semibold">Your plan</h3>
			<p class="text-sm text-muted-foreground">Manage or upgrade your plan.</p>
		</div>

		<div class="border rounded-lg p-4 space-y-4">
			<div>
				<p class="text-xs text-muted-foreground mb-2">Plan Summary</p>
				<div class="flex items-center gap-2">
					<span class="text-xs border rounded px-2 py-0.5 bg-muted">Free Plan</span>
				</div>
			</div>

			<div>
				<p class="font-semibold">100 credits left</p>
			</div>

			<div class="space-y-1">
				<div class="h-1 bg-muted rounded-full overflow-hidden">
					<div class="bg-foreground h-full rounded-full" style="width: 50%"></div>
				</div>
				<p class="text-xs text-muted-foreground text-right">50% of 200 credits used</p>
			</div>

			<div class="grid grid-cols-3 gap-4">
				<div>
					<p class="text-xs text-muted-foreground">Price/Month</p>
					<p class="font-semibold">$0</p>
				</div>
				<div>
					<p class="text-xs text-muted-foreground">Included Credits</p>
					<p class="font-semibold">200</p>
				</div>
				<div>
					<p class="text-xs text-muted-foreground">Renewal Date</p>
					<p class="font-semibold text-sm">Oct 3, 2024</p>
				</div>
			</div>

			<Button class="w-full" onclick={onUpgrade}>
				Upgrade plan
				<span class="ml-2">
					{@html ExternalLinkIcon}
				</span>
			</Button>
		</div>
	</div>

	<!-- Invoices Section -->
	<div class="border rounded-lg p-6 space-y-4">
		<div>
			<h3 class="text-lg font-semibold">Invoices</h3>
			<p class="text-sm text-muted-foreground">View and download your invoices</p>
		</div>

		<div class="flex items-center gap-2">
			<input
				type="text"
				placeholder="Search invoices..."
				bind:value={searchQuery}
				class="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
			/>
			<Button variant="outline" onclick={onDownloadAll}>↓ Download all</Button>
		</div>

		<div class="border rounded-lg overflow-hidden">
			<table class="w-full text-sm">
				<thead class="bg-muted border-b">
					<tr>
						<th class="w-8 px-4 py-2 text-left">
							<input type="checkbox" class="rounded" />
						</th>
						<th class="px-4 py-2 text-left font-semibold">Name</th>
						<th class="px-4 py-2 text-left font-semibold">Status</th>
						<th class="px-4 py-2 text-left font-semibold">Billing date</th>
						<th class="px-4 py-2 text-left font-semibold">Plan</th>
						<th class="w-8 px-4 py-2 text-center">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each paginatedInvoices as invoice (invoice.id)}
						<tr class="border-b hover:bg-muted/50">
							<td class="px-4 py-3">
								<input
									type="checkbox"
									class="rounded"
									checked={selectedCheckboxes.has(invoice.id)}
									onchange={() => toggleCheckbox(invoice.id)}
								/>
							</td>
							<td class="px-4 py-3">{invoice.name}</td>
							<td class="px-4 py-3">
								{#if invoice.status === 'Paid'}
									<span class="inline-block bg-foreground text-background text-xs px-2 py-1 rounded-full"
										>{invoice.status}</span
									>
								{:else if invoice.status === 'Due'}
									<span
										class="inline-block text-destructive border border-destructive rounded-full px-2 py-1 text-xs"
										>{invoice.status}</span
									>
								{:else}
									<span class="text-xs">{invoice.status}</span>
								{/if}
							</td>
							<td class="px-4 py-3">{invoice.date}</td>
							<td class="px-4 py-3">{invoice.plan}</td>
							<td class="px-4 py-3 text-center">
								<button class="text-muted-foreground hover:text-foreground">...</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex items-center justify-center gap-1">
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage === 1}
					onclick={() => goToPage(currentPage - 1)}
				>
					{@html ChevronLeftIcon}
					Previous
				</Button>

				{#each pages as page}
					{#if page === '...'}
						<span class="px-2">...</span>
					{:else}
						<Button
							variant={currentPage === page ? 'default' : 'outline'}
							size="sm"
							onclick={() => goToPage(page as number)}
						>
							{page}
						</Button>
					{/if}
				{/each}

				<Button
					variant="outline"
					size="sm"
					disabled={currentPage === totalPages}
					onclick={() => goToPage(currentPage + 1)}
				>
					Next
					{@html ChevronRightIcon}
				</Button>
			</div>
		{/if}
	</div>
</div>
