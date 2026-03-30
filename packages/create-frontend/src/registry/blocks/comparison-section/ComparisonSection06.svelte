<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface PricingPlan {
		name: string;
		price: string;
		period?: string;
		description?: string;
		features: string[];
		highlighted?: boolean;
		ctaLabel?: string;
	}

	interface Props {
		class?: string;
		title?: string;
		plans?: PricingPlan[];
		annualDiscount?: number;
	}

	const defaultPlans: PricingPlan[] = [
		{
			name: 'Starter',
			price: '$0',
			period: '/month',
			description: 'Perfect for individuals and small projects.',
			features: ['5 projects', '10GB storage', 'Basic analytics', 'Email support'],
			ctaLabel: 'Get started free'
		},
		{
			name: 'Pro',
			price: '$29',
			period: '/month',
			description: 'Best for growing teams and businesses.',
			features: [
				'Unlimited projects',
				'100GB storage',
				'Advanced analytics',
				'Priority support',
				'Custom domain',
				'API access'
			],
			highlighted: true,
			ctaLabel: 'Start free trial'
		},
		{
			name: 'Enterprise',
			price: '$99',
			period: '/month',
			description: 'For large-scale operations.',
			features: [
				'Everything in Pro',
				'Unlimited storage',
				'Dedicated support',
				'SLA guarantee',
				'Custom integrations',
				'SSO/SAML'
			],
			ctaLabel: 'Contact sales'
		}
	];

	let billing: 'monthly' | 'annual' = $state('monthly');

	const {
		class: className,
		title = 'Choose the right plan',
		plans = defaultPlans,
		annualDiscount = 0.8
	}: Props = $props();

	function getPrice(price: string): number {
		return parseInt(price.replace('$', ''));
	}

	function formatPrice(price: string): string {
		if (price === '$0') return '$0';
		const basePrice = getPrice(price);
		const discountedPrice = Math.round(basePrice * annualDiscount);
		return `$${discountedPrice}`;
	}
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="text-center mb-12">
			<h2 class="text-3xl font-bold">{title}</h2>

			<div class="mt-8 flex items-center justify-center gap-4">
				<p class={cn('text-sm font-semibold', billing === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}>
					Monthly
				</p>
				<button
					onclick={() => (billing = billing === 'monthly' ? 'annual' : 'monthly')}
					class={cn(
						'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
						billing === 'annual' ? 'bg-foreground' : 'bg-muted'
					)}
				>
					<span
						class={cn(
							'inline-block h-6 w-6 transform rounded-full bg-background transition-transform',
							billing === 'annual' ? 'translate-x-7' : 'translate-x-1'
						)}
					/>
				</button>
				<p class={cn('text-sm font-semibold', billing === 'annual' ? 'text-foreground' : 'text-muted-foreground')}>
					Annual <span class="ml-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Save 20%</span>
				</p>
			</div>

			<p class="mt-4 text-muted-foreground">Choose a plan that fits your needs.</p>
		</div>

		<div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
			{#each plans as plan}
				<div
					class={cn(
						'rounded-xl border bg-background p-6',
						plan.highlighted ? 'border-foreground ring-2 ring-foreground' : ''
					)}
				>
					<h3 class="text-lg font-semibold">{plan.name}</h3>
					<div class="mt-4">
						<span class="text-4xl font-bold">
							{billing === 'monthly' ? plan.price : formatPrice(plan.price)}
						</span>
						<span class="text-muted-foreground">/{billing === 'monthly' ? 'month' : 'year'}</span>
					</div>
					<p class="mt-4 text-sm text-muted-foreground">{plan.description}</p>

					<ul class="mt-6 space-y-3">
						{#each plan.features as feature}
							<li class="flex items-center gap-2 text-sm">
								<svg class="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<polyline points="20 6 9 17 4 12" />
								</svg>
								{feature}
							</li>
						{/each}
					</ul>

					<Button
						class="w-full mt-6"
						variant={plan.highlighted ? 'default' : 'outline'}
					>
						{plan.ctaLabel}
					</Button>
				</div>
			{/each}
		</div>
	</div>
</section>
