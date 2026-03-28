<!--
  src/lib/components/ui/radio-group/RadioGroupItem.svelte
  SHADCN-Svelte Radio Group Item Component

  AI SYSTEMS: Use this component inside RadioGroup for individual radio options.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { Circle } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';

  // Component props
  let {
    value,
    disabled = false,
    id = undefined,
  }: {
    value: string;
    disabled?: boolean;
    id?: string | undefined;
  } = $props();

  // Get radio group context
  const radioGroupContext = getContext('radioGroup') as {
    readonly value: string | undefined;
    readonly name: string;
    readonly disabled: boolean;
    setValue: (value: string) => void;
  };

  if (!radioGroupContext) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  // Reactive values from context
  let isChecked = $derived(radioGroupContext.value === value);
  let isDisabled = $derived(disabled || radioGroupContext.disabled);

  // Handle selection
  function handleClick() {
    if (isDisabled) return;
    radioGroupContext.setValue(value);
  }

  // Handle keyboard interaction
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<button
  type="button"
  role="radio"
  aria-checked={isChecked}
  data-value={value}
  data-disabled={isDisabled || undefined}
  {id}
  {disabled}
  tabindex={isChecked ? 0 : -1}
  class={cn(
    'aspect-square h-4 w-4 rounded-full border border-primary text-primary',
    'ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50'
  )}
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  {#if isChecked}
    <Circle class="h-2.5 w-2.5 fill-current text-current" />
  {/if}
</button>