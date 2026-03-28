<!--
  src/lib/components/ui/Textarea.svelte
  SHADCN-Svelte Textarea Component

  AI SYSTEMS: Use this component for multi-line text input.
  Supports auto-resize and proper form integration.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  // Component props
  let {
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    readonly = false,
    required = false,
    name = undefined as string | undefined,
    id = undefined as string | undefined,
    rows = 3,
    maxlength = undefined as number | undefined,
    resize = true,
    autoResize = false,
    oninput,
    onchange,
    onfocus,
    onblur,
    ...rest
  }: {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    name?: string | undefined;
    id?: string | undefined;
    rows?: number;
    maxlength?: number | undefined;
    resize?: boolean;
    autoResize?: boolean;
    oninput?: (e: Event & { currentTarget: HTMLTextAreaElement }) => void;
    onchange?: (e: Event & { currentTarget: HTMLTextAreaElement }) => void;
    onfocus?: (e: FocusEvent & { currentTarget: HTMLTextAreaElement }) => void;
    onblur?: (e: FocusEvent & { currentTarget: HTMLTextAreaElement }) => void;
    [key: string]: unknown;
  } = $props();

  let textareaElement: HTMLTextAreaElement;

  // Auto-resize functionality
  function handleAutoResize() {
    if (autoResize && textareaElement) {
      textareaElement.style.height = 'auto';
      textareaElement.style.height = textareaElement.scrollHeight + 'px';
    }
  }

  // Handle input
  function handleInput(event: Event & { currentTarget: HTMLTextAreaElement }) {
    value = event.currentTarget.value;
    handleAutoResize();
    oninput?.(event);
  }

  // Handle change
  function handleChange(event: Event & { currentTarget: HTMLTextAreaElement }) {
    value = event.currentTarget.value;
    onchange?.(event);
  }

  // Update auto-resize when value changes externally
  $effect(() => {
    if (autoResize && textareaElement && value !== undefined) {
      handleAutoResize();
    }
  });
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
  oninput={handleInput}
  onchange={handleChange}
  onfocus={onfocus}
  onblur={onblur}
  {...rest}
></textarea>
