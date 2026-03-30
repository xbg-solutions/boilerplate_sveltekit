<!--
  SectionFooter03.svelte
  Save/Edit/View action buttons left. Description text center-right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui';

  let {
    class: className = '',
    description = 'This feature is available in the Pro Plan for additional $10 per month.',
    onview = () => {},
    onedit = () => {},
    onsave = () => {}
  }: {
    class?: string;
    description?: string;
    onview?: () => void;
    onedit?: () => void;
    onsave?: () => void;
  } = $props();
</script>

<div class={cn('flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between', className)}>
  <div class="flex shrink-0 items-center gap-2">
    <Button size="sm" onclick={onsave}>Save</Button>
    <Button variant="outline" size="sm" onclick={onedit}>Edit</Button>
    <Button variant="outline" size="sm" onclick={onview}>View</Button>
  </div>
  {#if description}
    <p class="text-sm text-muted-foreground sm:text-right">{description}</p>
  {/if}
</div>
