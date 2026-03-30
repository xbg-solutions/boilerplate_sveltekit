<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		count?: number;
		bookmarked?: boolean;
		onbookmark?: () => void;
	}

	const { class: className = '', count = 24, bookmarked = false, onbookmark } = $props();

	let bookmarkCount = $state(count);
	let isBookmarked = $state(bookmarked);

	const handleBookmark = () => {
		isBookmarked = !isBookmarked;
		bookmarkCount = isBookmarked ? bookmarkCount + 1 : bookmarkCount - 1;
		onbookmark?.();
	};
</script>

<button
	type="button"
	onclick={handleBookmark}
	class={cn(
		'inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted transition-colors',
		isBookmarked && 'bg-muted',
		className
	)}
>
	<svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
		<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
	</svg>
	<span>Bookmark</span>
	<span class="text-sm text-muted-foreground">{bookmarkCount}</span>
</button>
