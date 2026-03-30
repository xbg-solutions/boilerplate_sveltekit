<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Feature {
		name: string;
		starter: string | boolean;
		pro: string | boolean;
		enterprise: string | boolean;
	}

	interface Props {
		class?: string;
		title?: string;
		features?: Feature[];
	}

	const defaultFeatures: Feature[] = [
		{ name: 'Projects', starter: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
		{ name: 'Storage', starter: '10GB', pro: '100GB', enterprise: 'Unlimited' },
		{ name: 'Support', starter: 'Email', pro: 'Priority', enterprise: 'Dedicated' },
		{ name: 'API', starter: false, pro: true, enterprise: true },
		{ name: 'Custom Domain', starter: false, pro: true, enterprise: true },
		{ name: 'SSO', starter: false, pro: false, enterprise: true }
	];

	const {
		class: className,
		title = 'Feature Comparison',
		features = defaultFeatures
	}: Props = $props();

	function renderValue(value: string | boolean) {
		if (typeof value === 'boolean') {
			if (value) {
				return `<svg class="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12" /></svg>`;
			} else {
				return `<svg class="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>`;
			}
		}
		return value;
	}
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="text-center mb-12">
			<h2 class="text-3xl font-bold">{title}</h2>
			<p class="mt-4 text-muted-foreground">Compare all features across plans.</p>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full mt-8 text-sm">
				<thead class="border-b">
					<tr>
						<th class="text-left py-4 px-4 font-semibold">Feature</th>
						<th class="text-center py-4 px-4 font-semibold">Starter</th>
						<th class="text-center py-4 px-4 font-semibold">Pro</th>
						<th class="text-center py-4 px-4 font-semibold">Enterprise</th>
					</tr>
				</thead>
				<tbody>
					{#each features as feature}
						<tr class="border-b hover:bg-muted/50">
							<td class="py-4 px-4">{feature.name}</td>
							<td class="py-4 px-4 text-center">
								{#if typeof feature.starter === 'boolean'}
									<div class="flex justify-center">
										{@html renderValue(feature.starter)}
									</div>
								{:else}
									{feature.starter}
								{/if}
							</td>
							<td class="py-4 px-4 text-center">
								{#if typeof feature.pro === 'boolean'}
									<div class="flex justify-center">
										{@html renderValue(feature.pro)}
									</div>
								{:else}
									{feature.pro}
								{/if}
							</td>
							<td class="py-4 px-4 text-center">
								{#if typeof feature.enterprise === 'boolean'}
									<div class="flex justify-center">
										{@html renderValue(feature.enterprise)}
									</div>
								{:else}
									{feature.enterprise}
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>
