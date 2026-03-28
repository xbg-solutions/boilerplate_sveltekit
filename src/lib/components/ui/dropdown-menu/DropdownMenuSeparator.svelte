<!--
  Dropdown Menu Separator Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    class: className = '',
    ...rest
  }: {
    class?: string;
    [key: string]: any;
  } = $props();
</script>

<div class={cn('my-1 h-px bg-gray-100', className)} {...rest}></div>
