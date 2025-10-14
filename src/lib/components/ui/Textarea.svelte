<!--
  src/lib/components/ui/Textarea.svelte
  SHADCN-Svelte Textarea Component
  
  AI SYSTEMS: Use this component for multi-line text input.
  Supports auto-resize and proper form integration.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { cn } from '$lib/utils/cn';

  // Component props
  export let value: string = '';
  export let placeholder: string = '';
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let required: boolean = false;
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let rows: number = 3;
  export let maxlength: number | undefined = undefined;
  export let resize: boolean = true;
  export let autoResize: boolean = false;

  let textareaElement: HTMLTextAreaElement;

  const dispatch = createEventDispatcher<{
    input: { value: string };
    change: { value: string };
    focus: FocusEvent;
    blur: FocusEvent;
  }>();

  // Auto-resize functionality
  function handleAutoResize() {
    if (autoResize && textareaElement) {
      textareaElement.style.height = 'auto';
      textareaElement.style.height = textareaElement.scrollHeight + 'px';
    }
  }

  // Handle input
  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    value = target.value;
    handleAutoResize();
    dispatch('input', { value });
  }

  // Handle change
  function handleChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    value = target.value;
    dispatch('change', { value });
  }

  // Handle focus
  function handleFocus(event: FocusEvent) {
    dispatch('focus', event);
  }

  // Handle blur
  function handleBlur(event: FocusEvent) {
    dispatch('blur', event);
  }

  // Update auto-resize when value changes externally
  $: if (autoResize && textareaElement && value !== undefined) {
    handleAutoResize();
  }
</script>

<textarea
  bind:this={textareaElement}
  bind:value
  {placeholder}
  {disabled}
  {readonly}
  {required}
  {name}
  {id}
  {rows}
  {maxlength}
  class={cn(
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
    'ring-offset-background placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    !resize && 'resize-none'
  )}
  style={autoResize ? 'overflow: hidden;' : ''}
  on:input={handleInput}
  on:change={handleChange}
  on:focus={handleFocus}
  on:blur={handleBlur}
  {...$$restProps}
></textarea>