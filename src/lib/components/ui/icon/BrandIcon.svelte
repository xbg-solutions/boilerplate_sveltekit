<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import * as simpleIcons from 'simple-icons';

  let {
    name,
    size = 24,
    colored = false,
    class: className = '',
    ...rest
  }: {
    name: string;
    size?: number;
    colored?: boolean;
    class?: string;
    [key: string]: unknown;
  } = $props();

  // simple-icons exports as siGoogle, siGithub, etc.
  // Convert slug like "google" → "siGoogle"
  function getIcon(slug: string) {
    const key = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return (simpleIcons as Record<string, { path: string; hex: string; title: string }>)[key] ?? null;
  }

  let icon = $derived(getIcon(name));
</script>

{#if icon}
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill={colored ? `#${icon.hex}` : 'currentColor'}
    class={cn('inline-block shrink-0', className)}
    aria-label={icon.title}
    {...rest}
  >
    <path d={icon.path}></path>
  </svg>
{/if}
