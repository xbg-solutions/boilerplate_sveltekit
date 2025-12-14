# Advanced Components

Complex, feature-rich components for advanced UI patterns and data management.

## Components

### DataTable

Full-featured data table with sorting, filtering, pagination, and bulk actions.

**Location**: `$lib/components/advanced/DataTable.svelte`

**Props:**
- `data`: any[] - Array of row data
- `columns`: Column[] - Column definitions
- `loading`: boolean - Loading state
- `error`: string | null - Error message
- `options`: DataTableOptions - Configuration options
- `bulkActions`: BulkAction[] - Available bulk actions
- `emptyMessage`: string - Message when no data
- `searchPlaceholder`: string - Search input placeholder

**Column Definition:**
```typescript
interface Column {
  key: string;              // Data property key
  title: string;            // Display title
  sortable?: boolean;       // Enable sorting
  filterable?: boolean;     // Enable column filter
  width?: string;           // Column width (CSS)
  align?: 'left' | 'center' | 'right';
  render?: (value, row) => string;  // Custom renderer
  component?: any;          // Custom component
  hidden?: boolean;         // Hide column
}
```

**Options:**
```typescript
interface DataTableOptions {
  pagination?: boolean;     // Enable pagination
  pageSize?: number;        // Rows per page
  sorting?: boolean;        // Enable sorting
  filtering?: boolean;      // Enable filtering
  selection?: boolean;      // Enable row selection
  bulkActions?: boolean;    // Enable bulk actions
  export?: boolean;         // Enable export
  responsive?: boolean;     // Responsive layout
  striped?: boolean;        // Striped rows
  bordered?: boolean;       // Table borders
  hover?: boolean;          // Hover effect
}
```

**Events:**
- `on:sort` - Column sorted: `{ column: string, direction: 'asc' | 'desc' }`
- `on:filter` - Filter changed: `{ [key]: value }`
- `on:paginate` - Page changed: `{ page: number, pageSize: number }`
- `on:select` - Row(s) selected: `{ selected: any[], row?: any }`
- `on:bulkAction` - Bulk action triggered: `{ action: string, items: any[] }`
- `on:rowClick` - Row clicked: row data
- `on:export` - Export triggered: `{ format: string, data: any[] }`
- `on:refresh` - Refresh triggered

**Usage:**
```svelte
<script>
  import { DataTable } from '$lib/components/advanced';
  import type { Column } from '$lib/components/advanced/DataTable.svelte';

  const columns: Column[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filterable: true
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => value === 'active'
        ? '<span class="badge-success">Active</span>'
        : '<span class="badge-inactive">Inactive</span>'
    },
    {
      key: 'actions',
      title: 'Actions',
      component: TableActionsCell
    }
  ];

  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' }
  ];

  const options = {
    pagination: true,
    pageSize: 10,
    sorting: true,
    filtering: true,
    selection: true,
    bulkActions: true,
    export: true
  };

  const bulkActions = [
    {
      key: 'delete',
      label: 'Delete Selected',
      icon: Trash2,
      variant: 'destructive',
      confirm: true
    }
  ];

  function handleSort(event) {
    console.log('Sort:', event.detail);
  }

  function handleBulkAction(event) {
    const { action, items } = event.detail;
    // Handle bulk action
  }
</script>

<DataTable
  {data}
  {columns}
  {options}
  {bulkActions}
  on:sort={handleSort}
  on:bulkAction={handleBulkAction}
  on:rowClick={(e) => console.log('Row clicked:', e.detail)}
/>
```

**Features:**
- **Sorting**: Click column headers to sort (asc → desc → none)
- **Filtering**: Global search + per-column filters
- **Pagination**: Configurable page size, page navigation
- **Selection**: Individual row + select all checkbox
- **Bulk Actions**: Execute actions on multiple selected rows
- **Column Visibility**: Show/hide columns dynamically
- **Export**: CSV, JSON, XLSX formats
- **Responsive**: Horizontal scroll on small screens
- **Loading/Error States**: Built-in UI for async data
- **Empty State**: Customizable empty message
- **Custom Renderers**: HTML or component-based cells

### FormWizard

Multi-step form wizard with progress tracking.

**Location**: `$lib/components/advanced/FormWizard.svelte`

**Props:**
- `steps`: Step[] - Wizard step definitions
- `currentStep`: number - Active step index
- `validation`: boolean - Enable step validation
- `allowSkip`: boolean - Allow skipping optional steps

**Step Definition:**
```typescript
interface Step {
  id: string;
  title: string;
  description?: string;
  component: any;           // Step component
  validate?: () => boolean; // Validation function
  optional?: boolean;       // Skip allowed
}
```

**Usage:**
```svelte
<script>
  import { FormWizard } from '$lib/components/advanced';
  import Step1 from './steps/Step1.svelte';
  import Step2 from './steps/Step2.svelte';
  import Step3 from './steps/Step3.svelte';

  const steps = [
    {
      id: 'personal',
      title: 'Personal Info',
      description: 'Enter your details',
      component: Step1,
      validate: () => !!formData.name && !!formData.email
    },
    {
      id: 'address',
      title: 'Address',
      component: Step2,
      optional: true
    },
    {
      id: 'confirm',
      title: 'Confirmation',
      component: Step3
    }
  ];

  let formData = {};
</script>

<FormWizard
  {steps}
  bind:currentStep
  on:complete={(e) => console.log('Form completed:', formData)}
/>
```

**Features:**
- Step progress indicator
- Next/Previous navigation
- Step validation
- Optional step skipping
- Form data persistence
- Completion callback

### ImageUpload

Advanced image upload with preview, cropping, and validation.

**Location**: `$lib/components/advanced/ImageUpload.svelte`

**Props:**
- `maxSize`: number - Max file size in bytes
- `acceptedFormats`: string[] - Allowed formats ['image/jpeg', 'image/png']
- `multiple`: boolean - Allow multiple uploads
- `preview`: boolean - Show preview
- `crop`: boolean - Enable cropping
- `aspectRatio`: number - Crop aspect ratio (e.g., 16/9)

**Events:**
- `on:upload` - File(s) uploaded: `{ files: File[] }`
- `on:error` - Upload error: `{ error: string }`
- `on:crop` - Image cropped: `{ file: File }`

**Usage:**
```svelte
<script>
  import { ImageUpload } from '$lib/components/advanced';

  function handleUpload(event) {
    const { files } = event.detail;
    // Process uploaded files
  }
</script>

<ImageUpload
  maxSize={5 * 1024 * 1024}
  acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
  preview={true}
  crop={true}
  aspectRatio={16/9}
  on:upload={handleUpload}
/>
```

**Features:**
- Drag and drop support
- File format validation
- Size validation
- Image preview
- Crop tool integration
- Progress indicator
- Multiple file support

### ChartWrapper

Chart component wrapper with responsive design and data formatting.

**Location**: `$lib/components/advanced/ChartWrapper.svelte`

**Props:**
- `type`: 'line' | 'bar' | 'pie' | 'doughnut' - Chart type
- `data`: ChartData - Chart data
- `options`: ChartOptions - Chart.js options
- `responsive`: boolean - Responsive sizing
- `height`: number - Chart height in pixels

**Usage:**
```svelte
<script>
  import { ChartWrapper } from '$lib/components/advanced';

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Sales',
      data: [12, 19, 3, 5, 2],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };
</script>

<ChartWrapper
  type="line"
  data={chartData}
  options={chartOptions}
  height={300}
/>
```

**Features:**
- Chart.js integration
- Responsive sizing
- Multiple chart types
- Customizable options
- Loading states
- Export functionality

## Integration Patterns

### DataTable with API

```svelte
<script>
  import { DataTable } from '$lib/components/advanced';
  import { onMount } from 'svelte';

  let data = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      const response = await fetch('/api/users');
      data = await response.json();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
</script>

<DataTable
  {data}
  {loading}
  {error}
  columns={columns}
  on:refresh={async () => {
    loading = true;
    // Reload data
  }}
/>
```

### FormWizard with Validation

```svelte
<script>
  import { FormWizard } from '$lib/components/advanced';
  import { writable } from 'svelte/store';

  const formStore = writable({});

  const steps = [
    {
      id: 'step1',
      title: 'Step 1',
      component: Step1Component,
      validate: () => {
        const data = get(formStore);
        return data.field1 && data.field2;
      }
    }
  ];
</script>

<FormWizard
  {steps}
  on:complete={async (e) => {
    const data = get(formStore);
    await submitForm(data);
  }}
/>
```

## Performance

- **DataTable**: Virtual scrolling for large datasets (via options)
- **ImageUpload**: Lazy loading, web workers for processing
- **ChartWrapper**: Canvas rendering, throttled updates
- **FormWizard**: Component lazy loading per step

## Accessibility

- **Keyboard navigation**: Full keyboard support
- **ARIA labels**: Proper semantic markup
- **Focus management**: Tab order and focus trapping
- **Screen reader support**: Announcements for actions
- **Color contrast**: WCAG AA compliant

## Best Practices

1. **DataTable**: Use server-side pagination for large datasets
2. **FormWizard**: Keep steps focused and concise
3. **ImageUpload**: Validate on both client and server
4. **ChartWrapper**: Limit data points for performance
5. **All**: Handle loading and error states gracefully

## Component Count: 4

- DataTable (659 lines, highly featured)
- FormWizard
- ImageUpload
- ChartWrapper
