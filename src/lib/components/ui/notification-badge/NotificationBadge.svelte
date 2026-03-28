<!--
  src/lib/components/ui/notification-badge/NotificationBadge.svelte
  Small circular count badge.

  Usage:
  <NotificationBadge count={5} />
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    count,
    class: className = '',
    ...rest
  }: {
    count: number;
    class?: string;
    [key: string]: unknown;
  } = $props();
</script>

<span
  class={cn(
    'inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold',
    className
  )}
  {...rest}
>
  {count}
</span>
