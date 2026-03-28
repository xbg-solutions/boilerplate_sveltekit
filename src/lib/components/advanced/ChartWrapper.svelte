<!--
  Advanced ChartWrapper Component

  Features:
  - Multiple chart types (line, bar, pie, area, scatter)
  - Responsive design
  - Interactive legends
  - Data export functionality
  - Loading and error states
  - Customizable themes
  - Animation support
-->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
  } from '$lib/components/ui/dropdown-menu';
  import {
    Download,
    RefreshCw,
    Settings,
    TrendingUp,
    BarChart3,
    PieChart,
    LineChart,
    Scatter3D,
    AlertTriangle,
    Maximize2,
    X
  } from 'lucide-svelte';

  // Types
  export interface ChartData {
    labels?: string[];
    datasets: Dataset[];
  }

  export interface Dataset {
    label: string;
    data: number[] | { x: number; y: number }[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }

  export interface ChartOptions {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      legend?: {
        display?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
      };
      tooltip?: {
        enabled?: boolean;
        mode?: string;
      };
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    scales?: {
      x?: ScaleOptions;
      y?: ScaleOptions;
    };
    animation?: {
      duration?: number;
      easing?: string;
    };
  }

  export interface ScaleOptions {
    display?: boolean;
    title?: {
      display?: boolean;
      text?: string;
    };
    min?: number;
    max?: number;
    beginAtZero?: boolean;
  }

  export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';

  export interface ChartConfig {
    type: ChartType;
    data: ChartData;
    options?: ChartOptions;
    theme?: 'light' | 'dark';
  }

  // Props
  let {
    config,
    title = '',
    subtitle = '',
    loading = false,
    error = $bindable<string | null>(null),
    height = '400px',
    className = '',
    showControls = true,
    showExport = true,
    allowFullscreen = true,
    onChartClick,
    onLegendClick,
    onExport,
    onRefresh,
    onFullscreen,
  }: {
    config: ChartConfig;
    title?: string;
    subtitle?: string;
    loading?: boolean;
    error?: string | null;
    height?: string;
    className?: string;
    showControls?: boolean;
    showExport?: boolean;
    allowFullscreen?: boolean;
    onChartClick?: (detail: { event: any; elements: any[] }) => void;
    onLegendClick?: (detail: { event: any; legendItem: any }) => void;
    onExport?: (detail: { format: string; data: ChartData }) => void;
    onRefresh?: () => void;
    onFullscreen?: (isFullscreen: boolean) => void;
  } = $props();

  // State
  let chartContainer: HTMLCanvasElement;
  let chart: any = $state(null);
  let isFullscreen = $state(false);
  let chartLibraryLoaded = $state(false);

  // Default theme colors
  const themes = {
    light: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#06B6D4',
      success: '#10B981',
      background: '#FFFFFF',
      text: '#1F2937',
      grid: '#E5E7EB'
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#34D399',
      accent: '#FBBF24',
      error: '#F87171',
      warning: '#FBBF24',
      info: '#22D3EE',
      success: '#34D399',
      background: '#1F2937',
      text: '#F9FAFB',
      grid: '#374151'
    }
  };

  // Functions
  async function loadChartLibrary() {
    if (chartLibraryLoaded) return;

    try {
      // Dynamically import Chart.js to reduce bundle size
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      (window as any).Chart = Chart;
      chartLibraryLoaded = true;
    } catch (err) {
      error = 'Failed to load chart library';
      console.error('Chart library loading error:', err);
    }
  }

  function getDefaultOptions(type: ChartType, theme: 'light' | 'dark' = 'light'): ChartOptions {
    const themeColors = themes[theme];

    const baseOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          enabled: true,
          mode: 'index'
        }
      },
      animation: {
        duration: 750,
        easing: 'easeOutQuart'
      }
    };

    // Chart-specific configurations
    if (type === 'line' || type === 'area' || type === 'bar' || type === 'scatter') {
      baseOptions.scales = {
        x: {
          display: true,
          title: {
            display: true,
            text: 'X Axis'
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Y Axis'
          }
        }
      };
    }

    return baseOptions;
  }

  function applyTheme(data: ChartData, theme: 'light' | 'dark' = 'light'): ChartData {
    const themeColors = themes[theme];
    const colorPalette = [
      themeColors.primary,
      themeColors.secondary,
      themeColors.accent,
      themeColors.info,
      themeColors.warning,
      themeColors.error
    ];

    return {
      ...data,
      datasets: data.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor ||
          (config.type === 'pie' || config.type === 'doughnut'
            ? colorPalette
            : colorPalette[index % colorPalette.length] + '20'),
        borderColor: dataset.borderColor || colorPalette[index % colorPalette.length],
        borderWidth: dataset.borderWidth || 2
      }))
    };
  }

  function mergeOptions(defaultOpts: ChartOptions, userOpts?: ChartOptions): ChartOptions {
    if (!userOpts) return defaultOpts;

    return {
      ...defaultOpts,
      ...userOpts,
      plugins: {
        ...defaultOpts.plugins,
        ...userOpts.plugins
      },
      scales: {
        ...defaultOpts.scales,
        ...userOpts.scales
      }
    };
  }

  async function createChart() {
    if (!chartContainer || !chartLibraryLoaded || !(window as any).Chart) return;

    // Destroy existing chart
    if (chart) {
      chart.destroy();
      chart = null;
    }

    try {
      const Chart = (window as any).Chart;

      // Prepare data with theme
      const themedData = applyTheme(config.data, config.theme);

      // Prepare options
      const defaultOpts = getDefaultOptions(config.type, config.theme);
      const finalOptions = mergeOptions(defaultOpts, config.options);

      // Handle area chart (line with fill)
      let chartType = config.type;
      if (config.type === 'area') {
        chartType = 'line';
        themedData.datasets = themedData.datasets.map(dataset => ({
          ...dataset,
          fill: true,
          tension: dataset.tension || 0.4
        }));
      }

      // Create chart
      chart = new Chart(chartContainer, {
        type: chartType,
        data: themedData,
        options: {
          ...finalOptions,
          onClick: (event: any, elements: any[]) => {
            onChartClick?.({ event, elements });
          },
          plugins: {
            ...finalOptions.plugins,
            legend: {
              ...finalOptions.plugins?.legend,
              onClick: (event: any, legendItem: any) => {
                Chart.defaults.plugins.legend.onClick.call(chart, event, legendItem, chart);
                onLegendClick?.({ event, legendItem });
              }
            }
          }
        }
      });

    } catch (err) {
      error = `Failed to create chart: ${err}`;
      console.error('Chart creation error:', err);
    }
  }

  function updateChart() {
    if (!chart) return;

    const themedData = applyTheme(config.data, config.theme);
    chart.data = themedData;
    chart.update('none'); // Skip animation for updates
  }

  function exportChart(format: 'png' | 'jpg' | 'svg' | 'pdf') {
    if (!chart) return;

    try {
      let dataUrl: string;

      if (format === 'png' || format === 'jpg') {
        dataUrl = chart.toBase64Image(format === 'jpg' ? 'image/jpeg' : 'image/png', 1);

        // Create download link
        const link = document.createElement('a');
        link.download = `chart.${format}`;
        link.href = dataUrl;
        link.click();
      } else if (format === 'svg') {
        // For SVG export, we'd need additional library
        error = 'SVG export not implemented yet';
      } else if (format === 'pdf') {
        // For PDF export, we'd need additional library
        error = 'PDF export not implemented yet';
      }

      onExport?.({ format, data: config.data });
    } catch (err) {
      error = `Export failed: ${err}`;
    }
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    onFullscreen?.(isFullscreen);

    // Resize chart after fullscreen toggle
    setTimeout(() => {
      if (chart) {
        chart.resize();
      }
    }, 100);
  }

  function refreshChart() {
    onRefresh?.();
    createChart();
  }

  function getChartIcon(type: ChartType) {
    switch (type) {
      case 'line':
      case 'area':
        return LineChart;
      case 'bar':
        return BarChart3;
      case 'pie':
      case 'doughnut':
        return PieChart;
      case 'scatter':
        return Scatter3D;
      default:
        return TrendingUp;
    }
  }

  // Lifecycle - mount and destroy
  $effect(() => {
    (async () => {
      await loadChartLibrary();
      if (chartLibraryLoaded) {
        await createChart();
      }
    })();

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  });

  // Reactive updates when config changes
  $effect(() => {
    if (chart && config) {
      updateChart();
    }
  });
</script>

<div class="chart-wrapper {className}" class:fullscreen={isFullscreen}>
  <Card class="w-full h-full">
    {#if title || subtitle || showControls}
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            {#if title}
              <CardTitle class="flex items-center gap-2">
                <svelte:component this={getChartIcon(config.type)} class="w-5 h-5" />
                {title}
              </CardTitle>
            {/if}
            {#if subtitle}
              <p class="text-sm text-gray-600 mt-1">{subtitle}</p>
            {/if}
          </div>

          {#if showControls}
            <div class="flex items-center gap-2">
              <!-- Chart Type Indicator -->
              <Badge variant="outline" class="capitalize">
                {config.type} Chart
              </Badge>

              <!-- Export Menu -->
              {#if showExport}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild let:builder>
                    <Button builders={[builder]} variant="outline" size="sm">
                      <Download class="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onclick={() => exportChart('png')}>
                      Export as PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onclick={() => exportChart('jpg')}>
                      Export as JPG
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onclick={() => exportChart('svg')} disabled>
                      Export as SVG
                    </DropdownMenuItem>
                    <DropdownMenuItem onclick={() => exportChart('pdf')} disabled>
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              {/if}

              <!-- Fullscreen Toggle -->
              {#if allowFullscreen}
                <Button variant="outline" size="sm" onclick={toggleFullscreen}>
                  <Maximize2 class="w-4 h-4" />
                </Button>
              {/if}

              <!-- Refresh -->
              <Button variant="outline" size="sm" onclick={refreshChart}>
                <RefreshCw class="w-4 h-4" />
              </Button>
            </div>
          {/if}
        </div>
      </CardHeader>
    {/if}

    <CardContent class="p-4">
      <div class="chart-container relative" style="height: {height}">
        {#if loading}
          <div class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
            <div class="text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p class="text-sm text-gray-600">Loading chart...</p>
            </div>
          </div>
        {:else if error}
          <Alert variant="destructive" class="m-4">
            <AlertTriangle class="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        {:else if !config.data?.datasets?.length}
          <div class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
            <div class="text-center">
              <TrendingUp class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-sm text-gray-600">No data available</p>
            </div>
          </div>
        {:else}
          <canvas
            bind:this={chartContainer}
            class="w-full h-full"
          ></canvas>
        {/if}
      </div>

      <!-- Chart Info -->
      {#if config.data?.datasets?.length && !loading && !error}
        <div class="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <span>
            Data Points: {config.data.datasets.reduce((sum, ds) => sum + (Array.isArray(ds.data) ? ds.data.length : 0), 0)}
          </span>
          <span>
            Series: {config.data.datasets.length}
          </span>
          {#if config.data.labels}
            <span>
              Categories: {config.data.labels.length}
            </span>
          {/if}
        </div>
      {/if}
    </CardContent>
  </Card>
</div>

<!-- Fullscreen Overlay -->
{#if isFullscreen}
  <div class="fixed inset-0 bg-black bg-opacity-75 z-50 p-4 flex items-center justify-center">
    <div class="w-full h-full bg-white rounded-lg overflow-hidden">
      <div class="h-full flex flex-col">
        <div class="flex items-center justify-between p-4 border-b">
          <h2 class="text-lg font-semibold">{title || 'Chart'}</h2>
          <Button variant="ghost" size="sm" onclick={toggleFullscreen}>
            <X class="w-4 h-4" />
          </Button>
        </div>
        <div class="flex-1 p-4">
          <div class="w-full h-full">
            <canvas
              bind:this={chartContainer}
              class="w-full h-full"
            ></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .chart-wrapper.fullscreen {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .chart-container {
    position: relative;
  }

  .chart-container canvas {
    max-width: 100%;
    height: auto;
  }
</style>