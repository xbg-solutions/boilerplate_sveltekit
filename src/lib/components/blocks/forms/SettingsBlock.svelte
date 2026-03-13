<!--
  SettingsBlock.svelte
  Tabbed settings page with Profile, Account, Appearance, Notifications, Display tabs.
  Vertical tab list on the left, form content on the right.
-->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Checkbox,
    RadioGroup,
    RadioGroupItem,
    Textarea
  } from '$lib/components/ui';
  import Separator from '$lib/components/ui/Separator.svelte';

  let className: string = '';
  export { className as class };

  export let activeTab: string = 'profile';

  // Profile form state
  let profileName = '';
  let profileEmail = '';
  let profileBio = '';
  let profileUrl1 = '';
  let profileUrl2 = '';

  // Account form state
  let accountLanguage = 'en';
  let accountTimezone = 'utc';

  // Appearance state
  let selectedTheme = 'light';

  // Notifications state
  let emailNotifications = true;
  let pushNotifications = false;
  let marketingEmails = false;
  let securityEmails = true;

  // Display state
  let displayMode = 'comfortable';

  const tabs = [
    { value: 'profile', label: 'Profile' },
    { value: 'account', label: 'Account' },
    { value: 'appearance', label: 'Appearance' },
    { value: 'notifications', label: 'Notifications' },
    { value: 'display', label: 'Display' }
  ];

  const themes = [
    { value: 'light', label: 'Light', description: 'Clean light theme' },
    { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
    { value: 'system', label: 'System', description: 'Match OS setting' }
  ];
</script>

<div class={cn('mx-auto max-w-4xl space-y-6 p-6', className)}>
  <div>
    <h2 class="text-2xl font-bold tracking-tight">Settings</h2>
    <p class="text-muted-foreground">Manage your account settings and preferences.</p>
  </div>
  <Separator />

  <Tabs value={activeTab} orientation="vertical">
    <div class="flex gap-8">
      <!-- Vertical Tab List -->
      <aside class="w-48 shrink-0">
        <TabsList class="flex flex-col items-stretch gap-1 bg-transparent p-0">
          {#each tabs as tab}
            <TabsTrigger
              value={tab.value}
              class="justify-start rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-muted"
            >
              {tab.label}
            </TabsTrigger>
          {/each}
        </TabsList>
      </aside>

      <!-- Tab Content -->
      <div class="flex-1">
        <!-- Profile Tab -->
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>This is how others will see you on the site.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label htmlFor="settings-name">Name</Label>
                <Input
                  placeholder="Your name"
                  bind:value={profileName}
                />
                <p class="text-xs text-muted-foreground">
                  This is your public display name. It can be your real name or a pseudonym.
                </p>
              </div>
              <div class="space-y-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  bind:value={profileEmail}
                />
                <p class="text-xs text-muted-foreground">
                  You can manage verified email addresses in your email settings.
                </p>
              </div>
              <div class="space-y-2">
                <Label htmlFor="settings-bio">Bio</Label>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  bind:value={profileBio}
                />
                <p class="text-xs text-muted-foreground">
                  You can @mention other users and organizations to link to them.
                </p>
              </div>
              <div class="space-y-2">
                <Label>URLs</Label>
                <p class="text-xs text-muted-foreground">
                  Add links to your website, blog, or social media profiles.
                </p>
                <Input
                  placeholder="https://example.com"
                  bind:value={profileUrl1}
                />
                <Input
                  placeholder="https://twitter.com/username"
                  bind:value={profileUrl2}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update profile</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <!-- Account Tab -->
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Update your account settings. Set your preferred language and timezone.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label htmlFor="settings-language">Language</Label>
                <Input
                  placeholder="English"
                  bind:value={accountLanguage}
                />
                <p class="text-xs text-muted-foreground">
                  This is the language that will be used in the dashboard.
                </p>
              </div>
              <div class="space-y-2">
                <Label htmlFor="settings-timezone">Timezone</Label>
                <Input
                  placeholder="UTC"
                  bind:value={accountTimezone}
                />
                <p class="text-xs text-muted-foreground">
                  Your timezone is used to display dates and times correctly.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update account</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <!-- Appearance Tab -->
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the appearance of the app. Automatically switch between day and night themes.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label>Theme</Label>
                <p class="text-xs text-muted-foreground">Select the theme for the dashboard.</p>
              </div>
              <div class="grid grid-cols-3 gap-4">
                {#each themes as theme}
                  <button
                    type="button"
                    class={cn(
                      'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-muted',
                      selectedTheme === theme.value
                        ? 'border-primary'
                        : 'border-transparent'
                    )}
                    on:click={() => (selectedTheme = theme.value)}
                  >
                    <!-- Theme preview placeholder -->
                    <div class={cn(
                      'flex h-20 w-full items-center justify-center rounded-md border',
                      theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'
                    )}>
                      <div class="space-y-1">
                        <div class={cn('h-1.5 w-12 rounded', theme.value === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200')} />
                        <div class={cn('h-1.5 w-8 rounded', theme.value === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200')} />
                      </div>
                    </div>
                    <span class="text-sm font-medium">{theme.label}</span>
                  </button>
                {/each}
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update appearance</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <!-- Notifications Tab -->
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-4">
                <h4 class="text-sm font-medium">Email Notifications</h4>
                <div class="space-y-3">
                  <label class="flex items-center gap-3">
                    <Checkbox bind:checked={emailNotifications} />
                    <div>
                      <p class="text-sm font-medium">Communication emails</p>
                      <p class="text-xs text-muted-foreground">Receive emails about your account activity.</p>
                    </div>
                  </label>
                  <label class="flex items-center gap-3">
                    <Checkbox bind:checked={marketingEmails} />
                    <div>
                      <p class="text-sm font-medium">Marketing emails</p>
                      <p class="text-xs text-muted-foreground">Receive emails about new products, features, and more.</p>
                    </div>
                  </label>
                  <label class="flex items-center gap-3">
                    <Checkbox bind:checked={securityEmails} />
                    <div>
                      <p class="text-sm font-medium">Security emails</p>
                      <p class="text-xs text-muted-foreground">Receive emails about your account security.</p>
                    </div>
                  </label>
                </div>
              </div>
              <Separator />
              <div class="space-y-4">
                <h4 class="text-sm font-medium">Push Notifications</h4>
                <label class="flex items-center gap-3">
                  <Checkbox bind:checked={pushNotifications} />
                  <div>
                    <p class="text-sm font-medium">Push notifications</p>
                    <p class="text-xs text-muted-foreground">Receive push notifications on your devices.</p>
                  </div>
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update notifications</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <!-- Display Tab -->
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display</CardTitle>
              <CardDescription>Turn items on or off to control what is displayed in the app.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label>Display Mode</Label>
                <p class="text-xs text-muted-foreground">Set the display density for the interface.</p>
              </div>
              <RadioGroup name="display-mode" value={displayMode} on:change={(e) => displayMode = e.detail.value}>
                <label class="flex items-center gap-3">
                  <RadioGroupItem value="comfortable" />
                  <div>
                    <p class="text-sm font-medium">Comfortable</p>
                    <p class="text-xs text-muted-foreground">Default spacing with more room to breathe.</p>
                  </div>
                </label>
                <label class="flex items-center gap-3">
                  <RadioGroupItem value="compact" />
                  <div>
                    <p class="text-sm font-medium">Compact</p>
                    <p class="text-xs text-muted-foreground">Tighter spacing for more content density.</p>
                  </div>
                </label>
              </RadioGroup>
            </CardContent>
            <CardFooter>
              <Button>Update display</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </div>
    </div>
  </Tabs>
</div>
