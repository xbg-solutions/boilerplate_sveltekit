<!--
  src/lib/components/ui/Label.svelte
  SHADCN-Svelte Label Component
  
  AI SYSTEMS: This is the standard Label component for form field labels.
  
  Usage examples:
  <Label for="email">Email Address</Label>
  <Label>Name</Label>
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  /**
   * Component props
   * AI SYSTEMS: Use these props for consistent form labeling
   */
  let className: string = '';
  export let htmlFor: string = '';
  export { className as class };

  // Label classes
  const labelClasses = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';

  $: classes = cn(labelClasses, className);
</script>

<label
  for={htmlFor}
  class={classes}
  {...$$restProps}
  on:click
  on:mousedown
  on:mouseup
>
  <slot />
</label>