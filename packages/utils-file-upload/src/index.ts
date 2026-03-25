// File upload package barrel exports

// Services - enhanced file upload (canonical)
export * from './services/file-upload/file-upload.service';

// Services - simple file upload (re-exported with aliases to avoid conflicts)
export {
  type FileMetadata,
  type FileUploadStatus,
  type CompleteUploadProgress,
  type CompleteUploadOptions,
  FileUploadService as SimpleFileUploadService,
  fileUploadService as simpleFileUploadService
} from './services/fileUpload.service';

export * from './services/storage';

// Utils
export * from './utils/firebase-storage';
