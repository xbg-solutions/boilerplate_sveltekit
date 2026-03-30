<!--
  src/lib/components/ui/text-editor/TextEditor.svelte
  Rich text area with toolbar snippet.

  Usage:
  <TextEditor bind:value state="default" placeholder="Write something...">
    {#snippet toolbar()}
      <Button variant="ghost" size="icon"><BoldIcon /></Button>
    {/snippet}
  </TextEditor>
-->
<script lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  const textEditorVariants = tv({
    base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    variants: {
      state: {
        default: '',
        filled: '',
        disabled: 'opacity-50 pointer-events-none'
      }
    },
    defaultVariants: {
      state: 'default'
    }
  });

  type State = VariantProps<typeof textEditorVariants>['state'];

  let {
    value = $bindable(''),
    state = 'default' as State,
    placeholder = '',
    class: className = '',
    toolbar,
    oninput,
    onfocus,
    onblur,
    ...rest
  }: {
    value?: string;
    state?: State;
    placeholder?: string;
    class?: string;
    toolbar?: Snippet;
    oninput?: (detail: { value: string }) => void;
    onfocus?: (e: FocusEvent) => void;
    onblur?: (e: FocusEvent) => void;
    [key: string]: unknown;
  } = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    oninput?.({ value });
  }
</script>

<div class={cn(textEditorVariants({ state }), className)} {...rest}>
  <div class="flex items-center gap-1 border-b px-3 py-2">
    {#if toolbar}
      {@render toolbar()}
    {/if}
  </div>
  <textarea
    class="w-full min-h-[120px] resize-y bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed"
    {placeholder}
    {value}
    disabled={state === 'disabled'}
    oninput={handleInput}
    {onfocus}
    {onblur}
  />
</div>
