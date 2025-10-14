<script>
  import { fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let show = true;
  export let duration = 300;
  export let delay = 0;
  export let easing = quintOut;
</script>

{#if show}
  <div
    in:fade={{ duration, delay, easing }}
    out:fade={{ duration: duration * 0.7, easing }}
  >
    <slot />
  </div>
{/if}