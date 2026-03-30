<!--
  SectionFooter04.svelte
  Primary CTA button left. "Need more?" text + secondary link/button right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    ctaLabel = 'Purchase credits',
    needMoreText = 'Need more?',
    contactLabel = 'Contact sales',
    oncta = () => {},
    oncontact = () => {}
  }: {
    class?: string;
    ctaLabel?: string;
    needMoreText?: string;
    contactLabel?: string;
    oncta?: () => void;
    oncontact?: () => void;
  } = $props();
</script>

<div class={cn('flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between', className)}>
  <Button size="sm" onclick={oncta}>{ctaLabel}</Button>
  <div class="flex items-center gap-2 text-sm">
    {#if needMoreText}
      <span class="text-muted-foreground">{needMoreText}</span>
    {/if}
    <Button variant="outline" size="sm" onclick={oncontact}>{contactLabel}</Button>
  </div>
</div>
