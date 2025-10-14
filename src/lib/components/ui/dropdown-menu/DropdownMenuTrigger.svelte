<!--
  Dropdown Menu Trigger Component
-->
<script lang="ts">
  import { getContext } from 'svelte';

  export let builders: any[] = [];
  export let asChild = false;
  
  const dropdown = getContext('dropdown') as any;
  
  function handleClick() {
    dropdown?.toggle();
  }
</script>

{#if asChild}
  <slot {builders} />
{:else}
  <button type="button" on:click={handleClick}>
    <slot />
  </button>
{/if}