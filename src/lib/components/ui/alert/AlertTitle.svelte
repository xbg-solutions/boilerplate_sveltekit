<!--
  Alert Title Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  export let className = '';
</script>

<h5 class={cn('mb-1 font-medium leading-none tracking-tight', className)}>
  <slot />
</h5>