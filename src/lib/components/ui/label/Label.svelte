<!--
  Label Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  export let htmlFor = '';
  export let className = '';
</script>

<label
  for={htmlFor}
  class={cn(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    className
  )}
>
  <slot />
</label>