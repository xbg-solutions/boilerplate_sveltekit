<!--
  src/lib/components/ui/table/TableCell.svelte
  SHADCN-Svelte Table Cell Component
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children, ...rest }: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<td class={cn('p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', className)} {...rest}>
  {@render children?.()}
</td>