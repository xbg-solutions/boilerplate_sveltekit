<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface PricingPlan {
		name: string;
		price: string;
		period?: string;
		description?: string;
		features: string[];
		ctaLabel?: string;
		highlighted?: boolean;
	}

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		plans?: PricingPlan[];
	}

	const defaultPlans: PricingPlan[] = [
		{
			name: 'Free',
			price: '$0',
			features: ['5 projects', '10GB storage', 'Basic analytics', 'Email support'],
			ctaLabel: 'Get started'
		},
		{
			name: 'Pro',
			price: '$29',
			period: '/month',
			features: ['Unlimited projects', '1TB storage', 'Advanced analytics', 'Priority support'],
			ctaLabel: 'Start free trial',
			highlighted: true
		}
	];

	let { class: customClass = '', title = 'Plans & Comparison', description = '', plans = defaultPlans }: Props = $props();

	const checkIcon = `<polyline points="20 6 9 17 4 12"/>`;
	const allFeatures = ['Projects', 'Storage', 'Analytics', 'Support', 'API Access', 'Integrations'];
</script>

<section class={cn('w-full py-16 px-4 sm:px-6', customClass)}>
	<div class="mx-auto max-w-7xl">
		<div class="text-center mb-12">
			<p class="text-sm font-semibold text-foreground/60 mb-2">Pricing Section</p>
			<h2 class="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
			{#if description}
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
			{/if}
		</div>

		<!-- Cards -->
		<div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 mb-12">
			{#each plans as plan}
				<div class={cn(
					'rounded-xl border p-6 flex flex-col',
					plan.highlighted
						? 'border-foreground ring-2 ring-foreground bg-background'
						: 'bg-background'
				)}>
					{#if plan.highlighted}
						<div class="mb-4 inline-flex items-center rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background w-fit">
							Most popular
						</div>
					{/if}

					<h3 class="text-lg font-semibold mb-2">{plan.name}</h3>

					<div class="mb-6">
						<span class="text-4xl font-bold">{plan.price}</span>
						{#if plan.period}
							<span class="text-muted-foreground ml-1">{plan.period}</span>
						{/if}
					</div>

					<ul class="space-y-3 mb-6 flex-grow">
						{#each plan.features as feature}
							<li class="flex items-start gap-3">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground flex-shrink-0 mt-0.5">
									{checkIcon}
								</svg>
								<span class="text-sm">{feature}</span>
							</li>
						{/each}
					</ul>

					<Button class="w-full" variant={plan.highlighted ? 'default' : 'outline'}>
						{plan.ctaLabel || 'Get started'}
					</Button>
				</div>
			{/each}
		</div>

		<!-- Feature Comparison Table -->
		<div class="border-t pt-12">
			<h3 class="text-xl font-semibold mb-6 text-center">Detailed Comparison</h3>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b">
							<th class="text-left py-3 px-4 font-semibold">Feature</th>
							{#each plans.slice(0, 2) as plan}
								<th class="text-center py-3 px-4 font-semibold">{plan.name}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each allFeatures as feature}
							<tr class="border-b hover:bg-muted/30">
								<td class="text-left py-3 px-4">{feature}</td>
								{#each plans.slice(0, 2) as plan}
									<td class="text-center py-3 px-4">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-foreground">
											{checkIcon}
										</svg>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>
