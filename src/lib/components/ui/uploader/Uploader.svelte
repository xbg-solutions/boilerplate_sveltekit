<!--
  src/lib/components/ui/uploader/Uploader.svelte
  File upload drop zone with drag and drop support.

  Usage:
  <Uploader accept="image/*" multiple on:change={handleFiles} />
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { createEventDispatcher } from 'svelte';

  export let accept: string = '';
  export let multiple: boolean = false;
  export let disabled: boolean = false;

  let className: string = '';
  export { className as class };

  let dragging = false;
  let fileInput: HTMLInputElement;

  const dispatch = createEventDispatcher<{ change: FileList }>();

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (!disabled) dragging = true;
  }

  function handleDragLeave() {
    dragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    if (disabled || !e.dataTransfer?.files.length) return;
    dispatch('change', e.dataTransfer.files);
  }

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files?.length) {
      dispatch('change', target.files);
    }
  }

  function openFilePicker() {
    if (!disabled) fileInput.click();
  }
</script>

<button
  type="button"
  class={cn(
    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
    dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
    disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
    className
  )}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:click={openFilePicker}
  {disabled}
  {...$$restProps}
>
  <slot name="icon">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  </slot>
  <slot>
    <span class="text-sm text-muted-foreground">
      Upload a file or drag and drop
    </span>
  </slot>
</button>

<input
  bind:this={fileInput}
  type="file"
  class="sr-only"
  {accept}
  {multiple}
  {disabled}
  on:change={handleInputChange}
/>
