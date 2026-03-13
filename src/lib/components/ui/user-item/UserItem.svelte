<!--
  src/lib/components/ui/user-item/UserItem.svelte
  Avatar + name + email row component.

  Usage:
  <UserItem name="John Doe" email="john@example.com" avatarSrc="/avatar.jpg">
    <svelte:fragment slot="value">$1,999.00</svelte:fragment>
  </UserItem>
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import Avatar from '$lib/components/ui/Avatar.svelte';

  export let name: string;
  export let email: string;
  export let avatarSrc: string | undefined = undefined;

  let className: string = '';
  export { className as class };
</script>

<div class={cn('flex items-center gap-3', className)} {...$$restProps}>
  <Avatar src={avatarSrc} alt={name} fallback={name} size="lg" />
  <div class="flex-1 min-w-0">
    <p class="text-sm font-medium text-foreground truncate">{name}</p>
    <p class="text-sm text-muted-foreground truncate">{email}</p>
  </div>
  <slot name="value" />
</div>
