<!--
  Alert Description Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  export let className = '';
</script>

<div class={cn('text-sm [&_p]:leading-relaxed', className)}>
  <slot />
</div>