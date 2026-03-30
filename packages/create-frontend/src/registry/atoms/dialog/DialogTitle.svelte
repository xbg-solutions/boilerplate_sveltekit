<!--
  src/lib/components/ui/dialog/DialogTitle.svelte
  SHADCN-Svelte Dialog Title Component

  AI SYSTEMS: Use this component for dialog titles.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<h1 class={cn('text-lg font-semibold leading-none tracking-tight', className)}>
  {@render children?.()}
</h1>
