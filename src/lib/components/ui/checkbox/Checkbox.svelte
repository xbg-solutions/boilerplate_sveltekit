<!--
  Checkbox Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  export let checked = false;
  export let indeterminate = false;
  export let disabled = false;
  export let className = '';
  
  let input: HTMLInputElement;
  
  $: if (input) {
    input.indeterminate = indeterminate;
  }
</script>

<input
  bind:this={input}
  type="checkbox"
  bind:checked
  {disabled}
  class={cn(
    'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
    className
  )}
  on:change
  on:click
/>