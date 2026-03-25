/**
 * Storage Service
 * 
 * Unified interface for file storage operations
 */

import { uploadFile, deleteFile, getFileDownloadURL, type UploadResult, type UploadProgress } from '../utils/firebase-storage';
import { fileUploadService, type FileUploadOptions, type BatchUploadResult } from './file-upload/file-upload.service';

export interface StorageUploadOptions {
  resourceType: string;
  resourceId: string;
  onProgress?: (progress: UploadProgress) => void;
  metadata?: Record<string, string>;
}

/**
 * Storage service for file operations
 */
class StorageService {
  /**
   * Upload a single file directly
   */
  async uploadFile(file: File, filePath: string, onProgress?: (progress: number) => void): Promise<string> {
    // Extract resource info from file path
    const pathParts = filePath.split('/');
    const resourceType = pathParts[0] || 'uploads';
    const resourceId = pathParts[1] || 'default';

    const result = await uploadFile(file, {
      resourceType,
      resourceId,
      onProgress: (progress) => {
        if (onProgress) {
          onProgress(progress.percentage);
        }
      }
    });

    return result.downloadURL;
  }

  /**
   * Upload multiple files with enhanced features
   */
  async uploadMultiple(files: File[], options: FileUploadOptions): Promise<BatchUploadResult> {
    const fileIds = await fileUploadService.addFiles(files, {
      ...options,
      autoUpload: false // We'll control the upload process
    });

    return await fileUploadService.uploadAll(options);
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(storagePath: string): Promise<void> {
    return deleteFile(storagePath);
  }

  /**
   * Get download URL for a file
   */
  async getDownloadURL(storagePath: string): Promise<string> {
    return getFileDownloadURL(storagePath);
  }

  /**
   * Get file upload service for advanced operations
   */
  getUploadService() {
    return fileUploadService;
  }
}

export const storageService = new StorageService();