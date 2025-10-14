<!--
  src/lib/components/ui/radio-group/RadioGroup.svelte
  SHADCN-Svelte Radio Group Component
  
  AI SYSTEMS: Use this component for mutually exclusive selections.
  Provides proper keyboard navigation and accessibility.
-->
<script lang="ts">
  import { createEventDispatcher, setContext } from 'svelte';
  import { writable } from 'svelte/store';

  // Component props
  export let value: string | undefined = undefined;
  export let name: string;
  export let disabled: boolean = false;
  export let required: boolean = false;
  export let orientation: 'horizontal' | 'vertical' = 'vertical';

  const dispatch = createEventDispatcher<{
    change: { value: string };
  }>();

  // Create context for radio items
  const radioGroupContext = writable({
    value,
    name,
    disabled,
    setValue: (newValue: string) => {
      value = newValue;
      dispatch('change', { value: newValue });
    }
  });

  // Update context when props change
  $: radioGroupContext.set({
    value,
    name,
    disabled,
    setValue: (newValue: string) => {
      value = newValue;
      dispatch('change', { value: newValue });
    }
  });

  setContext('radioGroup', radioGroupContext);

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (disabled) return;

    const radioItems = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll('[role="radio"]')
    ) as HTMLElement[];

    const currentIndex = radioItems.findIndex(item => item === event.target);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % radioItems.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex === 0 ? radioItems.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = radioItems.length - 1;
        break;
      default:
        return;
    }

    // Focus and select the next radio item
    const nextItem = radioItems[nextIndex];
    if (nextItem && !nextItem.hasAttribute('data-disabled')) {
      nextItem.focus();
      const radioValue = nextItem.getAttribute('data-value');
      if (radioValue) {
        value = radioValue;
        dispatch('change', { value: radioValue });
      }
    }
  }
</script>

<div
  role="radiogroup"
  class="grid gap-2"
  tabindex="0"
  class:grid-cols-1={orientation === 'vertical'}
  class:grid-flow-col={orientation === 'horizontal'}
  class:auto-cols-max={orientation === 'horizontal'}
  on:keydown={handleKeydown}
>
  <slot />
</div>

<!-- Hidden input for form submission -->
<input
  type="hidden"
  {name}
  {value}
  {required}
/>