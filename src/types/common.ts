/**
 * Common Type Definitions
 *
 * Shared types used across the application
 */

/**
 * Make specific properties required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Make specific properties optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * Maybe type (nullable or undefined)
 */
export type Maybe<T> = T | null | undefined;

/**
 * Non-nullable type helper
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Extract keys of a specific type
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Timestamp fields
 */
export interface Timestamps {
  created_at: string;
  updated_at: string;
}

/**
 * Entity with ID
 */
export interface Entity {
  id: string;
}

/**
 * Entity with timestamps
 */
export interface TimestampedEntity extends Entity, Timestamps {}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Sort parameters
 */
export interface SortParams<T = string> {
  field: T;
  order: SortOrder;
}

/**
 * Filter operator
 */
export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

/**
 * Filter condition
 */
export interface FilterCondition<T = unknown> {
  field: string;
  operator: FilterOperator;
  value: T;
}

/**
 * Query parameters
 */
export interface QueryParams<T = string> {
  pagination?: PaginationParams;
  sort?: SortParams<T>;
  filters?: FilterCondition[];
  search?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async data state
 */
export interface AsyncData<T, E = Error> {
  data: T | null;
  error: E | null;
  loading: boolean;
  state: LoadingState;
}

/**
 * Create initial async data state
 */
export function createAsyncData<T, E = Error>(): AsyncData<T, E> {
  return {
    data: null,
    error: null,
    loading: false,
    state: 'idle',
  };
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Form field state
 */
export interface FieldState<T = string> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

/**
 * Form state
 */
export type FormState<T extends Record<string, unknown>> = {
  [K in keyof T]: FieldState<T[K]>;
};

/**
 * Create initial field state
 */
export function createFieldState<T>(initialValue: T): FieldState<T> {
  return {
    value: initialValue,
    error: null,
    touched: false,
    dirty: false,
  };
}

/**
 * Environment
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Log level
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Configuration
 */
export interface Config {
  env: Environment;
  apiUrl: string;
  logLevel: LogLevel;
  features: Record<string, boolean>;
}

/**
 * Feature flag
 */
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  [key: string]: unknown;
}

/**
 * Coordinate
 */
export interface Coordinate {
  x: number;
  y: number;
}

/**
 * Dimensions
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Rectangle
 */
export interface Rectangle extends Coordinate, Dimensions {}

/**
 * Range
 */
export interface Range<T = number> {
  min: T;
  max: T;
}

/**
 * Time range
 */
export interface TimeRange {
  start: Date | string;
  end: Date | string;
}

/**
 * Key-value pair
 */
export interface KeyValuePair<K = string, V = unknown> {
  key: K;
  value: V;
}

/**
 * Option for select/dropdown
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  group?: string;
}

/**
 * Tree node
 */
export interface TreeNode<T = unknown> {
  id: string;
  label: string;
  data?: T;
  children?: TreeNode<T>[];
  parent?: TreeNode<T>;
}

/**
 * Branded type for type safety
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * UUID type
 */
export type UUID = Brand<string, 'UUID'>;

/**
 * Email type
 */
export type Email = Brand<string, 'Email'>;

/**
 * URL type
 */
export type URL = Brand<string, 'URL'>;

/**
 * ISO Date string type
 */
export type ISODateString = Brand<string, 'ISODateString'>;

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Type guard for checking if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for checking if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for checking if value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}
