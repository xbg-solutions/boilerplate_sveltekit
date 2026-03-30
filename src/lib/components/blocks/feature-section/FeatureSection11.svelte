<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface TableRow {
		feature: string;
		free: boolean;
		pro: boolean;
		enterprise: boolean;
	}

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		rows?: TableRow[];
	}

	const defaultRows: TableRow[] = [
		{ feature: 'Basic Features', free: true, pro: true, enterprise: true },
		{ feature: 'Advanced Analytics', free: false, pro: true, enterprise: true },
		{ feature: 'Priority Support', free: false, pro: true, enterprise: true },
		{ feature: 'Custom Integrations', free: false, pro: false, enterprise: true },
		{ feature: 'Dedicated Account Manager', free: false, pro: false, enterprise: true },
		{ feature: 'API Access', free: false, pro: true, enterprise: true },
		{ feature: 'SSO & Security', free: false, pro: false, enterprise: true },
	];

	let {
		class: className,
		title = 'Simple, Transparent Pricing',
		description = 'Choose the perfect plan for your needs. Upgrade or downgrade at any time.',
		rows = defaultRows,
	}: Props = $props();
</script>

<section class={cn('w-full bg-gray-950 py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="text-center mb-12">
			<h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-white">
				{title}
			</h2>
			<p class="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
				{description}
			</p>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-gray-800">
						<th class="py-4 px-6 text-left text-sm font-semibold text-gray-300">Feature</th>
						<th class="py-4 px-6 text-center text-sm font-semibold text-white">
							<div class="flex flex-col items-center">
								<span>Free</span>
							</div>
						</th>
						<th class="py-4 px-6 text-center text-sm font-semibold text-white relative">
							<div class="flex flex-col items-center">
								<span class="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2"
									>Popular</span
								>
								<span>Pro</span>
							</div>
						</th>
						<th class="py-4 px-6 text-center text-sm font-semibold text-white">
							<div class="flex flex-col items-center">
								<span>Enterprise</span>
							</div>
						</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row}
						<tr class="border-b border-gray-800 hover:bg-gray-900/50 transition">
							<td class="py-4 px-6 text-sm text-gray-300">{row.feature}</td>
							<td class="py-4 px-6 text-center">
								{#if row.free}
									<svg class="w-5 h-5 mx-auto text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="20 6 9 17 4 12"></polyline>
									</svg>
								{:else}
									<svg class="w-5 h-5 mx-auto text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<line x1="18" y1="6" x2="6" y2="18"></line>
										<line x1="6" y1="6" x2="18" y2="18"></line>
									</svg>
								{/if}
							</td>
							<td class="py-4 px-6 text-center">
								{#if row.pro}
									<svg class="w-5 h-5 mx-auto text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="20 6 9 17 4 12"></polyline>
									</svg>
								{:else}
									<svg class="w-5 h-5 mx-auto text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<line x1="18" y1="6" x2="6" y2="18"></line>
										<line x1="6" y1="6" x2="18" y2="18"></line>
									</svg>
								{/if}
							</td>
							<td class="py-4 px-6 text-center">
								{#if row.enterprise}
									<svg class="w-5 h-5 mx-auto text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="20 6 9 17 4 12"></polyline>
									</svg>
								{:else}
									<svg class="w-5 h-5 mx-auto text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<line x1="18" y1="6" x2="6" y2="18"></line>
										<line x1="6" y1="6" x2="18" y2="18"></line>
									</svg>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>
