<!--
  Dropdown Menu Content Component
-->
<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { cn } from '$lib/utils/cn';
  
  export let className = '';
  
  const dropdown = getContext('dropdown') as any;
  let contentElement: HTMLElement;
  
  function handleClickOutside(event: MouseEvent) {
    if (contentElement && !contentElement.contains(event.target as Node)) {
      dropdown?.close();
    }
  }
  
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

{#if $dropdown.isOpen}
  <div
    bind:this={contentElement}
    class={cn(
      'absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
      className
    )}
  >
    <div class="py-1">
      <slot />
    </div>
  </div>
{/if}