<!--
  src/lib/components/ui/table/TableHeader.svelte
  SHADCN-Svelte Table Header Component
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  let { class: className = '', children, ...rest }: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<thead class={cn('[&_tr]:border-b', className)} {...rest}>
  {@render children?.()}
</thead>