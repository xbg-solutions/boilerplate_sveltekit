// Core package barrel exports
//
// Where two modules export the same name, only the canonical source
// is re-exported with `export *`.  The duplicate module uses explicit
// named re-exports (or is skipped) so consumers see one unambiguous symbol.

// ── Config ──────────────────────────────────────────────────────────
export * from './config/app.config';
export * from './config/routes.config';
// security: RateLimitConfig clashes with utils/rate-limiter – export everything except RateLimitConfig
export {
  type SecurityConfig,
  type ContentSecurityPolicy,
  type SecurityHeaders,
  type ValidationRules,
  // RateLimitConfig intentionally omitted – canonical version is in utils/rate-limiter
  productionSecurityConfig,
  developmentSecurityConfig,
  getSecurityConfig,
  generateCSPHeader,
  validateFileUpload,
  validateStringInput,
  sanitizeHtml,
  generateSecureToken,
  isAllowedDomain,
  createSecurityMiddleware,
  clientSecurityUtils
} from './config/security';
export type { RateLimitConfig as SecurityRateLimitConfig } from './config/security';

// ── Constants ───────────────────────────────────────────────────────
export * from './constants/api.constants';
export * from './constants/app';
// auth.constants: AUTH_ROUTES clashes with config/routes.config – export everything except AUTH_ROUTES
export {
  AUTH_EVENTS,
  AUTH_CONFIG,
  CREATE_AUTH_USER_ON_FIRST_SIGNIN,
  ROLES,
  CLAIM_BOOLEAN_MAP,
  BOOLEAN_CLAIM_ROLE_MAP,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY
} from './constants/auth.constants';
export { AUTH_ROUTES as AUTH_ROUTES_LEGACY } from './constants/auth.constants';
export * from './constants/mutex.constants';
// routes.constants: ClaimOperator, RouteClaimConfig clash with utils/route-handler – export only ROUTES
export { ROUTES } from './constants/routes.constants';

// ── Services ────────────────────────────────────────────────────────
export * from './services/error-reporting/error-reporting.service';
export * from './services/initialization/initialization.service';
export * from './services/logging/logging.service';
export * from './services/toast/toast-event-handlers';
export * from './services/toast/toast.service';

// ── Stores ──────────────────────────────────────────────────────────
// Use explicit imports where names collide with services/events/* or services/logging/*
export * from './stores/event.store';
export { type EventBusState, eventBusStore as simpleEventBusStore, eventBusService } from './stores/event-bus';
export { type PubSubState, pubSubStore as simplePubSubStore, pubSubService as simplePubSubService } from './stores/pub-sub';
export * from './stores/initialization.store';
export * from './stores/loading.store';
export { type LoggingServiceState } from './stores/logging.service';
export * from './stores/logging.store';
export * from './stores/route-handler';
export * from './stores/toast.store';

// ── Types ───────────────────────────────────────────────────────────
export type * from './types/api.interfaces';
export type * from './types/api.types';
export type * from './types/auth.types';
export type * from './types/error.types';
// event.types: AuthStateChangePayload clashes with types/auth.types – export everything except it
export type {
  BaseEvent,
  AppEvent,
  EventHandler,
  Subscription,
  CoreEventType,
  EventDispatchOptions,
  // AuthStateChangePayload intentionally omitted – canonical version is in types/auth.types
} from './types/event.types';
export type { AuthStateChangePayload as EventAuthStateChangePayload } from './types/event.types';
export type * from './types/events.interfaces';
// firebase.types: PhoneAuthOptions, AuthResult clash with types/auth.types – export everything except them
export type {
  FirebaseInitState,
  FirebaseState,
  FirebaseAuthState,
  FirebaseUserClaims,
  EmailLinkAuthOptions,
  // PhoneAuthOptions intentionally omitted – canonical version is in types/auth.types
  // AuthResult intentionally omitted – canonical version is in types/auth.types
} from './types/firebase.types';
export type { PhoneAuthOptions as FirebasePhoneAuthOptions, AuthResult as FirebaseAuthResult } from './types/firebase.types';
export type * from './types/mutex.types';
export type * from './types/logging.interfaces';
export type * from './types/logging.types';
export type * from './types/token.types';

// ── Services – Events (canonical event bus and pub-sub) ─────────────
// event-bus: publish & subscribe clash with pub-sub – export everything except them
export {
  EventError,
  eventBus,
  eventBusStore,
  createEventBus
} from './services/events/event-bus';
export { publish as eventBusPublish, subscribe as eventBusSubscribe } from './services/events/event-bus';
// pub-sub is the canonical publish/subscribe API
export * from './services/events/pub-sub';

// ── Utils ───────────────────────────────────────────────────────────
export * from './utils/app-check';
export * from './utils/mutex';
export * from './utils/browser';
export * from './utils/cn';
export * from './utils/error-handler-toast';
export * from './utils/error-handler';
export * from './utils/firebase';
export * from './utils/rate-limiter';
// route-handler: RouteConfig, ClaimOperator, RouteClaimConfig clash with config/routes.config & constants/routes.constants
export {
  createRouteHandler,
  routeHandler,
  ROUTE_EVENTS,
  type RouteConfig as RouteHandlerConfig,
  type ClaimOperator,
  type RouteClaimConfig
} from './utils/route-handler';
