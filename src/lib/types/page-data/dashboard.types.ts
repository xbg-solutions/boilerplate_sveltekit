/**
 * Dashboard Page Data Types
 * 
 * Type definitions for dashboard-related data structures.
 * These types define the expected shape of data for dashboard components
 * and can be used with the DashboardLayout template.
 */

// Basic metric/stat type
export interface DashboardMetric {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  icon?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: string;
  color?: string;
}

export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  data: ChartDataPoint[];
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  height?: number;
}

// Activity/Timeline types
export interface ActivityItem {
  id: string;
  type: 'user_action' | 'system_event' | 'notification' | 'error' | 'success';
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

// Quick action types
export interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

// Table data types for dashboard tables
export interface DashboardTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => string;
}

export interface DashboardTableRow {
  id: string;
  [key: string]: any;
}

export interface DashboardTableData {
  columns: DashboardTableColumn[];
  rows: DashboardTableRow[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  loading?: boolean;
}

// Widget configuration
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'custom';
  size: 'small' | 'medium' | 'large' | 'full';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  data?: any;
  config?: Record<string, any>;
  refreshable?: boolean;
  lastUpdated?: string;
}

// Main dashboard page data structure
export interface DashboardPageData {
  // Page metadata
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  
  // User context
  user: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  
  // Key metrics
  metrics: DashboardMetric[];
  
  // Charts and visualizations
  charts?: ChartData[];
  
  // Recent activity
  recentActivity?: ActivityItem[];
  
  // Quick actions
  quickActions?: QuickAction[];
  
  // Widgets configuration
  widgets?: DashboardWidget[];
  
  // Table data (if dashboard includes tables)
  tableData?: Record<string, DashboardTableData>;
  
  // Notifications
  notifications?: {
    unread: number;
    items: Array<{
      id: string;
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      timestamp: string;
      read: boolean;
    }>;
  };
  
  // Navigation (for sidebar)
  navigation?: Array<{
    label: string;
    href: string;
    icon?: string;
    badge?: string;
    active?: boolean;
  }>;
  
  // Permissions and features
  permissions?: {
    canEdit: boolean;
    canExport: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
  };
}

// Loading states
export interface DashboardLoadingState {
  metrics: boolean;
  charts: boolean;
  activity: boolean;
  tables: Record<string, boolean>;
  overall: boolean;
}

// Error states
export interface DashboardError {
  type: 'network' | 'permissions' | 'data' | 'unknown';
  message: string;
  code?: string;
  retryable?: boolean;
}

// Filter and search types
export interface DashboardFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  category?: string[];
  status?: string[];
  search?: string;
}

// Export configuration
export interface DashboardExportConfig {
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
  sections: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
}

// Real-time update types
export interface DashboardRealtimeUpdate {
  type: 'metric' | 'activity' | 'notification' | 'table_row';
  id: string;
  data: any;
  timestamp: string;
}

// Analytics data
export interface DashboardAnalytics {
  pageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    path: string;
    views: number;
    percentage: number;
  }>;
  deviceTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

// Settings and preferences
export interface DashboardSettings {
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number; // in seconds
  defaultView: string;
  widgetPositions: Record<string, DashboardWidget['position']>;
  hiddenWidgets: string[];
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

// Complete dashboard state
export interface DashboardState {
  data: DashboardPageData | null;
  loading: DashboardLoadingState;
  error: DashboardError | null;
  filters: DashboardFilters;
  settings: DashboardSettings;
  selectedWidgets: string[];
  editMode: boolean;
}