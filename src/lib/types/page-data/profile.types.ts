/**
 * Profile Page Data Types
 * 
 * Type definitions for user profile-related data structures.
 * These types define the expected shape of data for profile components
 * and can be used with profile pages and forms.
 */

// Basic profile information
export interface ProfileData {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  phoneNumber?: string;
  timezone?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
}

// Profile settings categories
export interface ProfileSettings {
  // Privacy settings
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    allowSearchByEmail: boolean;
    allowSearchByPhone: boolean;
  };
  
  // Notification preferences
  notifications: {
    email: {
      marketing: boolean;
      security: boolean;
      updates: boolean;
      digest: boolean;
      frequency: 'immediately' | 'daily' | 'weekly' | 'never';
    };
    push: {
      enabled: boolean;
      marketing: boolean;
      security: boolean;
      updates: boolean;
      mentions: boolean;
    };
    inApp: {
      enabled: boolean;
      sound: boolean;
      desktop: boolean;
    };
  };
  
  // Display preferences
  display: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    currency: string;
  };
  
  // Security settings
  security: {
    twoFactorEnabled: boolean;
    twoFactorMethod: 'sms' | 'app' | 'email';
    sessionTimeout: number; // minutes
    requirePasswordForSensitive: boolean;
    allowedLoginMethods: Array<'email' | 'phone' | 'google' | 'apple'>;
  };
}

// Social profile connections
export interface SocialConnection {
  provider: 'google' | 'apple' | 'github' | 'linkedin' | 'twitter' | 'facebook';
  providerId: string;
  email?: string;
  name?: string;
  avatar?: string;
  connectedAt: string;
  active: boolean;
}

// Profile activity tracking
export interface ProfileActivity {
  id: string;
  type: 'login' | 'profile_update' | 'password_change' | 'security_change' | 'data_export' | 'data_deletion';
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
  };
  metadata?: Record<string, any>;
}

// Profile verification status
export interface ProfileVerification {
  email: {
    verified: boolean;
    verifiedAt?: string;
    pending: boolean;
  };
  phone: {
    verified: boolean;
    verifiedAt?: string;
    pending: boolean;
  };
  identity: {
    verified: boolean;
    verifiedAt?: string;
    pending: boolean;
    documents?: Array<{
      type: 'passport' | 'drivers_license' | 'id_card';
      status: 'pending' | 'approved' | 'rejected';
      uploadedAt: string;
    }>;
  };
}

// Subscription and billing info
export interface ProfileSubscription {
  plan: {
    id: string;
    name: string;
    tier: 'free' | 'basic' | 'pro' | 'enterprise';
    price: number;
    currency: string;
    billing: 'monthly' | 'yearly';
    features: string[];
  };
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  usage?: {
    [key: string]: {
      used: number;
      limit: number;
      unit: string;
    };
  };
}

// Billing information
export interface BillingInfo {
  defaultPaymentMethod?: {
    id: string;
    type: 'card' | 'paypal' | 'bank_account';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
  };
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
  invoiceEmails: string[];
}

// Profile preferences for app behavior
export interface ProfilePreferences {
  dashboard: {
    defaultView: string;
    widgetLayout: Record<string, any>;
    refreshInterval: number;
  };
  dataRetention: {
    activityHistory: number; // days
    exportFormat: 'json' | 'csv' | 'xlsx';
    autoDeleteAfter?: number; // days
  };
  integrations: {
    [key: string]: {
      enabled: boolean;
      config: Record<string, any>;
    };
  };
}

// Profile export data
export interface ProfileExportData {
  profile: ProfileData;
  settings: ProfileSettings;
  activity: ProfileActivity[];
  connections: SocialConnection[];
  preferences: ProfilePreferences;
  subscription?: ProfileSubscription;
  billing?: BillingInfo;
  exportedAt: string;
  exportVersion: string;
}

// Form data interfaces for profile editing
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  location: string;
  website: string;
  company: string;
  jobTitle: string;
  timezone: string;
  language: string;
}

export interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'sms' | 'app' | 'email';
  sessionTimeout: number;
}

export interface NotificationFormData {
  emailMarketing: boolean;
  emailSecurity: boolean;
  emailUpdates: boolean;
  emailDigest: boolean;
  emailFrequency: 'immediately' | 'daily' | 'weekly' | 'never';
  pushEnabled: boolean;
  pushMarketing: boolean;
  pushSecurity: boolean;
  pushUpdates: boolean;
  inAppEnabled: boolean;
  inAppSound: boolean;
}

// Main profile page data structure
export interface ProfilePageData {
  // Core profile data
  profile: ProfileData;
  
  // Profile settings
  settings: ProfileSettings;
  
  // Social connections
  connections: SocialConnection[];
  
  // Recent activity
  recentActivity: ProfileActivity[];
  
  // Verification status
  verification: ProfileVerification;
  
  // Subscription info (if applicable)
  subscription?: ProfileSubscription;
  
  // Billing info (if applicable)
  billing?: BillingInfo;
  
  // User preferences
  preferences: ProfilePreferences;
  
  // Available timezones for selection
  availableTimezones: Array<{
    value: string;
    label: string;
    offset: string;
  }>;
  
  // Available languages for selection
  availableLanguages: Array<{
    code: string;
    name: string;
    nativeName: string;
  }>;
  
  // Available currencies for selection
  availableCurrencies: Array<{
    code: string;
    name: string;
    symbol: string;
  }>;
  
  // Permissions for what user can edit
  permissions: {
    canEditProfile: boolean;
    canChangeEmail: boolean;
    canChangePassword: boolean;
    canDeleteAccount: boolean;
    canExportData: boolean;
    canManageBilling: boolean;
    canManageConnections: boolean;
  };
}

// Loading states for different sections
export interface ProfileLoadingState {
  profile: boolean;
  settings: boolean;
  activity: boolean;
  connections: boolean;
  subscription: boolean;
  billing: boolean;
  overall: boolean;
}

// Error states for profile operations
export interface ProfileError {
  type: 'network' | 'validation' | 'permissions' | 'server' | 'unknown';
  message: string;
  field?: string; // specific field for validation errors
  code?: string;
  retryable?: boolean;
}

// Profile update request types
export interface ProfileUpdateRequest {
  type: 'basic_info' | 'settings' | 'password' | 'avatar' | 'preferences';
  data: Record<string, any>;
  timestamp: string;
}

// Profile validation rules
export interface ProfileValidation {
  firstName: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  lastName: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  email: {
    required: boolean;
    format: 'email';
    unique: boolean;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  phoneNumber: {
    format: 'international' | 'national';
    required: boolean;
  };
  bio: {
    maxLength: number;
  };
  website: {
    format: 'url';
  };
}

// Account deletion data
export interface AccountDeletionRequest {
  reason: 'not_using' | 'privacy_concerns' | 'too_expensive' | 'switching_service' | 'other';
  feedback?: string;
  confirmPassword: string;
  scheduledFor?: string; // ISO date for delayed deletion
  immediateDelete: boolean;
}

// Two-factor authentication setup
export interface TwoFactorSetup {
  method: 'sms' | 'app' | 'email';
  phone?: string;
  email?: string;
  qrCode?: string;
  backupCodes?: string[];
  setupToken?: string;
  verified: boolean;
}

// Profile statistics and insights
export interface ProfileStats {
  accountAge: number; // days
  loginStreak: number; // consecutive days
  totalLogins: number;
  profileCompleteness: number; // percentage
  securityScore: number; // percentage
  dataUsage: {
    storage: {
      used: number;
      limit: number;
      unit: 'MB' | 'GB';
    };
    bandwidth: {
      used: number;
      limit: number;
      unit: 'MB' | 'GB';
    };
  };
}

// Complete profile state
export interface ProfileState {
  data: ProfilePageData | null;
  loading: ProfileLoadingState;
  error: ProfileError | null;
  editMode: boolean;
  activeSection: 'profile' | 'security' | 'notifications' | 'billing' | 'privacy' | 'data';
  unsavedChanges: boolean;
  stats: ProfileStats | null;
}