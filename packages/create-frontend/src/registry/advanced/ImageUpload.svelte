<!--
  Advanced ImageUpload Component

  Features:
  - Firebase Storage integration
  - Image preview and cropping
  - Multiple file upload
  - Progress tracking
  - Image optimization
  - Drag and drop support
  - Validation and error handling
-->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Progress } from '$lib/components/ui/progress';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import {
    Upload,
    X,
    Image as ImageIcon,
    Download,
    Eye,
    Crop,
    RotateCw,
    ZoomIn,
    ZoomOut,
    Check,
    AlertTriangle,
    FileText,
    Camera
  } from 'lucide-svelte';
  import { toastService as toast } from '@xbg.solutions/bpsk-core';
  import { storageService } from '@xbg.solutions/bpsk-utils-file-upload';

  // Types
  export interface UploadedFile {
    id: string;
    file: File;
    preview: string;
    url?: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    metadata?: {
      size: number;
      type: string;
      width?: number;
      height?: number;
      lastModified: number;
    };
  }

  export interface ImageUploadOptions {
    maxFiles?: number;
    maxFileSize?: number; // in MB
    allowedTypes?: string[];
    uploadPath?: string;
    autoUpload?: boolean;
    showPreview?: boolean;
    showProgress?: boolean;
    enableCrop?: boolean;
    enableResize?: boolean;
    thumbnailSize?: { width: number; height: number };
    quality?: number;
    dragAndDrop?: boolean;
  }

  export interface CropConfig {
    aspectRatio?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  }

  // Props
  let {
    options = {},
    cropConfig = {},
    value = $bindable([]),
    disabled = false,
    className = '',
    placeholder = 'Click or drag images here to upload',
    onUpload,
    onComplete,
    onError,
    onRemove,
    onPreview,
    onCrop,
  }: {
    options?: ImageUploadOptions;
    cropConfig?: CropConfig;
    value?: string[];
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    onUpload?: (detail: { files: UploadedFile[] }) => void;
    onComplete?: (detail: { files: UploadedFile[] }) => void;
    onError?: (detail: { error: string; file?: UploadedFile }) => void;
    onRemove?: (detail: { file: UploadedFile }) => void;
    onPreview?: (detail: { file: UploadedFile }) => void;
    onCrop?: (detail: { file: UploadedFile; config: CropConfig }) => void;
  } = $props();

  // Default options
  const defaultOptions: ImageUploadOptions = {
    maxFiles: 10,
    maxFileSize: 10, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    uploadPath: 'uploads',
    autoUpload: true,
    showPreview: true,
    showProgress: true,
    enableCrop: false,
    enableResize: true,
    thumbnailSize: { width: 200, height: 200 },
    quality: 0.8,
    dragAndDrop: true,
    ...options
  };

  // State
  let files = $state<UploadedFile[]>([]);
  let fileInput: HTMLInputElement;
  let dragCounter = $state(0);
  let isDragging = $state(false);
  let isProcessing = $state(false);
  let selectedFile = $state<UploadedFile | null>(null);
  let showCropModal = $state(false);

  // Functions
  function generateFileId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!defaultOptions.allowedTypes!.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${defaultOptions.allowedTypes!.join(', ')}`
      };
    }

    // Check file size
    const maxSizeBytes = defaultOptions.maxFileSize! * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum allowed size of ${defaultOptions.maxFileSize}MB`
      };
    }

    return { valid: true };
  }

  async function createPreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = src;
    });
  }

  async function resizeImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        }, file.type, quality);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async function processFile(file: File): Promise<UploadedFile> {
    const id = generateFileId();
    const preview = await createPreview(file);
    const dimensions = await getImageDimensions(preview);

    let processedFile = file;

    // Resize if enabled and needed
    if (defaultOptions.enableResize && defaultOptions.thumbnailSize) {
      const { width: maxWidth, height: maxHeight } = defaultOptions.thumbnailSize;
      if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
        try {
          processedFile = await resizeImage(file, maxWidth, maxHeight, defaultOptions.quality);
        } catch (error) {
          console.warn('Failed to resize image, using original:', error);
        }
      }
    }

    return {
      id,
      file: processedFile,
      preview,
      progress: 0,
      status: 'pending',
      metadata: {
        size: processedFile.size,
        type: processedFile.type,
        width: dimensions.width,
        height: dimensions.height,
        lastModified: processedFile.lastModified
      }
    };
  }

  async function uploadFile(uploadedFile: UploadedFile): Promise<void> {
    try {
      uploadedFile.status = 'uploading';
      files = files.map(f => f.id === uploadedFile.id ? uploadedFile : f);

      const fileName = `${uploadedFile.id}-${uploadedFile.file.name}`;
      const filePath = `${defaultOptions.uploadPath}/${fileName}`;

      // Upload to Firebase Storage with progress tracking
      const url = await storageService.uploadFile(
        uploadedFile.file,
        filePath,
        (progress) => {
          uploadedFile.progress = progress;
          files = files.map(f => f.id === uploadedFile.id ? { ...uploadedFile, progress } : f);
        }
      );

      uploadedFile.url = url;
      uploadedFile.status = 'completed';
      uploadedFile.progress = 100;

      files = files.map(f => f.id === uploadedFile.id ? uploadedFile : f);

      // Update value array
      value = [...value, url];

      toast.success(`${uploadedFile.file.name} uploaded successfully`);

    } catch (error) {
      uploadedFile.status = 'error';
      uploadedFile.error = error instanceof Error ? error.message : 'Upload failed';

      files = files.map(f => f.id === uploadedFile.id ? uploadedFile : f);

      onError?.({ error: uploadedFile.error, file: uploadedFile });
      toast.error(`Failed to upload ${uploadedFile.file.name}: ${uploadedFile.error}`);
    }
  }

  async function handleFileSelect(selectedFiles: FileList | null) {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const currentFileCount = files.length;
    const maxFiles = defaultOptions.maxFiles!;

    // Check file limit
    if (currentFileCount + selectedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - currentFileCount} more files.`);
      return;
    }

    isProcessing = true;
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error!);
        continue;
      }

      try {
        const uploadedFile = await processFile(file);
        newFiles.push(uploadedFile);
      } catch (error) {
        toast.error(`Failed to process ${file.name}: ${error}`);
      }
    }

    files = [...files, ...newFiles];
    isProcessing = false;

    onUpload?.({ files: newFiles });

    // Auto-upload if enabled
    if (defaultOptions.autoUpload) {
      for (const file of newFiles) {
        uploadFile(file);
      }
    }
  }

  function removeFile(fileToRemove: UploadedFile) {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(fileToRemove.preview);

    // Remove from Firebase Storage if uploaded
    if (fileToRemove.url && fileToRemove.status === 'completed') {
      storageService.deleteFile(fileToRemove.url).catch(console.error);
      value = value.filter(url => url !== fileToRemove.url);
    }

    files = files.filter(f => f.id !== fileToRemove.id);
    onRemove?.({ file: fileToRemove });
  }

  function openFileDialog() {
    if (disabled) return;
    fileInput?.click();
  }

  function openPreview(file: UploadedFile) {
    selectedFile = file;
    onPreview?.({ file });
  }

  function openCropModal(file: UploadedFile) {
    if (!defaultOptions.enableCrop) return;
    selectedFile = file;
    showCropModal = true;
  }

  async function retryUpload(file: UploadedFile) {
    if (file.status !== 'error') return;
    file.status = 'pending';
    file.error = undefined;
    files = [...files];
    await uploadFile(file);
  }

  // Drag and drop handlers
  function handleDragEnter(e: DragEvent) {
    if (!defaultOptions.dragAndDrop || disabled) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    isDragging = true;
  }

  function handleDragLeave(e: DragEvent) {
    if (!defaultOptions.dragAndDrop || disabled) return;
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter === 0) {
      isDragging = false;
    }
  }

  function handleDragOver(e: DragEvent) {
    if (!defaultOptions.dragAndDrop || disabled) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: DragEvent) {
    if (!defaultOptions.dragAndDrop || disabled) return;
    e.preventDefault();
    e.stopPropagation();

    isDragging = false;
    dragCounter = 0;

    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles) {
      handleFileSelect(droppedFiles);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function getStatusColor(status: UploadedFile['status']): string {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'uploading': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  function getStatusIcon(status: UploadedFile['status']) {
    switch (status) {
      case 'completed': return Check;
      case 'uploading': return Upload;
      case 'error': return AlertTriangle;
      default: return FileText;
    }
  }
</script>

<div class="image-upload {className}">
  <!-- Hidden file input -->
  <input
    bind:this={fileInput}
    type="file"
    multiple={defaultOptions.maxFiles! > 1}
    accept={defaultOptions.allowedTypes!.join(',')}
    class="hidden"
    onchange={(e) => handleFileSelect(e.currentTarget.files)}
    {disabled}
  />

  <!-- Drop Zone -->
  <Card
    class="border-2 border-dashed transition-colors cursor-pointer {isDragging ? 'border-primary bg-primary/5' : ''} {!isDragging && !disabled ? 'border-gray-300' : ''} {disabled ? 'border-gray-200 cursor-not-allowed' : ''}"
    onclick={openFileDialog}
    ondragenter={handleDragEnter}
    ondragleave={handleDragLeave}
    ondragover={handleDragOver}
    ondrop={handleDrop}
  >
    <CardContent class="flex flex-col items-center justify-center p-8 text-center">
      {#if isProcessing}
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p class="text-sm text-gray-600">Processing files...</p>
      {:else}
        <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          {#if defaultOptions.dragAndDrop}
            <Upload class="w-6 h-6 text-gray-400" />
          {:else}
            <Camera class="w-6 h-6 text-gray-400" />
          {/if}
        </div>

        <p class="text-sm font-medium text-gray-900 mb-2">
          {placeholder}
        </p>

        <p class="text-xs text-gray-500">
          {#if defaultOptions.dragAndDrop}
            Drag and drop files here or click to browse
          {:else}
            Click to select files
          {/if}
        </p>

        <div class="mt-2 text-xs text-gray-400">
          <p>Max {defaultOptions.maxFiles} files, {defaultOptions.maxFileSize}MB each</p>
          <p>Supported: {defaultOptions.allowedTypes!.map(t => t.split('/')[1]).join(', ')}</p>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- File List -->
  {#if files.length > 0}
    <div class="mt-6 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-900">
          Files ({files.length}/{defaultOptions.maxFiles})
        </h3>

        <div class="flex items-center gap-2">
          {#if !defaultOptions.autoUpload}
            <Button
              size="sm"
              variant="outline"
              disabled={files.every(f => f.status !== 'pending')}
              onclick={() => files.filter(f => f.status === 'pending').forEach(uploadFile)}
            >
              <Upload class="w-4 h-4 mr-1" />
              Upload All
            </Button>
          {/if}

          <Button
            size="sm"
            variant="outline"
            onclick={() => files.forEach(removeFile)}
          >
            <X class="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
      </div>

      {#each files as file}
        <Card class="p-4">
          <div class="flex items-center gap-4">
            <!-- Preview -->
            {#if defaultOptions.showPreview}
              <div
                class="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                onclick={() => openPreview(file)}
              >
                <img
                  src={file.preview}
                  alt={file.file.name}
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-colors flex items-center justify-center">
                  <Eye class="w-4 h-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            {/if}

            <!-- File Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {file.file.name}
                </p>
                <Badge variant="outline" class={getStatusColor(file.status)}>
                  {file.status}
                </Badge>
              </div>

              <div class="mt-1 text-xs text-gray-500">
                {formatFileSize(file.file.size)}
                {#if file.metadata?.width && file.metadata?.height}
                  • {file.metadata.width}x{file.metadata.height}
                {/if}
              </div>

              <!-- Progress Bar -->
              {#if defaultOptions.showProgress && (file.status === 'uploading' || file.progress > 0)}
                <Progress value={file.progress} class="h-1 mt-2" />
              {/if}

              <!-- Error Message -->
              {#if file.error}
                <Alert variant="destructive" class="mt-2">
                  <AlertTriangle class="h-4 w-4" />
                  <AlertDescription class="text-xs">
                    {file.error}
                  </AlertDescription>
                </Alert>
              {/if}
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1">
              {#if file.status === 'completed'}
                <Button size="sm" variant="ghost" onclick={() => openPreview(file)}>
                  <Eye class="w-4 h-4" />
                </Button>

                {#if file.url}
                  <Button size="sm" variant="ghost" onclick={() => window.open(file.url, '_blank')}>
                    <Download class="w-4 h-4" />
                  </Button>
                {/if}

                {#if defaultOptions.enableCrop}
                  <Button size="sm" variant="ghost" onclick={() => openCropModal(file)}>
                    <Crop class="w-4 h-4" />
                  </Button>
                {/if}
              {:else if file.status === 'error'}
                <Button size="sm" variant="ghost" onclick={() => retryUpload(file)}>
                  <RotateCw class="w-4 h-4" />
                </Button>
              {:else if !defaultOptions.autoUpload && file.status === 'pending'}
                <Button size="sm" variant="ghost" onclick={() => uploadFile(file)}>
                  <Upload class="w-4 h-4" />
                </Button>
              {/if}

              <Button size="sm" variant="ghost" onclick={() => removeFile(file)}>
                <X class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- Image Preview Modal -->
{#if selectedFile}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <Card class="max-w-4xl max-h-[90vh] overflow-hidden">
      <CardContent class="p-0">
        <div class="relative">
          <img
            src={selectedFile.preview}
            alt={selectedFile.file.name}
            class="w-full h-auto max-h-[80vh] object-contain"
          />

          <Button
            size="sm"
            variant="ghost"
            class="absolute top-2 right-2 bg-white bg-opacity-75"
            onclick={() => selectedFile = null}
          >
            <X class="w-4 h-4" />
          </Button>
        </div>

        <div class="p-4 border-t">
          <h3 class="font-medium">{selectedFile.file.name}</h3>
          <p class="text-sm text-gray-500 mt-1">
            {formatFileSize(selectedFile.file.size)}
            {#if selectedFile.metadata?.width && selectedFile.metadata?.height}
              • {selectedFile.metadata.width}x{selectedFile.metadata.height}
            {/if}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
{/if}