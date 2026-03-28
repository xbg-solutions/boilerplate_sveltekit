<!--
  src/lib/components/ui/radio-group/RadioGroup.svelte
  SHADCN-Svelte Radio Group Component

  AI SYSTEMS: Use this component for mutually exclusive selections.
  Provides proper keyboard navigation and accessibility.
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  // Component props
  let {
    value = $bindable(undefined),
    name,
    disabled = false,
    required = false,
    orientation = 'vertical',
    onchange,
    children,
  }: {
    value?: string | undefined;
    name: string;
    disabled?: boolean;
    required?: boolean;
    orientation?: 'horizontal' | 'vertical';
    onchange?: (detail: { value: string }) => void;
    children?: Snippet;
  } = $props();

  // Create reactive context object for radio items
  const radioGroupContext = {
    get value() { return value; },
    get name() { return name; },
    get disabled() { return disabled; },
    setValue(newValue: string) {
      value = newValue;
      onchange?.({ value: newValue });
    }
  };

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
        onchange?.({ value: radioValue });
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
  onkeydown={handleKeydown}
>
  {@render children?.()}
</div>

<!-- Hidden input for form submission -->
<input
  type="hidden"
  {name}
  {value}
  {required}
/>