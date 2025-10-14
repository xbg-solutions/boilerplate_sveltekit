<!--
  src/lib/components/ui/select/Select.svelte
  SHADCN-Svelte Select Component
  
  AI SYSTEMS: Use this component for dropdown selections.
  Supports single selection with keyboard navigation and proper accessibility.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { ChevronDown, Check } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';
  import { tv, type VariantProps } from 'tailwind-variants';

  const selectTriggerVariants = tv({
    base: 'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    variants: {
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  });

  type SelectSize = VariantProps<typeof selectTriggerVariants>['size'];

  // Component props
  export let value: string | undefined = undefined;
  export let placeholder: string = 'Select an option...';
  export let disabled: boolean = false;
  export let size: SelectSize = 'md';
  export let options: Array<{ value: string; label: string; disabled?: boolean }> = [];
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;

  // Local state
  let isOpen = false;
  let triggerElement: HTMLButtonElement;
  let contentElement: HTMLDivElement;
  
  // Generate unique ID for accessibility
  const listboxId = `select-listbox-${Math.random().toString(36).substr(2, 9)}`;

  const dispatch = createEventDispatcher<{
    change: { value: string; option: { value: string; label: string } };
  }>();

  // Get selected option
  $: selectedOption = options.find(option => option.value === value);

  // Handle option selection
  function selectOption(option: { value: string; label: string; disabled?: boolean }) {
    if (option.disabled) return;
    
    value = option.value;
    isOpen = false;
    dispatch('change', { value: option.value, option });
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        isOpen = !isOpen;
        break;
      case 'Escape':
        isOpen = false;
        triggerElement?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (isOpen) {
          // Focus first non-disabled option
          const firstOption = contentElement?.querySelector('[role="option"]:not([data-disabled="true"])') as HTMLElement;
          firstOption?.focus();
        } else {
          isOpen = true;
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          // Focus last non-disabled option
          const options = contentElement?.querySelectorAll('[role="option"]:not([data-disabled="true"])');
          const lastOption = options?.[options.length - 1] as HTMLElement;
          lastOption?.focus();
        } else {
          isOpen = true;
        }
        break;
    }
  }

  // Handle option keyboard navigation
  function handleOptionKeydown(event: KeyboardEvent, option: { value: string; label: string; disabled?: boolean }) {
    if (option.disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectOption(option);
        triggerElement?.focus();
        break;
      case 'Escape':
        isOpen = false;
        triggerElement?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        const nextOption = (event.target as HTMLElement)?.nextElementSibling as HTMLElement;
        if (nextOption && !nextOption.dataset.disabled) {
          nextOption.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevOption = (event.target as HTMLElement)?.previousElementSibling as HTMLElement;
        if (prevOption && !prevOption.dataset.disabled) {
          prevOption.focus();
        }
        break;
    }
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (!triggerElement?.contains(event.target as Node) && !contentElement?.contains(event.target as Node)) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative">
  <!-- Hidden select for form submission -->
  {#if name}
    <select {name} {id} bind:value class="sr-only" tabindex="-1" aria-hidden="true">
      <option value="">Choose...</option>
      {#each options as option}
        <option value={option.value} disabled={option.disabled}>{option.label}</option>
      {/each}
    </select>
  {/if}

  <!-- Select Trigger -->
  <button
    bind:this={triggerElement}
    type="button"
    class={cn(selectTriggerVariants({ size }))}
    {disabled}
    role="combobox"
    aria-expanded={isOpen}
    aria-controls={listboxId}
    aria-haspopup="listbox"
    aria-label={placeholder}
    on:click={() => !disabled && (isOpen = !isOpen)}
    on:keydown={handleKeydown}
  >
    <span class="block truncate">
      {selectedOption?.label || placeholder}
    </span>
    <ChevronDown class="h-4 w-4 opacity-50" />
  </button>

  <!-- Select Content -->
  {#if isOpen}
    <div
      bind:this={contentElement}
      id={listboxId}
      class="absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 top-full mt-1"
      role="listbox"
      data-side="bottom"
    >
      {#each options as option}
        <div
          role="option"
          tabindex={option.disabled ? -1 : 0}
          data-disabled={option.disabled || undefined}
          data-selected={option.value === value || undefined}
          aria-selected={option.value === value}
          class={cn(
            'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
            'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            option.disabled && 'pointer-events-none opacity-50',
            option.value === value && 'bg-accent text-accent-foreground'
          )}
          on:click={() => selectOption(option)}
          on:keydown={(e) => handleOptionKeydown(e, option)}
        >
          {#if option.value === value}
            <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              <Check class="h-4 w-4" />
            </span>
          {/if}
          <span class="block truncate">{option.label}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>