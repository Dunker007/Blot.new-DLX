/**
 * Custom Error Types for DLX Studios
 *
 * Provides structured error handling across the application
 */

export enum ErrorCode {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_FAILED = 'CONNECTION_FAILED',

  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // LLM Provider Errors
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_API_KEY = 'INVALID_API_KEY',

  // Database Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',

  // Application Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.NETWORK_ERROR, 503, true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.UNAUTHORIZED, 401, true, context);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, context);
  }
}

export class ProviderError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.PROVIDER_UNAVAILABLE,
    context?: Record<string, unknown>
  ) {
    super(message, code, 503, true, context);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.DATABASE_ERROR, 500, true, context);
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, context?: Record<string, unknown>) {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429, true, context);
    this.retryAfter = retryAfter;
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.CONFIGURATION_ERROR, 500, false, context);
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is operational (expected)
 */
export function isOperationalError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, ErrorCode.UNKNOWN_ERROR, 500, false, {
      originalError: error.name,
    });
  }

  return new AppError(getErrorMessage(error), ErrorCode.UNKNOWN_ERROR, 500, false);
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = AppError> = { success: true; data: T } | { success: false; error: E };

/**
 * Create a successful result
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Create a failed result
 */
export function failure<E = AppError>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Async result type
 */
export type AsyncResult<T, E = AppError> = Promise<Result<T, E>>;

/**
 * Wrap an async function to return a Result instead of throwing
 */
export async function wrapAsync<T>(fn: () => Promise<T>): AsyncResult<T> {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return failure(toAppError(error));
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryAsync<T>(fn: () => Promise<T>, config: RetryConfig): Promise<T> {
  const { maxAttempts, delayMs, backoffMultiplier = 2, shouldRetry = () => true } = config;

  let lastError: unknown;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError;
}

/**
 * Error logger utility
 */
export const errorLogger = {
  log(error: unknown, context?: Record<string, unknown>) {
    const appError = toAppError(error);

    console.error('[Error]', {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      context: { ...appError.context, ...context },
      timestamp: appError.timestamp,
      stack: appError.stack,
    });
  },

  warn(message: string, context?: Record<string, unknown>) {
    console.warn('[Warning]', {
      message,
      context,
      timestamp: new Date(),
    });
  },

  info(message: string, context?: Record<string, unknown>) {
    console.info('[Info]', {
      message,
      context,
      timestamp: new Date(),
    });
  },
};
