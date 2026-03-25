<!--
  PlaygroundBlock02.svelte
  AI playground with separate Input and Instructions textareas plus parameter panel.
-->
<script lang="ts">
  import { cn } from '@xbg.solutions/frontend-core';
  import {
    Button,
    Input,
    Label,
    Select,
    Textarea
  } from '$lib/components/ui';

  let className: string = '';
  export { className as class };

  export let models: Array<{ value: string; label: string }> = [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3', label: 'Claude 3' }
  ];

  let selectedModel = models[0]?.value ?? '';
  let inputText = '';
  let instructions = '';
  let output = '';
  let temperature = 0.7;
  let maxLength = 256;
  let topP = 0.9;
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
    <!-- Left: Input + Output -->
    <div class="flex flex-1 flex-col gap-4 p-4">
      <!-- Input Section -->
      <div class="space-y-2">
        <Label>Input</Label>
        <Textarea
          placeholder="Enter your input here..."
          bind:value={inputText}
          class="min-h-[120px] resize-none"
        />
      </div>

      <!-- Main Output Area -->
      <div class="flex-1 space-y-2">
        <Label>Output</Label>
        <Textarea
          placeholder="Output will appear here..."
          bind:value={output}
          class="min-h-[200px] flex-1 resize-none"
        />
      </div>

      <!-- Instructions -->
      <div class="space-y-2">
        <Label>Instructions</Label>
        <Textarea
          placeholder="Enter instructions for the model..."
          bind:value={instructions}
          class="min-h-[100px] resize-none"
        />
      </div>

      <!-- Footer -->
      <div class="flex items-center gap-2">
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
