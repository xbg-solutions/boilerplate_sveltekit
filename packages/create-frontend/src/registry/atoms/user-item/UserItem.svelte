<!--
  src/lib/components/ui/user-item/UserItem.svelte
  Avatar + name + email row component.

  Usage:
  <UserItem name="John Doe" email="john@example.com" avatarSrc="/avatar.jpg">
    {#snippet value()}$1,999.00{/snippet}
  </UserItem>
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import Avatar from '$lib/components/ui/Avatar.svelte';
  import type { Snippet } from 'svelte';

  let {
    name,
    email,
    avatarSrc = undefined,
    class: className = '',
    value,
    ...rest
  }: {
    name: string;
    email: string;
    avatarSrc?: string | undefined;
    class?: string;
    value?: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<div class={cn('flex items-center gap-3', className)} {...rest}>
  <Avatar src={avatarSrc} alt={name} fallback={name} size="lg" />
  <div class="flex-1 min-w-0">
    <p class="text-sm font-medium text-foreground truncate">{name}</p>
    <p class="text-sm text-muted-foreground truncate">{email}</p>
  </div>
  {@render value?.()}
</div>
