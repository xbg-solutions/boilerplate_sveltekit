<!--
  src/lib/components/ui/message/Message.svelte
  Message list item with sender, subject, preview, and time.

  Usage:
  <Message
    sender="Jane Smith"
    subject="Meeting Tomorrow"
    preview="Hey, just wanted to confirm our meeting..."
    time="2:30 PM"
    state="active"
  />
-->
<script lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';
  import { cn } from '$lib/utils/cn';

  const messageVariants = tv({
    base: 'flex flex-col gap-1 px-4 py-3 transition-colors cursor-pointer',
    variants: {
      state: {
        default: 'hover:bg-muted/50',
        hover: 'bg-muted/50',
        active: 'bg-muted border-l-2 border-primary'
      }
    },
    defaultVariants: {
      state: 'default'
    }
  });

  type State = VariantProps<typeof messageVariants>['state'];

  export let sender: string;
  export let subject: string;
  export let preview: string;
  export let time: string;
  export let state: State = 'default';

  let className: string = '';
  export { className as class };

  $: classes = cn(messageVariants({ state }), className);
</script>

<div class={classes} {...$$restProps} on:click>
  <div class="flex items-center justify-between gap-2">
    <span class="text-sm font-semibold text-foreground truncate">{sender}</span>
    <span class="text-xs text-muted-foreground flex-shrink-0">{time}</span>
  </div>
  <p class="text-sm font-medium text-foreground truncate">{subject}</p>
  <p class="text-xs text-muted-foreground line-clamp-2">{preview}</p>
</div>
