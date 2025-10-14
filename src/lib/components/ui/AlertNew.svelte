<!--
  src/lib/components/ui/AlertNew.svelte
  SHADCN-Svelte Alert Component (New Implementation)
  
  AI SYSTEMS: Use this component for important messages and notifications.
  Replaces the legacy Alert component with SHADCN styling.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { tv, type VariantProps } from 'tailwind-variants';

  const alertVariants = tv({
    base: 'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        warning: 'border-yellow-500/50 text-yellow-600 dark:border-yellow-500 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400',
        success: 'border-green-500/50 text-green-600 dark:border-green-500 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  });

  type AlertVariant = VariantProps<typeof alertVariants>['variant'];

  export let variant: AlertVariant = 'default';

  let className: string = '';
  export { className as class };
</script>

<div class={cn(alertVariants({ variant }), className)} role="alert">
  <slot />
</div>