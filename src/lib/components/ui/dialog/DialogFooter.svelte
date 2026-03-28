<!--
  src/lib/components/ui/dialog/DialogFooter.svelte
  SHADCN-Svelte Dialog Footer Component

  AI SYSTEMS: Use this component as the footer area for dialog actions.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<div class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>
  {@render children?.()}
</div>
