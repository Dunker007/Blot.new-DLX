# API Documentation

This document describes the core APIs and services in DLX Studios.

## Table of Contents

- [LLM Service](#llm-service)
- [Token Tracking Service](#token-tracking-service)
- [Request Cache Service](#request-cache-service)
- [Storage Service](#storage-service)
- [Error Handling](#error-handling)

## LLM Service

The LLM Service provides a unified interface for interacting with multiple LLM providers.

### Import

```typescript
import { llmService } from '@/services/llm';
```

### Methods

#### `sendMessage()`

Send a message to an LLM and get a response.

```typescript
async sendMessage(
  messages: LLMMessage[],
  providerId: string,
  modelId: string,
  options?: {
    stream?: boolean;
    onStream?: (chunk: StreamChunk) => void;
    signal?: AbortSignal;
    conversationId?: string;
    projectId?: string;
    trackUsage?: boolean;
  }
): Promise<LLMResponse>
```

**Parameters:**
- `messages` - Array of conversation messages
- `providerId` - ID of the LLM provider (e.g., 'lm-studio', 'ollama', 'openai')
- `modelId` - ID of the model to use
- `options` - Optional configuration
  - `stream` - Enable streaming responses
  - `onStream` - Callback for streaming chunks
  - `signal` - AbortSignal for cancellation
  - `conversationId` - Track usage per conversation
  - `projectId` - Track usage per project
  - `trackUsage` - Enable/disable usage tracking (default: true)

**Returns:** Promise resolving to LLMResponse

**Example:**

```typescript
const response = await llmService.sendMessage(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ],
  'lm-studio',
  'model-123',
  {
    stream: true,
    onStream: (chunk) => {
      console.log('Received chunk:', chunk.content);
    },
    projectId: 'my-project'
  }
);

console.log('Full response:', response.content);
```

### Types

```typescript
interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  content: string;
  model: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cached?: boolean;
}

interface StreamChunk {
  content: string;
  done: boolean;
}
```

## Token Tracking Service

Track and analyze LLM API usage, costs, and performance metrics.

### Import

```typescript
import { tokenTrackingService } from '@/services/tokenTracking';
```

### Methods

#### `logTokenUsage()`

Log token usage for an LLM request.

```typescript
async logTokenUsage(data: {
  conversationId?: string;
  projectId?: string;
  providerId: string;
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  responseTimeMs: number;
  status: 'success' | 'failed';
  errorMessage?: string;
}): Promise<void>
```

#### `getTokenMetrics()`

Get aggregated token usage metrics.

```typescript
async getTokenMetrics(filters?: {
  projectId?: string;
  providerId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<TokenMetrics>
```

**Returns:**

```typescript
interface TokenMetrics {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  avgResponseTime: number;
  successRate: number; // 0-1 decimal
  byProvider: {
    [providerId: string]: {
      tokens: number;
      cost: number;
      requests: number;
    };
  };
}
```

#### `getProviderUsage()`

Get usage statistics grouped by provider.

```typescript
async getProviderUsage(filters?: {
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<ProviderUsage[]>
```

**Returns:**

```typescript
interface ProviderUsage {
  provider_id: string;
  request_count: number;
  total_tokens: number;
  total_cost: number;
  avg_response_time: number;
}
```

#### `setBudget()`

Set a budget limit for a project.

```typescript
setBudget(
  projectId: string,
  limit: number,
  period: 'daily' | 'weekly' | 'monthly'
): void
```

#### `checkBudget()`

Check current budget status.

```typescript
async checkBudget(projectId: string): Promise<BudgetStatus>
```

**Returns:**

```typescript
interface BudgetStatus {
  usage: number;
  limit: number;
  withinBudget: boolean;
}
```

### Example

```typescript
// Set a monthly budget
tokenTrackingService.setBudget('my-project', 100, 'monthly');

// Check budget status
const status = await tokenTrackingService.checkBudget('my-project');
if (!status.withinBudget) {
  console.warn('Budget exceeded!', status);
}

// Get metrics
const metrics = await tokenTrackingService.getTokenMetrics({
  projectId: 'my-project',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
});

console.log('Total cost:', metrics.totalCost);
console.log('Success rate:', metrics.successRate * 100 + '%');
```

## Request Cache Service

Cache LLM responses to reduce costs and improve performance.

### Import

```typescript
import { requestCache } from '@/services/requestCache';
```

### Methods

#### `get()`

Retrieve a cached response.

```typescript
get(messages: LLMMessage[], modelId: string): LLMResponse | null
```

#### `set()`

Store a response in the cache.

```typescript
set(messages: LLMMessage[], modelId: string, response: LLMResponse): void
```

#### `clear()`

Clear all cached responses.

```typescript
clear(): void
```

#### `setTTL()`

Set the time-to-live for cache entries (in minutes).

```typescript
setTTL(minutes: number): void
```

#### `setMaxSize()`

Set the maximum number of cache entries.

```typescript
setMaxSize(size: number): void
```

### Example

```typescript
// Check cache before making request
const cached = requestCache.get(messages, modelId);
if (cached) {
  console.log('Using cached response');
  return cached;
}

// Make request and cache result
const response = await llmService.sendMessage(messages, providerId, modelId);
requestCache.set(messages, modelId, response);

// Configure cache
requestCache.setTTL(120); // 2 hours
requestCache.setMaxSize(500); // Store up to 500 responses
```

## Storage Service

Interact with Supabase database.

### Import

```typescript
import { storage } from '@/lib/storage';
```

### Methods

The storage service provides a Supabase client instance. Refer to [Supabase documentation](https://supabase.com/docs) for full API details.

#### Common Operations

```typescript
// Query data
const { data, error } = await storage
  .from('table_name')
  .select('*')
  .eq('column', 'value');

// Insert data
const { data, error } = await storage
  .from('table_name')
  .insert({ column: 'value' });

// Update data
const { data, error } = await storage
  .from('table_name')
  .update({ column: 'new_value' })
  .eq('id', 'record_id');

// Delete data
const { data, error } = await storage
  .from('table_name')
  .delete()
  .eq('id', 'record_id');
```

## Error Handling

DLX Studios uses custom error types for structured error handling.

### Import

```typescript
import {
  AppError,
  NetworkError,
  ValidationError,
  ProviderError,
  RateLimitError,
  ErrorCode,
  isAppError,
  getErrorMessage,
  wrapAsync,
} from '@/types/errors';
```

### Error Types

#### `AppError`

Base error class for all application errors.

```typescript
class AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  isOperational: boolean;
  context?: Record<string, unknown>;
  timestamp: Date;
}
```

#### Specialized Errors

- `NetworkError` - Network and connectivity issues
- `AuthenticationError` - Authentication failures
- `ValidationError` - Input validation errors
- `ProviderError` - LLM provider errors
- `DatabaseError` - Database operation errors
- `RateLimitError` - Rate limiting errors
- `ConfigurationError` - Configuration issues

### Usage

```typescript
// Throwing errors
throw new ValidationError('Invalid email format', {
  field: 'email',
  value: userInput
});

// Catching and handling errors
try {
  await someOperation();
} catch (error) {
  if (isAppError(error)) {
    console.error('App error:', error.code, error.message);
    
    if (error instanceof RateLimitError) {
      console.log('Retry after:', error.retryAfter);
    }
  } else {
    console.error('Unknown error:', getErrorMessage(error));
  }
}

// Using Result type for safer error handling
const result = await wrapAsync(async () => {
  return await riskyOperation();
});

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### Error Codes

```typescript
enum ErrorCode {
  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // LLM
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  
  // General
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

## Best Practices

1. **Always handle errors** - Use try/catch or Result types
2. **Use type guards** - Check error types before accessing specific properties
3. **Provide context** - Include relevant data in error context
4. **Log errors** - Use the errorLogger utility for consistent logging
5. **Cache wisely** - Balance performance with freshness
6. **Track usage** - Monitor costs and performance metrics
7. **Set budgets** - Prevent unexpected costs with budget limits
8. **Test error paths** - Write tests for error scenarios

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

