<!--
  src/lib/components/ui/statistic-card/StatisticCard.svelte
  Metric display card for dashboards.

  Usage:
  <StatisticCard title="Total Revenue" value="$45,231.89" change="+20.1%" changeType="positive">
    {#snippet icon()}<DollarIcon />{/snippet}
  </StatisticCard>
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
  import type { Snippet } from 'svelte';

  let {
    title,
    value,
    change = '',
    changeType = 'neutral',
    class: className = '',
    icon,
    ...rest
  }: {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    class?: string;
    icon?: Snippet;
    [key: string]: unknown;
  } = $props();

  const changeColors = {
    positive: 'text-emerald-600',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground'
  };
</script>

<Card class={className} {...rest}>
  <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle class="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    {@render icon?.()}
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
