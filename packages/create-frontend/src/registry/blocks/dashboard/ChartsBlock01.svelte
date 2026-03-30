<!--
  ChartsBlock01.svelte
  Activity/fitness-style dashboard with multiple chart card areas.
  Features stat cards with chart slots, progress rings placeholder,
  and colored accent areas for data visualization.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription
  } from '$lib/components/ui';

  let {
    class: className = '',
    data = {},
    accentColors = {
      primary: 'bg-orange-500',
      secondary: 'bg-teal-500'
    },
    'steps-chart': stepsChart,
    'heartrate-chart': heartrateChart,
    'progress-chart': progressChart,
    'walking-chart': walkingChart,
    'rings-chart': ringsChart,
    'energy-chart': energyChart,
    additional
  }: {
    class?: string;
    /** Primary metric data */
    data?: {
      steps?: { value: string; label?: string };
      heartRate?: { value: string; unit?: string };
      walkingDistance?: { value: string; unit?: string };
      activeEnergy?: { value: string; unit?: string };
      moveGoal?: { current: string; target: string };
      exerciseGoal?: { current: string; target: string };
      standGoal?: { current: string; target: string };
      progressComparison?: {
        currentYear: string;
        previousYear: string;
        currentValue: string;
        previousValue: string;
      };
    };
    /** Accent colors for chart areas */
    accentColors?: {
      primary?: string;
      secondary?: string;
    };
    'steps-chart'?: Snippet;
    'heartrate-chart'?: Snippet;
    'progress-chart'?: Snippet;
    'walking-chart'?: Snippet;
    'rings-chart'?: Snippet;
    'energy-chart'?: Snippet;
    additional?: Snippet;
  } = $props();
</script>

<div class={cn('space-y-4 p-4 md:p-8', className)}>
  <!-- Top Row: Steps + Heart Rate + Progress Comparison -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <!-- Steps Card -->
    <Card class="lg:col-span-1">
      <CardHeader class="pb-2">
        <CardDescription>Today</CardDescription>
        <CardTitle class="text-3xl">
          {data.steps?.value ?? '0'}
          <span class="text-sm font-normal text-muted-foreground">
            {data.steps?.label ?? 'steps'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <!-- Steps chart snippet -->
        {#if stepsChart}
          {@render stepsChart()}
        {:else}
          <div class={cn(
            'h-[120px] rounded-md flex items-end justify-center gap-0.5 overflow-hidden',
          )}>
            {#each Array(24) as _, i}
              <div
                class={cn('w-2 rounded-t', accentColors.primary ?? 'bg-orange-500')}
                style="height: {Math.random() * 80 + 20}%; opacity: {0.4 + Math.random() * 0.6}"
              ></div>
            {/each}
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Heart Rate Card -->
    <Card>
      <CardHeader class="pb-2">
        <CardDescription>Resting Heart Rate</CardDescription>
        <CardTitle class="text-3xl">
          {data.heartRate?.value ?? '--'}
          <span class="text-sm font-normal text-muted-foreground">
            {data.heartRate?.unit ?? 'bpm'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {#if heartrateChart}
          {@render heartrateChart()}
        {:else}
          <div class="h-[120px] rounded-md border border-dashed flex items-center justify-center text-muted-foreground text-sm">
            Heart rate chart
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Progress Comparison Card -->
    <Card>
      <CardHeader class="pb-2">
        <CardDescription>Progress</CardDescription>
        {#if data.progressComparison}
          <div class="flex items-baseline gap-2">
            <CardTitle class="text-2xl">{data.progressComparison.currentValue}</CardTitle>
            <span class="text-sm text-muted-foreground">
              vs {data.progressComparison.previousValue}
            </span>
          </div>
        {:else}
          <CardTitle class="text-2xl">--</CardTitle>
        {/if}
      </CardHeader>
      <CardContent>
        {#if progressChart}
          {@render progressChart()}
        {:else}
          <div class="flex items-end gap-1 h-[120px]">
            {#if data.progressComparison}
              <!-- Simple dual-bar comparison placeholder -->
              <div class="flex flex-1 items-end justify-center gap-2">
                <div class="flex flex-col items-center gap-1">
                  <div
                    class={cn('w-8 rounded-t', accentColors.primary ?? 'bg-orange-500')}
                    style="height: 80px"
                  ></div>
                  <span class="text-xs text-muted-foreground">
                    {data.progressComparison.currentYear}
                  </span>
                </div>
                <div class="flex flex-col items-center gap-1">
                  <div
                    class={cn('w-8 rounded-t opacity-40', accentColors.primary ?? 'bg-orange-500')}
                    style="height: 55px"
                  ></div>
                  <span class="text-xs text-muted-foreground">
                    {data.progressComparison.previousYear}
                  </span>
                </div>
              </div>
            {:else}
              <div class="flex-1 rounded-md border border-dashed flex items-center justify-center text-muted-foreground text-sm">
                Comparison chart
              </div>
            {/if}
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>

  <!-- Middle Row: Walking Distance + Activity Rings + Active Energy -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <!-- Walking Distance -->
    <Card>
      <CardHeader class="pb-2">
        <CardDescription>Walking Distance</CardDescription>
        <CardTitle class="text-3xl">
          {data.walkingDistance?.value ?? '--'}
          <span class="text-sm font-normal text-muted-foreground">
            {data.walkingDistance?.unit ?? 'km'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {#if walkingChart}
          {@render walkingChart()}
        {:else}
          <div class={cn(
            'h-[120px] rounded-md flex items-end justify-center gap-0.5 overflow-hidden'
          )}>
            {#each Array(14) as _, i}
              <div
                class={cn('w-3 rounded-t', accentColors.secondary ?? 'bg-teal-500')}
                style="height: {Math.random() * 80 + 20}%; opacity: {0.4 + Math.random() * 0.6}"
              ></div>
            {/each}
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Activity Rings (Move / Exercise / Stand) -->
    <Card>
      <CardHeader class="pb-2">
        <CardDescription>Activity</CardDescription>
      </CardHeader>
      <CardContent>
        {#if ringsChart}
          {@render ringsChart()}
        {:else}
          <!-- Simple ring placeholder using nested circles -->
          <div class="flex items-center justify-center h-[140px]">
            <div class="relative flex items-center justify-center">
              <!-- Outer ring (Move) -->
              <div class="w-28 h-28 rounded-full border-4 border-red-500/30 flex items-center justify-center">
                <!-- Middle ring (Exercise) -->
                <div class="w-20 h-20 rounded-full border-4 border-green-500/30 flex items-center justify-center">
                  <!-- Inner ring (Stand) -->
                  <div class="w-12 h-12 rounded-full border-4 border-blue-500/30"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
            {#if data.moveGoal}
              <span>Move: {data.moveGoal.current}/{data.moveGoal.target}</span>
            {/if}
            {#if data.exerciseGoal}
              <span>Exercise: {data.exerciseGoal.current}/{data.exerciseGoal.target}</span>
            {/if}
            {#if data.standGoal}
              <span>Stand: {data.standGoal.current}/{data.standGoal.target}</span>
            {/if}
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Active Energy -->
    <Card>
      <CardHeader class="pb-2">
        <CardDescription>Active Energy</CardDescription>
        <CardTitle class="text-3xl">
          {data.activeEnergy?.value ?? '--'}
          <span class="text-sm font-normal text-muted-foreground">
            {data.activeEnergy?.unit ?? 'kcal'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {#if energyChart}
          {@render energyChart()}
        {:else}
          <div class={cn(
            'h-[120px] rounded-md flex items-end justify-center gap-0.5 overflow-hidden'
          )}>
            {#each Array(12) as _, i}
              <div
                class={cn('w-3 rounded-t', accentColors.primary ?? 'bg-orange-500')}
                style="height: {Math.random() * 80 + 20}%; opacity: {0.5 + Math.random() * 0.5}"
              ></div>
            {/each}
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>

  <!-- Additional chart area snippet -->
  {#if additional}
    {@render additional()}
  {/if}
</div>
