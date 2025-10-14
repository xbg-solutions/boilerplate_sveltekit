<!--
  src/lib/components/ui/table/TableRow.svelte
  SHADCN-Svelte Table Row Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<tr class={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)}>
  <slot />
</tr>