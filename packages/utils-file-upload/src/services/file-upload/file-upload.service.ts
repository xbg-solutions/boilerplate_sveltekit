/**
 * Enhanced File Upload Service
 * 
 * Provides advanced file upload capabilities with progress tracking,
 * image optimization, drag & drop support, and batch operations.
 */

import { writable, type Writable } from 'svelte/store';
import { uploadFile, deleteFile, type UploadResult, type UploadProgress } from '../../utils/firebase-storage';
import { loggerService, toastService } from '@xbg.solutions/frontend-core';

export interface FileUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  progress: number;
  result?: UploadResult;
  error?: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

export interface FileUploadOptions {
  resourceType: string;
  resourceId: string;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  autoUpload?: boolean;
  generateThumbnails?: boolean;
  resizeImages?: boolean;
  compressionQuality?: number;
  onComplete?: (results: UploadResult[]) => void;
  onError?: (error: string) => void;
}

export interface BatchUploadResult {
  successful: UploadResult[];
  failed: Array<{ file: File; error: string }>;
  cancelled: File[];
}

export class FileUploadService {
  private uploads: Writable<Map<string, FileUploadItem>> = writable(new Map());
  private logger = loggerService.withContext('FileUploadService');

  /**
   * Generate unique ID for upload item
   */
  private generateId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate file against options
   */
  private validateFile(file: File, options: FileUploadOptions): { valid: boolean; error?: string } {
    // Check file size
    const maxSize = (options.maxFileSize || 50) * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size of ${options.maxFileSize || 50}MB`
      };
    }

    // Check file type
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      if (!options.allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Generate thumbnail for image files
   */
  private async generateThumbnail(file: File): Promise<string | undefined> {
    if (!file.type.startsWith('image/')) {
      return undefined;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set thumbnail size
          const maxSize = 150;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress and resize image if needed
   */
  private async processImage(file: File, options: FileUploadOptions): Promise<File> {
    if (!file.type.startsWith('image/') || !options.resizeImages) {
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Max dimensions for resizing
          const maxWidth = 1920;
          const maxHeight = 1080;
          let { width, height } = img;
          
          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                });
                resolve(processedFile);
              } else {
                resolve(file);
              }
            },
            file.type,
            options.compressionQuality || 0.8
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Add files to upload queue
   */
  async addFiles(files: File[], options: FileUploadOptions): Promise<string[]> {
    const fileIds: string[] = [];
    const currentUploads = new Map();
    
    // Get current uploads count
    this.uploads.subscribe(uploads => {
      uploads.forEach((upload, id) => {
        if (upload.status !== 'completed' && upload.status !== 'error' && upload.status !== 'cancelled') {
          currentUploads.set(id, upload);
        }
      });
    })();

    // Check max files limit
    if (options.maxFiles && currentUploads.size + files.length > options.maxFiles) {
      throw new Error(`Maximum ${options.maxFiles} files allowed. Current: ${currentUploads.size}`);
    }

    for (const file of files) {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        toastService.error(validation.error!);
        continue;
      }

      const id = this.generateId();
      fileIds.push(id);

      // Process file (resize/compress if needed)
      let processedFile: File;
      try {
        processedFile = await this.processImage(file, options);
      } catch (error) {
        this.logger.error('Failed to process image', error instanceof Error ? error : undefined);
        processedFile = file;
      }

      // Generate thumbnail
      let thumbnail: string | undefined;
      if (options.generateThumbnails) {
        try {
          thumbnail = await this.generateThumbnail(processedFile);
        } catch (error) {
          this.logger.error('Failed to generate thumbnail', error instanceof Error ? error : undefined);
        }
      }

      // Create upload item
      const uploadItem: FileUploadItem = {
        id,
        file: processedFile,
        status: 'pending',
        progress: 0,
        thumbnail,
        metadata: {
          originalSize: file.size,
          processedSize: processedFile.size,
          compressionRatio: processedFile.size / file.size
        }
      };

      // Add to store
      this.uploads.update(uploads => {
        uploads.set(id, uploadItem);
        return uploads;
      });

      // Auto-upload if enabled
      if (options.autoUpload) {
        this.uploadFile(id, options);
      }
    }

    return fileIds;
  }

  /**
   * Upload a single file
   */
  async uploadFile(id: string, options: FileUploadOptions): Promise<UploadResult | null> {
    let uploadItem: FileUploadItem | undefined;
    
    this.uploads.subscribe(uploads => {
      uploadItem = uploads.get(id);
    })();

    if (!uploadItem) {
      throw new Error(`Upload item with ID ${id} not found`);
    }

    if (uploadItem.status !== 'pending') {
      return uploadItem.result || null;
    }

    try {
      // Update status to uploading
      this.uploads.update(uploads => {
        const item = uploads.get(id)!;
        item.status = 'uploading';
        item.progress = 0;
        uploads.set(id, item);
        return uploads;
      });

      const result = await uploadFile(uploadItem.file, {
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        onProgress: (progress: UploadProgress) => {
          this.uploads.update(uploads => {
            const item = uploads.get(id)!;
            item.progress = progress.percentage;
            uploads.set(id, item);
            return uploads;
          });
        },
        metadata: {
          uploadId: id,
          ...uploadItem.metadata
        }
      });

      // Update status to completed
      this.uploads.update(uploads => {
        const item = uploads.get(id)!;
        item.status = 'completed';
        item.progress = 100;
        item.result = result;
        uploads.set(id, item);
        return uploads;
      });

      this.logger.info('File uploaded successfully', {
        uploadId: id,
        fileName: uploadItem.file.name,
        downloadURL: result.downloadURL
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      // Update status to error
      this.uploads.update(uploads => {
        const item = uploads.get(id)!;
        item.status = 'error';
        item.error = errorMessage;
        uploads.set(id, item);
        return uploads;
      });

      this.logger.error('File upload failed', error instanceof Error ? error : undefined, {
        uploadId: id,
        fileName: uploadItem.file.name
      });

      throw error;
    }
  }

  /**
   * Upload all pending files
   */
  async uploadAll(options: FileUploadOptions): Promise<BatchUploadResult> {
    const result: BatchUploadResult = {
      successful: [],
      failed: [],
      cancelled: []
    };

    const pendingUploads: string[] = [];
    
    this.uploads.subscribe(uploads => {
      uploads.forEach((upload, id) => {
        if (upload.status === 'pending') {
          pendingUploads.push(id);
        }
      });
    })();

    // Upload files in parallel (with concurrency limit)
    const concurrency = 3;
    const chunks = [];
    for (let i = 0; i < pendingUploads.length; i += concurrency) {
      chunks.push(pendingUploads.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(async (id) => {
          try {
            const uploadResult = await this.uploadFile(id, options);
            if (uploadResult) {
              result.successful.push(uploadResult);
            }
          } catch (error) {
            let uploadItem: FileUploadItem | undefined;
            this.uploads.subscribe(uploads => {
              uploadItem = uploads.get(id);
            })();

            if (uploadItem) {
              result.failed.push({
                file: uploadItem.file,
                error: error instanceof Error ? error.message : 'Upload failed'
              });
            }
          }
        })
      );
    }

    // Call completion callback
    if (options.onComplete) {
      options.onComplete(result.successful);
    }

    return result;
  }

  /**
   * Cancel an upload
   */
  cancelUpload(id: string): void {
    this.uploads.update(uploads => {
      const item = uploads.get(id);
      if (item && (item.status === 'pending' || item.status === 'uploading')) {
        item.status = 'cancelled';
        uploads.set(id, item);
      }
      return uploads;
    });
  }

  /**
   * Remove an upload item
   */
  removeUpload(id: string): void {
    this.uploads.update(uploads => {
      uploads.delete(id);
      return uploads;
    });
  }

  /**
   * Clear all uploads
   */
  clearAll(): void {
    this.uploads.update(() => new Map());
  }

  /**
   * Get upload items store
   */
  getUploads(): Writable<Map<string, FileUploadItem>> {
    return this.uploads;
  }

  /**
   * Retry failed upload
   */
  async retryUpload(id: string, options: FileUploadOptions): Promise<UploadResult | null> {
    this.uploads.update(uploads => {
      const item = uploads.get(id);
      if (item && item.status === 'error') {
        item.status = 'pending';
        item.error = undefined;
        uploads.set(id, item);
      }
      return uploads;
    });

    return this.uploadFile(id, options);
  }

  /**
   * Delete uploaded file from storage
   */
  async deleteUpload(id: string): Promise<void> {
    let uploadItem: FileUploadItem | undefined;
    
    this.uploads.subscribe(uploads => {
      uploadItem = uploads.get(id);
    })();

    if (!uploadItem || !uploadItem.result) {
      throw new Error('Upload item not found or not completed');
    }

    try {
      await deleteFile(uploadItem.result.storagePath);
      this.removeUpload(id);
      
      this.logger.info('File deleted successfully', {
        uploadId: id,
        storagePath: uploadItem.result.storagePath
      });
      
    } catch (error) {
      this.logger.error('Failed to delete file', error instanceof Error ? error : undefined, {
        uploadId: id,
        storagePath: uploadItem.result?.storagePath
      });
      throw error;
    }
  }

  /**
   * Get upload statistics
   */
  getStats(): {
    total: number;
    pending: number;
    uploading: number;
    completed: number;
    error: number;
    cancelled: number;
    totalSize: number;
    completedSize: number;
  } {
    let stats = {
      total: 0,
      pending: 0,
      uploading: 0,
      completed: 0,
      error: 0,
      cancelled: 0,
      totalSize: 0,
      completedSize: 0
    };

    this.uploads.subscribe(uploads => {
      uploads.forEach(upload => {
        stats.total++;
        stats.totalSize += upload.file.size;
        
        if (upload.status === 'completed') {
          stats.completedSize += upload.file.size;
        }
        
        stats[upload.status]++;
      });
    })();

    return stats;
  }

  /**
   * Format file size utility
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();