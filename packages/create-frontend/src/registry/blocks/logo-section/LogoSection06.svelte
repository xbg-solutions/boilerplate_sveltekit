<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Logo {
		name: string;
		logoUrl?: string;
	}

	interface Props {
		class?: string;
		logos?: Logo[];
	}

	const defaultLogos: Logo[] = [
		{ name: 'Buzzsnap' },
		{ name: 'Dashstar' },
		{ name: 'Editly' },
		{ name: 'Geoaura' },
		{ name: 'Nanodea' },
		{ name: 'Orionbo' }
	];

	let { class: className, logos = defaultLogos }: Props = $props();
</script>

<section class={cn('w-full bg-foreground text-background py-8 px-4', className)}>
	<div class="mx-auto max-w-4xl">
		<div class="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y border border-background/20">
			{#each logos as logo (logo.name)}
				<div class="flex items-center justify-center p-8">
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
</section>
