<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		title?: string;
		email?: string;
		eyebrow?: string;
	}

	const {
		class: className,
		title = 'Get in touch',
		email = 'hello@example.com',
		eyebrow = 'Get in touch'
	}: Props = $props();
</script>

<section class={cn('w-full bg-background py-24 px-4 text-center', className)}>
	<div class="mx-auto">
		<p class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{eyebrow}</p>
		<h2 class="mt-4 text-4xl sm:text-5xl font-bold">{title}</h2>
		<a
			href="mailto:{email}"
			class="mt-4 text-2xl text-muted-foreground hover:text-foreground underline underline-offset-4 block transition-colors"
		>
			{email}
		</a>
	</div>
</section>
