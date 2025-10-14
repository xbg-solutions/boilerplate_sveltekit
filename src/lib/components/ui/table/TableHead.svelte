<!--
  src/lib/components/ui/table/TableHead.svelte
  SHADCN-Svelte Table Head Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<th class={cn('h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', className)}>
  <slot />
</th>