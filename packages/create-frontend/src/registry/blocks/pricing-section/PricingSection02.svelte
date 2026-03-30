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
			period: '/month',
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
		},
		{
			name: 'Enterprise',
			price: '$99',
			period: '/month',
			features: ['Everything unlimited', 'Custom integrations', '24/7 support'],
			ctaLabel: 'Contact sales'
		}
	];

	let { class: customClass = '', title = 'Simple, transparent pricing', description = '', plans = defaultPlans }: Props = $props();

	let billing: 'monthly' | 'annual' = $state('monthly');

	const checkIcon = `<polyline points="20 6 9 17 4 12"/>`;

	function getPrice(plan: PricingPlan): string {
		if (billing === 'annual') {
			const monthlyPrice = parseFloat(plan.price.replace('$', ''));
			const annualMonthly = Math.round(monthlyPrice * 12 * 0.8);
			return '$' + annualMonthly;
		}
		return plan.price;
	}
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

		<!-- Billing Toggle -->
		<div class="flex items-center justify-center gap-4 mb-12">
			<button
				onclick={() => { billing = 'monthly'; }}
				class={cn(
					'px-4 py-2 rounded-lg font-medium transition-colors',
					billing === 'monthly'
						? 'bg-foreground text-background'
						: 'text-foreground/60'
				)}
			>
				Monthly
			</button>
			<button
				onclick={() => { billing = 'annual'; }}
				class={cn(
					'px-4 py-2 rounded-lg font-medium transition-colors relative',
					billing === 'annual'
						? 'bg-foreground text-background'
						: 'text-foreground/60'
				)}
			>
				Annual
				{#if billing === 'annual'}
					<span class="absolute -top-2 -right-8 inline-flex items-center rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">
						Save 20%
					</span>
				{/if}
			</button>
		</div>

		<div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
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
						<span class="text-4xl font-bold">{getPrice(plan)}</span>
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
	</div>
</section>
