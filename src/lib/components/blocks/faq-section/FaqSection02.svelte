<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface FaqItem {
		question: string;
		answer: string;
		category?: string;
	}

	interface Props {
		class?: string;
		title?: string;
		description?: string;
		items?: FaqItem[];
		eyebrow?: string;
	}

	const defaultFaqs: FaqItem[] = [
		{
			question: 'What is shadcn/ui?',
			answer:
				'Shadcn/ui is a popular, open-source UI component library for React that focuses on flexibility and customization. It provides a set of accessible, customizable components that you can use to build modern web applications.'
		},
		{
			question: 'What is shadcn/ui kit for Figma?',
			answer:
				'The shadcn/ui kit for Figma is our comprehensive design kit that brings the shadcn/ui components into the Figma environment.'
		},
		{
			question: "I'm not familiar with shadcn/ui. Can I still use this kit?",
			answer:
				'Absolutely! Our kit is intuitive and comes with documentation to help you get started, regardless of your familiarity with Figma or shadcn/ui.'
		},
		{
			question: 'Can I create multi-brand design systems with this UI kit?',
			answer:
				'Yes! Our kit is designed with multi-brand support in mind. You can easily create and manage multiple styles for different brands within a single design system using Figma variables.'
		},
		{
			question: 'How will this kit save me time?',
			answer:
				'By providing pre-built, customizable components and templates, you can skip the repetitive setup work and focus on the unique aspects of your design.'
		},
		{
			question: 'How does this improve my collaboration with developers?',
			answer:
				'Our components are built to closely match the shadcn/ui library, significantly reducing misinterpretations and implementation errors.'
		}
	];

	let { class: className, title = 'FAQ', description = 'Get answers to your questions.', items = defaultFaqs, eyebrow = 'FAQ Section' }: Props = $props();

	let openIndexLeft: number | null = $state(0);
	let openIndexRight: number | null = $state(0);

	function toggleLeft(index: number) {
		openIndexLeft = openIndexLeft === index ? null : index;
	}

	function toggleRight(index: number) {
		openIndexRight = openIndexRight === index ? null : index;
	}
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl">
		<div>
			<p class="text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
			<h2 class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
			<p class="mt-3 text-muted-foreground">{description}</p>
		</div>

		<div class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
			{#if items.length > 0}
				<div>
					<h3 class="text-base font-semibold">General</h3>
					<div class="mt-4 flex flex-col divide-y border-t">
						{#each items.slice(0, 4) as item, index (item.question)}
							<button
								onclick={() => toggleLeft(index)}
								class="flex w-full items-center justify-between py-4 text-left text-sm font-medium hover:text-foreground transition-colors"
							>
								<span>{item.question}</span>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									class="flex-shrink-0 transition-transform duration-200 {openIndexLeft === index ? 'rotate-180' : ''}"
								>
									<polyline points="6 9 12 15 18 9" />
								</svg>
							</button>
							{#if openIndexLeft === index}
								<div class="pb-4 text-sm text-muted-foreground">
									{item.answer}
								</div>
							{/if}
						{/each}
					</div>
				</div>

				<div>
					<h3 class="text-base font-semibold">Billing</h3>
					<div class="mt-4 flex flex-col divide-y border-t">
						{#each items.slice(0, 4) as item, index (item.question + '-billing')}
							<button
								onclick={() => toggleRight(index)}
								class="flex w-full items-center justify-between py-4 text-left text-sm font-medium hover:text-foreground transition-colors"
							>
								<span>{item.question}</span>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									class="flex-shrink-0 transition-transform duration-200 {openIndexRight === index ? 'rotate-180' : ''}"
								>
									<polyline points="6 9 12 15 18 9" />
								</svg>
							</button>
							{#if openIndexRight === index}
								<div class="pb-4 text-sm text-muted-foreground">
									{item.answer}
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>
