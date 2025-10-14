<script>
  import { scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  export let show = true;
  export let duration = 300;
  export let delay = 0;
  export let easing = backOut;
  export let start = 0.9;
  export let opacity = 0;
</script>

{#if show}
  <div
    in:scale={{ duration, delay, easing, start, opacity }}
    out:scale={{ duration: duration * 0.5, easing, start, opacity }}
  >
    <slot />
  </div>
{/if}