<!--
  src/lib/components/ui/statistic-card/StatisticCard.svelte
  Metric display card for dashboards.

  Usage:
  <StatisticCard title="Total Revenue" value="$45,231.89" change="+20.1%" changeType="positive">
    <svelte:fragment slot="icon"><DollarIcon /></svelte:fragment>
  </StatisticCard>
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';

  export let title: string;
  export let value: string;
  export let change: string = '';
  export let changeType: 'positive' | 'negative' | 'neutral' = 'neutral';

  let className: string = '';
  export { className as class };

  const changeColors = {
    positive: 'text-emerald-600',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground'
  };
</script>

<Card class={className} {...$$restProps}>
  <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle class="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    <slot name="icon" />
  </CardHeader>
  <CardContent>
    <div class="text-2xl font-bold">{value}</div>
    {#if change}
      <p class={cn('text-xs', changeColors[changeType])}>
        {change}
      </p>
    {/if}
  </CardContent>
</Card>
