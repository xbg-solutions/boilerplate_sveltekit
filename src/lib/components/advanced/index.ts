export { default as DataTable } from './DataTable.svelte';
export { default as FormWizard } from './FormWizard.svelte';
export { default as ImageUpload } from './ImageUpload.svelte';
export { default as ChartWrapper } from './ChartWrapper.svelte';

// DataTable types
export interface Column<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => string;
  component?: any;
  hidden?: boolean;
  /** When true, render() output is injected as raw HTML (opt-in). Default: false (escaped). */
  allowHtml?: boolean;
}

export interface DataTableOptions {
  pagination?: boolean;
  pageSize?: number;
  sorting?: boolean;
  filtering?: boolean;
  selection?: boolean;
  bulkActions?: boolean;
  export?: boolean;
  responsive?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: string | number | boolean;
}

export interface BulkAction {
  key: string;
  label: string;
  icon?: any;
  variant?: 'default' | 'destructive' | 'secondary';
  confirm?: boolean;
}

// FormWizard types
export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: any;
  component?: any;
  validation?: (data: any) => Promise<ValidationResult> | ValidationResult;
  condition?: (data: any) => boolean;
  optional?: boolean;
  canSkip?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors?: { [key: string]: string };
  warnings?: { [key: string]: string };
}

export interface WizardOptions {
  allowBackward?: boolean;
  allowSkip?: boolean;
  showProgress?: boolean;
  showStepNumbers?: boolean;
  saveOnStep?: boolean;
  validateOnChange?: boolean;
  linearNavigation?: boolean;
  showSummary?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

// ImageUpload types
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

// ChartWrapper types
export interface ChartData {
  labels?: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[] | { x: number; y: number }[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface ScaleOptions {
  display?: boolean;
  title?: {
    display?: boolean;
    text?: string;
  };
  min?: number;
  max?: number;
  beginAtZero?: boolean;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled?: boolean;
      mode?: string;
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: ScaleOptions;
    y?: ScaleOptions;
  };
  animation?: {
    duration?: number;
    easing?: string;
  };
}

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';

export interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  theme?: 'light' | 'dark';
}
