<!--
  MusicBlock.svelte
  Music/media app layout with menu bar, sidebar, and album grid.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import {
    Button,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
  } from '$lib/components/ui';
  import { DynamicIcon } from '$lib/components/ui/icon';
  import Separator from '$lib/components/ui/Separator.svelte';

  let {
    class: className = '',
    sidebarItems = {
      discover: [],
      library: [],
      playlists: []
    },
    albums = [],
    madeForYou = []
  }: {
    class?: string;
    sidebarItems?: {
      discover: Array<{ label: string; icon?: string; active?: boolean }>;
      library: Array<{ label: string; icon?: string; active?: boolean }>;
      playlists: Array<{ label: string }>;
    };
    albums?: Array<{
      title: string;
      artist: string;
      image?: string;
    }>;
    madeForYou?: Array<{
      title: string;
      artist: string;
      image?: string;
    }>;
  } = $props();

  let activeTab = $state('music');

  const menuItems = ['Music', 'File', 'Edit', 'View', 'Account'];
</script>

<div class={cn('flex h-screen flex-col', className)}>
  <!-- Menu Bar -->
  <div class="flex items-center gap-4 border-b px-4 py-2">
    {#each menuItems as item}
      <button
        type="button"
        class="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {item}
      </button>
    {/each}
  </div>

  <div class="flex flex-1 overflow-hidden">
    <!-- Left Sidebar -->
    <aside class="w-56 shrink-0 border-r bg-background">
      <div class="flex h-full flex-col gap-4 p-4">
        <!-- Discover Section -->
        <div>
          <h4 class="mb-2 px-2 text-sm font-semibold">Discover</h4>
          <nav class="space-y-0.5">
            {#each sidebarItems.discover as item}
              <a
                href="#"
                class={cn(
                  'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors',
                  item.active
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {#if item.icon}
                  <DynamicIcon name={item.icon} size={16} />
                {/if}
                {item.label}
              </a>
            {/each}
          </nav>
        </div>

        <!-- Library Section -->
        <div>
          <h4 class="mb-2 px-2 text-sm font-semibold">Library</h4>
          <nav class="space-y-0.5">
            {#each sidebarItems.library as item}
              <a
                href="#"
                class={cn(
                  'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors',
                  item.active
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {#if item.icon}
                  <DynamicIcon name={item.icon} size={16} />
                {/if}
                {item.label}
              </a>
            {/each}
          </nav>
        </div>

        <!-- Playlists Section -->
        <div>
          <h4 class="mb-2 px-2 text-sm font-semibold">Playlists</h4>
          <Separator class="mb-2" />
          <nav class="space-y-0.5">
            {#each sidebarItems.playlists as item}
              <a
                href="#"
                class="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <DynamicIcon name="list-music" size={16} />
                {item.label}
              </a>
            {/each}
          </nav>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <div class="p-6">
        <Tabs value={activeTab}>
          <div class="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
              <TabsTrigger value="live">Live</TabsTrigger>
            </TabsList>
            <Button size="sm">
              <!-- Lucide: PlusCircle -->
              <span class="mr-1">+</span>
              Add music
            </Button>
          </div>

          <TabsContent value="music">
            <!-- Listen Now -->
            <div class="mt-6">
              <h2 class="text-2xl font-semibold tracking-tight">Listen Now</h2>
              <p class="text-sm text-muted-foreground">Top picks for you. Updated daily.</p>
            </div>
            <Separator class="my-4" />

            <!-- Album Grid -->
            <div class="grid grid-cols-4 gap-4">
              {#each albums as album}
                <div class="space-y-3">
                  <div class="overflow-hidden rounded-md">
                    {#if album.image}
                      <img
                        src={album.image}
                        alt={album.title}
                        class="aspect-square w-full object-cover transition-all hover:scale-105"
                      />
                    {:else}
                      <div class="flex aspect-square w-full items-center justify-center bg-muted">
                        <!-- Lucide: Music -->
                        <span class="text-2xl text-muted-foreground">M</span>
                      </div>
                    {/if}
                  </div>
                  <div class="space-y-1">
                    <h3 class="text-sm font-medium leading-none">{album.title}</h3>
                    <p class="text-xs text-muted-foreground">{album.artist}</p>
                  </div>
                </div>
              {:else}
                <p class="col-span-4 py-8 text-center text-muted-foreground">No albums to display.</p>
              {/each}
            </div>

            <!-- Made For You -->
            {#if madeForYou.length > 0}
              <div class="mt-8">
                <h2 class="text-2xl font-semibold tracking-tight">Made for You</h2>
                <p class="text-sm text-muted-foreground">Your personal mixes. Get better recommendations as you listen.</p>
              </div>
              <Separator class="my-4" />
              <div class="grid grid-cols-4 gap-4">
                {#each madeForYou as album}
                  <div class="space-y-3">
                    <div class="overflow-hidden rounded-md">
                      {#if album.image}
                        <img
                          src={album.image}
                          alt={album.title}
                          class="aspect-[4/5] w-full object-cover transition-all hover:scale-105"
                        />
                      {:else}
                        <div class="flex aspect-[4/5] w-full items-center justify-center bg-muted">
                          <span class="text-2xl text-muted-foreground">M</span>
                        </div>
                      {/if}
                    </div>
                    <div class="space-y-1">
                      <h3 class="text-sm font-medium leading-none">{album.title}</h3>
                      <p class="text-xs text-muted-foreground">{album.artist}</p>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </TabsContent>

          <TabsContent value="podcasts">
            <div class="mt-6 flex flex-col items-center justify-center rounded-md border border-dashed py-16">
              <h3 class="text-xl font-semibold">No episodes added</h3>
              <p class="mt-1 text-sm text-muted-foreground">You have not added any podcasts. Add one below.</p>
              <Button class="mt-4" size="sm">
                <span class="mr-1">+</span>
                Add Podcast
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="live">
            <div class="mt-6 flex flex-col items-center justify-center rounded-md border border-dashed py-16">
              <h3 class="text-xl font-semibold">No live events</h3>
              <p class="mt-1 text-sm text-muted-foreground">There are no live events scheduled at this time.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  </div>
</div>
