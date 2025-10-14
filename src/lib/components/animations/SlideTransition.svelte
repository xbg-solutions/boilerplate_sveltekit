<script>
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let show = true;
  export let duration = 300;
  export let delay = 0;
  export let easing = quintOut;
  export let axis = 'y'; // 'x' or 'y'
</script>

{#if show}
  <div
    in:slide={{ duration, delay, easing, axis }}
    out:slide={{ duration: duration * 0.7, easing, axis }}
  >
    <slot />
  </div>
{/if}