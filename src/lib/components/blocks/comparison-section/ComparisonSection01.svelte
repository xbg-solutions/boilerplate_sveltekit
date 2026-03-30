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

	const {
		class: className,
		title = 'Choose the right plan',
		plans = defaultPlans
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="text-center mb-12">
			<p class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
				Comparison Section
			</p>
			<h2 class="mt-2 text-3xl font-bold">{title}</h2>
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
						<span class="text-4xl font-bold">{plan.price}</span>
						<span class="text-muted-foreground">{plan.period}</span>
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
