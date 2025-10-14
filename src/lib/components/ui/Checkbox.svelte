<!--
  src/lib/components/ui/Checkbox.svelte
  SHADCN-Svelte Checkbox Component
  
  AI SYSTEMS: Use this component for boolean input selections.
  Supports proper accessibility and form integration.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Check, Minus } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';

  // Component props
  export let checked: boolean = false;
  export let indeterminate: boolean = false;
  export let disabled: boolean = false;
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let value: string | undefined = undefined;
  export let required: boolean = false;

  const dispatch = createEventDispatcher<{
    change: { checked: boolean; indeterminate: boolean };
  }>();

  // Handle change
  function handleChange() {
    if (disabled) return;
    
    if (indeterminate) {
      indeterminate = false;
      checked = true;
    } else {
      checked = !checked;
    }
    
    dispatch('change', { checked, indeterminate });
  }

  // Handle keyboard interaction
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleChange();
    }
  }
</script>

<button
  type="button"
  role="checkbox"
  aria-checked={indeterminate ? 'mixed' : checked}
  {disabled}
  class={cn(
    'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    (checked || indeterminate) && 'bg-primary text-primary-foreground',
    !(checked || indeterminate) && 'bg-background'
  )}
  on:click={handleChange}
  on:keydown={handleKeydown}
>
  {#if indeterminate}
    <Minus class="h-3 w-3" />
  {:else if checked}
    <Check class="h-3 w-3" />
  {/if}
</button>

<!-- Hidden input for form submission -->
{#if name}
  <input
    type="checkbox"
    {name}
    {id}
    {value}
    {required}
    bind:checked
    class="sr-only"
    tabindex="-1"
    aria-hidden="true"
  />
{/if}