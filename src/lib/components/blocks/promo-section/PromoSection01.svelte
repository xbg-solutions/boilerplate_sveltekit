<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		heading?: string;
		subtitle?: string;
	}

	let { class: className, heading = 'Flash Sale', subtitle = 'Limited time offer - Save big today!' }: Props = $props();

	let timeLeft = $state({
		hours: 2,
		minutes: 34,
		seconds: 56,
	});
</script>

<section
	class={cn(
		'w-full bg-gradient-to-r from-red-600 to-red-700 px-4 py-20 sm:px-6 lg:px-8 text-white',
		className
	)}
>
	<div class="mx-auto max-w-6xl">
		<div class="text-center">
			<!-- Badge -->
			<div class="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
				Flash Sale
			</div>

			<!-- Heading -->
			<h2 class="text-5xl sm:text-6xl font-bold mb-4">Up to 50% Off</h2>

			<!-- Subtitle -->
			<p class="text-lg sm:text-xl text-red-100 mb-8 max-w-2xl mx-auto">
				{subtitle}
			</p>

			<!-- Countdown Timer -->
			<div class="mb-8 inline-block">
				<p class="text-sm text-red-100 mb-3">Offer ends in:</p>
				<div class="flex gap-4 justify-center">
					<div class="flex flex-col items-center">
						<span class="text-4xl sm:text-5xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
						<span class="text-xs sm:text-sm text-red-100 mt-1">Hours</span>
					</div>
					<div class="flex flex-col items-center">
						<span class="text-4xl sm:text-5xl font-bold">:</span>
					</div>
					<div class="flex flex-col items-center">
						<span class="text-4xl sm:text-5xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
						<span class="text-xs sm:text-sm text-red-100 mt-1">Minutes</span>
					</div>
					<div class="flex flex-col items-center">
						<span class="text-4xl sm:text-5xl font-bold">:</span>
					</div>
					<div class="flex flex-col items-center">
						<span class="text-4xl sm:text-5xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
						<span class="text-xs sm:text-sm text-red-100 mt-1">Seconds</span>
					</div>
				</div>
			</div>

			<!-- CTA Button -->
			<Button size="lg" class="bg-white text-red-600 hover:bg-gray-100 font-semibold px-8">
				Shop Now
			</Button>
		</div>
	</div>
</section>
