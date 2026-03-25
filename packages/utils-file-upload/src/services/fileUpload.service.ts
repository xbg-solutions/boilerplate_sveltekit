/**
 * src/lib/services/file-handling/fileUpload.service.ts
 * Complete file upload service handling Firebase Storage + backend metadata
 * 
 * Orchestrates the full upload flow:
 * 1. Upload file to Firebase Storage
 * 2. Store metadata via backend API
 * 3. Poll for processing status
 * 4. Handle errors and retries
 * 
 * This all needs to be cleaned up to use constants, etc. At the moment it's using values (e.g. nmeta ddata and permission rules, etc) that are relevant to the my.xbg site)
 * 
 */

import { uploadFile, type UploadOptions, type UploadResult, type UploadProgress } from '../utils/firebase-storage';
import { apiService } from '@xbg.solutions/utils-api-client';
import { loggerService } from '@xbg.solutions/frontend-core';
import { AppError } from '@xbg.solutions/frontend-core';

// Create logger for file upload service
const uploadLogger = loggerService.withContext('FileUploadService');

/**
 * File metadata for backend storage
 */
export interface FileMetadata {
  fileName: string;
  originalFilename: string;
  description?: string;
  contentType: string;
  type: string; // user-selected category
  size: number;
  storagePath: string;
  downloadURL: string;
  resourceType: string;
  resourceId: string;
  tags: string[];
  accessLevel: 'me_and_admins' | 'my_account' | 'this_engagement';
  consultantsCanAccess: boolean;
}

/**
 * Upload status from backend
 */
export interface FileUploadStatus {
  id: string;
  status: 'processing' | 'active' | 'error';
  processingStage?: string;
  processingProgress?: number;
  error?: string;
}

/**
 * Complete upload progress tracking
 */
export interface CompleteUploadProgress {
  fileId?: string;
  fileName: string;
  phase: 'uploading' | 'storing-metadata' | 'processing' | 'complete' | 'error';
  uploadProgress?: UploadProgress;
  processingProgress?: number;
  processingStage?: string;
  error?: string;
}

/**
 * Upload options for the complete flow
 */
export interface CompleteUploadOptions {
  resourceType: string;
  resourceId: string;
  description?: string;
  fileType: string; // user-selected category
  tags: string[];
  accessLevel: 'me_and_admins' | 'my_account' | 'this_engagement';
  consultantsCanAccess: boolean;
  onProgress?: (progress: CompleteUploadProgress) => void;
}

/**
 * File upload service class
 */
export class FileUploadService {
  /**
   * Store file metadata via backend API
   */
  private async storeFileMetadata(metadata: FileMetadata): Promise<{ id: string }> {
    try {
      const result = await apiService.post(`/file-management/metadata`, {
        fileName: metadata.fileName,
        originalFilename: metadata.originalFilename,
        description: metadata.description,
        contentType: metadata.contentType,
        type: metadata.type,
        size: metadata.size,
        storagePath: metadata.storagePath,
        downloadURL: metadata.downloadURL,
        resourceType: metadata.resourceType,  // ← Add this
        resourceId: metadata.resourceId,      // ← Add this  
        tags: metadata.tags.join(','),
        accessLevel: metadata.accessLevel,
        consultantsCanAccess: metadata.consultantsCanAccess
      });

      // Handle both success wrapper and direct data response patterns
      const fileId = (result as any).data?.id || (result as any).id;
      return { id: fileId };
    } catch (error) {
      uploadLogger.error('Failed to store file metadata', error instanceof Error ? error : undefined, {
        metadata
      });
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('Failed to store file metadata', {
        category: 'api',
        cause: error instanceof Error ? error : undefined,
        userMessage: 'Failed to save file information. Please try again.'
      });
    }
  }

  /**
   * Poll file processing status
   */
  private async pollFileStatus(fileId: string): Promise<FileUploadStatus> {
    try {
      const result = await apiService.get(`/files/${fileId}/status`);
      
      // Handle both success wrapper and direct data response patterns
      return (result as any).data || (result as FileUploadStatus);
    } catch (error) {
      uploadLogger.error('Failed to poll file status', error instanceof Error ? error : undefined, {
        fileId
      });
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('Failed to check file status', {
        category: 'api',
        cause: error instanceof Error ? error : undefined,
        userMessage: 'Failed to check file processing status.'
      });
    }
  }

  /**
   * Wait for file processing to complete
   */
  private async waitForProcessingComplete(
    fileId: string, 
    onProgress?: (progress: CompleteUploadProgress) => void,
    fileName: string = 'file'
  ): Promise<void> {
    const maxAttempts = 60; // 5 minutes max (5 second intervals)
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await this.pollFileStatus(fileId);
        
        // Update progress
        if (onProgress) {
          onProgress({
            fileId,
            fileName,
            phase: 'processing',
            processingProgress: status.processingProgress,
            processingStage: status.processingStage
          });
        }

        // Check if processing is complete
        if (status.status === 'active') {
          uploadLogger.info('File processing completed', { fileId, fileName });
          return;
        }

        if (status.status === 'error') {
          throw new AppError(`File processing failed: ${status.error}`, {
            category: 'processing',
            userMessage: 'File processing failed. Please try uploading again.',
            context: { fileId, error: status.error }
          });
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        
        // For network errors, wait and retry
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }

    // Timeout reached
    throw new AppError('File processing timeout', {
      category: 'processing',
      userMessage: 'File processing is taking longer than expected. The file may still be processed in the background.',
      context: { fileId, attempts }
    });
  }

  /**
   * Upload a single file with complete flow
   */
  async uploadFile(file: File, options: CompleteUploadOptions): Promise<string> {
    const timerId = uploadLogger.startTimer('CompleteFileUpload');
    let fileId: string | undefined;

    try {
      uploadLogger.info('Starting complete file upload', {
        fileName: file.name,
        fileSize: file.size,
        resourceType: options.resourceType,
        resourceId: options.resourceId
      });

      // Phase 1: Upload to Firebase Storage
      if (options.onProgress) {
        options.onProgress({
          fileName: file.name,
          phase: 'uploading'
        });
      }

      const uploadResult = await uploadFile(file, {
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        onProgress: (uploadProgress) => {
          if (options.onProgress) {
            options.onProgress({
              fileName: file.name,
              phase: 'uploading',
              uploadProgress
            });
          }
        }
      });

      uploadLogger.info('Firebase upload completed', {
        fileName: file.name,
        storagePath: uploadResult.storagePath
      });

      // Phase 2: Store metadata
      if (options.onProgress) {
        options.onProgress({
          fileName: file.name,
          phase: 'storing-metadata'
        });
      }

      const metadata: FileMetadata = {
        fileName: file.name,
        originalFilename: file.name,
        description: options.description,
        contentType: uploadResult.contentType,
        type: options.fileType,
        size: uploadResult.size,
        storagePath: uploadResult.storagePath,
        downloadURL: uploadResult.downloadURL,
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        tags: options.tags,
        accessLevel: options.accessLevel,
        consultantsCanAccess: options.consultantsCanAccess
      };

      const metadataResult = await this.storeFileMetadata(metadata);
      fileId = metadataResult.id;

      uploadLogger.info('Metadata stored successfully', {
        fileName: file.name,
        fileId
      });

      // Phase 3: Wait for processing (optional - file is usable immediately)
      if (options.onProgress) {
        options.onProgress({
          fileId,
          fileName: file.name,
          phase: 'processing',
          processingProgress: 0,
          processingStage: 'initializing'
        });
      }

      // Start processing check but don't wait for it to complete
      // This allows the file to be immediately available while processing happens in background
      this.waitForProcessingComplete(fileId, options.onProgress, file.name).catch(error => {
        uploadLogger.warn('Background processing check failed', {
          fileId,
          fileName: file.name,
          error: error.message
        });
      });

      // Phase 4: Complete
      if (options.onProgress) {
        options.onProgress({
          fileId,
          fileName: file.name,
          phase: 'complete'
        });
      }

      uploadLogger.endTimer(timerId);
      uploadLogger.info('Complete file upload finished', {
        fileName: file.name,
        fileId
      });

      return fileId;
    } catch (error) {
      uploadLogger.endTimer(timerId);
      uploadLogger.error('Complete file upload failed', error instanceof Error ? error : undefined, {
        fileName: file.name,
        fileId
      });

      // Update progress with error
      if (options.onProgress) {
        options.onProgress({
          fileId,
          fileName: file.name,
          phase: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        });
      }

      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], options: CompleteUploadOptions): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, {
      ...options,
      onProgress: options.onProgress // Each file will call progress individually
    }));

    return Promise.all(uploadPromises);
  }

  /**
   * Get file status
   */
  async getFileStatus(fileId: string): Promise<FileUploadStatus> {
    return this.pollFileStatus(fileId);
  }

  /**
   * Get files for a resource
   */
  async getFiles(resourceType: string, resourceId: string, filters?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ files: any[], pagination: any }> {
    try {
      // Use correct file-management endpoints based on resource type
      const endpoint = resourceType === 'accounts' 
        ? `/file-management/account/${resourceId}`
        : `/file-management/resource/${resourceType}/${resourceId}`;
        
      const result = await apiService.get(endpoint, {
        params: filters
      });

      // Handle both success wrapper and direct data response patterns
      return {
        files: (result as any).data?.items || (result as any).data || (result as any[]),
        pagination: (result as any).pagination || {}
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('Failed to get files', {
        category: 'api',
        cause: error instanceof Error ? error : undefined,
        userMessage: 'Failed to load files. Please try again.'
      });
    }
  }
}

// Create and export a singleton instance
export const fileUploadService = new FileUploadService();

// Export default for convenience
export default fileUploadService;