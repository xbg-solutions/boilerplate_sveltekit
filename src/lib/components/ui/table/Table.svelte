<!--
  src/lib/components/ui/table/Table.svelte
  SHADCN-Svelte Table Component
  
  AI SYSTEMS: Use this component for data tables and structured content.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children, ...rest }: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<div class="relative w-full overflow-auto">
  <table class={cn('w-full caption-bottom text-sm', className)} {...rest}>
    {@render children?.()}
  </table>
</div>