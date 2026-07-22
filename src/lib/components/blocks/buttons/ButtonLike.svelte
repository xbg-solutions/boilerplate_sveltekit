<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		count?: number;
		liked?: boolean;
		onlike?: () => void;
	}

	const { class: className = '', count = 24, liked = false, onlike } = $props();

	// svelte-ignore state_referenced_locally
	let likeCount = $state(count);
	// svelte-ignore state_referenced_locally
	let isLiked = $state(liked);

	const handleLike = () => {
		isLiked = !isLiked;
		likeCount = isLiked ? likeCount + 1 : likeCount - 1;
		onlike?.();
	};
</script>

<button
	type="button"
	onclick={handleLike}
	class={cn(
		'inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted transition-colors',
		isLiked && 'bg-muted',
		className
	)}
>
	<svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
		<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
	</svg>
	<span>Like</span>
	<span class="text-sm text-muted-foreground">{likeCount}</span>
</button>
