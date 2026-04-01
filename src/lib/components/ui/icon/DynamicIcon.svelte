<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { Component } from 'svelte';

  let {
    name,
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
    class: className = '',
    ...rest
  }: {
    name: string;
    size?: number;
    color?: string;
    strokeWidth?: number;
    class?: string;
    [key: string]: unknown;
  } = $props();

  let IconComp: Component | null = $state(null);

  // Vite resolves this glob at build time into a lazy-import map
  const icons = import.meta.glob<{ default: Component }>(
    '/node_modules/lucide-svelte/dist/icons/*.svelte'
  );

  $effect(() => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const key = `/node_modules/lucide-svelte/dist/icons/${slug}.svelte`;
    const loader = icons[key];
    if (loader) {
      loader().then((mod) => { IconComp = mod.default; });
    } else {
      IconComp = null;
    }
  });
</script>

{#if IconComp}
  <IconComp {size} {color} {strokeWidth} class={cn(className)} {...rest}></IconComp>
{/if}
