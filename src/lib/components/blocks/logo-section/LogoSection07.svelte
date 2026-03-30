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
		{ name: 'Orionbo' },
		{ name: 'Revahub' },
		{ name: 'Starlight' }
	];

	let {
		class: className,
		logos = defaultLogos,
		title = 'Customer logos that build trust',
		description = 'Add logos of notable companies using your product. Include recognizable brands in grayscale to maintain visual consistency.'
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-12 px-4', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="text-center">
			<p class="text-xs uppercase tracking-widest text-muted-foreground">Logo Section</p>
			<h2 class="mt-2 text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
			<p class="mt-3 text-sm text-muted-foreground sm:text-base">{description}</p>
		</div>

		<div class="mt-8 flex items-center gap-8 overflow-x-auto pb-2">
			{#each logos as logo (logo.name)}
				<div class="flex-shrink-0 flex items-center gap-2 font-semibold text-sm text-foreground">
					{#if logo.logoUrl}
						<img src={logo.logoUrl} alt={logo.name} class="h-5 w-5 object-contain" />
					{:else}
						<div class="h-5 w-5 rounded bg-foreground/80"></div>
					{/if}
					<span class="whitespace-nowrap">{logo.name}</span>
				</div>
			{/each}
		</div>
	</div>
</section>
