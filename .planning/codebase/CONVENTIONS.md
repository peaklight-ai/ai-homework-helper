# Coding Conventions

**Analysis Date:** 2026-01-26

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension - `Avatar.tsx`, `Conversation.tsx`, `ProfileCard.tsx`
- Pages: `page.tsx` in directory structure (Next.js App Router convention)
- API routes: `route.ts` in `app/api/[endpoint]/` directories
- Library modules: camelCase with `.ts` extension - `gemini.ts`, `supabase.ts`, `db.ts`
- Config files: lowercase with extensions - `next.config.ts`, `eslint.config.mjs`

**Functions:**
- camelCase for all functions: `getSocraticResponseStream()`, `handleSubmit()`, `createStudent()`
- Event handlers: prefix with `handle` - `handleLogin()`, `handleComplete()`, `handleNewProblem()`
- Async functions: descriptive verb prefix - `fetchStudents()`, `loadSession()`, `extractTextFromImage()`
- React hooks: start with `use` - `useUser()`, `useAuth()`, `useSupabase()`

**Variables:**
- camelCase for variables and state: `isLoading`, `xpTotal`, `selectedStudent`
- Boolean state: prefix with `is`, `show`, `has` - `isComplete`, `showConfetti`, `hasSupabaseCredentials`
- Constants: SCREAMING_SNAKE_CASE for config values - `MESSAGE_LIMIT`, `DEFAULT_XP_GOAL`, `AVATAR_STYLES`

**Types/Interfaces:**
- PascalCase: `MathProblem`, `StudentProfile`, `ConversationContext`
- Interface props: suffix with `Props` - `ConversationProps`, `AvatarProps`, `StudentLoginProps`
- Database types: match Supabase snake_case for direct types, camelCase for frontend types

## Code Style

**Formatting:**
- No Prettier config detected - relies on ESLint and editor defaults
- Indentation: 2 spaces
- Semicolons: omitted in most files (consistent per-file)
- Quotes: single quotes for strings

**Linting:**
- ESLint with Next.js config (`eslint-config-next`)
- Core Web Vitals rules enabled
- TypeScript rules enabled via `eslint-config-next/typescript`
- Config file: `eslint.config.mjs`

## Import Organization

**Order:**
1. React/Next.js core imports (`'use client'` directive first if present)
2. Third-party libraries (framer-motion, supabase, etc.)
3. Local components with `@/components/` alias
4. Local lib modules with `@/lib/` alias
5. CSS imports last

**Path Aliases:**
- `@/*` maps to project root (configured in `tsconfig.json`)
- Use `@/components/` for all component imports
- Use `@/lib/` for all library module imports

**Example pattern from `app/page.tsx`:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Conversation } from '@/components/Conversation'
import { Avatar } from '@/components/Avatar'
import { getRandomProblem, getProblemsByGrade } from '@/lib/sampleProblems'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
```

## Error Handling

**API Routes:**
- Try-catch blocks wrapping entire handler
- Return JSON responses with `error` field
- Use appropriate HTTP status codes (400, 401, 500)
- Log errors with `console.error()` for debugging

```typescript
// Pattern from app/api/students/route.ts
try {
  // ... logic
  if (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
} catch (error) {
  console.error('Students API error:', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
```

**Client Components:**
- Try-catch for async operations (fetch calls)
- Set error state for UI display
- Use console.error for debugging

```typescript
// Pattern from components/Conversation.tsx
} catch (error) {
  console.error('Failed to send message:', error)
  setMessages(prev => [...prev, {
    role: 'model',
    parts: 'Oops! Something went wrong. Let\'s try again.'
  }])
}
```

## Logging

**Framework:** Native `console` methods

**Patterns:**
- `console.error()` for errors with descriptive prefix: `'Error creating teacher:', error`
- `console.error()` for failed operations: `'Failed to parse stream chunk:', e`
- No production logging framework configured
- Debug info in development mode via `process.env.NODE_ENV` checks

## Comments

**When to Comment:**
- File/module headers with purpose explanation (using `// ===` separator blocks)
- Complex algorithms or non-obvious logic
- Type definitions with unclear purpose

**Style:**
```typescript
// =============================================================================
// SUPABASE CLIENT CONFIGURATION
// =============================================================================
// This file provides Supabase clients for both browser and server contexts.
// - Browser client: For client-side React components
// - Server client: For API routes and server components
// =============================================================================
```

**JSDoc/TSDoc:**
- Used sparingly for utility functions
- Format: `/** Description */` single-line or multi-line block

```typescript
/**
 * Extract text from an image using Tesseract.js
 */
export async function extractTextFromImage(...): Promise<OCRResult> { }

/**
 * Clean up extracted text for math problems
 * Handles common OCR mistakes in math expressions
 */
export function cleanMathText(text: string): string { }
```

## Function Design

**Size:**
- No strict limit enforced
- Components can be large (500+ lines for page components)
- Utility functions kept small and focused

**Parameters:**
- Use destructuring for props: `{ problem, childName, onComplete }: ConversationProps`
- Optional parameters with defaults: `seed: string, size = 64, className = ''`
- Object parameters for complex options: `context: ConversationContext`

**Return Values:**
- Functions return typed values or `Promise<Type>`
- Null/undefined returns explicit: `Promise<Teacher | null>`
- Boolean returns for success/failure operations: `Promise<boolean>`

## Module Design

**Exports:**
- Named exports for most functions and types
- Single default export for page components only
- Group related exports in single files

**Example from `lib/sampleProblems.ts`:**
```typescript
export interface MathProblem { ... }
export const sampleProblems: MathProblem[] = [...]
export function getRandomProblem(difficulty?: 1 | 2 | 3 | 4 | 5): MathProblem { }
export function getProblemById(id: string): MathProblem | undefined { }
export function getProblemsByDomain(domain: MathDomain): MathProblem[] { }
export function getProblemsByGrade(grade: number): MathProblem[] { }
```

**Barrel Files:**
- Not used - import directly from specific files

## React Component Patterns

**Client Components:**
- Start with `'use client'` directive
- Functional components only
- useState/useEffect for state management

**Props Interface:**
- Define interface above component
- Use explicit typing: `({ prop }: ComponentProps)`

**State Organization:**
```typescript
// Group related state together
const [messages, setMessages] = useState<Message[]>([])
const [input, setInput] = useState('')
const [isLoading, setIsLoading] = useState(false)
const [isComplete, setIsComplete] = useState(false)
```

**Event Handlers:**
- Defined as const arrow functions inside component
- Named with `handle` prefix

## Styling Patterns

**Approach:**
- Tailwind CSS classes for most styling
- Inline `style` objects for dynamic/computed values
- Framer Motion for animations

**Color Pattern:**
- Use inline styles for brand colors: `style={{ color: '#BB8CFC' }}`
- Tailwind for standard colors: `bg-white`, `text-gray-800`

**Animation:**
- Framer Motion `<motion.div>` for animations
- AnimatePresence for enter/exit animations
- Use `whileHover`, `whileTap` for interactions

## TypeScript Usage

**Strict Mode:**
- Enabled in `tsconfig.json`
- All parameters and return types should be typed

**Type Assertions:**
- Minimize usage; prefer type guards
- Use when necessary: `profileId as number`

**Union Types:**
- Use for constrained values: `grade: 1 | 2 | 3 | 4 | 5 | 6`
- Use for status enums: `status: 'pending' | 'processed' | 'failed'`

---

*Convention analysis: 2026-01-26*
