<!--
  src/lib/components/layout/PageFooter.svelte
  Page Footer Component
-->
<script lang="ts">
  /**
   * Reusable page footer component
   */
  
  // Props
  export let text: string = `© ${new Date().getFullYear()} SvelteKit Boilerplate`;
  export let centered: boolean = true;
  export let marginTop: string = 'mt-auto';
  export let padding: string = 'py-4';
  export let textSize: 'xs' | 'sm' | 'base' = 'sm';
  export let textColor: string = 'var(--primary-dark)';
  export let backgroundColor: string = 'var(--primary-mid)';
  
  // Computed classes
  $: footerClass = [
    centered ? 'text-center' : '',
    marginTop,
    padding,
    `text-${textSize}`
  ].filter(Boolean).join(' ');
  
  // Computed styles
  $: footerStyle = `background-color: ${backgroundColor}; color: ${textColor};`;
</script>

<footer class={footerClass} style={footerStyle} {...$$restProps}>
  <div class="container mx-auto px-4">
    <p>{text}</p>
    <slot></slot>
  </div>
</footer>