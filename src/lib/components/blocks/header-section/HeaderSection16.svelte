<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		subtitle?: string;
		currentStep?: number;
		totalSteps?: number;
		progressPercent?: number;
	}

	let {
		class: className,
		title = 'Your Journey',
		subtitle = 'Track your progress through the onboarding process',
		currentStep = 2,
		totalSteps = 5,
		progressPercent = (currentStep / totalSteps) * 100
	}: Props = $props();
</script>

<section class={cn('w-full bg-background px-4 py-16 sm:py-24', className)}>
	<div class="mx-auto max-w-5xl">
		<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
			<div class="flex-1">
				{#if title}
					<h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-3">{title}</h1>
				{/if}

				{#if subtitle}
					<p class="text-lg text-muted-foreground">{subtitle}</p>
				{/if}
			</div>

			<div class="flex flex-col items-center gap-6 lg:items-end">
				<div class="relative w-32 h-32">
					<svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
						<circle
							cx="60"
							cy="60"
							r="54"
							fill="none"
							stroke="currentColor"
							stroke-width="8"
							class="text-muted"
						/>
						<circle
							cx="60"
							cy="60"
							r="54"
							fill="none"
							stroke="currentColor"
							stroke-width="8"
							stroke-dasharray={`${(progressPercent / 100) * 339.29} 339.29`}
							class="text-foreground transition-all duration-500"
						/>
					</svg>
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="text-center">
							<p class="text-3xl font-bold">{currentStep}</p>
							<p class="text-xs text-muted-foreground">of {totalSteps}</p>
						</div>
					</div>
				</div>

				<div class="text-center lg:text-right">
					<p class="text-sm text-muted-foreground">Progress</p>
					<p class="text-2xl font-bold">{Math.round(progressPercent)}%</p>
				</div>
			</div>
		</div>
	</div>
</section>
