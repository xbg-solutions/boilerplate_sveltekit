<!--
  src/routes/demo/+page.svelte
  SHADCN-Svelte Component Demo Page
  
  AI SYSTEMS: This page demonstrates the standard component patterns.
  Use these examples as reference for component usage and styling.
-->
<script lang="ts">
  import { 
    Button, 
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
    Badge,
    Input,
    Label,
    Select,
    Checkbox,
    RadioGroup, RadioGroupItem,
    Textarea,
    Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    Sheet,
    Popover,
    Tabs, TabsList, TabsTrigger, TabsContent,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator,
    Pagination,
    Avatar,
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
    AlertNew, AlertTitle, AlertDescription,
    Progress,
    Separator,
    Skeleton
  } from '$lib/components/ui';
  
  import { Info, AlertTriangle, CheckCircle, X } from 'lucide-svelte';

  // Component state
  let inputValue = $state('');
  let textareaValue = $state('');
  let selectValue = $state('');
  let checkboxValue = $state(false);
  let radioValue = $state('option1');
  let darkMode = $state(false);
  let dialogOpen = $state(false);
  let sheetOpen = $state(false);
  let activeTab = $state('overview');
  let currentPage = $state(1);
  let progressValue = $state(65);

  // Form options
  const selectOptions = [
    { value: 'option1', label: 'Option One' },
    { value: 'option2', label: 'Option Two' },
    { value: 'option3', label: 'Option Three' }
  ];

  // Sample data
  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator' }
  ];

  // Toggle dark mode
  function toggleDarkMode() {
    darkMode = !darkMode;
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Progress animation
  function animateProgress() {
    progressValue = Math.floor(Math.random() * 100);
  }
</script>

<svelte:head>
  <title>SHADCN-Svelte Component Demo - Your App</title>
  <meta name="description" content="Comprehensive SHADCN-Svelte component demonstration" />
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
  <div class="container mx-auto p-8 space-y-8">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold">SHADCN-Svelte Demo</h1>
      <p class="text-muted-foreground">Comprehensive component library demonstration</p>
      <div class="flex justify-center gap-2">
        <Button variant="outline" onclick={toggleDarkMode}>
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </Button>
        <Button onclick={() => dialogOpen = true}>Open Dialog</Button>
        <Button variant="secondary" onclick={() => sheetOpen = true}>Open Sheet</Button>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/demo">Components</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink>Demo Page</BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>

    <!-- Alerts -->
    <div class="grid gap-4">
      <AlertNew variant="default">
        <Info class="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>This is an informational alert with the default styling.</AlertDescription>
      </AlertNew>

      <AlertNew variant="warning">
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This alert warns about something important you should know.</AlertDescription>
      </AlertNew>

      <AlertNew variant="success">
        <CheckCircle class="h-4 w-4" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Operation completed successfully!</AlertDescription>
      </AlertNew>

      <AlertNew variant="destructive">
        <X class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong. Please try again.</AlertDescription>
      </AlertNew>
    </div>

    <Separator />

    <!-- Progress and Loading States -->
    <Card>
      <CardHeader>
        <CardTitle>Progress & Loading States</CardTitle>
        <CardDescription>Progress indicators and skeleton loading</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Project Progress</span>
            <Button size="sm" variant="outline" onclick={animateProgress}>Randomize</Button>
          </div>
          <Progress value={progressValue} showLabel={true} />
        </div>

        <div class="space-y-2">
          <span class="text-sm font-medium">Skeleton Loading Example</span>
          <div class="flex items-center space-x-4">
            <Skeleton class="h-12 w-12 rounded-full" />
            <div class="space-y-2 flex-1">
              <Skeleton class="h-4 w-[250px]" />
              <Skeleton class="h-4 w-[200px]" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Form Components -->
    <Card>
      <CardHeader>
        <CardTitle>Advanced Form Components</CardTitle>
        <CardDescription>All form input types and interactions</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Text Inputs -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label htmlFor="text-input">Text Input</Label>
            <Input id="text-input" placeholder="Enter text..." bind:value={inputValue} />
          </div>
          <div class="space-y-2">
            <Label htmlFor="email-input">Email Input</Label>
            <Input id="email-input" type="email" placeholder="your@email.com" />
          </div>
        </div>

        <!-- Select -->
        <div class="space-y-2">
          <Label>Select Dropdown</Label>
          <Select
            bind:value={selectValue}
            options={selectOptions}
            placeholder="Choose an option..."
            onchange={(value) => console.log('Selected:', value)}
          />
        </div>

        <!-- Textarea -->
        <div class="space-y-2">
          <Label htmlFor="textarea">Textarea</Label>
          <Textarea
            id="textarea"
            placeholder="Enter multiple lines of text..."
            bind:value={textareaValue}
            rows={3}
          />
        </div>

        <!-- Checkbox -->
        <div class="flex items-center space-x-2">
          <Checkbox id="checkbox" bind:checked={checkboxValue} />
          <Label htmlFor="checkbox">I agree to the terms and conditions</Label>
        </div>

        <!-- Radio Group -->
        <div class="space-y-2">
          <Label>Choose an option:</Label>
          <RadioGroup bind:value={radioValue} name="demo-radio">
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="option1" id="radio1" />
              <Label htmlFor="radio1">Option 1</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="option2" id="radio2" />
              <Label htmlFor="radio2">Option 2</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="option3" id="radio3" />
              <Label htmlFor="radio3">Option 3</Label>
            </div>
          </RadioGroup>
        </div>

        <!-- Form Values Display -->
        <div class="p-4 bg-muted rounded-lg">
          <h4 class="font-medium mb-2">Current Form Values:</h4>
          <div class="text-sm space-y-1">
            <p>Text: <code class="bg-background px-1 rounded">{inputValue || 'empty'}</code></p>
            <p>Select: <code class="bg-background px-1 rounded">{selectValue || 'none'}</code></p>
            <p>Textarea: <code class="bg-background px-1 rounded">{textareaValue ? textareaValue.substring(0, 20) + '...' : 'empty'}</code></p>
            <p>Checkbox: <code class="bg-background px-1 rounded">{checkboxValue}</code></p>
            <p>Radio: <code class="bg-background px-1 rounded">{radioValue}</code></p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Navigation Components -->
    <Card>
      <CardHeader>
        <CardTitle>Navigation Components</CardTitle>
        <CardDescription>Tabs, pagination, and navigation elements</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Tabs -->
        <div>
          <Tabs bind:value={activeTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div class="p-4 border rounded-lg">
                <h3 class="font-medium mb-2">Overview Tab</h3>
                <p class="text-sm text-muted-foreground">This is the overview content panel.</p>
              </div>
            </TabsContent>
            <TabsContent value="analytics">
              <div class="p-4 border rounded-lg">
                <h3 class="font-medium mb-2">Analytics Tab</h3>
                <p class="text-sm text-muted-foreground">Analytics and reporting information would go here.</p>
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <div class="p-4 border rounded-lg">
                <h3 class="font-medium mb-2">Settings Tab</h3>
                <p class="text-sm text-muted-foreground">Configuration options and preferences.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator />

        <!-- Pagination -->
        <div>
          <h4 class="font-medium mb-4">Pagination Component</h4>
          <Pagination
            bind:currentPage
            totalPages={10}
            onPageChange={(page) => console.log('Page changed to:', page)}
          />
          <p class="text-sm text-muted-foreground mt-2">Current page: {currentPage}</p>
        </div>
      </CardContent>
    </Card>

    <!-- Data Display -->
    <Card>
      <CardHeader>
        <CardTitle>Data Display Components</CardTitle>
        <CardDescription>Tables, avatars, and data presentation</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Avatars -->
        <div>
          <h4 class="font-medium mb-4">Avatar Sizes</h4>
          <div class="flex items-center gap-4">
            <Avatar size="sm" fallback="JS" />
            <Avatar size="md" fallback="MD" />
            <Avatar size="lg" fallback="LG" />
            <Avatar size="xl" fallback="XL" />
            <Avatar size="2xl" fallback="2XL" />
          </div>
        </div>

        <Separator />

        <!-- Table -->
        <div>
          <h4 class="font-medium mb-4">Data Table</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each tableData as row}
                <TableRow>
                  <TableCell class="font-medium">{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <Badge variant={row.role === 'Admin' ? 'default' : 'secondary'}>
                      {row.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Interactive Elements -->
    <Card>
      <CardHeader>
        <CardTitle>Interactive Elements</CardTitle>
        <CardDescription>Buttons, popovers, and interactive components</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Button Variants -->
        <div>
          <h4 class="font-medium mb-4">Button Variants</h4>
          <div class="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </div>

        <!-- Badges -->
        <div>
          <h4 class="font-medium mb-4">Badges</h4>
          <div class="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Error</Badge>
          </div>
        </div>

        <!-- Popover Example -->
        <div>
          <h4 class="font-medium mb-4">Popover Example</h4>
          <Popover>
            {#snippet triggerContent()}
              <Button variant="outline">Open Popover</Button>
            {/snippet}
            {#snippet content()}
              <div class="space-y-2">
                <h4 class="font-medium">Popover Content</h4>
                <p class="text-sm text-muted-foreground">
                  This is a popover with some sample content. You can put any content here.
                </p>
                <Button size="sm" class="w-full">Action Button</Button>
              </div>
            {/snippet}
          </Popover>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

<!-- Dialog Example -->
<Dialog bind:open={dialogOpen}>
  <DialogHeader>
    <DialogTitle>Example Dialog</DialogTitle>
    <DialogDescription>
      This is a sample dialog demonstrating the dialog component functionality.
    </DialogDescription>
  </DialogHeader>
  <div class="py-4">
    <p class="text-sm">Dialog content goes here. You can include forms, information, or any other content.</p>
  </div>
  <DialogFooter>
    <Button variant="outline" onclick={() => dialogOpen = false}>Cancel</Button>
    <Button onclick={() => dialogOpen = false}>Confirm</Button>
  </DialogFooter>
</Dialog>

<!-- Sheet Example -->
<Sheet bind:open={sheetOpen} side="right">
  <div class="space-y-4">
    <h2 class="text-lg font-semibold">Sheet Panel</h2>
    <p class="text-sm text-muted-foreground">
      This is a sheet component that slides in from the side. Perfect for settings panels,
      navigation menus, or detailed views.
    </p>
    <div class="space-y-2">
      <Label htmlFor="sheet-input">Sheet Input</Label>
      <Input id="sheet-input" placeholder="Enter something..." />
    </div>
    <Button class="w-full" onclick={() => sheetOpen = false}>Close Sheet</Button>
  </div>
</Sheet>