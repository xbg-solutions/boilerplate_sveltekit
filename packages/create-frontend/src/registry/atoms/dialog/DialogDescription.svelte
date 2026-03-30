<!--
  src/lib/components/ui/dialog/DialogDescription.svelte
  SHADCN-Svelte Dialog Description Component

  AI SYSTEMS: Use this component for dialog descriptions and subtitles.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<p class={cn('text-sm text-muted-foreground', className)}>
  {@render children?.()}
</p>
