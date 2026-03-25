<!--
  PlaygroundBlock01.svelte
  Simple AI playground with model selector, textarea, and parameter panel.
-->
<script lang="ts">
  import { cn } from '@xbg.solutions/frontend-core';
  import {
    Button,
    Input,
    Label,
    Select,
    Textarea,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
  } from '$lib/components/ui';
  import Separator from '$lib/components/ui/Separator.svelte';

  let className: string = '';
  export { className as class };

  export let models: Array<{ value: string; label: string }> = [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3', label: 'Claude 3' }
  ];

  let selectedModel = models[0]?.value ?? '';
  let prompt = '';
  let temperature = 0.7;
  let maxLength = 256;
  let topP = 0.9;
  let activeTab = 'complete';
</script>

<div class={cn('flex h-screen flex-col', className)}>
  <!-- Header -->
  <div class="flex items-center justify-between border-b px-4 py-3">
    <h1 class="text-lg font-semibold">Playground</h1>
    <div class="flex items-center gap-2">
      <Select
        options={models}
        bind:value={selectedModel}
        placeholder="Select model"
      />
      <Button variant="outline" size="sm">Save</Button>
      <Button variant="outline" size="sm">
        <!-- Lucide: Code -->
        View code
      </Button>
      <Button variant="outline" size="sm">
        <!-- Lucide: Share -->
        Share
      </Button>
    </div>
  </div>

  <!-- Main Area -->
  <div class="flex flex-1 overflow-hidden">
    <!-- Prompt Area -->
    <div class="flex flex-1 flex-col p-4">
      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger value="complete">Complete</TabsTrigger>
          <TabsTrigger value="insert">Insert</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="complete" class="flex-1">
          <Textarea
            placeholder="Write a tagline for an ice cream shop..."
            bind:value={prompt}
            class="min-h-[300px] resize-none"
          />
        </TabsContent>

        <TabsContent value="insert">
          <Textarea
            placeholder="Insert text here..."
            bind:value={prompt}
            class="min-h-[300px] resize-none"
          />
        </TabsContent>

        <TabsContent value="edit">
          <Textarea
            placeholder="Edit prompt..."
            bind:value={prompt}
            class="min-h-[300px] resize-none"
          />
        </TabsContent>
      </Tabs>

      <!-- Footer -->
      <div class="mt-4 flex items-center gap-2">
        <Button>Submit</Button>
        <Button variant="ghost" size="sm">
          <!-- Lucide: RotateCcw -->
          <span class="text-xs">Reset</span>
        </Button>
      </div>
    </div>

    <!-- Right Panel: Parameters -->
    <aside class="w-72 shrink-0 border-l bg-background p-4">
      <div class="space-y-6">
        <div class="space-y-2">
          <Label>Model</Label>
          <Select
            options={models}
            bind:value={selectedModel}
            placeholder="Select model"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Temperature</Label>
            <span class="text-sm text-muted-foreground">{temperature}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            bind:value={temperature}
            class="w-full accent-primary"
          />
        </div>

        <div class="space-y-2">
          <Label>Maximum Length</Label>
          <Input
            type="number"
            bind:value={maxLength}
            min={1}
            max={4096}
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Top P</Label>
            <span class="text-sm text-muted-foreground">{topP}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            bind:value={topP}
            class="w-full accent-primary"
          />
        </div>
      </div>
    </aside>
  </div>
</div>
