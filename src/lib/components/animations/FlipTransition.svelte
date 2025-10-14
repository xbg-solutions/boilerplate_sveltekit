<script>
  import { crossfade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export const flipId = '';
  export let duration = 300;
  export let fallback = 'fade';

  const [send, receive] = crossfade({
    duration,
    easing: quintOut,
    fallback(node, params) {
      if (fallback === 'fade') {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        return {
          duration: params.duration || duration,
          easing: params.easing || quintOut,
          css: t => `opacity: ${t * opacity}`
        };
      }
      return { duration: 0 };
    }
  });

  export { send, receive };
</script>

<slot {send} {receive} />