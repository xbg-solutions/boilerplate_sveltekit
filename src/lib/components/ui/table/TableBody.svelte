<!--
  src/lib/components/ui/table/TableBody.svelte
  SHADCN-Svelte Table Body Component
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children, ...rest }: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<tbody class={cn('[&_tr:last-child]:border-0', className)} {...rest}>
  {@render children?.()}
</tbody>