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
			name: 'Pro',
			price: '$29',
			period: '/month',
			description: 'Everything you need to grow',
			features: ['Unlimited projects', '1TB storage', 'Advanced analytics', 'Priority support', 'Custom integrations'],
			ctaLabel: 'Start free trial',
			highlighted: true
		}
	];

	let { class: customClass = '', title = 'Simple, transparent pricing', description = '', plans = defaultPlans }: Props = $props();

	const checkIcon = `<polyline points="20 6 9 17 4 12"/>`;
	const proPlan = plans[0];
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

		<!-- Featured Plan Card -->
		{#if proPlan}
			<div class="mt-10 mx-auto max-w-lg">
				<div class="rounded-xl border-2 border-foreground ring-2 ring-foreground bg-background p-8">
					<div class="inline-flex items-center rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background mb-4">
						Most popular
					</div>

					<h3 class="text-2xl font-semibold mb-2">{proPlan.name}</h3>

					<div class="mb-6">
						<span class="text-5xl font-bold">{proPlan.price}</span>
						{#if proPlan.period}
							<span class="text-muted-foreground ml-2">{proPlan.period}</span>
						{/if}
					</div>

					<ul class="space-y-3 mb-8">
						{#each proPlan.features as feature}
							<li class="flex items-start gap-3">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-foreground flex-shrink-0 mt-0.5">
									{checkIcon}
								</svg>
								<span class="text-sm">{feature}</span>
							</li>
						{/each}
					</ul>

					<Button class="w-full mb-6">
						{proPlan.ctaLabel || 'Get started'}
					</Button>

					<p class="text-center text-sm text-muted-foreground">30-day free trial, no credit card required.</p>
				</div>
			</div>

			<!-- Compare link -->
			<div class="mt-8 text-center">
				<a href="#" class="text-sm font-semibold text-foreground hover:underline">
					Compare all plans →
				</a>
			</div>
		{/if}
	</div>
</section>
