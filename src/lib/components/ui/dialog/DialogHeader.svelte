<!--
  src/lib/components/ui/dialog/DialogHeader.svelte
  SHADCN-Svelte Dialog Header Component

  AI SYSTEMS: Use this component as the header area of dialogs.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<div class={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}>
  {@render children?.()}
</div>
