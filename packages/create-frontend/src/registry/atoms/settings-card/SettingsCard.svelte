<!--
  src/lib/components/ui/settings-card/SettingsCard.svelte
  Settings form card with title, description, content slot, and optional footer.

  Usage:
  <SettingsCard title="Profile" description="Manage your profile settings.">
    <Input label="Name" value="John" />
    {#snippet footer()}<Button>Save changes</Button>{/snippet}
  </SettingsCard>
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '$lib/components/ui/card';
  import type { Snippet } from 'svelte';

  let {
    title,
    description = '',
    class: className = '',
    children,
    footer,
    ...rest
  }: {
    title: string;
    description?: string;
    class?: string;
    children?: Snippet;
    footer?: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<Card class={className} {...rest}>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    {#if description}
      <CardDescription>{description}</CardDescription>
    {/if}
  </CardHeader>
  <CardContent>
    {@render children?.()}
  </CardContent>
  {#if footer}
    <CardFooter>
      {@render footer?.()}
    </CardFooter>
  {/if}
</Card>
