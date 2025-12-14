# Diagnostic Components

Components for monitoring application state, initialization status, and debugging.

## Components

### InitializationStatus

Visual display of application initialization progress and service status.

**Location**: `$lib/components/diagnostics/InitializationStatus.svelte`

**Props:**
- `services`: ServiceStatus[] - Array of service initialization statuses
- `showDetails`: boolean - Show detailed service information
- `autoHide`: boolean - Auto-hide when all services ready
- `autoHideDelay`: number - Delay before auto-hide (ms)

**Service Status:**
```typescript
interface ServiceStatus {
  name: string;
  status: 'pending' | 'initializing' | 'ready' | 'error';
  message?: string;
  error?: Error;
  startTime?: number;
  endTime?: number;
}
```

**Usage:**
```svelte
<script>
  import { InitializationStatus } from '$lib/components/diagnostics';
  import { onMount } from 'svelte';

  let services = [
    { name: 'Firebase', status: 'pending' },
    { name: 'Auth', status: 'pending' },
    { name: 'Database', status: 'pending' },
    { name: 'Analytics', status: 'pending' }
  ];

  onMount(async () => {
    // Update service statuses as they initialize
    services[0].status = 'initializing';
    await initializeFirebase();
    services[0].status = 'ready';

    services[1].status = 'initializing';
    await initializeAuth();
    services[1].status = 'ready';

    // Handle errors
    try {
      services[2].status = 'initializing';
      await initializeDatabase();
      services[2].status = 'ready';
    } catch (error) {
      services[2].status = 'error';
      services[2].error = error;
    }
  });
</script>

<InitializationStatus
  {services}
  showDetails={true}
  autoHide={true}
  autoHideDelay={2000}
/>
```

**Display Features:**
- **Status Icons**:
  - Pending: Clock icon
  - Initializing: Spinner
  - Ready: Checkmark
  - Error: X mark with red color

- **Progress Bar**: Overall initialization progress percentage

- **Service Details**:
  - Service name
  - Current status
  - Status message
  - Error details (if any)
  - Initialization time

- **Color Coding**:
  - Pending: Gray
  - Initializing: Blue with animation
  - Ready: Green
  - Error: Red

**Integration with AppInitializer:**
```svelte
<!-- In AppInitializer.svelte -->
<script>
  import { InitializationStatus } from '$lib/components/diagnostics';
  import { initializationStore } from '$lib/stores/initialization';

  // Track initialization
  const services = [
    { name: 'Firebase SDK', status: 'pending' },
    { name: 'Authentication', status: 'pending' },
    { name: 'Firestore', status: 'pending' },
    { name: 'Storage', status: 'pending' }
  ];

  async function initialize() {
    for (let service of services) {
      service.status = 'initializing';
      service.startTime = Date.now();

      try {
        await initializeService(service.name);
        service.status = 'ready';
        service.endTime = Date.now();
      } catch (error) {
        service.status = 'error';
        service.error = error;
        service.message = error.message;
      }
    }
  }

  onMount(initialize);
</script>

{#if !$initializationStore.isComplete}
  <InitializationStatus {services} showDetails={true} />
{:else}
  <slot />
{/if}
```

**Use Cases:**
- Application startup monitoring
- Service health dashboard
- Debugging initialization issues
- User feedback during app load
- Development environment status

**Advanced Features:**

1. **Time Tracking**:
   ```svelte
   {#if service.startTime && service.endTime}
     <span class="text-xs text-gray-500">
       {service.endTime - service.startTime}ms
     </span>
   {/if}
   ```

2. **Retry Logic**:
   ```svelte
   {#if service.status === 'error'}
     <button on:click={() => retryService(service)}>
       Retry
     </button>
   {/if}
   ```

3. **Collapsible Details**:
   ```svelte
   <InitializationStatus
     {services}
     showDetails={false}
   >
     <!-- Click to expand details -->
   </InitializationStatus>
   ```

4. **Custom Status Messages**:
   ```typescript
   services[0] = {
     name: 'Firebase',
     status: 'initializing',
     message: 'Connecting to Firebase...'
   };
   ```

## Diagnostic Patterns

### Development Mode Status

```svelte
<script>
  import { InitializationStatus } from '$lib/components/diagnostics';
  import { dev } from '$app/environment';
</script>

{#if dev}
  <div class="fixed bottom-4 right-4 z-50">
    <InitializationStatus
      {services}
      showDetails={true}
      autoHide={false}
    />
  </div>
{/if}
```

### Conditional Rendering

```svelte
<script>
  let allServicesReady = false;

  $: allServicesReady = services.every(s => s.status === 'ready');
</script>

{#if !allServicesReady}
  <InitializationStatus {services} />
{:else}
  <MainApp />
{/if}
```

### Error Reporting Integration

```svelte
<script>
  import { InitializationStatus } from '$lib/components/diagnostics';
  import { reportError } from '$lib/services/errorReporting';

  function handleServiceError(service) {
    reportError({
      message: `Service initialization failed: ${service.name}`,
      error: service.error,
      context: {
        service: service.name,
        timestamp: Date.now()
      }
    });
  }

  $: {
    services.forEach(service => {
      if (service.status === 'error') {
        handleServiceError(service);
      }
    });
  }
</script>
```

## Styling

Component uses Tailwind classes with semantic colors:

```css
/* Status colors */
.status-pending { @apply text-gray-500; }
.status-initializing { @apply text-blue-500 animate-pulse; }
.status-ready { @apply text-green-500; }
.status-error { @apply text-red-500; }

/* Progress bar */
.progress-bar {
  @apply h-2 bg-blue-500 rounded-full transition-all duration-300;
}
```

Customize with class overrides:
```svelte
<InitializationStatus
  {services}
  class="bg-white shadow-lg rounded-lg p-6"
/>
```

## Accessibility

- **ARIA live regions**: Status updates announced to screen readers
- **Role attributes**: Proper semantic roles
- **Status text**: Clear textual descriptions
- **Keyboard accessible**: Tab navigation for retry buttons

## Performance

- **Lightweight**: Minimal DOM manipulation
- **Reactive**: Uses Svelte reactivity for updates
- **Auto-cleanup**: Removes from DOM after completion
- **No polling**: Event-driven status updates

## Best Practices

1. **Use in development** for debugging initialization
2. **Auto-hide in production** to avoid UI clutter
3. **Provide meaningful service names** for clarity
4. **Include error messages** for troubleshooting
5. **Track initialization times** for performance monitoring
6. **Integrate with error reporting** for production issues
7. **Test all status states** (pending, initializing, ready, error)

## Integration with Other Components

Works well with:
- **AppInitializer**: Show initialization progress
- **ErrorBoundary**: Handle initialization errors
- **ClientOnly**: Skip SSR for client-only services
- **Loading states**: Coordinate with other loading indicators

## Component Count: 1

- InitializationStatus
