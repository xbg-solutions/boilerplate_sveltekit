<!--
  DashboardBlock07.svelte
  Minimal dashboard with stats summary and a simple item list.
  Clean, lightweight layout for overviews.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    Avatar,
    Separator
  } from '$lib/components/ui';

  let className: string = '';
  export { className as class };

  /** Stat items for the top summary row */
  export let stats: Array<{
    title: string;
    value: string;
    change?: string;
  }> = [];

  /** List items (e.g. recent activity, transactions) */
  export let items: Array<{
    id: string;
    title: string;
    subtitle: string;
    value: string;
    avatar?: string;
  }> = [];

  export let heading: string = 'Overview';
  export let listTitle: string = 'Recent Activity';
  export let listDescription: string = '';

  export let onItemClick: ((id: string) => void) | undefined = undefined;
</script>

<div class={cn('space-y-4 p-4 md:p-8', className)}>
  <!-- Page Heading -->
  <h1 class="text-2xl font-bold tracking-tight">{heading}</h1>

  <!-- Stats Row -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each stats as stat}
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>{stat.title}</CardDescription>
          <CardTitle class="text-3xl">{stat.value}</CardTitle>
        </CardHeader>
        {#if stat.change}
          <CardContent>
            <p class="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        {/if}
      </Card>
    {/each}
  </div>

  <!-- Activity List -->
  <Card>
    <CardHeader>
      <CardTitle>{listTitle}</CardTitle>
      {#if listDescription}
        <CardDescription>{listDescription}</CardDescription>
      {/if}
    </CardHeader>
    <CardContent>
      <div class="space-y-0">
        {#each items as item, i}
          <button
            class="flex w-full items-center gap-4 py-3 text-left hover:bg-muted/50 rounded-md px-2 transition-colors"
            on:click={() => onItemClick?.(item.id)}
          >
            <Avatar
              src={item.avatar}
              fallback={item.title}
              size="lg"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium leading-none truncate">{item.title}</p>
              <p class="text-sm text-muted-foreground truncate">{item.subtitle}</p>
            </div>
            <span class="text-sm font-medium shrink-0">{item.value}</span>
          </button>
          {#if i < items.length - 1}
            <Separator />
          {/if}
        {/each}
      </div>
    </CardContent>
  </Card>
</div>
