<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		title?: string;
		subtitle?: string;
		primaryLabel?: string;
		onPrimary?: () => void;
		placeholderEmail?: string;
	}

	let {
		class: className,
		title = 'Stay Updated with Our Latest',
		subtitle = 'Get exclusive tips, industry insights, and product updates delivered to your inbox.',
		primaryLabel = 'Subscribe',
		onPrimary,
		placeholderEmail = 'your@email.com',
	}: Props = $props();

	let email = $state('');

	function handleSubscribe() {
		if (email) {
			onPrimary?.();
			email = '';
		}
	}
</script>

<section class={cn('w-full bg-gradient-to-b from-orange-50 to-pink-50 px-4 py-20 sm:py-28 sm:px-6 lg:px-8', className)}>
	<!-- Decorative Gradient Blobs -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl"></div>
		<div class="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"></div>
	</div>

	<div class="relative z-10 mx-auto max-w-4xl">
		<div class="text-center">
			<!-- Headline -->
			<h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900">
				{title}
			</h1>

			<!-- Subtitle -->
			<p class="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
				{subtitle}
			</p>

			<!-- Email Signup Inline -->
			<div class="mt-10 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
				<input
					type="email"
					placeholder={placeholderEmail}
					bind:value={email}
					class="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
					required
				/>
				<Button size="lg" onclick={handleSubscribe} class="bg-orange-600 hover:bg-orange-700">
					{primaryLabel}
				</Button>
			</div>

			<!-- Logo Strip -->
			<div class="mt-16 border-t border-gray-300/30 pt-10">
				<p class="text-sm text-gray-600 mb-6">Trusted by leading companies</p>
				<div class="flex flex-wrap justify-center items-center gap-8 opacity-60">
					<div class="text-gray-700 font-semibold">Acme</div>
					<div class="text-gray-700 font-semibold">TechCorp</div>
					<div class="text-gray-700 font-semibold">StartupIO</div>
					<div class="text-gray-700 font-semibold">CloudNet</div>
				</div>
			</div>
		</div>
	</div>
</section>
