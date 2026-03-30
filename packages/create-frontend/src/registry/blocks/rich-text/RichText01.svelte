<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		subtitle?: string;
		paragraph1?: string;
		paragraph2?: string;
	}

	const {
		class: className,
		title = 'Article Title',
		subtitle = 'A compelling subtitle that draws readers in...',
		paragraph1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
		paragraph2 = 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-16 px-4 sm:px-6', className)}>
	<div class="mx-auto max-w-2xl">
		<h1 class="text-3xl font-bold tracking-tight">{title}</h1>
		<p class="mt-4 text-xl text-muted-foreground">{subtitle}</p>
		<div class="mt-8 space-y-4 text-base leading-7 text-muted-foreground">
			<p>{paragraph1}</p>
			<p>{paragraph2}</p>
		</div>
	</div>
</section>
