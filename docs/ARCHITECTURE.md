# Architecture Documentation

This document describes the architecture and design decisions of DLX Studios.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Design Patterns](#design-patterns)
- [Security](#security)
- [Performance](#performance)

## Overview

DLX Studios is an AI-powered web development platform that provides a unified interface for interacting with multiple LLM providers. It supports both local (LM Studio, Ollama) and cloud-based (OpenAI, Anthropic, Gemini) providers with intelligent routing, caching, and cost optimization.

### Key Features

- **Multi-Provider Support** - Seamlessly switch between different LLM providers
- **Hybrid Architecture** - Use local models for development, cloud for production
- **Token Tracking** - Real-time monitoring of API usage and costs
- **Request Caching** - LRU cache with TTL to reduce costs
- **Error Handling** - Comprehensive error boundaries and structured errors
- **Type Safety** - Full TypeScript coverage with strict mode

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components  │  │    Hooks     │  │   Services   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      LLM Service Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Request Cache │  │Token Tracking│  │Error Handler │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
│  Local Providers│ │Cloud Providers│ │  Supabase  │
│  - LM Studio   │ │  - OpenAI    │ │  Database  │
│  - Ollama      │ │  - Anthropic │ │            │
│                │ │  - Gemini    │ │            │
└─────────────────┘ └─────────────┘ └─────────────┘
```

### Architecture Layers

1. **Presentation Layer** - React components and UI
2. **Business Logic Layer** - Services and hooks
3. **Data Access Layer** - Supabase client and API clients
4. **External Services** - LLM providers and third-party APIs

## Component Architecture

### Core Components

```
src/
├── components/
│   ├── ErrorBoundary.tsx      # Error handling wrapper
│   ├── ProviderSelector.tsx   # LLM provider selection
│   ├── ModelSelector.tsx      # Model selection
│   └── ChatInterface.tsx      # Main chat UI
│
├── hooks/
│   ├── useProviders.ts        # Provider management
│   ├── useModels.ts           # Model management
│   ├── useChat.ts             # Chat state management
│   └── useTokenTracking.ts   # Usage tracking
│
├── services/
│   ├── llm.ts                 # LLM service
│   ├── tokenTracking.ts       # Token tracking
│   ├── requestCache.ts        # Response caching
│   └── storage.ts             # Database access
│
├── lib/
│   ├── apiClient.ts           # HTTP client
│   └── utils.ts               # Utilities
│
└── types/
    ├── errors.ts              # Error types
    ├── common.ts              # Common types
    └── database.ts            # Database types
```

### Component Hierarchy

```
App
├── ErrorBoundary
│   └── Router
│       ├── Dashboard
│       │   ├── ProviderSelector
│       │   ├── ModelSelector
│       │   └── UsageStats
│       │
│       └── Chat
│           ├── ChatInterface
│           │   ├── MessageList
│           │   └── MessageInput
│           │
│           └── Sidebar
│               ├── ConversationList
│               └── Settings
```

## Data Flow

### Message Flow

```
User Input
    │
    ▼
ChatInterface Component
    │
    ▼
useChat Hook
    │
    ▼
LLM Service
    │
    ├─► Request Cache (check)
    │   └─► Cache Hit? → Return cached response
    │
    ├─► Token Tracking (log request)
    │
    ▼
Provider API
    │
    ▼
Response
    │
    ├─► Request Cache (store)
    │
    ├─► Token Tracking (log usage)
    │
    ▼
Update UI
```

### State Management

DLX Studios uses React hooks for state management:

- **Local State** - `useState` for component-specific state
- **Shared State** - Context API for global state
- **Server State** - Custom hooks with Supabase real-time subscriptions
- **Cache State** - In-memory LRU cache for API responses

### Data Persistence

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase Database                     │
├─────────────────────────────────────────────────────────┤
│  Tables:                                                 │
│  - providers          # LLM provider configurations      │
│  - models             # Available models                 │
│  - projects           # User projects                    │
│  - conversations      # Chat conversations               │
│  - messages           # Chat messages                    │
│  - token_logs         # Usage tracking                   │
│  - budgets            # Budget limits                    │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend/Database

- **Supabase** - PostgreSQL database, authentication, real-time
- **Row Level Security** - Database-level access control

### Development Tools

- **Vitest** - Testing framework
- **Testing Library** - Component testing
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Type checking

### External Services

- **LM Studio** - Local LLM hosting
- **Ollama** - Local LLM hosting
- **OpenAI API** - Cloud LLM
- **Anthropic API** - Cloud LLM
- **Google Gemini API** - Cloud LLM

## Design Patterns

### Service Pattern

Services encapsulate business logic and external API interactions:

```typescript
class LLMService {
  async sendMessage(messages, provider, model, options) {
    // Business logic here
  }
}

export const llmService = new LLMService();
```

### Repository Pattern

Storage service abstracts database operations:

```typescript
class StorageService {
  async getProviders() {
    return this.client.from('providers').select('*');
  }
}
```

### Factory Pattern

Create instances with configuration:

```typescript
export function createApiClient(baseURL, headers, timeout) {
  return new ApiClient(baseURL, headers, timeout);
}
```

### Observer Pattern

React hooks for reactive state:

```typescript
function useProviders() {
  const [providers, setProviders] = useState([]);
  
  useEffect(() => {
    const subscription = storage
      .from('providers')
      .on('*', () => fetchProviders())
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, []);
  
  return providers;
}
```

### Strategy Pattern

Different caching strategies:

```typescript
class RequestCacheService {
  private strategy: 'lru' | 'lfu' | 'fifo';
  
  evict() {
    switch (this.strategy) {
      case 'lru': return this.evictLRU();
      case 'lfu': return this.evictLFU();
      case 'fifo': return this.evictFIFO();
    }
  }
}
```

## Security

### Authentication

- Supabase Auth for user authentication
- JWT tokens for API requests
- Secure session management

### Authorization

- Row Level Security (RLS) policies in Supabase
- User-scoped data access
- API key encryption

### Data Protection

- Environment variables for sensitive data
- No API keys in client-side code
- HTTPS for all external requests
- Input validation and sanitization

### Best Practices

1. **Never expose API keys** - Use environment variables
2. **Validate all inputs** - Use validation schemas
3. **Sanitize user content** - Prevent XSS attacks
4. **Use HTTPS** - Encrypt data in transit
5. **Implement RLS** - Database-level security
6. **Rate limiting** - Prevent abuse
7. **Error messages** - Don't leak sensitive information

## Performance

### Optimization Strategies

1. **Request Caching**
   - LRU cache with configurable TTL
   - Reduces API calls and costs
   - Improves response time

2. **Code Splitting**
   - Lazy loading of routes
   - Dynamic imports for large components
   - Reduced initial bundle size

3. **Memoization**
   - `useMemo` for expensive computations
   - `useCallback` for stable function references
   - React.memo for component optimization

4. **Database Optimization**
   - Indexed columns for fast queries
   - Efficient query patterns
   - Connection pooling

5. **Asset Optimization**
   - Minified JavaScript and CSS
   - Compressed images
   - CDN for static assets

### Performance Metrics

- **Time to Interactive (TTI)** - < 3 seconds
- **First Contentful Paint (FCP)** - < 1.5 seconds
- **API Response Time** - < 500ms (cached), < 2s (uncached)
- **Bundle Size** - < 200KB (gzipped)

### Monitoring

- Error tracking with structured logging
- Performance metrics collection
- Usage analytics
- Cost tracking per provider

## Scalability

### Horizontal Scaling

- Stateless frontend (can run multiple instances)
- Supabase handles database scaling
- CDN for static assets

### Vertical Scaling

- Efficient algorithms (LRU cache)
- Lazy loading and code splitting
- Optimized database queries

### Future Considerations

- Redis for distributed caching
- Message queue for async processing
- Microservices architecture
- GraphQL for flexible queries

## Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

### Deployment Targets

- **Vercel** - Recommended for frontend
- **Netlify** - Alternative frontend hosting
- **Railway** - Full-stack deployment
- **Docker** - Containerized deployment

## Conclusion

DLX Studios is built with modern web technologies and best practices, focusing on:

- **Type Safety** - TypeScript throughout
- **Performance** - Caching and optimization
- **Reliability** - Error handling and testing
- **Scalability** - Modular architecture
- **Security** - Authentication and authorization
- **Developer Experience** - Clear structure and documentation

For more information, see:
- [API Documentation](./API.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [README](../README.md)

