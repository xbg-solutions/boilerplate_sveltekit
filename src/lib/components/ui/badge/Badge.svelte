<!--
  Badge Component
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  export let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  export let className = '';
  
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'text-foreground border border-input bg-background'
  };
</script>

<div class={cn(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  variants[variant],
  className
)}>
  <slot />
</div>