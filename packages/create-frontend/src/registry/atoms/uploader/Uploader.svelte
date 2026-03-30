<!--
  src/lib/components/ui/uploader/Uploader.svelte
  File upload drop zone with drag and drop support.

  Usage:
  <Uploader accept="image/*" multiple onchange={handleFiles} />
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { Snippet } from 'svelte';

  let {
    accept = '',
    multiple = false,
    disabled = false,
    class: className = '',
    icon,
    children,
    onchange,
    ...rest
  }: {
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    class?: string;
    icon?: Snippet;
    children?: Snippet;
    onchange?: (files: FileList) => void;
    [key: string]: unknown;
  } = $props();

  let dragging = $state(false);
  let fileInput: HTMLInputElement | undefined = $state(undefined);

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
    onchange?.(e.dataTransfer.files);
  }

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files?.length) {
      onchange?.(target.files);
    }
  }

  function openFilePicker() {
    if (!disabled) fileInput?.click();
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
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={openFilePicker}
  {disabled}
  {...rest}
>
  {#if icon}
    {@render icon()}
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  {/if}
  {#if children}
    {@render children()}
  {:else}
    <span class="text-sm text-muted-foreground">
      Upload a file or drag and drop
    </span>
  {/if}
</button>

<input
  bind:this={fileInput}
  type="file"
  class="sr-only"
  {accept}
  {multiple}
  {disabled}
  onchange={handleInputChange}
/>
