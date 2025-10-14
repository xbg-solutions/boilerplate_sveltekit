<script>
  import { page } from '$app/stores';
  import { onNavigate } from '$app/navigation';
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  export let type = 'slide'; // 'slide', 'fade', 'scale'
  export let duration = 300;
  export let delay = 0;

  let previousUrl = '';
  let direction = 1; // 1 for forward, -1 for backward

  $: currentUrl = $page.url.pathname;

  onNavigate(async (navigation) => {
    // Determine navigation direction
    direction = navigation.to?.url.pathname > previousUrl ? 1 : -1;
    previousUrl = currentUrl;
  });

  function getTransition(node, params) {
    switch (type) {
      case 'fade':
        return fade(node, params);
      case 'scale':
        return {
          ...fade(node, params),
          css: (t, u) => `
            opacity: ${t};
            transform: scale(${0.9 + t * 0.1});
          `
        };
      default: // 'slide'
        return fly(node, {
          ...params,
          x: direction * 100
        });
    }
  }
</script>

<div
  in:getTransition={{ duration, delay, easing: quintOut }}
  out:getTransition={{ duration: duration * 0.5, easing: quintOut }}
>
  <slot />
</div>