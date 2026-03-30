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
			{
				label: 'Products',
				href: '#',
				children: [
					{ label: 'Product A', href: '#' },
					{ label: 'Product B', href: '#' }
				]
			},
			{
				label: 'Use Cases',
				href: '#',
				children: [
					{ label: 'Use Case 1', href: '#' },
					{ label: 'Use Case 2', href: '#' }
				]
			},
			{ label: 'Docs', href: '#' },
			{ label: 'Blog', href: '#' },
			{ label: 'FAQ', href: '#' }
		],
		onCta = () => {},
		onLogin = () => {}
	}: {
		class?: string;
		links?: Link[];
		onCta?: () => void;
		onLogin?: () => void;
	} = $props();

	let isOpen = $state(false);
	let openDropdown = $state<string | null>(null);
	let openMobileSubmenu = $state<string | null>(null);
</script>

<header class={cn('w-full border-b bg-background', className)}>
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
		<!-- Logo -->
		<div class="h-8 w-8 rounded bg-foreground/10 flex items-center justify-center flex-shrink-0">
			<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="text-foreground/60">
				<path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" />
			</svg>
		</div>

		<!-- Desktop Nav with Dropdowns -->
		<nav class="hidden sm:flex items-center gap-6">
			{#each links as link}
				<div class="relative group">
					<button
						onmouseenter={() => link.children && (openDropdown = link.label)}
						onmouseleave={() => (openDropdown = null)}
						class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						{link.label}
						{#if link.children}
							<svg width="12" height="12" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2">
								<polyline points="6 9 12 15 18 9" />
							</svg>
						{/if}
					</button>

					<!-- Dropdown Menu -->
					{#if link.children && openDropdown === link.label}
						<div
							class="absolute top-full left-0 mt-2 w-48 rounded-md border bg-background shadow-lg py-2 z-50"
							onmouseenter={() => (openDropdown = link.label)}
							onmouseleave={() => (openDropdown = null)}
						>
							{#each link.children as child}
								<a
									href={child.href || '#'}
									class="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								>
									{child.label}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</nav>

		<!-- Desktop Auth Buttons -->
		<div class="hidden sm:flex items-center gap-2">
			<Button variant="ghost" size="sm" onclick={onLogin}>Login</Button>
			<Button size="sm" onclick={onCta}>Get started</Button>
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

	<!-- Mobile Slide-in Panel -->
	{#if isOpen}
		<!-- Overlay -->
		<div
			class="fixed inset-0 z-40 bg-black/50 sm:hidden"
			onclick={() => (isOpen = false)}
		></div>

		<!-- Slide Panel -->
		<div class="fixed inset-y-0 left-0 z-50 w-72 bg-background border-r sm:hidden overflow-y-auto">
			<!-- Close Button -->
			<div class="flex items-center justify-between p-6 border-b">
				<span class="font-medium">Menu</span>
				<button
					onclick={() => (isOpen = false)}
					class="p-2 hover:bg-muted rounded-md transition-colors"
				>
					<svg width="20" height="20" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<!-- Navigation -->
			<nav class="flex flex-col py-4 px-4">
				{#each links as link}
					{#if link.children}
						<button
							onclick={() =>
								(openMobileSubmenu = openMobileSubmenu === link.label ? null : link.label)}
							class="flex items-center justify-between px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
						>
							{link.label}
							<svg
								width="12"
								height="12"
								viewBox="0 0 20 20"
								stroke="currentColor"
								stroke-width="2"
								class={cn('transition-transform', openMobileSubmenu === link.label && 'rotate-180')}
							>
								<polyline points="6 9 12 15 18 9" />
							</svg>
						</button>
						{#if openMobileSubmenu === link.label}
							<div class="pl-4 flex flex-col">
								{#each link.children as child}
									<a
										href={child.href || '#'}
										class="px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
										onclick={() => (isOpen = false)}
									>
										{child.label}
									</a>
								{/each}
							</div>
						{/if}
					{:else}
						<a
							href={link.href || '#'}
							class="px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							onclick={() => (isOpen = false)}
						>
							{link.label}
						</a>
					{/if}
				{/each}
			</nav>

			<!-- Auth Buttons -->
			<div class="border-t mt-4 p-6">
				<div class="flex flex-col gap-2">
					<Button variant="outline" size="sm" class="w-full" onclick={onLogin}>Login</Button>
					<Button size="sm" class="w-full" onclick={onCta}>Get started</Button>
				</div>
			</div>
		</div>
	{/if}
</header>
