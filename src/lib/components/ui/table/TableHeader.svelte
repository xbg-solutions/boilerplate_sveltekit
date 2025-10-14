<!--
  src/lib/components/ui/table/TableHeader.svelte
  SHADCN-Svelte Table Header Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let className: string = '';
  export { className as class };
</script>

<thead class={cn('[&_tr]:border-b', className)}>
  <slot />
</thead>