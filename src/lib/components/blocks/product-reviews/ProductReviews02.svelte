<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	let rating = $state(0);
	let title = $state('');
	let review = $state('');
	let recommend = $state('yes');
	let imageUploaded = $state(false);
</script>

<section class={cn('w-full bg-background px-4 py-12 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-2xl">
		<!-- Form Header -->
		<div class="mb-8">
			<h2 class="text-3xl font-bold mb-2">Write a Review</h2>
			<p class="text-muted-foreground">Share your experience with this product</p>
		</div>

		<!-- Form -->
		<form class="space-y-6">
			<!-- Rating Selector -->
			<div>
				<span class="block text-sm font-semibold mb-4">Rating</span>
				<div class="flex gap-2">
					{#each { length: 5 } as _, i}
						<button
							type="button"
							aria-label={`Rate ${i + 1} ${i + 1 === 1 ? 'star' : 'stars'}`}
							onclick={() => (rating = i + 1)}
							class="transition-transform hover:scale-110"
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill={i < rating ? 'currentColor' : 'none'}
								stroke="currentColor"
								stroke-width="1"
								class={i < rating ? 'text-yellow-400' : 'text-gray-300'}
							>
								<polygon points="12 2 15.09 10.26 24 10.35 17.77 16.88 20.16 25.54 12 20.01 3.84 25.54 6.23 16.88 0 10.35 8.91 10.26" />
							</svg>
						</button>
					{/each}
				</div>
				{#if rating > 0}
					<p class="text-sm text-muted-foreground mt-2">You rated this product {rating} star{rating !== 1 ? 's' : ''}</p>
				{/if}
			</div>

			<!-- Title -->
			<div>
				<label for="title" class="block text-sm font-semibold mb-2">Review Title</label>
				<input
					id="title"
					type="text"
					bind:value={title}
					placeholder="Sum up your experience in a few words"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>

			<!-- Review Text -->
			<div>
				<label for="review" class="block text-sm font-semibold mb-2">Your Review</label>
				<textarea
					id="review"
					bind:value={review}
					placeholder="Tell us what you think about this product"
					rows="6"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
				></textarea>
				<p class="text-xs text-muted-foreground mt-2">{review.length} / 2000 characters</p>
			</div>

			<!-- Recommendation -->
			<div>
				<span class="block text-sm font-semibold mb-3">Would you recommend this product?</span>
				<div class="flex gap-6">
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="radio"
							name="recommend"
							value="yes"
							bind:group={recommend}
							class="w-4 h-4"
						/>
						<span class="text-sm">Yes, I recommend it</span>
					</label>
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="radio"
							name="recommend"
							value="no"
							bind:group={recommend}
							class="w-4 h-4"
						/>
						<span class="text-sm">No, I don't recommend it</span>
					</label>
				</div>
			</div>

			<!-- Image Upload -->
			<div>
				<span class="block text-sm font-semibold mb-3">Upload Photos (Optional)</span>
				<div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
					<svg
						width="40"
						height="40"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						class="mx-auto mb-3 text-gray-400"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<polyline points="21 15 16 10 5 21" />
					</svg>
					<p class="text-sm text-muted-foreground mb-2">Drag and drop images here or click to upload</p>
					<input type="file" accept="image/*" multiple class="hidden" />
					<p class="text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF</p>
				</div>
			</div>

			<!-- Submit -->
			<div class="flex gap-3 pt-4">
				<Button class="flex-1" disabled={!title || !review || rating === 0}>Submit Review</Button>
				<Button variant="outline" class="flex-1">Cancel</Button>
			</div>
		</form>
	</div>
</section>
