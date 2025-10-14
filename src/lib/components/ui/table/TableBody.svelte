<!--
  src/lib/components/ui/table/TableBody.svelte
  SHADCN-Svelte Table Body Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<tbody class={cn('[&_tr:last-child]:border-0', className)}>
  <slot />
</tbody>