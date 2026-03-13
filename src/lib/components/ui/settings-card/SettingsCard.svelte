<!--
  src/lib/components/ui/settings-card/SettingsCard.svelte
  Settings form card with title, description, content slot, and optional footer.

  Usage:
  <SettingsCard title="Profile" description="Manage your profile settings.">
    <Input label="Name" value="John" />
    <svelte:fragment slot="footer">
      <Button>Save changes</Button>
    </svelte:fragment>
  </SettingsCard>
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '$lib/components/ui/card';

  export let title: string;
  export let description: string = '';

  let className: string = '';
  export { className as class };
</script>

<Card class={className} {...$$restProps}>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    {#if description}
      <CardDescription>{description}</CardDescription>
    {/if}
  </CardHeader>
  <CardContent>
    <slot />
  </CardContent>
  {#if $$slots.footer}
    <CardFooter>
      <slot name="footer" />
    </CardFooter>
  {/if}
</Card>
