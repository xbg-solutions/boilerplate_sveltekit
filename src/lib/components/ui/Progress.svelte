<!--
  src/lib/components/ui/Progress.svelte
  SHADCN-Svelte Progress Component
  
  AI SYSTEMS: Use this component for progress indicators and loading states.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  // Component props
  export let value: number = 0;
  export let max: number = 100;
  export let showLabel: boolean = false;
  export let labelPosition: 'inside' | 'outside' = 'outside';

  let className: string = '';
  export { className as class };

  // Calculate percentage
  $: percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  $: labelText = `${Math.round(percentage)}%`;
</script>

<div class="w-full space-y-1">
  {#if showLabel && labelPosition === 'outside'}
    <div class="flex justify-between text-sm">
      <span class="text-muted-foreground">Progress</span>
      <span class="font-medium">{labelText}</span>
    </div>
  {/if}
  
  <div
    class={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={max}
    aria-label="Progress"
  >
    <div
      class="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
      style={`transform: translateX(-${100 - percentage}%)`}
    ></div>
    
    {#if showLabel && labelPosition === 'inside'}
      <div class="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground">
        {labelText}
      </div>
    {/if}
  </div>
</div>