<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	const qaItems = [
		{
			id: 1,
			question: 'What is the warranty period for this product?',
			answer: 'This product comes with a 2-year manufacturer warranty covering defects in materials and workmanship.',
			isSellerResponse: true,
		},
		{
			id: 2,
			question: 'Does this product ship internationally?',
			answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. Please check your cart for specific shipping details.',
			isSellerResponse: true,
		},
		{
			id: 3,
			question: 'Is there a size/color guide available?',
			answer: 'A detailed size and color guide is available in the product specifications tab. You can also contact our customer service team for personalized recommendations.',
			isSellerResponse: true,
		},
	];

	let showAskForm = $state(false);
	let questionTitle = $state('');
	let questionText = $state('');
</script>

<section class={cn('w-full bg-background px-4 py-12 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h2 class="text-3xl font-bold">Questions & Answers</h2>
				<p class="text-muted-foreground">{qaItems.length} questions answered</p>
			</div>
			<Button onclick={() => (showAskForm = !showAskForm)}>
				{showAskForm ? 'Cancel' : 'Ask a Question'}
			</Button>
		</div>

		<!-- Ask Question Form -->
		{#if showAskForm}
			<div class="bg-gray-50 rounded-lg p-6 mb-8">
				<h3 class="font-semibold mb-4">Ask Your Question</h3>
				<div class="space-y-4">
					<div>
						<label for="question-title" class="block text-sm font-semibold mb-2">Question Title</label>
						<input
							id="question-title"
							type="text"
							bind:value={questionTitle}
							placeholder="What would you like to know?"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>

					<div>
						<label for="question-text" class="block text-sm font-semibold mb-2">Details</label>
						<textarea
							id="question-text"
							bind:value={questionText}
							placeholder="Provide more context for your question"
							rows="4"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
						></textarea>
					</div>

					<div class="flex gap-3">
						<Button size="sm" disabled={!questionTitle.trim()}>Submit Question</Button>
						<Button
							variant="outline"
							size="sm"
							onclick={() => {
								showAskForm = false;
								questionTitle = '';
								questionText = '';
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Q&A List -->
		<div class="space-y-6">
			{#each qaItems as item (item.id)}
				<div class="border-b pb-6 last:border-b-0">
					<!-- Question -->
					<h4 class="font-semibold text-base mb-3">{item.question}</h4>

					<!-- Answer -->
					<div class="ml-4 pl-4 border-l-2 border-gray-200">
						{#if item.isSellerResponse}
							<p class="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded w-fit mb-2">
								Seller response
							</p>
						{/if}
						<p class="text-muted-foreground">{item.answer}</p>
					</div>

					<!-- Helpful -->
					<button class="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mt-3">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="20 12 20 22 4 22 4 12" />
							<polyline points="2 7 12 2 22 7" />
						</svg>
						Was this helpful?
					</button>
				</div>
			{/each}
		</div>

		<!-- Load More -->
		<div class="mt-8 text-center">
			<Button variant="outline">View More Questions</Button>
		</div>
	</div>
</section>
