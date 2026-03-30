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
	class={cn(
		'w-full bg-foreground text-background min-h-[60vh] flex flex-col items-center justify-center px-4 text-center',
		className
	)}
>
	<p class="text-9xl font-black opacity-10">404</p>
	<h1 class="mt-4 text-3xl font-bold">Page not found</h1>
	<p class="mt-2 opacity-60 max-w-sm">
		The page you're looking for doesn't exist or has been moved to another location.
	</p>
	<Button onclick={onHome} variant="secondary" class="mt-8">Go back home</Button>
</section>
