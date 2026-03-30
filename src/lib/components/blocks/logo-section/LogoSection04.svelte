<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Logo {
		name: string;
		logoUrl?: string;
	}

	interface Props {
		class?: string;
		logos?: Logo[];
		title?: string;
		description?: string;
	}

	const defaultLogos: Logo[] = [
		{ name: 'Buzzsnap' },
		{ name: 'Dashstar' },
		{ name: 'Editly' },
		{ name: 'Geoaura' },
		{ name: 'Nanodea' },
		{ name: 'Orionbo' }
	];

	let {
		class: className,
		logos = defaultLogos,
		title = 'Customer logos that build trust',
		description = 'Add logos of notable companies using your product. Include recognizable brands in grayscale to maintain visual consistency.'
	}: Props = $props();
</script>

<section class={cn('w-full bg-foreground text-background py-12 px-4', className)}>
	<div class="mx-auto max-w-5xl flex flex-col gap-8 sm:flex-row sm:items-start">
		<div class="flex-shrink-0 sm:w-1/3">
			<p class="text-xs uppercase tracking-widest text-background/70">Logo Section</p>
			<h2 class="mt-2 text-2xl font-bold text-background">{title}</h2>
			<p class="mt-3 text-sm text-background/70">{description}</p>
		</div>

		<div class="sm:w-2/3">
			<div class="grid grid-cols-2 divide-x divide-y border border-background/20">
				{#each logos as logo (logo.name)}
					<div class="flex items-center justify-center p-6">
						<div class="flex items-center gap-2 font-semibold text-sm text-background">
							{#if logo.logoUrl}
								<img src={logo.logoUrl} alt={logo.name} class="h-5 w-5 object-contain brightness-0 invert" />
							{:else}
								<div class="h-5 w-5 rounded bg-background/80"></div>
							{/if}
							{logo.name}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
