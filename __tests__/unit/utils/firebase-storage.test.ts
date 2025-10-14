/**
 * Firebase Storage Utility Tests
 * 
 * Comprehensive tests for Firebase Storage file upload, validation, and management.
 * These tests focus on business logic: file validation, path generation, progress tracking,
 * error handling, and proper integration with Firebase APIs.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  uploadFile, 
  deleteFile, 
  getFileDownloadURL, 
  isImageFile, 
  formatFileSize,
  type UploadOptions,
  type UploadProgress 
} from '$lib/utils/firebase-storage';

// Mock Firebase Storage
const mockUploadTask = {
  on: vi.fn(),
  snapshot: { ref: { name: 'test-file.pdf' } }
};

const mockStorageRef = { name: 'test-ref' };

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({ name: 'mock-storage' })),
  ref: vi.fn(() => mockStorageRef),
  uploadBytesResumable: vi.fn(() => mockUploadTask),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn()
}));

// Mock Firebase utility
vi.mock('$lib/utils/firebase', () => ({
  getFirebaseApp: vi.fn().mockResolvedValue({ name: 'mock-app' }),
  FirebaseError: class extends Error {
    constructor(message: string, options: any = {}) {
      super(message);
      this.name = 'FirebaseError';
      Object.assign(this, options);
    }
  }
}));

// Mock logger service
vi.mock('$lib/services/logging/logging.service', () => ({
  loggerService: {
    withContext: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      startTimer: vi.fn(() => 'timer-id'),
      endTimer: vi.fn()
    }))
  }
}));

describe('Firebase Storage Utility', () => {
  let mockGetStorage: any;
  let mockRef: any;
  let mockUploadBytesResumable: any;
  let mockGetDownloadURL: any;
  let mockDeleteObject: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get mocked functions
    const { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } = await import('firebase/storage');
    mockGetStorage = vi.mocked(getStorage);
    mockRef = vi.mocked(ref);
    mockUploadBytesResumable = vi.mocked(uploadBytesResumable);
    mockGetDownloadURL = vi.mocked(getDownloadURL);
    mockDeleteObject = vi.mocked(deleteObject);
    
    // Reset upload task mock
    mockUploadTask.on.mockClear();
  });

  describe('File Validation', () => {
    it('should reject files exceeding 50MB limit', async () => {
      const largeMockFile = {
        name: 'large-file.pdf',
        size: 51 * 1024 * 1024, // 51MB
        type: 'application/pdf'
      } as File;

      const uploadOptions: UploadOptions = {
        resourceType: 'documents',
        resourceId: 'user123'
      };

      await expect(uploadFile(largeMockFile, uploadOptions))
        .rejects
        .toThrow('File size exceeds 50MB limit');
    });

    it('should accept files under 50MB limit', async () => {
      const validMockFile = {
        name: 'valid-file.pdf',
        size: 10 * 1024 * 1024, // 10MB
        type: 'application/pdf'
      } as File;

      const uploadOptions: UploadOptions = {
        resourceType: 'documents',
        resourceId: 'user123'
      };

      // Mock successful upload flow
      mockUploadTask.on.mockImplementation((event, onProgress, onError, onComplete) => {
        if (event === 'state_changed') {
          // Simulate progress
          onProgress({
            bytesTransferred: 5 * 1024 * 1024,
            totalBytes: 10 * 1024 * 1024,
            state: 'running'
          });
          // Simulate completion
          setTimeout(() => onComplete(), 0);
        }
      });

      mockGetDownloadURL.mockResolvedValue('https://storage.googleapis.com/test/file.pdf');

      await expect(uploadFile(validMockFile, uploadOptions)).resolves.toBeDefined();
    });

    it('should reject files without type', async () => {
      const noTypeMockFile = {
        name: 'no-type-file',
        size: 1024,
        type: ''
      } as File;

      const uploadOptions: UploadOptions = {
        resourceType: 'documents',
        resourceId: 'user123'
      };

      await expect(uploadFile(noTypeMockFile, uploadOptions))
        .rejects
        .toThrow('File type could not be determined');
    });

    it('should reject unsupported file types', async () => {
      const unsupportedFile = {
        name: 'virus.exe',
        size: 1024,
        type: 'application/octet-stream'
      } as File;

      const uploadOptions: UploadOptions = {
        resourceType: 'documents',
        resourceId: 'user123'
      };

      await expect(uploadFile(unsupportedFile, uploadOptions))
        .rejects
        .toThrow('File type \'application/octet-stream\' is not allowed');
    });

    it('should accept all supported file types', async () => {
      const supportedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];

      // Mock successful upload for all types
      mockUploadTask.on.mockImplementation((event, onProgress, onError, onComplete) => {
        if (event === 'state_changed') {
          setTimeout(() => onComplete(), 0);
        }
      });
      mockGetDownloadURL.mockResolvedValue('https://storage.googleapis.com/test/file');

      for (const type of supportedTypes) {
        const mockFile = {
          name: `test-file.${type.split('/')[1]}`,
          size: 1024,
          type
        } as File;

        const uploadOptions: UploadOptions = {
          resourceType: 'documents',
          resourceId: 'user123'
        };

        await expect(uploadFile(mockFile, uploadOptions)).resolves.toBeDefined();
      }
    });
  });

  describe('Storage Path Generation', () => {
    it('should generate correct storage path structure', async () => {
      const mockFile = {
        name: 'test-document.pdf',
        size: 1024,
        type: 'application/pdf'
      } as File;

      const uploadOptions: UploadOptions = {
        resourceType: 'contracts',
        resourceId: 'user456'
      };

      // Mock successful upload
      mockUploadTask.on.mockImplementation((event, onProgress, onError, onComplete) => {
        if (event === 'state_changed') {
          setTimeout(() => onComplete(), 0);
        }
      });
      mockGetDownloadURL.mockResolvedValue('https://storage.googleapis.com/test/file.pdf');

      await uploadFile(mockFile, uploadOptions);

      // Check that ref was called with correct path pattern
      expect(mockRef).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/^uploads\/contracts\/user456\/\d+-test-document\.pdf$/)
      );
    });

    it('should sanitize file names in storage path', async () => {
      const mockFile = {
        name: 'My Document With Spaces & Special!@#Characters.pdf',
        size: 1024,
        type: 'application/pdf'
      } as File;

      const uploadOptions: UploadOptions = {
        resourceType: 'documents',
        resourceId: 'user123'
      };

      // Mock successful upload
      mockUploadTask.on.mockImplementation((event, onProgress, onError, onComplete) => {
        if (event === 'state_changed') {
          setTimeout(() => onComplete(), 0);
        }
      });
      mockGetDownloadURL.mockResolvedValue('https://storage.googleapis.com/test/file.pdf');

      await uploadFile(mockFile, uploadOptions);

      // Check that special characters were replaced with underscores
      expect(mockRef).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/^uploads\/documents\/user123\/\d+-My_Document_With_Spaces___Special___Characters\.pdf$/)
      );
    });
  });

  describe('Upload Progress Tracking', () => {
    it('should call progress callback with correct progress information', async () => {
      const mockFile = {
        name: 'progress-test.pdf',
        size: 1000,
        type: 'application/pdf'
      } as File;

      const progressCallback = vi.fn();

      const uploadOptions: UploadOptions = {
        resourceType: 'documents',
        resourceId: 'user123',
        onProgress: progressCallback
      };

      // Mock upload with progress updates
      mockUploadTask.on.mockImplementation((event, onProgress, onError, onComplete) => {
        if (event === 'state_changed') {
          // Simulate 50% progress
          onProgress({
            bytesTransferred: 500,
            totalBytes: 1000,
            state: 'running'
          });
          
          // Simulate 100% progress
          onProgress({
            bytesTransferred: 1000,
            totalBytes: 1000,
            state: 'success'
          });
          
          setTimeout(() => onComplete(), 0);
        }
      });
      
      mockGetDownloadURL.mockResolvedValue('https://storage.googleapis.com/test/file.pdf');

      await uploadFile(mockFile, uploadOptions);

      expect(progressCallback).toHaveBeenCalledTimes(2);
      
      // Check first progress call (50%)
      expect(progressCallback).toHaveBeenNthCalledWith(1, {
        bytesTransferred: 500,
        totalBytes: 1000,
        percentage: 50,
        state: 'running'
      });
      
      // Check second progress call (100%)
      expect(progressCallback).toHaveBeenNthCalledWith(2, {
        bytesTransferred: 1000,
        totalBytes: 1000,
        percentage: 100,
        state: 'success'
      });
    });

    it('should work without progress callback', async () => {
      const mockFile = {
        name: 'no-callback-test.pdf',
        size: 1000,
        type: 'application/pdf'
      } as File;

      const uploadOptions: UploadOptions = {
        resourceType: 'documents',
        resourceId: 'user123'
        // No onProgress callback
      };

      // Mock successful upload
      mockUploadTask.on.mockImplementation((event, onProgress, onError, onComplete) => {
        if (event === 'state_changed') {
          onProgress({
            bytesTransferred: 1000,
            totalBytes: 1000,
            state: 'success'
          });
          setTimeout(() => onComplete(), 0);
        }
      });
      
      mockGetDownloadURL.mockResolvedValue('https://storage.googleapis.com/test/file.pdf');

      await expect(uploadFile(mockFile, uploadOptions)).resolves.toBeDefined();
    });
  });

  describe('Upload Error Handling', () => {
    it('should handle upload task errors', async () => {
      const mockFile = {
        name: 'error-test.pdf',
        size: 1000,
        type: 'application/pdf'
      } as File;

      const uploadOptions: UploadOptions = {
        resourceType: 'documents',
        resourceId: 'user123'
      };

      // Mock upload error
      mockUploadTask.on.mockImplementation((event, onProgress, onError, onComplete) => {
        if (event === 'state_changed') {
          onError(new Error('Network error'));
        }
      });

      await expect(uploadFile(mockFile, uploadOptions))
        .rejects
        .toThrow('File upload failed');
    });

    it('should handle getDownloadURL errors', async () => {
      const mockFile = {
        name: 'download-error-test.pdf',
        size: 1000,
        type: 'application/pdf'
      } as File;

      const uploadOptions: UploadOptions = {
        resourceType: 'documents',
        resourceId: 'user123'
      };

      // Mock upload success but getDownloadURL failure
      mockUploadTask.on.mockImplementation((event, onProgress, onError, onComplete) => {
        if (event === 'state_changed') {
          setTimeout(() => onComplete(), 0);
        }
      });
      
      mockGetDownloadURL.mockRejectedValue(new Error('Permission denied'));

      await expect(uploadFile(mockFile, uploadOptions))
        .rejects
        .toThrow('Failed to get download URL');
    });
  });

  describe('Upload Metadata', () => {
    it('should include correct metadata in upload', async () => {
      const mockFile = {
        name: 'metadata-test.pdf',
        size: 1000,
        type: 'application/pdf'
      } as File;

      const uploadOptions: UploadOptions = {
        resourceType: 'contracts',
        resourceId: 'user456',
        metadata: {
          category: 'legal',
          confidential: 'true'
        }
      };

      // Mock successful upload
      mockUploadTask.on.mockImplementation((event, onProgress, onError, onComplete) => {
        if (event === 'state_changed') {
          setTimeout(() => onComplete(), 0);
        }
      });
      mockGetDownloadURL.mockResolvedValue('https://storage.googleapis.com/test/file.pdf');

      await uploadFile(mockFile, uploadOptions);

      // Check that uploadBytesResumable was called with correct metadata
      expect(mockUploadBytesResumable).toHaveBeenCalledWith(
        mockStorageRef,
        mockFile,
        expect.objectContaining({
          contentType: 'application/pdf',
          customMetadata: expect.objectContaining({
            originalName: 'metadata-test.pdf',
            resourceType: 'contracts',
            resourceId: 'user456',
            category: 'legal',
            confidential: 'true',
            uploadedAt: expect.any(String)
          })
        })
      );
    });
  });

  describe('File Deletion', () => {
    it('should successfully delete a file', async () => {
      const storagePath = 'uploads/documents/user123/1234567890-test.pdf';
      
      await deleteFile(storagePath);

      expect(mockRef).toHaveBeenCalledWith(expect.anything(), storagePath);
      expect(mockDeleteObject).toHaveBeenCalledWith(mockStorageRef);
    });

    it('should handle deletion errors', async () => {
      const storagePath = 'uploads/documents/user123/nonexistent.pdf';
      
      mockDeleteObject.mockRejectedValue(new Error('File not found'));

      await expect(deleteFile(storagePath))
        .rejects
        .toThrow('Failed to delete file');
    });
  });

  describe('Download URL Generation', () => {
    it('should get download URL for existing file', async () => {
      const storagePath = 'uploads/documents/user123/test.pdf';
      const expectedURL = 'https://storage.googleapis.com/bucket/test.pdf';
      
      mockGetDownloadURL.mockResolvedValue(expectedURL);

      const downloadURL = await getFileDownloadURL(storagePath);

      expect(downloadURL).toBe(expectedURL);
      expect(mockRef).toHaveBeenCalledWith(expect.anything(), storagePath);
      expect(mockGetDownloadURL).toHaveBeenCalledWith(mockStorageRef);
    });

    it('should handle download URL errors', async () => {
      const storagePath = 'uploads/documents/user123/nonexistent.pdf';
      
      mockGetDownloadURL.mockRejectedValue(new Error('File not found'));

      await expect(getFileDownloadURL(storagePath))
        .rejects
        .toThrow('Failed to get download URL');
    });
  });

  describe('Utility Functions', () => {
    describe('isImageFile', () => {
      it('should correctly identify image files', () => {
        const imageFiles = [
          { type: 'image/jpeg' },
          { type: 'image/png' },
          { type: 'image/gif' },
          { type: 'image/webp' }
        ] as File[];

        imageFiles.forEach(file => {
          expect(isImageFile(file)).toBe(true);
        });
      });

      it('should correctly identify non-image files', () => {
        const nonImageFiles = [
          { type: 'application/pdf' },
          { type: 'text/plain' },
          { type: 'application/msword' },
          { type: 'video/mp4' }
        ] as File[];

        nonImageFiles.forEach(file => {
          expect(isImageFile(file)).toBe(false);
        });
      });
    });

    describe('formatFileSize', () => {
      it('should format bytes correctly', () => {
        expect(formatFileSize(0)).toBe('0 B');
        expect(formatFileSize(512)).toBe('512 B');
        expect(formatFileSize(1024)).toBe('1 KB');
        expect(formatFileSize(1536)).toBe('1.5 KB');
        expect(formatFileSize(1024 * 1024)).toBe('1 MB');
        expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
        expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
        expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB');
      });

      it('should handle edge cases', () => {
        expect(formatFileSize(1)).toBe('1 B');
        expect(formatFileSize(1023)).toBe('1023 B');
        expect(formatFileSize(1025)).toBe('1 KB');
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete upload workflow successfully', async () => {
      const mockFile = {
        name: 'integration-test.pdf',
        size: 2 * 1024 * 1024, // 2MB
        type: 'application/pdf'
      } as File;

      const progressCallback = vi.fn();

      const uploadOptions: UploadOptions = {
        resourceType: 'reports',
        resourceId: 'org789',
        onProgress: progressCallback,
        metadata: {
          version: '1.0',
          department: 'finance'
        }
      };

      // Mock complete successful workflow
      mockUploadTask.on.mockImplementation((event, onProgress, onError, onComplete) => {
        if (event === 'state_changed') {
          // Simulate progress updates
          onProgress({
            bytesTransferred: 1024 * 1024,
            totalBytes: 2 * 1024 * 1024,
            state: 'running'
          });
          
          onProgress({
            bytesTransferred: 2 * 1024 * 1024,
            totalBytes: 2 * 1024 * 1024,
            state: 'success'
          });
          
          setTimeout(() => onComplete(), 0);
        }
      });
      
      mockGetDownloadURL.mockResolvedValue('https://storage.googleapis.com/bucket/reports/org789/12345-integration-test.pdf');

      const result = await uploadFile(mockFile, uploadOptions);

      // Verify result structure
      expect(result).toEqual({
        storagePath: expect.stringMatching(/^uploads\/reports\/org789\/\d+-integration-test\.pdf$/),
        downloadURL: 'https://storage.googleapis.com/bucket/reports/org789/12345-integration-test.pdf',
        fileName: 'integration-test.pdf',
        contentType: 'application/pdf',
        size: 2 * 1024 * 1024
      });

      // Verify progress was tracked
      expect(progressCallback).toHaveBeenCalledTimes(2);
      expect(progressCallback).toHaveBeenNthCalledWith(1, {
        bytesTransferred: 1024 * 1024,
        totalBytes: 2 * 1024 * 1024,
        percentage: 50,
        state: 'running'
      });
      
      // Verify Firebase calls
      expect(mockUploadBytesResumable).toHaveBeenCalledWith(
        mockStorageRef,
        mockFile,
        expect.objectContaining({
          contentType: 'application/pdf',
          customMetadata: expect.objectContaining({
            originalName: 'integration-test.pdf',
            resourceType: 'reports',
            resourceId: 'org789',
            version: '1.0',
            department: 'finance'
          })
        })
      );
    });

    it('should handle validation failure before upload starts', async () => {
      const oversizedFile = {
        name: 'huge-file.pdf',
        size: 100 * 1024 * 1024, // 100MB - over limit
        type: 'application/pdf'
      } as File;

      const uploadOptions: UploadOptions = {
        resourceType: 'documents',
        resourceId: 'user123'
      };

      await expect(uploadFile(oversizedFile, uploadOptions))
        .rejects
        .toThrow('File size exceeds 50MB limit. Current size: 100.00MB');

      // Verify that no Firebase APIs were called since validation failed
      expect(mockUploadBytesResumable).not.toHaveBeenCalled();
    });
  });
});