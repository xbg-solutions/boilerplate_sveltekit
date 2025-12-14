# File Handling Service

## Overview

Complete file handling service orchestrating the full upload flow: Firebase Storage upload, backend metadata storage, and processing status polling. Provides end-to-end file management with comprehensive progress tracking.

**Location**: `src/lib/services/file-handling/`

**Note**: This service contains site-specific metadata fields and permission rules that should be customized for your application.

## Key Features

- Complete upload orchestration (storage + metadata + processing)
- Multi-phase progress tracking
- Backend metadata storage via API
- Processing status polling
- Background processing checks
- Error handling and retries
- Batch file uploads
- Resource-based file retrieval

## Upload Flow

1. **Phase 1: Upload to Firebase Storage** - File uploaded with progress tracking
2. **Phase 2: Store Metadata** - File information saved to backend database
3. **Phase 3: Processing** - Optional background processing (polling)
4. **Phase 4: Complete** - File ready for use

## Key Methods

### `uploadFile(file: File, options: CompleteUploadOptions): Promise<string>`
Upload a single file with complete orchestration.

**Returns**: File ID from backend

**Options**:
- `resourceType`: Resource type for organization (e.g., 'accounts', 'projects')
- `resourceId`: Resource ID
- `description`: Optional file description
- `fileType`: User-selected file category
- `tags`: Array of tags for categorization
- `accessLevel`: Access control level
  - `'me_and_admins'`: Only user and admins
  - `'my_account'`: All users in account
  - `'this_engagement'`: All users in engagement
- `consultantsCanAccess`: Whether consultants can access
- `onProgress`: Progress callback with phase updates

```typescript
const fileId = await fileUploadService.uploadFile(file, {
  resourceType: 'accounts',
  resourceId: accountId,
  description: 'Q4 Financial Report',
  fileType: 'report',
  tags: ['finance', '2024', 'q4'],
  accessLevel: 'my_account',
  consultantsCanAccess: true,
  onProgress: (progress) => {
    console.log(`Phase: ${progress.phase}`);
    console.log(`Progress: ${progress.uploadProgress?.percentage}%`);
  }
});
```

### `uploadFiles(files: File[], options: CompleteUploadOptions): Promise<string[]>`
Upload multiple files in parallel.

**Returns**: Array of file IDs

```typescript
const fileIds = await fileUploadService.uploadFiles(files, {
  resourceType: 'projects',
  resourceId: projectId,
  fileType: 'document',
  tags: ['project-docs'],
  accessLevel: 'this_engagement',
  consultantsCanAccess: false,
  onProgress: (progress) => {
    // Each file calls progress individually
    console.log(`${progress.fileName}: ${progress.phase}`);
  }
});
```

### `getFileStatus(fileId: string): Promise<FileUploadStatus>`
Get current file processing status.

**Returns**: Status object with processing details

```typescript
const status = await fileUploadService.getFileStatus(fileId);
// {
//   id: 'file-123',
//   status: 'processing' | 'active' | 'error',
//   processingStage?: 'initializing' | 'scanning' | 'complete',
//   processingProgress?: 75,
//   error?: 'Processing failed'
// }
```

### `getFiles(resourceType: string, resourceId: string, filters?: FileFilters): Promise<FilesResult>`
Get files for a resource with optional filtering.

**Filters**:
- `type`: Filter by file type
- `status`: Filter by status
- `page`: Page number for pagination
- `limit`: Items per page

**Returns**: Files array and pagination info

```typescript
const result = await fileUploadService.getFiles('accounts', accountId, {
  type: 'report',
  status: 'active',
  page: 1,
  limit: 20
});
// {
//   files: [...],
//   pagination: { page, limit, total, totalPages }
// }
```

## Data Structures

### CompleteUploadProgress
```typescript
interface CompleteUploadProgress {
  fileId?: string;
  fileName: string;
  phase: 'uploading' | 'storing-metadata' | 'processing' | 'complete' | 'error';
  uploadProgress?: {
    bytesTransferred: number;
    totalBytes: number;
    percentage: number;
  };
  processingProgress?: number; // 0-100
  processingStage?: string;
  error?: string;
}
```

### FileMetadata (Backend Storage)
```typescript
interface FileMetadata {
  fileName: string;
  originalFilename: string;
  description?: string;
  contentType: string;
  type: string; // User-selected category
  size: number;
  storagePath: string;
  downloadURL: string;
  resourceType: string;
  resourceId: string;
  tags: string[];
  accessLevel: 'me_and_admins' | 'my_account' | 'this_engagement';
  consultantsCanAccess: boolean;
}
```

### FileUploadStatus
```typescript
interface FileUploadStatus {
  id: string;
  status: 'processing' | 'active' | 'error';
  processingStage?: string;
  processingProgress?: number;
  error?: string;
}
```

## API Integration

The service integrates with backend endpoints:

### Store Metadata
```
POST /file-management/metadata
Body: FileMetadata
Response: { id: string }
```

### Get Status
```
GET /files/{fileId}/status
Response: FileUploadStatus
```

### Get Files
```
GET /file-management/account/{accountId}
GET /file-management/resource/{resourceType}/{resourceId}
Query: type, status, page, limit
Response: { files: [], pagination: {} }
```

## Usage Examples

### Basic Upload with Progress
```svelte
<script lang="ts">
  import { fileUploadService } from '$lib/services/file-handling';

  let uploadProgress: CompleteUploadProgress | null = null;

  async function handleUpload(file: File) {
    try {
      const fileId = await fileUploadService.uploadFile(file, {
        resourceType: 'accounts',
        resourceId: accountId,
        fileType: 'document',
        tags: ['uploaded'],
        accessLevel: 'my_account',
        consultantsCanAccess: false,
        onProgress: (progress) => {
          uploadProgress = progress;
        }
      });
      console.log('Upload complete:', fileId);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
</script>

{#if uploadProgress}
  <div class="upload-progress">
    <p>{uploadProgress.fileName}</p>
    <p>Phase: {uploadProgress.phase}</p>

    {#if uploadProgress.phase === 'uploading' && uploadProgress.uploadProgress}
      <progress value={uploadProgress.uploadProgress.percentage} max="100">
        {uploadProgress.uploadProgress.percentage}%
      </progress>
    {/if}

    {#if uploadProgress.phase === 'processing' && uploadProgress.processingProgress}
      <p>Processing: {uploadProgress.processingProgress}%</p>
      {#if uploadProgress.processingStage}
        <p>Stage: {uploadProgress.processingStage}</p>
      {/if}
    {/if}

    {#if uploadProgress.error}
      <p class="error">{uploadProgress.error}</p>
    {/if}
  </div>
{/if}
```

### Batch Upload
```typescript
import { fileUploadService } from '$lib/services/file-handling';

const files = Array.from(fileInput.files);
const progressMap = new Map<string, CompleteUploadProgress>();

try {
  const fileIds = await fileUploadService.uploadFiles(files, {
    resourceType: 'projects',
    resourceId: projectId,
    fileType: 'attachment',
    tags: ['batch-upload'],
    accessLevel: 'this_engagement',
    consultantsCanAccess: true,
    onProgress: (progress) => {
      progressMap.set(progress.fileName, progress);
      // Update UI for each file
    }
  });

  console.log(`Uploaded ${fileIds.length} files:`, fileIds);
} catch (error) {
  console.error('Batch upload failed:', error);
}
```

### Check Processing Status
```typescript
import { fileUploadService } from '$lib/services/file-handling';

const fileId = 'file-123';

const checkStatus = async () => {
  try {
    const status = await fileUploadService.getFileStatus(fileId);

    if (status.status === 'active') {
      console.log('File ready');
    } else if (status.status === 'processing') {
      console.log(`Processing: ${status.processingStage} (${status.processingProgress}%)`);
      // Check again in 2 seconds
      setTimeout(checkStatus, 2000);
    } else if (status.status === 'error') {
      console.error('Processing error:', status.error);
    }
  } catch (error) {
    console.error('Status check failed:', error);
  }
};

checkStatus();
```

### Retrieve Files with Filtering
```typescript
import { fileUploadService } from '$lib/services/file-handling';

// Get all files for account
const allFiles = await fileUploadService.getFiles('accounts', accountId);

// Get filtered files
const reports = await fileUploadService.getFiles('accounts', accountId, {
  type: 'report',
  status: 'active',
  page: 1,
  limit: 10
});

console.log('Reports:', reports.files);
console.log('Total:', reports.pagination.total);
```

### Upload with Access Control
```typescript
import { fileUploadService } from '$lib/services/file-handling';

// Private file (only me and admins)
const privateFileId = await fileUploadService.uploadFile(file, {
  resourceType: 'accounts',
  resourceId: accountId,
  fileType: 'confidential',
  tags: ['private'],
  accessLevel: 'me_and_admins',
  consultantsCanAccess: false
});

// Shared with account
const sharedFileId = await fileUploadService.uploadFile(file, {
  resourceType: 'accounts',
  resourceId: accountId,
  fileType: 'document',
  tags: ['shared'],
  accessLevel: 'my_account',
  consultantsCanAccess: true
});

// Engagement-wide
const publicFileId = await fileUploadService.uploadFile(file, {
  resourceType: 'projects',
  resourceId: projectId,
  fileType: 'resource',
  tags: ['public'],
  accessLevel: 'this_engagement',
  consultantsCanAccess: true
});
```

### Progress Tracking Component
```svelte
<script lang="ts">
  import { fileUploadService } from '$lib/services/file-handling';
  import type { CompleteUploadProgress } from '$lib/services/file-handling';

  let currentFile: File | null = null;
  let progress: CompleteUploadProgress | null = null;

  $: phaseLabel = {
    'uploading': 'Uploading file...',
    'storing-metadata': 'Storing file information...',
    'processing': 'Processing file...',
    'complete': 'Upload complete!',
    'error': 'Upload failed'
  }[progress?.phase || 'uploading'];

  async function upload(file: File) {
    currentFile = file;
    progress = null;

    try {
      const fileId = await fileUploadService.uploadFile(file, {
        resourceType: 'accounts',
        resourceId: $page.data.accountId,
        fileType: 'document',
        tags: [],
        accessLevel: 'my_account',
        consultantsCanAccess: false,
        onProgress: (p) => {
          progress = p;
        }
      });

      // Success
      goto(`/files/${fileId}`);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
</script>

<input
  type="file"
  on:change={(e) => e.target.files?.[0] && upload(e.target.files[0])}
/>

{#if progress}
  <div class="progress-card">
    <h3>{progress.fileName}</h3>
    <p class="phase">{phaseLabel}</p>

    {#if progress.phase === 'uploading' && progress.uploadProgress}
      <div class="progress-bar">
        <div
          class="progress-fill"
          style="width: {progress.uploadProgress.percentage}%"
        />
      </div>
      <p>{progress.uploadProgress.percentage}%</p>
    {/if}

    {#if progress.phase === 'processing'}
      <div class="spinner" />
      {#if progress.processingStage}
        <p>{progress.processingStage}</p>
      {/if}
    {/if}

    {#if progress.phase === 'complete'}
      <p class="success">✓ Upload successful</p>
    {/if}

    {#if progress.error}
      <p class="error">{progress.error}</p>
    {/if}
  </div>
{/if}
```

### Error Handling
```typescript
import { fileUploadService } from '$lib/services/file-handling';
import { AppError } from '$lib/utils/error-handler';

try {
  const fileId = await fileUploadService.uploadFile(file, options);
} catch (error) {
  if (error instanceof AppError) {
    console.error('Category:', error.context.category);
    console.error('User message:', error.context.userMessage);

    // Show user-friendly message
    toast.error(error.context.userMessage);

    // Log technical details
    console.error('Technical error:', error.cause);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Processing Stages

The service polls for processing completion with these stages:

1. **Initializing**: Processing started
2. **Scanning**: File being scanned/validated
3. **Active**: Processing complete, file ready
4. **Error**: Processing failed

Polling configuration:
- Max attempts: 60 (5 minutes total)
- Interval: 5 seconds
- Timeout: Throws error after 5 minutes
- Background: Processing happens async, file is usable immediately

## Best Practices

1. **Use descriptive file types**: Choose appropriate `fileType` for organization
2. **Tag appropriately**: Add relevant tags for filtering and search
3. **Set correct access level**: Choose appropriate `accessLevel` for security
4. **Handle all phases**: Show progress for uploading, storing, and processing
5. **Error handling**: Catch and display user-friendly error messages
6. **Background processing**: File is usable immediately, processing happens async
7. **Pagination**: Use filters when retrieving large file lists
8. **Status polling**: Check status for long-running processing tasks
9. **Resource organization**: Use consistent `resourceType` and `resourceId` patterns
10. **Customize metadata**: Update `FileMetadata` interface for your app's needs

## Customization Notes

This service contains site-specific fields that should be customized:

### Access Levels
Current levels: `'me_and_admins' | 'my_account' | 'this_engagement'`

Update to match your application's permission model.

### File Types
Current usage: User-selected category (e.g., 'report', 'document', 'attachment')

Define your own file type taxonomy.

### Resource Types
Examples: `'accounts'`, `'projects'`, `'engagements'`

Use resource types that match your application structure.

### Consultant Access
Field: `consultantsCanAccess: boolean`

Remove or modify based on your user roles.

### Backend Endpoints
Update API endpoints to match your backend:
- `/file-management/metadata` - Store metadata
- `/files/{fileId}/status` - Get status
- `/file-management/account/{accountId}` - Get account files
- `/file-management/resource/{type}/{id}` - Get resource files

## Notes

- Service is a singleton instance
- Automatic processing status polling (max 5 minutes)
- File is usable immediately after metadata storage
- Processing happens in background (non-blocking)
- Integrates with Firebase Storage for file storage
- Metadata stored in backend database via API
- Comprehensive error handling with AppError
- Supports batch uploads (parallel execution)
- All operations logged via logger service
- Progress tracking for all upload phases
