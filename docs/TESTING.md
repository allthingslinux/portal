# Testing Guide

This document outlines testing patterns and best practices for Portal.

## Test Runner

Portal uses [Vitest](https://vitest.dev/) as the test runner for its speed and excellent TypeScript support.

### Configuration

- **Config**: `vitest.config.ts`
- **Setup**: `vitest.setup.ts` (includes `@testing-library/jest-dom`)
- **Path Aliases**: Configured to match `tsconfig.json` paths

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (development)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

## Test Organization

### File Naming

- Place test files in the `tests/` directory, mirroring the `src/` structure
- Use `.test.ts` or `.test.tsx` extension
- Example: `src/lib/utils/utils.ts` → `tests/lib/utils/utils.test.ts`

### Test Structure

```typescript
import { describe, expect, it } from 'vitest'
import { functionToTest } from './module'

describe('functionToTest', () => {
  it('should do something', () => {
    expect(functionToTest()).toBe(expected)
  })
})
```

## Testing Patterns

### Unit Tests

**When to use**: Testing pure functions, utilities, and isolated logic

**Example - Utils**:

```typescript
import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
})
```

### Component Tests

**When to use**: Testing React components in isolation

**Setup**: Use `@testing-library/react` and `@testing-library/jest-dom`

**Example**:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### Hook Tests

**When to use**: Testing custom React hooks

**Pattern**: Use `renderHook` from `@testing-library/react`

**Example**:

```typescript
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useIsMobile } from './use-mobile'

describe('useIsMobile', () => {
  it('should return true for mobile viewport', () => {
    // Mock window.matchMedia
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })
})
```

### API Route Tests

**When to use**: Testing API route handlers

**Pattern**: Mock Next.js request objects and test handlers directly

**Example**:

```typescript
import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/user/me', () => {
  it('should return user data', async () => {
    const request = new NextRequest('http://localhost/api/user/me', {
      headers: {
        cookie: 'session=...',
      },
    })
    
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('user')
  })
})
```

### Testing with TanStack Query

**Pattern**: Mock query client and providers

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

const renderWithQuery = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  )
}
```

### Testing Auth Context

**Pattern**: Mock Better Auth client

```typescript
import { vi } from 'vitest'
import { authClient } from '@/auth/client'

vi.mock('@/auth/client', () => ({
  authClient: {
    useSession: vi.fn(() => ({
      data: { user: { id: '1', role: 'admin' } },
      isPending: false,
    })),
  },
}))
```

## Mocking

### Mocking Modules

```typescript
import { vi } from 'vitest'

vi.mock('./module', () => ({
  functionToMock: vi.fn(() => 'mocked'),
}))
```

### Mocking Window/DOM APIs

```typescript
import { vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})
```

### Mocking Next.js APIs

```typescript
import { vi } from 'vitest'

vi.mock('next/server', () => ({
  NextRequest: class MockRequest {
    headers = new Headers()
    async json() {
      return {}
    }
  },
}))
```

## Coverage Goals

- **New Code**: 70%+ coverage
- **Critical Paths**: Higher coverage (auth, API routes, integrations)
- **Overall**: 40%+ coverage (gradual improvement)

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Test user-facing behavior

2. **Keep Tests Simple**
   - One assertion per test when possible
   - Clear test names that describe the behavior

3. **Use Descriptive Names**
   - Test names should clearly describe what is being tested
   - Use `should` or `it` format: `it('should return user data')`

4. **Arrange-Act-Assert Pattern**

   ```typescript
   it('should merge classes', () => {
     // Arrange
     const class1 = 'foo'
     const class2 = 'bar'
     
     // Act
     const result = cn(class1, class2)
     
     // Assert
     expect(result).toBe('foo bar')
   })
   ```

5. **Test Edge Cases**
   - Null/undefined inputs
   - Empty arrays/objects
   - Boundary conditions
   - Error cases

6. **Avoid Testing Implementation Details**
   - Don't test private methods directly
   - Don't test framework internals
   - Focus on public APIs

7. **Keep Tests Fast**
   - Mock external dependencies
   - Avoid real network calls
   - Use in-memory databases for integration tests

## Common Patterns

### Testing Error Handling

```typescript
it('should handle errors gracefully', () => {
  expect(() => {
    functionThatThrows()
  }).toThrow('Expected error message')
})
```

### Testing Async Code

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction()
  expect(result).toBe(expected)
})
```

### Testing with User Interactions

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

it('should handle button click', () => {
  render(<Button onClick={handleClick}>Click</Button>)
  fireEvent.click(screen.getByText('Click'))
  expect(handleClick).toHaveBeenCalled()
})
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
