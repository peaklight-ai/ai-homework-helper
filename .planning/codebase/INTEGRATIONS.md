# External Integrations

**Analysis Date:** 2026-01-26

## APIs & External Services

**AI/LLM:**
- CometAPI (Production)
  - Endpoint: `https://api.cometapi.com/v1/chat/completions`
  - Model: `gemini-2.5-flash-preview-09-2025`
  - Auth: `COMET_API_KEY` (Bearer token)
  - Usage: Socratic tutoring responses via streaming
  - Implementation: `lib/gemini.ts`

- Ollama (Local Development)
  - Endpoint: `{OLLAMA_URL}/api/chat` (default: `http://localhost:11434`)
  - Model: Configurable via `OLLAMA_MODEL` (default: `llama3.1`)
  - Auth: None (local)
  - Usage: Local development LLM alternative
  - Implementation: `lib/gemini.ts`

**Avatars:**
- DiceBear API
  - Endpoint: `https://api.dicebear.com/9.x/adventurer/svg`
  - Auth: None (public)
  - Usage: Generate student avatars from seed strings
  - Implementation: `components/Avatar.tsx`
  - Parameters: seed, size, skinColor

**OCR:**
- Tesseract.js (Client-side)
  - No external API - runs in browser via WebAssembly
  - Language: English (`eng`)
  - Usage: Extract math problems from uploaded homework images
  - Implementation: `lib/ocr.ts`

## Data Storage

**Primary Database:**
- Supabase (PostgreSQL)
  - URL: `NEXT_PUBLIC_SUPABASE_URL`
  - Client: `@supabase/supabase-js`, `@supabase/ssr`
  - Tables: `teachers`, `students`, `progress`, `student_settings`, `homework_uploads`
  - Implementation: `lib/supabase.ts`

**Client-Side Storage:**
- Dexie.js (IndexedDB)
  - Database: `HomeworkHelperDB` (version 2)
  - Tables: `profiles`, `progress`, `customProblems`, `settings`
  - Usage: Offline-first student data, custom problems
  - Implementation: `lib/db.ts`

**Prisma Schema (Defined but not active):**
- PostgreSQL via `DATABASE_URL`
- Schema: `prisma/schema.prisma`
- Tables: `parents`, `children`, `child_progress`, `problems`, `conversations`, `conversation_turns`, `badges`, `child_badges`, `daily_streaks`
- Status: Schema exists but application uses Supabase directly

**File Storage:**
- Supabase Storage (implied)
  - Used for homework image uploads
  - Referenced in `HomeworkUpload` type as `image_url`

**Caching:**
- None detected (no Redis, no explicit caching layer)

## Authentication & Identity

**Teacher Auth:**
- Supabase Auth
  - Methods: Email/password signup and login
  - Implementation: `components/SupabaseProvider.tsx`
  - Hooks: `useAuth()`, `useUser()`, `useSession()`
  - Protected routes: `/teacher/*`, `/upload`

**Student Auth:**
- Custom login code system
  - 6-character alphanumeric codes (e.g., `ABC123`)
  - Stored in localStorage on client
  - Validated via `getStudentByLoginCode()` in `lib/supabase.ts`
  - Hooks: `useStudentSession()`, `setStudentSession()`
  - No Supabase Auth for students

**Route Protection:**
- Next.js Middleware (`middleware.ts`)
  - Protects `/teacher`, `/upload` routes
  - Redirects unauthenticated users to `/auth/login`
  - Redirects authenticated users away from `/auth/*` pages

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, LogRocket, etc.)

**Logs:**
- `console.error()` for error logging
- No structured logging framework

**Analytics:**
- None detected (no Mixpanel, PostHog, etc.)

## CI/CD & Deployment

**Hosting:**
- Vercel (primary target per CLAUDE.md)

**CI Pipeline:**
- None explicitly configured (no `.github/workflows/` detected)

**Build Command:**
```bash
npm run build  # next build
```

**Start Command:**
```bash
npm run start  # next start
```

## Environment Configuration

**Required for Production:**
```
COMET_API_KEY=<comet-api-key>
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
NEXT_PUBLIC_APP_URL=<production-url>
```

**Required for Development:**
```
USE_OLLAMA=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

**Optional:**
```
DATABASE_URL=postgresql://... # For Prisma (not actively used)
```

**Secrets Location:**
- Environment variables via Vercel dashboard (production)
- `.env.local` file (development, gitignored)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## API Routes

**Internal API Endpoints:**

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/chat` | POST | Socratic AI chat with streaming | None |
| `/api/auth/student` | POST | Student login via code | None |
| `/api/students` | GET/POST/DELETE | CRUD students | Teacher auth |
| `/api/teachers` | GET/POST | Teacher operations | Teacher auth |
| `/api/progress` | GET/POST | Student XP and progress | None |
| `/api/settings` | GET/POST | Student settings | None |

**Chat API Flow:**
1. Client sends message + problem context to `/api/chat`
2. Server calls CometAPI/Ollama with Socratic system prompt
3. Response streams back as SSE-style JSON chunks
4. Client renders streaming response in UI

## Third-Party SDK Summary

| Service | Package | Version | Purpose |
|---------|---------|---------|---------|
| Supabase | `@supabase/supabase-js` | 2.90.1 | Database, Auth |
| Supabase SSR | `@supabase/ssr` | 0.8.0 | Server-side client |
| Tesseract | `tesseract.js` | 7.0.0 | OCR processing |
| Prisma | `@prisma/client` | 6.19.0 | ORM (defined, not used) |

---

*Integration audit: 2026-01-26*
