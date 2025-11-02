/**
 * API Client with Enhanced Error Handling
 *
 * Provides a robust HTTP client with retry logic, timeout handling,
 * and structured error responses
 */
import {
  AppError,
  ErrorCode,
  NetworkError,
  RateLimitError,
  type RetryConfig,
  retryAsync,
} from '../types/errors';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retry?: Partial<RetryConfig>;
  signal?: AbortSignal;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(
    baseURL: string = '',
    defaultHeaders: Record<string, string> = {},
    defaultTimeout: number = 30000
  ) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
    this.defaultTimeout = defaultTimeout;
  }

  async request<T = unknown>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retry,
      signal,
    } = config;

    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const mergedHeaders = { ...this.defaultHeaders, ...headers };

    const makeRequest = async (): Promise<ApiResponse<T>> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(fullURL, {
          method,
          headers: mergedHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: signal || controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const retryAfterMs = retryAfter ? parseInt(retryAfter) * 1000 : undefined;

          throw new RateLimitError('Rate limit exceeded', retryAfterMs, { url: fullURL, method });
        }

        // Handle authentication errors
        if (response.status === 401) {
          throw new AppError('Authentication failed', ErrorCode.UNAUTHORIZED, 401, true, {
            url: fullURL,
          });
        }

        // Handle forbidden
        if (response.status === 403) {
          throw new AppError('Access forbidden', ErrorCode.FORBIDDEN, 403, true, { url: fullURL });
        }

        // Handle not found
        if (response.status === 404) {
          throw new AppError('Resource not found', ErrorCode.RECORD_NOT_FOUND, 404, true, {
            url: fullURL,
          });
        }

        // Handle server errors
        if (response.status >= 500) {
          const errorText = await response.text().catch(() => 'Unknown server error');
          throw new NetworkError(`Server error: ${errorText}`, {
            url: fullURL,
            status: response.status,
          });
        }

        // Handle client errors
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new AppError(
            `Request failed: ${errorText}`,
            ErrorCode.UNKNOWN_ERROR,
            response.status,
            true,
            { url: fullURL }
          );
        }

        // Parse response
        const contentType = response.headers.get('content-type');
        let data: T;

        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = (await response.text()) as T;
        }

        return {
          data,
          status: response.status,
          headers: response.headers,
        };
      } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort/timeout
        if (error instanceof Error && error.name === 'AbortError') {
          throw new NetworkError('Request timeout', { url: fullURL, timeout });
        }

        // Handle network errors
        if (error instanceof TypeError) {
          throw new NetworkError('Network request failed', {
            url: fullURL,
            originalError: error.message,
          });
        }

        // Re-throw AppErrors
        if (error instanceof AppError) {
          throw error;
        }

        // Wrap unknown errors
        throw new AppError(
          error instanceof Error ? error.message : 'Unknown error',
          ErrorCode.UNKNOWN_ERROR,
          500,
          false,
          { url: fullURL }
        );
      }
    };

    // Apply retry logic if configured
    if (retry) {
      const retryConfig: RetryConfig = {
        maxAttempts: retry.maxAttempts || 3,
        delayMs: retry.delayMs || 1000,
        backoffMultiplier: retry.backoffMultiplier || 2,
        shouldRetry:
          retry.shouldRetry ||
          (error => {
            // Retry on network errors and 5xx errors
            if (error instanceof NetworkError) return true;
            if (error instanceof AppError) {
              return error.statusCode >= 500;
            }
            return false;
          }),
      };

      return retryAsync(makeRequest, retryConfig);
    }

    return makeRequest();
  }

  async get<T = unknown>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ) {
    return this.request<T>(url, { ...config, method: 'POST', body });
  }

  async put<T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ) {
    return this.request<T>(url, { ...config, method: 'PUT', body });
  }

  async patch<T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ) {
    return this.request<T>(url, { ...config, method: 'PATCH', body });
  }

  async delete<T = unknown>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  setDefaultHeader(key: string, value: string) {
    this.defaultHeaders[key] = value;
  }

  removeDefaultHeader(key: string) {
    delete this.defaultHeaders[key];
  }

  setBaseURL(url: string) {
    this.baseURL = url;
  }
}

// Export a default instance
export const apiClient = new ApiClient();

// Export a factory for creating custom instances
export function createApiClient(
  baseURL: string,
  headers?: Record<string, string>,
  timeout?: number
): ApiClient {
  return new ApiClient(baseURL, headers, timeout);
}
