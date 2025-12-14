# Firebase Storage Utility

## Overview

Firebase Storage utility for file uploads with progress tracking, path generation, validation, and integration with Firebase Auth.

**Location:** `src/lib/utils/firebase-storage.ts`

## Key Features

- Direct uploads to Firebase Storage
- Progress tracking
- File validation (type, size)
- Automatic path generation with timestamps
- Download URL generation
- File deletion
- User/resource segregation

## Key Functions

### uploadFile
Uploads a file to Firebase Storage.

```typescript
const result = await uploadFile(file, {
  resourceType: 'profile',
  resourceId: userId,
  onProgress: (progress) => {
    console.log(`${progress.percentage}% complete`);
  },
  metadata: {
    uploadedBy: userId
  }
});

// result: { storagePath, downloadURL, fileName, contentType, size }
```

### deleteFile
Deletes a file from Firebase Storage.

```typescript
await deleteFile('uploads/profile/user123/1234567890-avatar.jpg');
```

### getFileDownloadURL
Gets a download URL for a file.

```typescript
const url = await getFileDownloadURL(storagePath);
```

### isImageFile
Checks if a file is an image.

```typescript
if (isImageFile(file)) {
  // Show image preview
}
```

### formatFileSize
Formats file size in human-readable format.

```typescript
const formatted = formatFileSize(1024000);
// "1000 KB"
```

## Upload Options

```typescript
interface UploadOptions {
  resourceType: string;    // e.g., 'profile', 'documents'
  resourceId: string;      // User ID or resource ID
  onProgress?: (progress: UploadProgress) => void;
  metadata?: Record<string, string>;
}

interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}
```

## File Validation

- **Max Size**: 50MB
- **Allowed Types**:
  - Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
  - Text: TXT, CSV
  - Images: JPEG, PNG, GIF, WEBP

## Storage Path Structure

Files are stored following this pattern:
```
uploads/{resourceType}/{resourceId}/{timestamp}-{sanitizedFileName}
```

Example:
```
uploads/profile/user123/1709123456789-avatar.jpg
uploads/documents/project456/1709123456789-report.pdf
```

## Common Patterns

### Profile Image Upload
```svelte
<script>
  import { uploadFile } from '$lib/utils/firebase-storage';
  import { authService } from '$lib/services/auth';
  
  let uploading = false;
  let progress = 0;
  
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    uploading = true;
    
    try {
      const result = await uploadFile(file, {
        resourceType: 'profile',
        resourceId: authService.getUserId(),
        onProgress: (p) => {
          progress = p.percentage;
        }
      });
      
      // Update user profile with downloadURL
      await updateProfile({ photoURL: result.downloadURL });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      uploading = false;
    }
  }
</script>

<input
  type="file"
  accept="image/*"
  on:change={handleFileUpload}
  disabled={uploading}
/>

{#if uploading}
  <progress value={progress} max="100"></progress>
  <p>{progress}% uploaded</p>
{/if}
```

### Document Upload with Preview
```typescript
import { uploadFile, isImageFile, formatFileSize } from '$lib/utils/firebase-storage';

async function uploadDocument(file: File) {
  // Show preview for images
  if (isImageFile(file)) {
    showImagePreview(file);
  }
  
  // Show file info
  console.log(`Uploading ${file.name} (${formatFileSize(file.size)})`);
  
  // Upload
  const result = await uploadFile(file, {
    resourceType: 'documents',
    resourceId: projectId,
    onProgress: updateProgressBar,
    metadata: {
      uploadedBy: currentUserId,
      projectId: projectId
    }
  });
  
  return result;
}
```

### Delete Old File
```typescript
// Delete old profile picture before uploading new one
if (oldPhotoPath) {
  await deleteFile(oldPhotoPath);
}

const result = await uploadFile(newFile, options);
```

### Batch Upload
```typescript
async function uploadMultipleFiles(files: File[]) {
  const promises = files.map(file =>
    uploadFile(file, {
      resourceType: 'gallery',
      resourceId: albumId,
      onProgress: (p) => {
        updateFileProgress(file.name, p.percentage);
      }
    })
  );
  
  return Promise.all(promises);
}
```

## Error Handling

The utility throws `FirebaseError` with user-friendly messages:

```typescript
try {
  await uploadFile(file, options);
} catch (error) {
  if (error instanceof FirebaseError) {
    showToast(error.userMessage);
  }
}
```

Common errors:
- File too large (>50MB)
- Invalid file type
- Upload failed
- Failed to get download URL

## Integration Points

- **Firebase Utility**: Uses Firebase app and auth
- **Logger Service**: Logs all operations
- **Error Handler**: Automatic error processing

## Best Practices

1. Validate files before upload
2. Show progress to users
3. Handle errors gracefully
4. Delete old files when replacing
5. Use appropriate resourceType/resourceId
6. Set meaningful metadata
7. Limit file sizes appropriately
8. Sanitize filenames automatically
