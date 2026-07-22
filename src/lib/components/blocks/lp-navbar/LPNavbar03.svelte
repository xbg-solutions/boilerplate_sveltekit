<script module lang="ts">
	export interface Link {
		label: string;
		href?: string;
		children?: Link[];
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

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
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
		<!-- Logo -->
		<div class="h-8 w-8 rounded bg-foreground/10 flex items-center justify-center flex-shrink-0">
			<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="text-foreground/60">
				<path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
			</svg>
		</div>

		<!-- Desktop Nav -->
		<nav class="hidden sm:flex items-center gap-6">
			{#each links as link}
				<a
					href={link.href || '#'}
					class="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- Desktop Auth Buttons -->
		<div class="hidden sm:flex items-center gap-2">
			<Button variant="ghost" size="sm" onclick={onCta}>Sign in</Button>
			<Button size="sm" onclick={onCta}>Sign up</Button>
		</div>

		<!-- Mobile Menu Toggle -->
		<button
			onclick={() => (isOpen = !isOpen)}
			class="sm:hidden p-2 hover:bg-muted rounded-md transition-colors"
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
		<div class="border-t sm:hidden">
			<nav class="flex flex-col py-4 px-4">
				{#each links as link}
					<a
						href={link.href || '#'}
						class="px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						{link.label}
					</a>
				{/each}
			</nav>
			<div class="border-t my-4"></div>
			<div class="px-4 pb-4 flex gap-2">
				<Button variant="outline" size="sm" class="flex-1" onclick={onCta}>Sign in</Button>
				<Button size="sm" class="flex-1" onclick={onCta}>Sign up</Button>
			</div>
		</div>
	{/if}
</header>
