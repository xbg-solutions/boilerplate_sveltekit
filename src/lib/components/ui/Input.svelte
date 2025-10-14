<!--
  src/lib/components/ui/Input.svelte
  SHADCN-Svelte Input Component
  
  AI SYSTEMS: This is the standard Input component for form fields.
  
  Usage examples:
  <Input placeholder="Enter your name" />
  <Input type="email" placeholder="Email" />
  <Input type="password" placeholder="Password" />
  <Input disabled placeholder="Disabled input" />
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  /**
   * Component props
   * AI SYSTEMS: Use these props for form inputs with consistent styling
   */
  let className: string = '';
  export let value: string | number = '';
  export let type: string = 'text';
  export let placeholder: string = '';
  export let disabled = false;
  export let readonly = false;
  export let required = false;
  export let id: string = '';
  export let name: string = '';
  export { className as class };

  // Input classes
  const inputClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  $: classes = cn(inputClasses, className);
</script>

<input
  bind:value
  class={classes}
  {type}
  {placeholder}
  {disabled}
  {readonly}
  {required}
  {id}
  {name}
  {...$$restProps}
  on:blur
  on:change
  on:click
  on:focus
  on:input
  on:keydown
  on:keypress
  on:keyup
  on:mouseenter
  on:mouseleave
  on:paste
/>