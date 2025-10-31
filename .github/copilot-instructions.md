# Copilot Instructions for DLX Studios

This document provides guidance for AI coding assistants to be effective in the DLX Studios codebase.

## 🚀 Big Picture: AI-Powered Hybrid Development Environment

DLX Studios is a web-based IDE that integrates Large Language Models (LLMs) into the development workflow. It's built with a React/TypeScript frontend and a Supabase backend. The core architectural feature is its **hybrid nature**, allowing it to work with both local LLMs (like Ollama or LM Studio) and cloud-based LLM providers (OpenAI, Anthropic, etc.).

The primary goal is to provide a flexible, AI-assisted coding environment while giving developers full control over cost and performance through intelligent token management and provider routing.

## 🏗️ Core Architecture & Key Services

The business logic is centered in the `src/services/` directory. Understanding these services is crucial.

1.  **`llm.ts` (`LLMService`)**: This is the low-level service for communicating with LLM providers. It handles the actual HTTP requests to provider endpoints (e.g., `/v1/chat/completions`), including streaming responses. It does *not* decide which provider to use.

2.  **`providerRouter.ts` (`ProviderRouterService`)**: This service is responsible for **intelligent provider selection**. Based on criteria like cost, preferred model type (local vs. cloud), health status, and task requirements, it selects the best provider/model for a given request. It's the "brain" that decides *where* to send an LLM call.

3.  **`multiModelOrchestrator.ts` (`MultiModelOrchestratorService`)**: This is the highest-level service that orchestrates complex AI tasks. It first analyzes the user's request to determine its complexity (`analyzeTaskComplexity`). Based on that, it devises a `MultiModelStrategy` which might involve a primary model, a fallback, and even parallel queries to multiple models. It then uses the `providerRouter.ts` and `llm.ts` to execute this strategy.

4.  **`tokenTracking.ts` (`TokenTrackingService`)**: This service is critical for the platform's value proposition. It hooks into `llm.ts` to log every token used, calculate costs, and enforce budgets. All LLM calls should go through a path that allows this service to track usage.

### Data Flow Example: User sends a message

1.  A React component in `src/components/` (e.g., `AIAssistantPanel.tsx`) captures the user's prompt.
2.  It calls a method on the `multiModelOrchestrator`.
3.  The orchestrator analyzes the task and selects a strategy (e.g., "This is a complex coding task, use the best coding model").
4.  It may use the `providerRouter` to find the best available model that fits the strategy.
5.  It then calls `llm.ts`'s `sendMessage` method with the chosen model and provider details.
6.  `llm.ts` makes the API call. As the response streams back, `tokenTracking.ts` logs the usage and cost against the user's project and budget.
7.  The response is streamed back to the UI.

## ⚙️ Developer Workflow

-   **Setup**: `npm install`
-   **Run Dev Server**: `npm run dev` (Vite HMR)
-   **Linting & Type Checking**: `npm run lint` and `npm run typecheck`. Run `npm run check` to run all checks.
-   **Building**: `npm run build`

##  supabase Backend

-   The database schema is managed via migrations in `supabase/migrations/`.
-   To add a new table or change a column, create a new SQL migration file following the timestamp naming convention (e.g., `YYYYMMDDHHMMSS_my_change.sql`).
-   Interact with the database from the frontend using the Supabase client located in `src/lib/supabase.ts`. All database types should be defined in `src/types/index.ts`.
-   Row Level Security (RLS) is enabled. Ensure all new tables have appropriate policies.

## 📝 Project Conventions

-   **Components**: All React components are in `src/components/`. Larger features have their own component file (e.g., `TokenAnalytics.tsx`).
-   **Styling**: Use Tailwind CSS for all styling. Avoid plain `.css` files or inline styles.
-   **State Management**: For complex state, prefer using React hooks (`useState`, `useReducer`, `useContext`). There is no external state management library like Redux.
-   **Types**: Centralize all TypeScript types in `src/types/index.ts`. This provides a single source of truth for data structures shared between the frontend and Supabase.
-   **Environment Variables**: All environment variables accessible to the frontend must be prefixed with `VITE_`. See `package.json` and `vite.config.ts`.
-   **Provider Integration**: When adding a new LLM provider, ensure it's compatible with the OpenAI-compatible API format that `llm.ts` expects. Configuration happens in the UI and is stored in the `llm_providers` table in Supabase.
