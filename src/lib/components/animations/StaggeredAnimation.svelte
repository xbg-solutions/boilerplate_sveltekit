<script>
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let items = [];
  export let staggerDelay = 100;
  export let initialDelay = 0;
  export let animation = 'fade'; // 'fade', 'slideUp', 'slideDown', 'slideLeft', 'slideRight'
  export let duration = 400;
  export let show = true;

  function getAnimation(index) {
    const delay = initialDelay + (index * staggerDelay);
    
    switch (animation) {
      case 'slideUp':
        return { transition: fly, props: { y: 30, duration, delay, easing: quintOut } };
      case 'slideDown':
        return { transition: fly, props: { y: -30, duration, delay, easing: quintOut } };
      case 'slideLeft':
        return { transition: fly, props: { x: 30, duration, delay, easing: quintOut } };
      case 'slideRight':
        return { transition: fly, props: { x: -30, duration, delay, easing: quintOut } };
      default: // 'fade'
        return { transition: fade, props: { duration, delay, easing: quintOut } };
    }
  }
</script>

{#if show}
  {#each items as item, index (item.id || index)}
    {@const { transition, props } = getAnimation(index)}
    <div in:transition={props} out:fade={{ duration: duration * 0.3 }}>
      <slot {item} {index} />
    </div>
  {/each}
{/if}