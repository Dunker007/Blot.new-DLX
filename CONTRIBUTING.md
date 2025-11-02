# Contributing to DLX Studios

Thank you for your interest in contributing to DLX Studios! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (for database features)
- (Optional) LM Studio or Ollama for local LLM testing

### Initial Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Blot.new-DLX.git
   cd Blot.new-DLX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   npm run setup
   ```
   
   Or manually copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/add-gemini-support`)
- `fix/` - Bug fixes (e.g., `fix/token-tracking-error`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/llm-service`)
- `test/` - Test additions or updates (e.g., `test/add-cache-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Development Process

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our [coding standards](#coding-standards)

3. Write or update tests for your changes

4. Run the test suite:
   ```bash
   npm run check
   ```

5. Commit your changes following our [commit guidelines](#commit-guidelines)

6. Push to your fork and create a pull request

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode and fix all type errors
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Code Style

We use Prettier and ESLint to enforce code style:

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

**Pre-commit hooks** automatically run formatting and linting on staged files.

### Best Practices

- **Keep functions small and focused** - Each function should do one thing well
- **Use meaningful names** - Variables, functions, and types should be self-documenting
- **Avoid magic numbers** - Use named constants
- **Handle errors properly** - Use the custom error types from `src/types/errors.ts`
- **Write defensive code** - Validate inputs and handle edge cases
- **Prefer composition over inheritance**
- **Use async/await** over raw promises
- **Avoid any type** - Use unknown and type guards instead

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback` when passing to child components

Example:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}
```

## Testing

We use Vitest for testing. All new features should include tests.

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Writing Tests

- Place tests in `__tests__` directories next to the code they test
- Use descriptive test names that explain what is being tested
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies
- Test edge cases and error conditions

Example:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
  it('should return expected value for valid input', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });

  it('should throw error for invalid input', () => {
    expect(() => myFunction('')).toThrow('Invalid input');
  });
});
```

### Test Coverage

- Aim for at least 80% code coverage
- Focus on testing critical paths and business logic
- Don't test implementation details, test behavior

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates, etc.
- `ci`: CI/CD changes

### Examples

```
feat(llm): add support for Gemini API

Implement Gemini provider integration with streaming support
and token tracking.

Closes #123
```

```
fix(cache): prevent memory leak in request cache

The cache cleanup interval was not being cleared on unmount,
causing memory leaks. Added proper cleanup in useEffect.
```

```
docs(readme): update installation instructions

Added troubleshooting section and clarified Supabase setup steps.
```

## Pull Request Process

1. **Update documentation** - If your changes affect user-facing features or APIs

2. **Add tests** - Ensure your changes are covered by tests

3. **Run the full check** - Make sure all tests pass and there are no linting errors:
   ```bash
   npm run check
   ```

4. **Update CHANGELOG** - Add a brief description of your changes (if applicable)

5. **Create the PR** with a clear title and description:
   - Explain what changes you made and why
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

6. **Respond to feedback** - Address review comments promptly

7. **Squash commits** - Before merging, squash your commits into logical units

### PR Title Format

Use the same format as commit messages:
```
feat(scope): brief description
```

## Project Structure

```
Blot.new-DLX/
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   ├── services/        # Business logic and API clients
│   ├── types/           # TypeScript type definitions
│   ├── test/            # Test utilities and setup
│   └── App.tsx          # Main application component
├── scripts/             # Build and utility scripts
├── public/              # Static assets
├── .husky/              # Git hooks
└── tests/               # Integration tests
```

### Key Directories

- **components/** - Reusable UI components
- **services/** - Core business logic (LLM, caching, token tracking)
- **types/** - Shared TypeScript types and interfaces
- **hooks/** - Custom React hooks for state management
- **lib/** - Utility functions and helpers

## Questions?

If you have questions or need help:

1. Check existing issues and discussions
2. Read the documentation in the README
3. Open a new issue with the `question` label

Thank you for contributing to DLX Studios! 🚀

