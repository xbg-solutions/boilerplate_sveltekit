<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		onHome?: () => void;
	}

	const { class: className, onHome }: Props = $props();
</script>

<section
	class={cn('w-full bg-background min-h-[60vh] flex items-center px-4', className)}
>
	<div class="mx-auto max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center w-full">
		<div>
			<p class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">404</p>
			<h1 class="mt-4 text-3xl font-bold">Oops! Page not found</h1>
			<p class="mt-4 text-muted-foreground">
				The page you're looking for doesn't exist or has been moved.
			</p>
			<Button onclick={onHome} class="mt-8">Back to home</Button>
		</div>

		<div class="aspect-square w-full rounded-2xl bg-muted" />
	</div>
</section>
