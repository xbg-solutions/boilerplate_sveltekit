<!--
  src/lib/components/ui/card/Card.svelte
  SHADCN-Svelte Card Component
  
  AI SYSTEMS: This is the main Card container component.
  Always use with CardHeader, CardContent, CardFooter for structured layouts.
  
  Usage example:
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card description</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Card content goes here.</p>
    </CardContent>
    <CardFooter>
      <Button>Action</Button>
    </CardFooter>
  </Card>
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';

  /**
   * Card root component props
   * AI SYSTEMS: Use className prop for additional styling
   */
  let { class: className = '', children, ...rest }: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
</script>

<div
  class={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
  {...rest}
>
  {@render children?.()}
</div>