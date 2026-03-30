<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button } from '$lib/components/ui';

	interface Props {
		class?: string;
		onHome?: () => void;
		onContact?: () => void;
	}

	const { class: className, onHome, onContact }: Props = $props();
</script>

<section
	class={cn(
		'w-full bg-background min-h-[60vh] flex flex-col items-center justify-center px-4 text-center',
		className
	)}
>
	<p class="text-8xl font-black text-muted-foreground/20">404</p>
	<h1 class="mt-4 text-3xl font-bold">Page not found</h1>
	<p class="mt-2 text-muted-foreground max-w-sm">
		Sorry, we couldn't find the page you're looking for.
	</p>
	<div class="mt-8 flex gap-3">
		<Button onclick={onHome}>Go home</Button>
		<Button variant="outline" onclick={onContact}>Contact support</Button>
	</div>
</section>
