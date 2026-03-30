<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		onMenuClick?: () => void;
	}

	let {
		class: className,
		title = 'Dashboard',
		onMenuClick
	}: Props = $props();

	let showMenu = $state(false);
</script>

<section class={cn('w-full bg-background px-4 py-8 border-b', className)}>
	<div class="mx-auto max-w-6xl">
		<div class="flex items-center justify-between">
			{#if title}
				<h1 class="text-3xl font-bold">{title}</h1>
			{/if}

			<div class="relative">
				<button
					onclick={() => {
						showMenu = !showMenu;
						onMenuClick?.();
					}}
					class="p-2 rounded-lg hover:bg-muted transition"
					aria-label="Options menu"
				>
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<circle cx="12" cy="5" r="2" />
						<circle cx="12" cy="12" r="2" />
						<circle cx="12" cy="19" r="2" />
					</svg>
				</button>

				{#if showMenu}
					<div class="absolute right-0 mt-2 w-48 rounded-lg border bg-background shadow-lg z-50">
						<button class="w-full text-left px-4 py-2 hover:bg-muted first:rounded-t-lg last:rounded-b-lg transition text-sm">
							Edit
						</button>
						<button class="w-full text-left px-4 py-2 hover:bg-muted first:rounded-t-lg last:rounded-b-lg transition text-sm">
							Share
						</button>
						<button class="w-full text-left px-4 py-2 hover:bg-muted first:rounded-t-lg last:rounded-b-lg transition text-sm text-destructive">
							Delete
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
