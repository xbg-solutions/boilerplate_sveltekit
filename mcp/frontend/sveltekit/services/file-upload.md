# File Upload Service

## Overview

Advanced file upload service with progress tracking, image optimization, drag & drop support, and batch operations. Integrates with Firebase Storage and provides comprehensive upload management.

**Location**: `src/lib/services/file-upload/`

## Key Features

- Progress tracking for individual and batch uploads
- Image optimization (resize, compress)
- Automatic thumbnail generation
- File validation (size, type)
- Batch upload with concurrency control
- Upload queue management
- Retry failed uploads
- Cancel/remove uploads
- Upload statistics

## Key Methods

### `addFiles(files: File[], options: FileUploadOptions): Promise<string[]>`
Add files to upload queue with validation and processing.

**Returns**: Array of upload IDs

**Options**:
- `resourceType`: Resource type for storage path
- `resourceId`: Resource ID for storage path
- `allowedTypes`: Allowed MIME types (e.g., `['image/jpeg', 'image/png']`)
- `maxFileSize`: Maximum file size in MB (default: 50)
- `maxFiles`: Maximum number of files allowed
- `autoUpload`: Auto-upload after adding (default: false)
- `generateThumbnails`: Generate image thumbnails (default: false)
- `resizeImages`: Resize large images (default: false)
- `compressionQuality`: JPEG compression quality 0-1 (default: 0.8)
- `onComplete`: Callback when all uploads complete
- `onError`: Callback on error

```typescript
const uploadIds = await fileUploadService.addFiles(files, {
  resourceType: 'users',
  resourceId: userId,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 10, // 10 MB
  maxFiles: 5,
  autoUpload: true,
  generateThumbnails: true,
  resizeImages: true,
  compressionQuality: 0.85
});
```

### `uploadFile(id: string, options: FileUploadOptions): Promise<UploadResult | null>`
Upload a single file from the queue.

**Returns**: Upload result with download URL and storage path

```typescript
const result = await fileUploadService.uploadFile(uploadId, {
  resourceType: 'documents',
  resourceId: docId
});
// result: { downloadURL, storagePath, contentType, size }
```

### `uploadAll(options: FileUploadOptions): Promise<BatchUploadResult>`
Upload all pending files with concurrency control (3 concurrent uploads).

**Returns**: Batch result with successful, failed, and cancelled uploads

```typescript
const result = await fileUploadService.uploadAll({
  resourceType: 'gallery',
  resourceId: galleryId,
  onComplete: (results) => {
    console.log(`Uploaded ${results.length} files`);
  }
});
// result: { successful: [], failed: [], cancelled: [] }
```

### `cancelUpload(id: string): void`
Cancel a pending or in-progress upload.

```typescript
fileUploadService.cancelUpload(uploadId);
```

### `removeUpload(id: string): void`
Remove upload from queue (any status).

```typescript
fileUploadService.removeUpload(uploadId);
```

### `clearAll(): void`
Clear all uploads from queue.

```typescript
fileUploadService.clearAll();
```

### `retryUpload(id: string, options: FileUploadOptions): Promise<UploadResult | null>`
Retry a failed upload.

```typescript
const result = await fileUploadService.retryUpload(uploadId, {
  resourceType: 'documents',
  resourceId: docId
});
```

### `deleteUpload(id: string): Promise<void>`
Delete uploaded file from Firebase Storage and remove from queue.

```typescript
await fileUploadService.deleteUpload(uploadId);
```

### `getUploads(): Writable<Map<string, FileUploadItem>>`
Get reactive store of all upload items.

```typescript
const uploads = fileUploadService.getUploads();
$: uploadList = Array.from($uploads.values());
```

### `getStats(): UploadStats`
Get upload statistics.

**Returns**: Statistics object with counts and sizes

```typescript
const stats = fileUploadService.getStats();
// {
//   total: 10,
//   pending: 2,
//   uploading: 3,
//   completed: 4,
//   error: 1,
//   cancelled: 0,
//   totalSize: 52428800,
//   completedSize: 20971520
// }
```

## Data Structures

### FileUploadItem
```typescript
interface FileUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  progress: number; // 0-100
  result?: UploadResult;
  error?: string;
  thumbnail?: string; // Base64 data URL
  metadata?: {
    originalSize: number;
    processedSize: number;
    compressionRatio: number;
  };
}
```

### UploadResult (from firebase-storage util)
```typescript
interface UploadResult {
  downloadURL: string;
  storagePath: string;
  contentType: string;
  size: number;
}
```

### BatchUploadResult
```typescript
interface BatchUploadResult {
  successful: UploadResult[];
  failed: Array<{ file: File; error: string }>;
  cancelled: File[];
}
```

## Firebase Storage Integration

The service uses `$lib/utils/firebase-storage` utilities:

### Upload Function
```typescript
import { uploadFile } from '$lib/utils/firebase-storage';

const result = await uploadFile(file, {
  resourceType: 'users',
  resourceId: userId,
  onProgress: (progress) => {
    console.log(`${progress.percentage}% uploaded`);
  },
  metadata: { uploadId: 'custom-id' }
});
```

### Delete Function
```typescript
import { deleteFile } from '$lib/utils/firebase-storage';

await deleteFile(storagePath);
```

## Usage Examples

### Basic Upload with Progress
```svelte
<script lang="ts">
  import { fileUploadService } from '$lib/services/file-upload';

  let uploads = fileUploadService.getUploads();

  async function handleFiles(files: FileList) {
    const fileArray = Array.from(files);

    await fileUploadService.addFiles(fileArray, {
      resourceType: 'documents',
      resourceId: 'doc-123',
      maxFileSize: 50,
      autoUpload: true,
      onComplete: (results) => {
        console.log('All uploads complete:', results);
      }
    });
  }
</script>

<input type="file" multiple on:change={(e) => handleFiles(e.target.files)} />

{#each Array.from($uploads.values()) as upload}
  <div>
    <p>{upload.file.name}</p>
    <p>Status: {upload.status}</p>
    {#if upload.status === 'uploading'}
      <progress value={upload.progress} max="100">{upload.progress}%</progress>
    {/if}
    {#if upload.error}
      <p class="error">{upload.error}</p>
      <button on:click={() => fileUploadService.retryUpload(upload.id, options)}>
        Retry
      </button>
    {/if}
  </div>
{/each}
```

### Image Upload with Optimization
```typescript
import { fileUploadService } from '$lib/services/file-upload';

const uploadIds = await fileUploadService.addFiles(imageFiles, {
  resourceType: 'gallery',
  resourceId: galleryId,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 10,
  generateThumbnails: true,
  resizeImages: true, // Max 1920x1080
  compressionQuality: 0.8,
  autoUpload: true
});
```

### Batch Upload with Validation
```typescript
import { fileUploadService } from '$lib/services/file-upload';

try {
  const uploadIds = await fileUploadService.addFiles(files, {
    resourceType: 'attachments',
    resourceId: taskId,
    allowedTypes: ['application/pdf', 'application/msword'],
    maxFileSize: 25,
    maxFiles: 10
  });

  // Upload with concurrency control
  const result = await fileUploadService.uploadAll({
    resourceType: 'attachments',
    resourceId: taskId
  });

  console.log(`Success: ${result.successful.length}`);
  console.log(`Failed: ${result.failed.length}`);
} catch (error) {
  console.error('Upload failed:', error.message);
}
```

### Manual Upload Control
```typescript
import { fileUploadService } from '$lib/services/file-upload';

// Add files without auto-upload
const uploadIds = await fileUploadService.addFiles(files, {
  resourceType: 'documents',
  resourceId: docId,
  autoUpload: false
});

// Upload individually
for (const id of uploadIds) {
  try {
    const result = await fileUploadService.uploadFile(id, {
      resourceType: 'documents',
      resourceId: docId
    });
    console.log('Uploaded:', result.downloadURL);
  } catch (error) {
    console.error('Failed:', error);
  }
}
```

### Upload with Thumbnails
```svelte
<script lang="ts">
  import { fileUploadService } from '$lib/services/file-upload';

  let uploads = fileUploadService.getUploads();

  async function uploadImages(files: File[]) {
    await fileUploadService.addFiles(files, {
      resourceType: 'gallery',
      resourceId: galleryId,
      generateThumbnails: true,
      autoUpload: true
    });
  }
</script>

{#each Array.from($uploads.values()) as upload}
  {#if upload.thumbnail}
    <img src={upload.thumbnail} alt="Preview" />
  {/if}
  <p>{upload.file.name}</p>
  <progress value={upload.progress} max="100" />
{/each}
```

### Error Handling and Retry
```typescript
import { fileUploadService } from '$lib/services/file-upload';

const uploads = fileUploadService.getUploads();

uploads.subscribe($uploads => {
  $uploads.forEach((upload, id) => {
    if (upload.status === 'error') {
      console.error(`Upload failed: ${upload.error}`);

      // Retry after 2 seconds
      setTimeout(async () => {
        try {
          await fileUploadService.retryUpload(id, options);
        } catch (error) {
          console.error('Retry failed:', error);
        }
      }, 2000);
    }
  });
});
```

### Upload Statistics Dashboard
```svelte
<script lang="ts">
  import { fileUploadService } from '$lib/services/file-upload';

  $: stats = fileUploadService.getStats();
  $: completionRate = stats.total > 0
    ? (stats.completed / stats.total * 100).toFixed(1)
    : 0;
</script>

<div class="stats">
  <p>Total: {stats.total}</p>
  <p>Pending: {stats.pending}</p>
  <p>Uploading: {stats.uploading}</p>
  <p>Completed: {stats.completed}</p>
  <p>Failed: {stats.error}</p>
  <p>Completion Rate: {completionRate}%</p>
  <p>Total Size: {formatBytes(stats.totalSize)}</p>
  <p>Uploaded: {formatBytes(stats.completedSize)}</p>
</div>
```

### Delete Uploaded File
```typescript
import { fileUploadService } from '$lib/services/file-upload';

// Delete from storage and remove from queue
try {
  await fileUploadService.deleteUpload(uploadId);
  console.log('File deleted successfully');
} catch (error) {
  console.error('Delete failed:', error);
}
```

## Image Processing

### Automatic Resizing
When `resizeImages: true`:
- Max dimensions: 1920x1080
- Maintains aspect ratio
- Only resizes if larger than max dimensions

### Compression
When `compressionQuality` is set (0-1):
- JPEG/WebP compression
- Default: 0.8 (80% quality)
- Smaller file sizes with acceptable quality

### Thumbnail Generation
When `generateThumbnails: true`:
- Max size: 150x150
- Maintains aspect ratio
- JPEG format at 80% quality
- Stored as base64 data URL in `FileUploadItem.thumbnail`

## Validation

### File Size Validation
```typescript
maxFileSize: 10 // MB
// Error: "File size 15.2 MB exceeds maximum allowed size of 10MB"
```

### File Type Validation
```typescript
allowedTypes: ['image/jpeg', 'image/png']
// Error: "File type application/pdf is not allowed. Allowed types: image/jpeg, image/png"
```

### Max Files Validation
```typescript
maxFiles: 5
// Error: "Maximum 5 files allowed. Current: 3"
```

## Best Practices

1. **Use autoUpload for simple flows**: Set `autoUpload: true` for immediate uploads
2. **Manual control for complex flows**: Use `autoUpload: false` and call `uploadFile()` manually
3. **Validate early**: Set `allowedTypes` and `maxFileSize` to prevent invalid uploads
4. **Optimize images**: Enable `resizeImages` and set appropriate `compressionQuality`
5. **Show thumbnails**: Use `generateThumbnails` for image previews
6. **Monitor progress**: Subscribe to uploads store for real-time updates
7. **Handle errors**: Implement retry logic for failed uploads
8. **Clean up**: Use `clearAll()` or `removeUpload()` to manage queue
9. **Concurrency control**: Batch uploads automatically limit to 3 concurrent uploads
10. **Track statistics**: Use `getStats()` for upload metrics

## Notes

- Service is a singleton instance
- All uploads tracked in reactive Svelte store
- Automatic file processing (resize/compress) before upload
- Progress tracking for each upload (0-100%)
- Batch uploads use concurrency limit of 3
- Storage paths follow pattern: `{resourceType}/{resourceId}/{fileName}`
- Metadata includes compression ratio and original/processed sizes
- Failed uploads remain in queue for retry
- Thumbnails generated client-side (no server processing)
