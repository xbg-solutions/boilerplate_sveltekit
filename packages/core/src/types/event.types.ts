/**
 * src/lib/types/event.types.ts
 * Event system type definitions
 * 
 * Defines the core types used by the event bus system, including event structure,
 * handler signatures, and common event types used throughout the application.
 */

/**
 * Base event interface that all events must implement
 */
export interface BaseEvent {
    /** Unique identifier for the event type */
    type: string;
    /** Timestamp when the event was created (milliseconds since epoch) */
    timestamp: number;
    /** Optional identifier for the component/service that fired the event */
    source?: string;
    /** Optional additional metadata for the event */
    meta?: Record<string, any>;
  }
  
  /**
   * Application event interface with typed payload
   */
  export interface AppEvent<T = any> extends BaseEvent {
    /** Event-specific data */
    payload: T;
  }
  
  /**
   * Event handler function signature
   * Note: Changed to return Promise<void> | void to support async handlers
   */
  export type EventHandler<T = any> = (event: AppEvent<T>) => Promise<void> | void;
  
  /**
   * Function returned from subscriptions that can be called to unsubscribe
   */
  export type Subscription = () => void;
  
  /**
   * Core event types used throughout the application
   * Following the convention: 'domain:action'
   */
  export enum CoreEventType {
    // Auth events
    AUTH_STATE_CHANGED = 'auth:stateChanged',
    AUTH_LOGIN_SUCCESS = 'auth:loginSuccess',
    AUTH_LOGIN_FAILURE = 'auth:loginFailure',
    AUTH_LOGOUT = 'auth:logout',
    
    // Token events
    TOKEN_REFRESHED = 'token:refreshed',
    TOKEN_EXPIRED = 'token:expired',
    
    // Application lifecycle events
    APP_INITIALIZED = 'app:initialized',
    APP_ERROR = 'app:error',
    
    // Navigation events
    NAVIGATION_START = 'navigation:start',
    NAVIGATION_END = 'navigation:end',
    
    // Tab sync events
    TAB_SYNC_REQUEST = 'tabSync:request',
    TAB_SYNC_RESPONSE = 'tabSync:response',
    
    // Store events
    STORE_UPDATED = 'store:updated',
    STORE_RESET = 'store:reset',
    
    // Service events
    SERVICE_INITIALIZED = 'service:initialized',
    SERVICE_ERROR = 'service:error',
    
    // Toast notifications
    TOAST_SHOW = 'toast:show',
    TOAST_HIDE = 'toast:hide',
    TOAST_CLEAR = 'toast:clear'
  }
  
  /**
   * Options for event bus event dispatch
   */
  export interface EventDispatchOptions {
    /** Whether to dispatch the event in the next microtask for performance reasons */
    defer?: boolean;
  }
  
  /**
   * Event payload for auth state changes
   */
  export interface AuthStateChangePayload {
    isAuthenticated: boolean;
    user?: {
      uid: string;
      email?: string;
      [key: string]: any;
    } | null;
  }
  
  /**
   * Event payload for token events
   */
  export interface TokenEventPayload {
    tokenType: 'id' | 'refresh' | 'access';
    expiresAt?: number;
    isExpired?: boolean;
  }
  
  /**
   * Event payload for navigation events
   */
  export interface NavigationEventPayload {
    from: string;
    to: string;
    params?: Record<string, string>;
  }
  
  /**
   * Event payload for tab sync events
   */
  export interface TabSyncPayload {
    tabId: string;
    state: Record<string, any>;
    timestamp: number;
  }
  
  /**
   * Event payload for store update events
   */
  export interface StoreUpdatePayload<T = any> {
    storeName: string;
    value: T;
    previousValue?: T;
  }
  
  /**
   * Event payload for toast notifications
   */
  export interface ToastEventPayload {
    /**
     * The type of toast notification
     */
    type: 'info' | 'success' | 'warning' | 'error';
    
    /**
     * The toast notification message
     */
    message: string;
    
    /**
     * Optional title for the toast
     */
    title?: string;
    
    /**
     * Duration in milliseconds before auto-dismissing
     * Set to 0 for persistent toast that doesn't auto-dismiss
     */
    duration?: number;
    
    /**
     * Position of the toast notification
     * Defaults to 'top-left' for larger screens, 'top-center' for mobile
     */
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    
    /**
     * Whether the toast is dismissible with a close button
     * Defaults to true
     */
    dismissible?: boolean;
    
    /**
     * Any additional properties to pass to the toast component
     */
    [key: string]: any;
  }