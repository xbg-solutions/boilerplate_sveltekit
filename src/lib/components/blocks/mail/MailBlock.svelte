<!--
  MailBlock.svelte
  Full 3-panel email client:
  - Left panel: account header + folder/label nav with unread counts
  - Center panel: thread list with tags and preview text
  - Right panel: reading pane with full message + reply box
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export interface MailFolder {
    id: string;
    label: string;
    icon: 'inbox' | 'drafts' | 'sent' | 'junk' | 'trash' | 'archive' | 'tag';
    count?: number;
  }

  export interface MailTag {
    label: string;
    variant?: 'default' | 'secondary' | 'outline';
  }

  export interface MailMessage {
    id: string;
    from: string;
    fromEmail?: string;
    avatar?: string;
    subject: string;
    preview: string;
    body: string;
    date: string;
    read: boolean;
    starred?: boolean;
    tags?: MailTag[];
    folderId: string;
  }

  let {
    class: className = '',
    accountName = 'Alicia Koch',
    accountEmail = 'alicia@example.com',
    folders = defaultFolders(),
    messages = [] as MailMessage[],
    selectedFolderId = 'inbox',
    selectedMessageId = null as string | null,
    muted = false
  }: {
    class?: string;
    accountName?: string;
    accountEmail?: string;
    folders?: MailFolder[];
    messages?: MailMessage[];
    selectedFolderId?: string;
    selectedMessageId?: string | null;
    muted?: boolean;
  } = $props();

  function defaultFolders(): MailFolder[] {
    return [
      { id: 'inbox',    label: 'Inbox',    icon: 'inbox',   count: 128 },
      { id: 'drafts',   label: 'Drafts',   icon: 'drafts',  count: 9 },
      { id: 'sent',     label: 'Sent',     icon: 'sent' },
      { id: 'junk',     label: 'Junk',     icon: 'junk',    count: 23 },
      { id: 'trash',    label: 'Trash',    icon: 'trash' },
      { id: 'archive',  label: 'Archive',  icon: 'archive' },
      { id: 'social',   label: 'Social',   icon: 'tag',     count: 972 },
      { id: 'updates',  label: 'Updates',  icon: 'tag',     count: 342 },
      { id: 'forums',   label: 'Forums',   icon: 'tag',     count: 128 },
      { id: 'shopping', label: 'Shopping', icon: 'tag',     count: 8 },
      { id: 'promotions',label:'Promotions',icon:'tag',     count: 21 }
    ];
  }

  let replyText = $state('');

  let folderMessages = $derived(messages.filter(m => m.folderId === selectedFolderId));
  let selectedMessage = $derived(messages.find(m => m.id === selectedMessageId) ?? null);

  function selectMessage(id: string) {
    selectedMessageId = id;
    const msg = messages.find(m => m.id === id);
    if (msg) msg.read = true;
  }

  function unreadCount(folderId: string) {
    return messages.filter(m => m.folderId === folderId && !m.read).length;
  }

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  // Icon paths as inline SVG content strings
  function folderIcon(icon: MailFolder['icon']) {
    switch (icon) {
      case 'inbox':   return 'M22 12h-6l-2 3h-4l-2-3H2';
      case 'drafts':  return 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z';
      case 'sent':    return 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z';
      case 'junk':    return 'M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2';
      case 'trash':   return 'M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2';
      case 'archive': return 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z';
      case 'tag':     return 'M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z M7 7h.01';
      default:        return '';
    }
  }
</script>

<div class={cn('flex h-full min-h-[600px] overflow-hidden rounded-xl border bg-background', className)}>

  <!-- LEFT: Folder nav -->
  <aside class="flex w-52 flex-col border-r">
    <!-- Account header -->
    <div class="flex items-center gap-2 border-b px-4 py-3">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {initials(accountName)}
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-medium">{accountName}</p>
        <p class="truncate text-xs text-muted-foreground">{accountEmail}</p>
      </div>
    </div>

    <!-- Compose -->
    <div class="px-3 py-2">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
        Compose
      </button>
    </div>

    <!-- Folder list -->
    <nav class="flex-1 overflow-y-auto px-2 py-1">
      {#each folders as folder}
        {@const count = unreadCount(folder.id) || folder.count}
        <button
          type="button"
          onclick={() => { selectedFolderId = folder.id; selectedMessageId = null; }}
          class={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted',
            selectedFolderId === folder.id && 'bg-muted font-medium'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground">
            <path d={folderIcon(folder.icon)}/>
          </svg>
          <span class="flex-1 truncate text-left">{folder.label}</span>
          {#if count}
            <span class="text-xs font-medium text-muted-foreground">{count}</span>
          {/if}
        </button>
      {/each}
    </nav>
  </aside>

  <!-- CENTER: Thread list -->
  <div class="flex w-72 flex-col border-r">
    <!-- Search -->
    <div class="border-b px-3 py-2">
      <div class="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder="Search..." class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
    </div>

    <!-- Folder title + unread count -->
    <div class="flex items-center justify-between border-b px-4 py-2">
      <h2 class="text-sm font-semibold capitalize">{folders.find(f => f.id === selectedFolderId)?.label ?? selectedFolderId}</h2>
      {#if unreadCount(selectedFolderId) > 0}
        <span class="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
          {unreadCount(selectedFolderId)} new
        </span>
      {/if}
    </div>

    <!-- Thread items -->
    <div class="flex-1 overflow-y-auto">
      {#each folderMessages as msg}
        <button
          type="button"
          onclick={() => selectMessage(msg.id)}
          class={cn(
            'flex w-full flex-col gap-1 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50',
            selectedMessageId === msg.id && 'bg-muted',
            !msg.read && 'bg-blue-50/50 dark:bg-blue-950/20'
          )}
        >
          <div class="flex items-center justify-between gap-2">
            <span class={cn('truncate text-sm', !msg.read && 'font-semibold')}>{msg.from}</span>
            <span class="shrink-0 text-[10px] text-muted-foreground">{msg.date}</span>
          </div>
          <p class={cn('truncate text-xs', !msg.read ? 'font-medium text-foreground' : 'text-muted-foreground')}>{msg.subject}</p>
          <p class="truncate text-xs text-muted-foreground">{msg.preview}</p>
          {#if msg.tags?.length}
            <div class="flex flex-wrap gap-1 pt-0.5">
              {#each msg.tags as tag}
                <span class={cn(
                  'rounded-sm px-1.5 py-0.5 text-[10px] font-medium',
                  tag.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
                  tag.variant === 'outline' ? 'border border-border text-muted-foreground' :
                  'bg-primary/10 text-primary'
                )}>{tag.label}</span>
              {/each}
            </div>
          {/if}
        </button>
      {:else}
        <div class="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No messages
        </div>
      {/each}
    </div>
  </div>

  <!-- RIGHT: Reading pane -->
  <div class="flex flex-1 flex-col overflow-hidden">
    {#if selectedMessage}
      <!-- Message header -->
      <div class="flex items-start justify-between gap-4 border-b px-6 py-4">
        <div class="min-w-0">
          <h3 class="truncate text-base font-semibold">{selectedMessage.subject}</h3>
          <div class="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span class="font-medium text-foreground">{selectedMessage.from}</span>
            {#if selectedMessage.fromEmail}
              <span>&lt;{selectedMessage.fromEmail}&gt;</span>
            {/if}
            <span>·</span>
            <span>{selectedMessage.date}</span>
          </div>
        </div>
        <!-- Actions -->
        <div class="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onclick={() => (muted = !muted)}
            class={cn(
              'flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted',
              muted && 'text-orange-500'
            )}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {#if muted}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            {/if}
          </button>
          <button type="button" class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted" title="Archive">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
          </button>
          <button type="button" class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <!-- Message body -->
      <div class="flex-1 overflow-y-auto px-6 py-5">
        <div class="flex items-center gap-3 mb-5">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
            {initials(selectedMessage.from)}
          </div>
          <div>
            <p class="text-sm font-medium">{selectedMessage.from}</p>
            {#if selectedMessage.fromEmail}
              <p class="text-xs text-muted-foreground">{selectedMessage.fromEmail}</p>
            {/if}
          </div>
        </div>
        <div class="prose prose-sm max-w-none text-sm leading-relaxed text-foreground">
          {selectedMessage.body}
        </div>
      </div>

      <!-- Reply box -->
      <div class="border-t px-6 py-4">
        <div class="rounded-md border">
          <div class="border-b px-4 py-2 text-xs text-muted-foreground">
            Reply to {selectedMessage.from}
          </div>
          <textarea
            bind:value={replyText}
            rows={4}
            placeholder="Write your reply..."
            class="w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          ></textarea>
          <div class="flex items-center justify-between border-t px-4 py-2">
            <div class="flex items-center gap-1">
              <button type="button" aria-label="Attach file" class="flex h-7 w-7 items-center justify-center rounded hover:bg-muted text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick={() => (muted = !muted)}
                class={cn('rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted', muted && 'border-orange-300 text-orange-600')}
              >
                {muted ? 'Unmute' : 'Mute'}
              </button>
              <button
                type="button"
                class="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={!replyText.trim()}
                onclick={() => (replyText = '')}
              >Send</button>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Empty state -->
      <div class="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        <p class="text-sm">Select a message to read</p>
      </div>
    {/if}
  </div>
</div>
