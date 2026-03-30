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

	let { class: className, title = 'Frequently Asked Questions', description = 'Find answers to your questions.', items = defaultFaqs, eyebrow = 'FAQ Section' }: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-6xl text-center">
		<p class="text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
		<h2 class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
		<p class="mt-3 text-muted-foreground">
			{description}
			<a href="#" class="underline hover:text-foreground">Contact us.</a>
		</p>
	</div>

	<div class="mt-10 mx-auto max-w-4xl">
		<div class="flex flex-col divide-y border-t">
			{#each items as item (item.question)}
				<div class="grid grid-cols-1 gap-4 py-6 sm:grid-cols-2">
					<h3 class="font-semibold text-sm">{item.question}</h3>
					<p class="text-sm text-muted-foreground">{item.answer}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
