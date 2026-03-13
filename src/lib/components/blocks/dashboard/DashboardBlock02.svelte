<!--
  DashboardBlock02.svelte
  Dashboard with stats, tabbed overview with chart slot, and recent sales.
  Features workspace selector, date range, and tab navigation.
-->
<script lang="ts">
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

  let className: string = '';
  export { className as class };

  /** Stat cards data */
  export let stats: Array<{
    title: string;
    value: string;
    change: string;
    icon?: string;
  }> = [];

  /** Recent sales data */
  export let recentSales: Array<{
    name: string;
    email: string;
    amount: string;
    avatar?: string;
  }> = [];

  /** Date range label displayed in header */
  export let dateRange: string = 'Jan 20, 2024 - Feb 09, 2024';

  /** Currently active tab */
  export let activeTab: string = 'overview';

  /** Workspace/team name */
  export let workspaceName: string = 'My Workspace';

  /** User info for avatar */
  export let user: { name: string; avatar?: string } = { name: 'User' };

  /** Tab options */
  export let tabs: Array<{ value: string; label: string }> = [
    { value: 'overview', label: 'Overview' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'reports', label: 'Reports' },
    { value: 'notifications', label: 'Notifications' }
  ];

  export let onTabChange: ((tab: string) => void) | undefined = undefined;
  export let onDateRangeClick: (() => void) | undefined = undefined;
  export let onDownload: (() => void) | undefined = undefined;

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

  function handleTabChange(e: CustomEvent<{ value: string }>) {
    activeTab = e.detail.value;
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
          <slot name="workspace-menu">
            <DropdownMenuItem>{workspaceName}</DropdownMenuItem>
          </slot>
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
        <Button variant="outline" on:click={() => onDateRangeClick?.()}>
          <!-- Calendar icon -->
          <span class="mr-2" aria-hidden="true"><DynamicIcon name="calendar" size={16} /></span>
          {dateRange}
        </Button>
        <Button on:click={() => onDownload?.()}>Download</Button>
      </div>
    </div>

    <!-- Tabs -->
    <Tabs value={activeTab} on:change={handleTabChange}>
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
              <slot name="chart">
                <div class="flex h-[350px] items-center justify-center rounded-md border border-dashed text-muted-foreground">
                  Chart placeholder
                </div>
              </slot>
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

      <!-- Other tab contents as slots -->
      <TabsContent value="analytics">
        <slot name="analytics">
          <div class="flex h-[400px] items-center justify-center rounded-md border border-dashed text-muted-foreground mt-4">
            Analytics content
          </div>
        </slot>
      </TabsContent>

      <TabsContent value="reports">
        <slot name="reports">
          <div class="flex h-[400px] items-center justify-center rounded-md border border-dashed text-muted-foreground mt-4">
            Reports content
          </div>
        </slot>
      </TabsContent>

      <TabsContent value="notifications">
        <slot name="notifications">
          <div class="flex h-[400px] items-center justify-center rounded-md border border-dashed text-muted-foreground mt-4">
            Notifications content
          </div>
        </slot>
      </TabsContent>
    </Tabs>
  </main>
</div>
