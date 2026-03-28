<!--
  DashboardLayout.svelte
  Dashboard-style layout template with sidebar navigation

  Usage:
  <DashboardLayout {navigation}>
    Main content here
  </DashboardLayout>
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';
  import { Button, Card, Separator, Badge } from '$lib/components/ui';
  import { Menu, X, Home, Users, Settings, BarChart3, Bell } from 'lucide-svelte';

  // Component props
  let {
    navigation = [
      { label: 'Dashboard', href: '/dashboard', icon: Home },
      { label: 'Users', href: '/users', icon: Users },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Settings', href: '/settings', icon: Settings }
    ],
    user = null,
    showNotifications = true,
    notificationCount = 0,
    header,
    'header-actions': headerActions,
    children
  }: {
    navigation?: Array<{
      label: string;
      href: string;
      icon?: any;
      badge?: string;
    }>;
    user?: {
      name: string;
      email: string;
      avatar?: string;
    } | null;
    showNotifications?: boolean;
    notificationCount?: number;
    header?: Snippet;
    'header-actions'?: Snippet;
    children?: Snippet;
  } = $props();

  // Local state
  let sidebarOpen = $state(false);

  // Current path for active nav item
  let currentPath = $derived($page.url.pathname);

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function closeSidebar() {
    sidebarOpen = false;
  }

  function isActiveRoute(href: string): boolean {
    return currentPath === href || currentPath.startsWith(href + '/');
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Mobile sidebar overlay -->
  {#if sidebarOpen}
    <div class="fixed inset-0 z-40 lg:hidden">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" onclick={closeSidebar} onkeydown={closeSidebar}></div>
    </div>
  {/if}

  <!-- Sidebar -->
  <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:inset-0">
    <!-- Sidebar header -->
    <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200">
      <h1 class="text-xl font-semibold text-gray-900">Dashboard</h1>
      <Button variant="ghost" size="sm" class="lg:hidden" onclick={closeSidebar}>
        <X class="h-5 w-5" />
      </Button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-2">
      {#each navigation as item}
        <a
          href={item.href}
          class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors {
            isActiveRoute(item.href)
              ? 'bg-primary text-primary-foreground'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }"
          onclick={closeSidebar}
        >
          {#if item.icon}
            <svelte:component this={item.icon} class="h-5 w-5 mr-3" />
          {/if}
          {item.label}
          {#if item.badge}
            <Badge variant="secondary" class="ml-auto">
              {item.badge}
            </Badge>
          {/if}
        </a>
      {/each}
    </nav>

    <!-- User profile section -->
    {#if user}
      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center space-x-3">
          {#if user.avatar}
            <img src={user.avatar} alt={user.name} class="h-8 w-8 rounded-full" />
          {:else}
            <div class="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
          {/if}
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p class="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Main content -->
  <div class="lg:ml-64">
    <!-- Top header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Mobile menu button -->
        <Button variant="ghost" size="sm" class="lg:hidden" onclick={toggleSidebar}>
          <Menu class="h-5 w-5" />
        </Button>

        <!-- Page title slot -->
        <div class="flex-1 lg:ml-0 ml-4">
          {#if header}
            {@render header()}
          {:else}
            <h2 class="text-2xl font-semibold text-gray-900">Dashboard</h2>
          {/if}
        </div>

        <!-- Header actions -->
        <div class="flex items-center space-x-4">
          {#if showNotifications}
            <Button variant="ghost" size="sm" class="relative">
              <Bell class="h-5 w-5" />
              {#if notificationCount > 0}
                <Badge variant="destructive" class="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs p-0">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              {/if}
            </Button>
          {/if}

          {@render headerActions?.()}
        </div>
      </div>
    </header>

    <!-- Page content -->
    <main class="p-6">
      {@render children?.()}
    </main>
  </div>
</div>

<style>
  /* Ensure smooth transitions */
  .transition-transform {
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
  }
</style>