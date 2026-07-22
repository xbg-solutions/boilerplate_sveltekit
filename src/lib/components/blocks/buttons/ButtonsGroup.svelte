<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		onNew?: () => void;
		onEdit?: () => void;
		onSend?: () => void;
		onMore?: () => void;
	}

	const { class: className = '', onNew, onEdit, onSend, onMore } = $props();
</script>

<div class={cn('inline-flex rounded-md border overflow-hidden divide-x', className)}>
	<button
		type="button"
		onclick={onNew}
		class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-background hover:bg-muted transition-colors"
	>
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
		<span>New</span>
	</button>

	<button
		type="button"
		onclick={onEdit}
		class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-background hover:bg-muted transition-colors"
	>
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
			<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
		</svg>
		<span>Edit</span>
	</button>

	<button
		type="button"
		onclick={onSend}
		class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-background hover:bg-muted transition-colors"
	>
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<line x1="22" y1="2" x2="11" y2="13" />
			<polygon points="22 2 15 22 11 13 2 9 22 2" />
		</svg>
		<span>Send</span>
	</button>

	<button
		type="button"
		onclick={onMore}
		aria-label="More options"
		class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-background hover:bg-muted transition-colors"
	>
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="1" />
			<circle cx="19" cy="12" r="1" />
			<circle cx="5" cy="12" r="1" />
		</svg>
	</button>
</div>
