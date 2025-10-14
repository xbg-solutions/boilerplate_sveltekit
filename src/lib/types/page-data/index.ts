/**
 * Page Data Types Index
 * 
 * Centralized export for all page data type definitions.
 * These types define the expected shape of data for various page types
 * and can be used with layout templates and components.
 */

// Dashboard page types
export type {
  DashboardMetric,
  ChartDataPoint,
  ChartData,
  ActivityItem,
  QuickAction,
  DashboardTableColumn,
  DashboardTableRow,
  DashboardTableData,
  DashboardWidget,
  DashboardPageData,
  DashboardLoadingState,
  DashboardError,
  DashboardFilters,
  DashboardExportConfig,
  DashboardRealtimeUpdate,
  DashboardAnalytics,
  DashboardSettings,
  DashboardState
} from './dashboard.types';

// Profile page types
export type {
  ProfileData,
  ProfileSettings,
  SocialConnection,
  ProfileActivity,
  ProfileVerification,
  ProfileSubscription,
  BillingInfo,
  ProfilePreferences,
  ProfileExportData,
  ProfileFormData,
  SecurityFormData,
  NotificationFormData,
  ProfilePageData,
  ProfileLoadingState,
  ProfileError,
  ProfileUpdateRequest,
  ProfileValidation,
  AccountDeletionRequest,
  TwoFactorSetup,
  ProfileStats,
  ProfileState
} from './profile.types';

// Common page data patterns
export interface BasePageData {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  permissions?: Record<string, boolean>;
  loading?: boolean;
  error?: {
    type: string;
    message: string;
    code?: string;
    retryable?: boolean;
  };
}

// Generic list page data
export interface ListPageData<T = any> extends BasePageData {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters?: Record<string, any>;
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  search?: string;
  selectedItems?: string[];
}

// Generic detail page data
export interface DetailPageData<T = any> extends BasePageData {
  item: T;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  relatedItems?: T[];
  actions?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'destructive';
    disabled?: boolean;
  }>;
}

// Form page data
export interface FormPageData<T = any> extends BasePageData {
  initialData?: Partial<T>;
  validationRules?: Record<string, any>;
  submitEndpoint?: string;
  redirectAfterSubmit?: string;
  sections?: Array<{
    id: string;
    title: string;
    description?: string;
    fields: string[];
  }>;
}

// Settings page data
export interface SettingsPageData extends BasePageData {
  sections: Array<{
    id: string;
    title: string;
    description?: string;
    icon?: string;
    href?: string;
    badge?: string;
  }>;
  currentSection?: string;
  unsavedChanges?: boolean;
}

// Analytics page data
export interface AnalyticsPageData extends BasePageData {
  dateRange: {
    start: string;
    end: string;
  };
  metrics: Array<{
    key: string;
    label: string;
    value: number | string;
    change?: number;
    format?: 'number' | 'currency' | 'percentage';
  }>;
  charts: Array<{
    id: string;
    title: string;
    type: 'line' | 'bar' | 'pie' | 'area';
    data: any[];
  }>;
  tables?: Record<string, {
    columns: Array<{
      key: string;
      label: string;
      sortable?: boolean;
    }>;
    rows: any[];
  }>;
}

// Error page data
export interface ErrorPageData {
  statusCode: number;
  title: string;
  message: string;
  description?: string;
  showRetry?: boolean;
  showHome?: boolean;
  showBack?: boolean;
  suggestions?: Array<{
    label: string;
    href: string;
  }>;
}

// Search page data
export interface SearchPageData<T = any> extends BasePageData {
  query: string;
  results: T[];
  totalResults: number;
  searchTime: number; // milliseconds
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  filters?: Record<string, any>;
  suggestions?: string[];
  categories?: Array<{
    name: string;
    count: number;
    active: boolean;
  }>;
}

// Page metadata
export interface PageMeta {
  title: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  jsonLd?: Record<string, any>;
}

// Page state management
export interface PageState<T = any> {
  data: T | null;
  loading: boolean;
  error: {
    type: string;
    message: string;
    code?: string;
    retryable?: boolean;
  } | null;
  meta: PageMeta;
  initialized: boolean;
  lastUpdated?: string;
}

// Utility types for page data
export type PageDataWithLoading<T> = T & {
  loading: boolean;
  error?: {
    type: string;
    message: string;
  } | null;
};

export type OptionalPageData<T> = Partial<T> & {
  title: string;
};

// Page data factory types
export interface PageDataFactory<T> {
  create(params?: any): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  list(params?: any): Promise<ListPageData<T>>;
}

// Real-time page data updates
export interface PageDataUpdate<T = any> {
  type: 'create' | 'update' | 'delete' | 'refresh';
  id?: string;
  data: Partial<T>;
  timestamp: string;
  source: 'user' | 'system' | 'external';
}

// Page data cache
export interface PageDataCache<T = any> {
  key: string;
  data: T;
  timestamp: string;
  ttl: number; // seconds
  stale: boolean;
}

// Export utility functions
export const createPageState = <T>(initialData?: T): PageState<T> => ({
  data: initialData || null,
  loading: false,
  error: null,
  meta: {
    title: '',
    description: ''
  },
  initialized: false
});

export const createListPageData = <T>(
  items: T[] = [],
  page: number = 1,
  pageSize: number = 20
): ListPageData<T> => ({
  title: '',
  items,
  pagination: {
    page,
    pageSize,
    total: items.length,
    totalPages: Math.ceil(items.length / pageSize)
  }
});

export const createErrorPageData = (
  statusCode: number,
  title: string,
  message: string
): ErrorPageData => ({
  statusCode,
  title,
  message,
  showRetry: statusCode >= 500,
  showHome: true,
  showBack: statusCode === 404
});