# Architecture

**Analysis Date:** 2026-01-26

## Pattern Overview

**Overall:** Next.js App Router with Client-Side Rendering emphasis

**Key Characteristics:**
- Next.js 16 App Router for routing and API endpoints
- Heavy client-side state management via React hooks (no Redux/Zustand)
- Dual data layer: Supabase (primary/production) + Dexie.js (local/offline fallback)
- Streaming AI responses via Server-Sent Events (SSE)
- Two distinct user flows: Teachers (Supabase Auth) and Students (code-based login)

## Layers

**Presentation Layer (Pages & Components):**
- Purpose: UI rendering and user interaction
- Location: `app/` and `components/`
- Contains: React components (`.tsx`), page layouts, client-side state
- Depends on: API routes, lib utilities
- Used by: End users (teachers and students)

**API Layer (Route Handlers):**
- Purpose: Backend logic, data operations, external service calls
- Location: `app/api/*/route.ts`
- Contains: Next.js route handlers, request/response processing
- Depends on: `lib/supabase.ts`, `lib/gemini.ts`
- Used by: Presentation layer via `fetch()`

**Data Access Layer:**
- Purpose: Database operations and data transformations
- Location: `lib/supabase.ts`, `lib/db.ts`
- Contains: Supabase client config, CRUD functions, type definitions
- Depends on: Supabase SDK, Dexie.js
- Used by: API routes

**AI Integration Layer:**
- Purpose: AI tutoring logic and streaming responses
- Location: `lib/gemini.ts`
- Contains: Socratic prompting, CometAPI/Ollama integration, answer checking
- Depends on: CometAPI (Gemini 2.5 Flash)
- Used by: `/api/chat` route

**Utilities Layer:**
- Purpose: Shared helpers and data
- Location: `lib/sampleProblems.ts`, `lib/ocr.ts`
- Contains: Math problem bank, OCR text extraction
- Depends on: Tesseract.js
- Used by: Pages, components

## Data Flow

**Student Learning Session:**

1. Student enters 6-character login code on `StudentLogin` component
2. `POST /api/auth/student` validates code against Supabase `students` table
3. Student data, progress, settings returned to client
4. Client stores session in `localStorage` (not Supabase Auth)
5. Main page loads problems filtered by student settings
6. `Conversation` component handles chat with AI via `/api/chat`

**Teacher Management Flow:**

1. Teacher logs in via Supabase Auth (`/auth/login`)
2. Middleware (`middleware.ts`) protects `/teacher/*` routes
3. Teacher dashboard fetches students via `GET /api/students`
4. CRUD operations use `/api/students`, `/api/progress`, `/api/settings`

**AI Chat Flow:**

1. User submits message in `Conversation` component
2. `POST /api/chat` receives message + problem + history
3. `getSocraticResponseStream()` in `lib/gemini.ts` builds system prompt
4. Request sent to CometAPI (or Ollama in dev mode)
5. SSE stream transformed and piped back to client
6. `Conversation` component updates message in real-time
7. `isCorrect` flag returned when answer matches expected

**State Management:**
- Client state: React `useState` hooks throughout
- Persistent state: `localStorage` for student sessions, XP goals, message counts
- Server state: Supabase for all teacher/student data
- No global state management library

## Key Abstractions

**MathProblem:**
- Purpose: Represents a tutoring problem with metadata
- Examples: `lib/sampleProblems.ts` (30+ sample problems)
- Pattern: Interface with id, question, answer, difficulty, domain, gradeRange, hints

**Student/Progress/Settings:**
- Purpose: Student profile and learning state
- Examples: `lib/supabase.ts` type definitions
- Pattern: Supabase table types with camelCase transforms in API responses

**ConversationContext:**
- Purpose: AI tutoring context including history
- Examples: `lib/gemini.ts`
- Pattern: Interface with problemQuestion, problemAnswer, conversationHistory, hintsGiven

## Entry Points

**Main Student App (`app/page.tsx`):**
- Location: `app/page.tsx`
- Triggers: Direct navigation to `/`
- Responsibilities: Student login, problem selection, learning interface

**Teacher Dashboard (`app/teacher/page.tsx`):**
- Location: `app/teacher/page.tsx`
- Triggers: Navigation to `/teacher` (protected)
- Responsibilities: Student management, settings configuration, progress monitoring

**Chat API (`app/api/chat/route.ts`):**
- Location: `app/api/chat/route.ts`
- Triggers: POST from `Conversation` component
- Responsibilities: AI response streaming, answer validation

**Root Layout (`app/layout.tsx`):**
- Location: `app/layout.tsx`
- Triggers: All page renders
- Responsibilities: HTML shell, font loading, SupabaseProvider context

**Middleware (`middleware.ts`):**
- Location: `middleware.ts` (root)
- Triggers: All non-static requests
- Responsibilities: Auth protection for `/teacher/*` and `/upload` routes

## Error Handling

**Strategy:** Try-catch with user-friendly messages, console logging for debugging

**Patterns:**
- API routes return JSON `{ error: string }` with appropriate HTTP status
- Components catch errors and display UI feedback (motion-animated error states)
- AI streaming errors show "Oops! Something went wrong" message
- No centralized error boundary (per-component handling)

## Cross-Cutting Concerns

**Logging:**
- `console.error()` in API routes and component catch blocks
- No structured logging or external service

**Validation:**
- Input validation in API routes (required fields, type checking)
- Client-side validation in forms (6-char code, grade ranges)
- No schema validation library (manual checks)

**Authentication:**
- Teachers: Supabase Auth (email/password) via `SupabaseProvider`
- Students: 6-character login codes (no auth, code-based lookup)
- Route protection: Middleware checks session for `/teacher/*` routes

**Animation:**
- Framer Motion throughout for page transitions, hover effects, celebrations
- `canvas-confetti` for success celebrations

---

*Architecture analysis: 2026-01-26*
