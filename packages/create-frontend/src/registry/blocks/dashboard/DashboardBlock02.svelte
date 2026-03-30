<!--
  DashboardBlock02.svelte
  Dashboard with stats, tabbed overview with chart slot, and recent sales.
  Features workspace selector, date range, and tab navigation.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import {
    Button,
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    Avatar,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
  } from '$lib/components/ui';
  import { DynamicIcon } from '$lib/components/ui/icon';

  let {
    class: className = '',
    stats = [],
    recentSales = [],
    dateRange = 'Jan 20, 2024 - Feb 09, 2024',
    activeTab = $bindable('overview'),
    workspaceName = 'My Workspace',
    user = { name: 'User' },
    tabs = [
      { value: 'overview', label: 'Overview' },
      { value: 'analytics', label: 'Analytics' },
      { value: 'reports', label: 'Reports' },
      { value: 'notifications', label: 'Notifications' }
    ],
    onTabChange = undefined,
    onDateRangeClick = undefined,
    onDownload = undefined,
    'workspace-menu': workspaceMenu,
    chart,
    analytics,
    reports,
    notifications
  }: {
    class?: string;
    /** Stat cards data */
    stats?: Array<{
      title: string;
      value: string;
      change: string;
      icon?: string;
    }>;
    /** Recent sales data */
    recentSales?: Array<{
      name: string;
      email: string;
      amount: string;
      avatar?: string;
    }>;
    /** Date range label displayed in header */
    dateRange?: string;
    /** Currently active tab */
    activeTab?: string;
    /** Workspace/team name */
    workspaceName?: string;
    /** User info for avatar */
    user?: { name: string; avatar?: string };
    /** Tab options */
    tabs?: Array<{ value: string; label: string }>;
    onTabChange?: ((tab: string) => void) | undefined;
    onDateRangeClick?: (() => void) | undefined;
    onDownload?: (() => void) | undefined;
    'workspace-menu'?: Snippet;
    chart?: Snippet;
    analytics?: Snippet;
    reports?: Snippet;
    notifications?: Snippet;
  } = $props();

  const iconMap: Record<string, string> = {
    revenue: 'dollar-sign',
    subscriptions: 'users',
    sales: 'credit-card',
    active: 'activity'
  };

  function getIconName(title: string): string {
    const key = title.toLowerCase();
    for (const [k, v] of Object.entries(iconMap)) {
      if (key.includes(k)) return v;
    }
    return 'circle';
  }

  function handleTabChange(detail: { value: string }) {
    activeTab = detail.value;
    onTabChange?.(activeTab);
  }
</script>

<div class={cn('flex min-h-screen flex-col', className)}>
  <!-- Top Header -->
  <header class="border-b">
    <div class="flex h-16 items-center px-4">
      <!-- Workspace Selector -->
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" class="gap-2">
            {workspaceName}
            <span aria-hidden="true">{'\u25BE'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {#if workspaceMenu}
            {@render workspaceMenu()}
          {:else}
            <DropdownMenuItem>{workspaceName}</DropdownMenuItem>
          {/if}
        </DropdownMenuContent>
      </DropdownMenu>

      <div class="ml-auto flex items-center space-x-4">
        <Avatar src={user.avatar} fallback={user.name} size="md" />
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 space-y-4 p-4 pt-6 md:p-8">
    <!-- Page Header -->
    <div class="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
      <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div class="flex items-center space-x-2">
        <Button variant="outline" onclick={() => onDateRangeClick?.()}>
          <!-- Calendar icon -->
          <span class="mr-2" aria-hidden="true"><DynamicIcon name="calendar" size={16} /></span>
          {dateRange}
        </Button>
        <Button onclick={() => onDownload?.()}>Download</Button>
      </div>
    </div>

    <!-- Tabs -->
    <Tabs value={activeTab} onchange={handleTabChange}>
      <TabsList>
        {#each tabs as tab}
          <TabsTrigger value={tab.value}>{tab.label}</TabsTrigger>
        {/each}
      </TabsList>

      <TabsContent value="overview">
        <!-- Stats Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          {#each stats as stat}
            <Card>
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <span class="text-muted-foreground" aria-hidden="true">
                  <DynamicIcon name={stat.icon || getIconName(stat.title)} size={16} />
                </span>
              </CardHeader>
              <CardContent>
                <div class="text-2xl font-bold">{stat.value}</div>
                <p class="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          {/each}
        </div>

        <!-- Two Column Layout -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
          <!-- Chart Area -->
          <Card class="lg:col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent class="pl-2">
              <!-- Chart slot: insert your chart component here -->
              {#if chart}
                {@render chart()}
              {:else}
                <div class="flex h-[350px] items-center justify-center rounded-md border border-dashed text-muted-foreground">
                  Chart placeholder
                </div>
              {/if}
            </CardContent>
          </Card>

          <!-- Recent Sales -->
          <Card class="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                You made {recentSales.length} sales this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-6">
                {#each recentSales as sale}
                  <div class="flex items-center">
                    <Avatar
                      src={sale.avatar}
                      fallback={sale.name}
                      size="lg"
                    />
                    <div class="ml-4 space-y-1">
                      <p class="text-sm font-medium leading-none">{sale.name}</p>
                      <p class="text-sm text-muted-foreground">{sale.email}</p>
                    </div>
                    <div class="ml-auto font-medium">{sale.amount}</div>
                  </div>
                {/each}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Other tab contents as snippet props -->
      <TabsContent value="analytics">
        {#if analytics}
          {@render analytics()}
        {:else}
          <div class="flex h-[400px] items-center justify-center rounded-md border border-dashed text-muted-foreground mt-4">
            Analytics content
          </div>
        {/if}
      </TabsContent>

      <TabsContent value="reports">
        {#if reports}
          {@render reports()}
        {:else}
          <div class="flex h-[400px] items-center justify-center rounded-md border border-dashed text-muted-foreground mt-4">
            Reports content
          </div>
        {/if}
      </TabsContent>

      <TabsContent value="notifications">
        {#if notifications}
          {@render notifications()}
        {:else}
          <div class="flex h-[400px] items-center justify-center rounded-md border border-dashed text-muted-foreground mt-4">
            Notifications content
          </div>
        {/if}
      </TabsContent>
    </Tabs>
  </main>
</div>
