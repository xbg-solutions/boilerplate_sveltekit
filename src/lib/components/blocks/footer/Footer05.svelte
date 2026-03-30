<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
	}

	let { class: customClass = '' }: Props = $props();
</script>

<footer class={cn('w-full border-t bg-background py-6 px-4 text-center', customClass)}>
	<div class="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
		<a href="#" class="hover:text-foreground transition-colors">Privacy Policy</a>
		<span>•</span>
		<a href="#" class="hover:text-foreground transition-colors">Terms of Service</a>
		<span>•</span>
		<a href="#" class="hover:text-foreground transition-colors">Cookie Policy</a>
	</div>
	<p class="mt-4 text-sm text-muted-foreground">© {new Date().getFullYear()} Acme Inc. All rights reserved.</p>
</footer>
