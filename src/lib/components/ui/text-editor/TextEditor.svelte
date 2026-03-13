<!--
  src/lib/components/ui/text-editor/TextEditor.svelte
  Rich text area with toolbar slot.

  Usage:
  <TextEditor bind:value state="default" placeholder="Write something...">
    <svelte:fragment slot="toolbar">
      <Button variant="ghost" size="icon"><BoldIcon /></Button>
    </svelte:fragment>
  </TextEditor>
-->
<script lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';
  import { cn } from '$lib/utils/cn';
  import { createEventDispatcher } from 'svelte';

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

  export let value: string = '';
  export let state: State = 'default';
  export let placeholder: string = '';

  let className: string = '';
  export { className as class };

  const dispatch = createEventDispatcher();

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    dispatch('input', { value });
  }
</script>

<div class={cn(textEditorVariants({ state }), className)} {...$$restProps}>
  <div class="flex items-center gap-1 border-b px-3 py-2">
    <slot name="toolbar" />
  </div>
  <textarea
    class="w-full min-h-[120px] resize-y bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed"
    {placeholder}
    {value}
    disabled={state === 'disabled'}
    on:input={handleInput}
    on:focus
    on:blur
  />
</div>
