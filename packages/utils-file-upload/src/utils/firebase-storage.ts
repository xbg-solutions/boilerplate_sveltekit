/**
 * src/lib/utils/firebase-storage.ts
 * Firebase Storage utility for file uploads and management
 * 
 * Handles direct uploads to Firebase Storage with progress tracking,
 * path generation, and integration with the existing Firebase utility.
 */

import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  type StorageReference,
  type UploadTaskSnapshot,
  type UploadTask
} from 'firebase/storage';
import { getFirebaseApp, FirebaseError, loggerService } from '@xbg.solutions/frontend-core';

// Create logger for storage operations
const storageLogger = loggerService.withContext('FirebaseStorage');

/**
 * File upload progress information
 */
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

/**
 * Upload options
 */
export interface UploadOptions {
  resourceType: string;
  resourceId: string;
  onProgress?: (progress: UploadProgress) => void;
  metadata?: Record<string, string>;
}

/**
 * Upload result
 */
export interface UploadResult {
  storagePath: string;
  downloadURL: string;
  fileName: string;
  contentType: string;
  size: number;
}

/**
 * Generates a storage path following the required structure:
 * uploads/{resourceType}/{resourceId}/{timestamp}-{sanitizedFileName}
 */
function generateStoragePath(resourceType: string, resourceId: string, fileName: string): string {
  const timestamp = Date.now();
  
  // Sanitize filename - keep only alphanumeric, dots, hyphens, and underscores
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Build path with user segregation
  return `uploads/${resourceType}/${resourceId}/${timestamp}-${sanitizedFileName}`;
}

/**
 * Validates file before upload
 */
function validateFile(file: File): void {
  // Check file size (50MB limit to match backend)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    throw new FirebaseError(`File size exceeds 50MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`, {
      userMessage: 'The selected file is too large. Please choose a file smaller than 50MB.',
      action: 'validateFile'
    });
  }

  // Check if file has a valid type
  if (!file.type) {
    throw new FirebaseError('File type could not be determined', {
      userMessage: 'The selected file type is not supported.',
      action: 'validateFile'
    });
  }

  // Validate allowed file types (matching form accept attribute)
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new FirebaseError(`File type '${file.type}' is not allowed`, {
      userMessage: 'This file type is not supported. Please select a PDF, Office document, text file, or image.',
      action: 'validateFile'
    });
  }
}

/**
 * Uploads a file to Firebase Storage
 */
export async function uploadFile(
  file: File, 
  options: UploadOptions
): Promise<UploadResult> {
  const timerId = storageLogger.startTimer('FileUpload');
  
  try {
    // Validate file
    validateFile(file);
    
    // Get Firebase app and storage
    const app = await getFirebaseApp();
    const storage = getStorage(app);
    
    // Generate storage path
    const storagePath = generateStoragePath(options.resourceType, options.resourceId, file.name);
    const storageRef = ref(storage, storagePath);
    
    storageLogger.info('Starting file upload', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storagePath,
      resourceType: options.resourceType,
      resourceId: options.resourceId
    });
    
    // Create upload task with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        uploadedAt: new Date().toISOString(),
        ...options.metadata
      }
    };
    
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    // Return promise that resolves when upload completes
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          // Calculate progress
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            state: snapshot.state as UploadProgress['state']
          };
          
          // Call progress callback if provided
          if (options.onProgress) {
            options.onProgress(progress);
          }
          
          storageLogger.info('Upload progress', {
            fileName: file.name,
            progress: progress.percentage,
            state: progress.state
          });
        },
        (error) => {
          storageLogger.endTimer(timerId);
          storageLogger.error('File upload failed', error, {
            fileName: file.name,
            storagePath
          });
          
          reject(new FirebaseError('File upload failed', {
            cause: error,
            userMessage: 'Failed to upload file. Please try again.',
            action: 'uploadFile',
            context: { fileName: file.name, storagePath }
          }));
        },
        async () => {
          try {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            const result: UploadResult = {
              storagePath,
              downloadURL,
              fileName: file.name,
              contentType: file.type,
              size: file.size
            };
            
            storageLogger.endTimer(timerId);
            storageLogger.info('File upload completed', {
              fileName: file.name,
              storagePath,
              downloadURL,
              size: file.size
            });
            
            resolve(result);
          } catch (error) {
            storageLogger.endTimer(timerId);
            storageLogger.error('Failed to get download URL', error instanceof Error ? error : undefined, {
              fileName: file.name,
              storagePath
            });
            
            reject(new FirebaseError('Failed to get download URL', {
              cause: error instanceof Error ? error : undefined,
              userMessage: 'Upload completed but failed to generate access URL. Please try again.',
              action: 'getDownloadURL'
            }));
          }
        }
      );
    });
  } catch (error) {
    storageLogger.endTimer(timerId);
    
    if (error instanceof FirebaseError) {
      throw error;
    }
    
    throw new FirebaseError('Failed to start file upload', {
      cause: error instanceof Error ? error : undefined,
      userMessage: 'Failed to start file upload. Please try again.',
      action: 'uploadFile',
      context: { fileName: file.name }
    });
  }
}

/**
 * Deletes a file from Firebase Storage
 */
export async function deleteFile(storagePath: string): Promise<void> {
  try {
    const app = await getFirebaseApp();
    const storage = getStorage(app);
    const storageRef = ref(storage, storagePath);
    
    await deleteObject(storageRef);
    
    storageLogger.info('File deleted successfully', { storagePath });
  } catch (error) {
    storageLogger.error('Failed to delete file', error instanceof Error ? error : undefined, {
      storagePath
    });
    
    throw new FirebaseError('Failed to delete file', {
      cause: error instanceof Error ? error : undefined,
      userMessage: 'Failed to delete file. Please try again.',
      action: 'deleteFile',
      context: { storagePath }
    });
  }
}

/**
 * Gets a download URL for a file
 */
export async function getFileDownloadURL(storagePath: string): Promise<string> {
  try {
    const app = await getFirebaseApp();
    const storage = getStorage(app);
    const storageRef = ref(storage, storagePath);
    
    return await getDownloadURL(storageRef);
  } catch (error) {
    storageLogger.error('Failed to get download URL', error instanceof Error ? error : undefined, {
      storagePath
    });
    
    throw new FirebaseError('Failed to get download URL', {
      cause: error instanceof Error ? error : undefined,
      userMessage: 'Failed to generate download link. Please try again.',
      action: 'getDownloadURL',
      context: { storagePath }
    });
  }
}

/**
 * Utility to check if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Utility to format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Default export with all functions
 */
export default {
  uploadFile,
  deleteFile,
  getFileDownloadURL,
  isImageFile,
  formatFileSize,
  generateStoragePath
};