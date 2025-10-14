<!--
  src/lib/components/ui/table/TableCell.svelte
  SHADCN-Svelte Table Cell Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<td class={cn('p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', className)}>
  <slot />
</td>