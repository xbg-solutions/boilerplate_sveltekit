<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type IconType = 'check' | 'box' | 'list' | 'default';

	interface Step {
		label: string;
		icon?: IconType;
	}

	interface Props {
		class?: string;
		steps?: Step[];
		currentStep?: number;
	}

	const defaultSteps: Step[] = [
		{ label: '1', icon: 'check' },
		{ label: '2. Delivery', icon: 'default' },
		{ label: '3', icon: 'box' },
		{ label: '4', icon: 'list' }
	];

	const { class: className = '', steps = defaultSteps, currentStep = 1 } = $props();

	const getIcon = (iconType: IconType | undefined, isCompleted: boolean) => {
		if (isCompleted && iconType !== 'default') {
			return '<polyline points="20 6 9 17 4 12"/>';
		}

		switch (iconType) {
			case 'box':
				return '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>';
			case 'list':
				return '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>';
			case 'check':
				return '<polyline points="20 6 9 17 4 12"/>';
			default:
				return '';
		}
	};
</script>

<div class={cn('inline-flex items-center gap-1', className)}>
	{#each steps as step, index (index)}
		<div class="flex items-center gap-1">
			{#if index > 0}
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted-foreground mx-0.5">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			{/if}

			<div
				class={cn(
					'flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-sm',
					index === currentStep ? 'border-foreground font-medium' : '',
					index < currentStep ? 'border-green-500' : ''
				)}
			>
				{#if index < currentStep || (step.icon === 'check' && index < currentStep)}
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600">
						{@html getIcon('check', true)}
					</svg>
				{:else if getIcon(step.icon, false)}
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						{@html getIcon(step.icon, false)}
					</svg>
				{/if}
				<span>{step.label}</span>
			</div>
		</div>
	{/each}
</div>
