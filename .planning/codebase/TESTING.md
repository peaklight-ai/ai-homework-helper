# Testing Patterns

**Analysis Date:** 2026-01-26

## Test Framework

**Runner:**
- No test framework configured
- No test runner package in `package.json`
- No test configuration files detected

**Assertion Library:**
- Not installed

**Run Commands:**
```bash
npm run lint     # Only linting available
# No test command configured
```

## Test File Organization

**Location:**
- No test files exist in the project
- No `__tests__` directories
- No `*.test.ts` or `*.spec.ts` files in `app/`, `components/`, or `lib/`

**Naming:**
- Not established

**Structure:**
- Not established

## Test Coverage

**Requirements:** None enforced

**Current State:**
- 0% test coverage
- No unit tests
- No integration tests
- No E2E tests

## Recommended Test Setup

Based on the tech stack (Next.js 16, React 19, TypeScript), the recommended setup would be:

**Recommended Framework:** Vitest
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**Recommended Config (`vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  }
})
```

## Testable Code Areas

**High Priority (Core Logic):**

1. **`lib/gemini.ts`** - AI response handling
   - `checkAnswer()` - answer validation logic
   - `extractNumbers()` - number extraction from text
   - `transformOllamaStream()` - stream transformation

2. **`lib/sampleProblems.ts`** - Problem filtering
   - `getRandomProblem()` - difficulty filtering
   - `getProblemsByGrade()` - grade range filtering
   - `getProblemsByDomain()` - domain filtering

3. **`lib/ocr.ts`** - OCR processing
   - `cleanMathText()` - text normalization
   - `parseMathProblem()` - pattern extraction
   - `evaluateExpression()` - math evaluation

4. **`lib/supabase.ts`** - Data transformation
   - `generateLoginCode()` - code generation
   - Helper functions for CRUD operations

**Medium Priority (Components):**

5. **`components/Conversation.tsx`** - Chat UI
   - Message rendering
   - Input handling
   - Completion state

6. **`components/StudentLogin.tsx`** - Login flow
   - Code validation
   - Form submission

**Lower Priority (API Routes):**

7. **API Routes** - Request/response handling
   - Input validation
   - Error responses
   - Data transformation

## Example Test Patterns

**Unit Test for `lib/gemini.ts`:**
```typescript
// lib/__tests__/gemini.test.ts
import { describe, it, expect } from 'vitest'

// These functions would need to be exported for testing
describe('checkAnswer', () => {
  it('should return true when user message contains correct answer', () => {
    const result = checkAnswer('I think the answer is 42', '42')
    expect(result).toBe(true)
  })

  it('should return false when answer is not present', () => {
    const result = checkAnswer('I am not sure', '42')
    expect(result).toBe(false)
  })
})

describe('extractNumbers', () => {
  it('should extract integers from text', () => {
    const result = extractNumbers('The answer is 5 plus 3')
    expect(result).toEqual([5, 3])
  })

  it('should extract decimals from text', () => {
    const result = extractNumbers('That equals 3.14')
    expect(result).toEqual([3.14])
  })

  it('should return empty array when no numbers', () => {
    const result = extractNumbers('no numbers here')
    expect(result).toEqual([])
  })
})
```

**Unit Test for `lib/sampleProblems.ts`:**
```typescript
// lib/__tests__/sampleProblems.test.ts
import { describe, it, expect } from 'vitest'
import { getRandomProblem, getProblemsByGrade, getProblemsByDomain } from '../sampleProblems'

describe('getRandomProblem', () => {
  it('should return a problem', () => {
    const problem = getRandomProblem()
    expect(problem).toBeDefined()
    expect(problem.question).toBeDefined()
    expect(problem.answer).toBeDefined()
  })

  it('should filter by difficulty when specified', () => {
    const problem = getRandomProblem(1)
    expect(problem.difficulty).toBeLessThanOrEqual(1)
  })
})

describe('getProblemsByGrade', () => {
  it('should return problems appropriate for grade', () => {
    const problems = getProblemsByGrade(2)
    problems.forEach(p => {
      expect(p.gradeRange[0]).toBeLessThanOrEqual(2)
      expect(p.gradeRange[1]).toBeGreaterThanOrEqual(2)
    })
  })
})

describe('getProblemsByDomain', () => {
  it('should return only problems in specified domain', () => {
    const problems = getProblemsByDomain('geometry')
    problems.forEach(p => {
      expect(p.domain).toBe('geometry')
    })
  })
})
```

**Unit Test for `lib/ocr.ts`:**
```typescript
// lib/__tests__/ocr.test.ts
import { describe, it, expect } from 'vitest'
import { cleanMathText, parseMathProblem } from '../ocr'

describe('cleanMathText', () => {
  it('should normalize whitespace', () => {
    expect(cleanMathText('5  +  3')).toContain('+')
  })

  it('should convert multiplication symbols', () => {
    const result = cleanMathText('5 x 3')
    expect(result).toContain('×')
  })

  it('should convert division symbols', () => {
    const result = cleanMathText('6 / 2')
    expect(result).toContain('÷')
  })
})

describe('parseMathProblem', () => {
  it('should parse simple addition', () => {
    const result = parseMathProblem('5 + 3 = ?')
    expect(result?.question).toContain('5')
    expect(result?.question).toContain('3')
    expect(result?.expectedAnswer).toBe(8)
  })

  it('should return null for empty text', () => {
    const result = parseMathProblem('')
    expect(result).toBeNull()
  })
})
```

**Component Test for `Avatar.tsx`:**
```typescript
// components/__tests__/Avatar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from '../Avatar'

describe('Avatar', () => {
  it('should render with correct size', () => {
    render(<Avatar seed="test" size={64} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('width', '64')
    expect(img).toHaveAttribute('height', '64')
  })

  it('should generate DiceBear URL with seed', () => {
    render(<Avatar seed="my-seed" />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toContain('my-seed')
    expect(img.getAttribute('src')).toContain('dicebear.com')
  })
})
```

## Mocking Patterns

**API Calls:**
```typescript
import { vi } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

beforeEach(() => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'test' })
  } as Response)
})
```

**Supabase Client:**
```typescript
vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockData, error: null })
    }))
  }))
}))
```

**LocalStorage:**
```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
```

## What to Mock

**Mock:**
- External API calls (Supabase, CometAPI, DiceBear)
- LocalStorage/SessionStorage
- Browser APIs (FileReader, canvas-confetti)
- Time-sensitive operations (setTimeout, Date)

**Do NOT Mock:**
- Pure utility functions
- React components under test
- State management hooks
- Routing (use actual test router)

## Test Types Summary

**Unit Tests (Recommended Priority):**
- Pure functions in `lib/` directory
- Data transformation logic
- Input validation helpers

**Integration Tests (Future):**
- API route handlers
- Database operations with test database
- Component with API interactions

**E2E Tests (Future):**
- Framework: Playwright or Cypress
- Critical user flows:
  - Student login with code
  - Solving a math problem
  - Teacher adding a student

## Adding Tests to This Project

**Step 1:** Install dependencies
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**Step 2:** Add test script to `package.json`
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Step 3:** Create `vitest.config.ts` (see recommended config above)

**Step 4:** Create test setup file `tests/setup.ts`
```typescript
import '@testing-library/jest-dom'
```

**Step 5:** Start with utility function tests in `lib/__tests__/`

---

*Testing analysis: 2026-01-26*
