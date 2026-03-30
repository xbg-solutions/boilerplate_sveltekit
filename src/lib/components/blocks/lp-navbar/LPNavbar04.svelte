<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Link {
		label: string;
		href?: string;
		children?: Link[];
	}

	let {
		class: className = '',
		links = [
			{ label: 'Products', href: '#' },
			{ label: 'Use Cases', href: '#' },
			{ label: 'Docs', href: '#' },
			{ label: 'Blog', href: '#' },
			{ label: 'FAQ', href: '#' }
		],
		onCta = () => {}
	}: {
		class?: string;
		links?: Link[];
		onCta?: () => void;
	} = $props();

	let isOpen = $state(false);
</script>

<header class={cn('w-full border-b bg-background', className)}>
	<!-- Desktop Pill Container -->
	<div class="hidden sm:flex mx-auto w-fit rounded-full border bg-background px-4 py-2 shadow-sm my-4">
		<!-- Logo -->
		<div class="h-8 w-8 rounded bg-foreground/10 flex items-center justify-center flex-shrink-0">
			<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="text-foreground/60">
				<path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
			</svg>
		</div>

		<!-- Nav Links -->
		<nav class="flex items-center gap-4 mx-4">
			{#each links as link}
				<a
					href={link.href || '#'}
					class="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- CTA -->
		<Button size="sm" onclick={onCta}>Get started</Button>
	</div>

	<!-- Mobile Full-Width Header -->
	<div class="sm:hidden w-full border-b">
		<div class="flex items-center justify-between px-4 py-3">
			<!-- Logo -->
			<div class="h-8 w-8 rounded bg-foreground/10 flex items-center justify-center flex-shrink-0">
				<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="text-foreground/60">
					<path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
				</svg>
			</div>

			<!-- Mobile Menu Toggle -->
			<button
				onclick={() => (isOpen = !isOpen)}
				class="p-2 hover:bg-muted rounded-md transition-colors"
			>
				{#if isOpen}
					<svg width="20" height="20" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2">
						<line x1="3" y1="6" x2="21" y2="6" />
						<line x1="3" y1="12" x2="21" y2="12" />
						<line x1="3" y1="18" x2="21" y2="18" />
					</svg>
				{/if}
			</button>
		</div>

		<!-- Mobile Menu -->
		{#if isOpen}
			<nav class="flex flex-col py-4 px-4 border-t">
				{#each links as link}
					<a
						href={link.href || '#'}
						class="px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						{link.label}
					</a>
				{/each}
			</nav>
			<div class="px-4 pb-4">
				<Button size="sm" class="w-full" onclick={onCta}>Get started</Button>
			</div>
		{/if}
	</div>
</header>
