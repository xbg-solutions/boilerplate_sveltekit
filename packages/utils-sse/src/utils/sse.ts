/**
 * src/lib/utils/sse.ts
 * Server-Sent Events (SSE) Utilities
 * 
 * Provides utilities for handling real-time event streams from the server.
 * Includes automatic reconnection, error handling, and integration with the event system.
 * 
 * SSE is ideal for:
 * - Real-time notifications
 * - Live updates (stock prices, analytics)
 * - AI streaming responses
 * - Server push notifications
 */

import {
  loggerService,
  publish,
  normalizeError,
  handleError
} from '@xbg.solutions/bpsk-core';

// Create context-aware logger
const sseLogger = loggerService.withContext('SSE');

/**
 * Configuration for SSE connection
 */
export interface SSEConfig {
  /** The URL endpoint for the SSE stream */
  url: string;
  /** Whether to automatically reconnect on disconnect */
  autoReconnect?: boolean;
  /** Maximum number of reconnection attempts (0 = infinite) */
  maxReconnectAttempts?: number;
  /** Delay between reconnection attempts in milliseconds */
  reconnectDelay?: number;
  /** Request headers to include */
  headers?: Record<string, string>;
  /** With credentials (for CORS) */
  withCredentials?: boolean;
  /** Event types to listen for (empty = all events) */
  eventTypes?: string[];
}

/**
 * SSE event handler function
 */
export type SSEEventHandler = (data: any, event: MessageEvent) => void;

/**
 * SSE error handler function
 */
export type SSEErrorHandler = (error: Error) => void;

/**
 * SSE connection states
 */
export type SSEConnectionState = 'connecting' | 'open' | 'closed' | 'error';

/**
 * SSE Connection wrapper with automatic reconnection
 */
export class SSEConnection {
  private eventSource: EventSource | null = null;
  private config: Required<SSEConfig>;
  private handlers: Map<string, Set<SSEEventHandler>> = new Map();
  private errorHandlers: Set<SSEErrorHandler> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private state: SSEConnectionState = 'closed';
  private manualClose = false;

  constructor(config: SSEConfig) {
    this.config = {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 3000,
      headers: {},
      withCredentials: false,
      eventTypes: [],
      ...config
    };
  }

  /**
   * Get current connection state
   */
  getState(): SSEConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'open';
  }

  /**
   * Connect to the SSE endpoint
   */
  connect(): void {
    if (this.eventSource) {
      sseLogger.warn('Already connected or connecting to SSE', {
        url: this.config.url,
        state: this.state
      });
      return;
    }

    try {
      this.state = 'connecting';
      this.manualClose = false;
      
      sseLogger.info('Connecting to SSE endpoint', {
        url: this.config.url,
        withCredentials: this.config.withCredentials
      });

      // Create EventSource
      this.eventSource = new EventSource(this.config.url, {
        withCredentials: this.config.withCredentials
      });

      // Setup event listeners
      this.setupEventListeners();

    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to create SSE connection');
      sseLogger.error('SSE connection error', normalizedError);
      this.handleConnectionError(normalizedError);
    }
  }

  /**
   * Setup EventSource event listeners
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // Handle connection open
    this.eventSource.onopen = () => {
      this.state = 'open';
      this.reconnectAttempts = 0;
      
      sseLogger.info('SSE connection established', {
        url: this.config.url
      });

      // Publish connection event
      publish('sse:connected', { url: this.config.url }, 'SSEConnection');
    };

    // Handle messages
    this.eventSource.onmessage = (event) => {
      this.handleMessage('message', event);
    };

    // Handle errors
    this.eventSource.onerror = (event) => {
      sseLogger.error('SSE connection error', new Error('EventSource error'), {
        url: this.config.url,
        readyState: this.eventSource?.readyState
      });

      this.state = 'error';

      // EventSource automatically tries to reconnect, but we handle it manually
      if (!this.manualClose && this.config.autoReconnect) {
        this.handleReconnect();
      }

      // Publish error event
      publish('sse:error', { url: this.config.url }, 'SSEConnection');
    };

    // Setup custom event type listeners
    if (this.config.eventTypes.length > 0) {
      this.config.eventTypes.forEach(eventType => {
        this.eventSource!.addEventListener(eventType, (event) => {
          this.handleMessage(eventType, event as MessageEvent);
        });
      });
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(eventType: string, event: MessageEvent): void {
    try {
      // Parse data (if JSON)
      let data: any = event.data;
      try {
        data = JSON.parse(event.data);
      } catch {
        // Not JSON, use raw data
      }

      sseLogger.info(`SSE message received: ${eventType}`, {
        hasData: !!data
      });

      // Call registered handlers
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(data, event);
          } catch (error) {
            const normalizedError = normalizeError(error, `Error in SSE handler for ${eventType}`);
            sseLogger.error(`Handler error for ${eventType}`, normalizedError);
            this.errorHandlers.forEach(errorHandler => errorHandler(normalizedError));
          }
        });
      }

      // Publish to event system
      publish(`sse:${eventType}`, data, 'SSEConnection');

    } catch (error) {
      const normalizedError = normalizeError(error, 'Error processing SSE message');
      sseLogger.error('Message processing error', normalizedError);
      this.errorHandlers.forEach(errorHandler => errorHandler(normalizedError));
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.manualClose) return;

    if (this.config.maxReconnectAttempts > 0 && 
        this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      sseLogger.error('Max reconnection attempts reached', undefined, {
        attempts: this.reconnectAttempts,
        maxAttempts: this.config.maxReconnectAttempts
      });
      this.state = 'closed';
      publish('sse:max_reconnects', { url: this.config.url }, 'SSEConnection');
      return;
    }

    this.reconnectAttempts++;
    
    sseLogger.info('Scheduling SSE reconnection', {
      attempt: this.reconnectAttempts,
      delay: this.config.reconnectDelay
    });

    this.reconnectTimer = window.setTimeout(() => {
      this.disconnect();
      this.connect();
    }, this.config.reconnectDelay);
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: Error): void {
    this.state = 'error';
    this.errorHandlers.forEach(handler => handler(error));
    
    if (this.config.autoReconnect && !this.manualClose) {
      this.handleReconnect();
    }
  }

  /**
   * Register event handler
   */
  on(eventType: string, handler: SSEEventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler);
    
    sseLogger.info(`Registered handler for SSE event: ${eventType}`);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Register error handler
   */
  onError(handler: SSEErrorHandler): () => void {
    this.errorHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    this.manualClose = true;

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      sseLogger.info('Disconnecting from SSE endpoint', {
        url: this.config.url
      });

      this.eventSource.close();
      this.eventSource = null;
      this.state = 'closed';

      // Publish disconnection event
      publish('sse:disconnected', { url: this.config.url }, 'SSEConnection');
    }
  }

  /**
   * Cleanup and disconnect
   */
  destroy(): void {
    this.disconnect();
    this.handlers.clear();
    this.errorHandlers.clear();
  }
}

/**
 * Create an SSE connection
 */
export function createSSEConnection(config: SSEConfig): SSEConnection {
  return new SSEConnection(config);
}

/**
 * Utility function for simple SSE usage
 */
export function streamSSE(
  url: string,
  onMessage: SSEEventHandler,
  options?: Partial<SSEConfig>
): () => void {
  const connection = createSSEConnection({
    url,
    ...options
  });

  connection.on('message', onMessage);
  connection.connect();

  // Return cleanup function
  return () => connection.destroy();
}

/**
 * Fetch with streaming response (for fetch-based streaming, not SSE)
 */
export async function* streamFetch(
  url: string,
  options?: RequestInit
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      yield chunk;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Example usage patterns for developers
 */
export const SSEExamples = {
  /**
   * Basic SSE connection
   */
  basic: () => {
    const connection = createSSEConnection({
      url: '/api/events',
      autoReconnect: true
    });

    connection.on('message', (data) => {
      console.log('Received:', data);
    });

    connection.onError((error) => {
      console.error('SSE Error:', error);
    });

    connection.connect();

    return () => connection.disconnect();
  },

  /**
   * AI streaming response
   */
  aiStreaming: () => {
    const connection = createSSEConnection({
      url: '/api/ai/stream',
      eventTypes: ['token', 'complete', 'error']
    });

    let response = '';

    connection.on('token', (data) => {
      response += data.token;
      // Update UI with new token
    });

    connection.on('complete', (data) => {
      console.log('Complete response:', response);
      connection.disconnect();
    });

    connection.on('error', (data) => {
      console.error('AI Error:', data.error);
      connection.disconnect();
    });

    connection.connect();
  },

  /**
   * Real-time notifications
   */
  notifications: () => {
    const connection = createSSEConnection({
      url: '/api/notifications/stream',
      withCredentials: true,
      autoReconnect: true
    });

    connection.on('notification', (data) => {
      // Show toast notification
      publish('notification:new', data, 'SSE');
    });

    connection.connect();

    return () => connection.disconnect();
  }
};