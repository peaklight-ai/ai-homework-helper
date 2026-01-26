# Codebase Structure

**Analysis Date:** 2026-01-26

## Directory Layout

```
ai-homework-helper/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/                # Backend API endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   │   └── student/    # Student login code verification
│   │   ├── chat/           # AI chat streaming endpoint
│   │   ├── progress/       # Student progress updates
│   │   ├── settings/       # Student learning settings
│   │   ├── students/       # Student CRUD operations
│   │   └── teachers/       # Teacher management (minimal)
│   ├── auth/               # Auth pages
│   │   ├── login/          # Teacher login page
│   │   └── signup/         # Teacher signup page
│   ├── teacher/            # Teacher dashboard
│   ├── upload/             # Homework photo upload page
│   ├── globals.css         # Global Tailwind styles
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main student learning page
│   └── providers.tsx       # Chakra UI provider (unused)
├── components/             # Reusable React components
│   ├── Avatar.tsx          # DiceBear avatar display
│   ├── Conversation.tsx    # Core AI chat interface
│   ├── HomeworkUpload.tsx  # Photo upload + OCR flow
│   ├── ProfileCard.tsx     # Student profile display
│   ├── ProfileForm.tsx     # Profile editing form
│   ├── QuestionForm.tsx    # Problem input form
│   ├── StudentLogin.tsx    # 6-char code login UI
│   └── SupabaseProvider.tsx # Auth context + hooks
├── lib/                    # Shared utilities and data
│   ├── db.ts               # Dexie.js local database (offline)
│   ├── gemini.ts           # AI integration (CometAPI/Ollama)
│   ├── ocr.ts              # Tesseract.js text extraction
│   ├── prisma.ts           # Prisma client (unused in production)
│   ├── sampleProblems.ts   # Math problem bank (30+ problems)
│   └── supabase.ts         # Supabase client + CRUD functions
├── prisma/                 # Prisma schema (not used in production)
│   └── schema.prisma       # Database schema definition
├── supabase/               # Supabase configuration
├── public/                 # Static assets
│   ├── plai-logo.svg       # Company logo
│   └── *.svg               # Next.js default icons
├── docs/                   # Documentation
│   └── plans/              # Design documents
├── .planning/              # GSD planning documents
│   └── codebase/           # Architecture analysis (this file)
├── middleware.ts           # Auth route protection
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
├── CHANGELOG.md            # Version history and roadmap
└── CLAUDE.md               # Claude Code instructions
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router pages and API routes
- Contains: Page components (`.tsx`), API route handlers (`route.ts`)
- Key files: `page.tsx` (main app), `layout.tsx` (root layout), `middleware.ts` (auth)

**`app/api/`:**
- Purpose: Backend REST API endpoints
- Contains: Route handlers using Next.js conventions
- Key files: `chat/route.ts` (AI), `students/route.ts` (CRUD), `auth/student/route.ts` (login)

**`components/`:**
- Purpose: Reusable UI components
- Contains: React functional components with hooks
- Key files: `Conversation.tsx` (main feature), `SupabaseProvider.tsx` (auth context)

**`lib/`:**
- Purpose: Shared business logic and utilities
- Contains: Database clients, API integrations, data files
- Key files: `supabase.ts` (data layer), `gemini.ts` (AI), `sampleProblems.ts` (content)

**`prisma/`:**
- Purpose: Database schema (legacy, not used)
- Contains: Prisma schema file
- Key files: `schema.prisma` (alternative schema design)

**`docs/plans/`:**
- Purpose: Design documents and planning
- Contains: Feature specs, architecture decisions

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Main student learning interface
- `app/teacher/page.tsx`: Teacher management dashboard
- `app/layout.tsx`: Root HTML layout with providers
- `middleware.ts`: Request interception for auth

**Configuration:**
- `next.config.ts`: Next.js settings
- `tsconfig.json`: TypeScript compiler options
- `package.json`: Dependencies, scripts
- `.env.local`: Environment variables (not committed)

**Core Logic:**
- `lib/supabase.ts`: All database operations (395 lines)
- `lib/gemini.ts`: AI tutoring system prompt and streaming (164 lines)
- `lib/sampleProblems.ts`: Math problem content (482 lines)
- `components/Conversation.tsx`: Chat UI and state (474 lines)

**Testing:**
- No test files present (not implemented)

## Naming Conventions

**Files:**
- Pages: `page.tsx` in directory-based routing
- API routes: `route.ts` in `app/api/*/`
- Components: PascalCase (`Conversation.tsx`, `StudentLogin.tsx`)
- Utilities: camelCase (`sampleProblems.ts`, `supabase.ts`)

**Directories:**
- Routes: kebab-case (`auth/student/`, `api/chat/`)
- Feature directories: lowercase singular (`teacher/`, `upload/`)

**Variables/Functions:**
- Functions: camelCase (`handleSubmit`, `fetchStudents`)
- React components: PascalCase (`function Conversation()`)
- Interfaces: PascalCase (`interface MathProblem`)
- Constants: SCREAMING_SNAKE_CASE (`MESSAGE_LIMIT`, `DEFAULT_XP_GOAL`)

## Where to Add New Code

**New Feature (e.g., achievements system):**
- Primary code: `lib/achievements.ts` (logic), `components/Achievements.tsx` (UI)
- API routes: `app/api/achievements/route.ts`
- Types: Add interfaces to `lib/supabase.ts` or new file

**New Component (e.g., leaderboard):**
- Implementation: `components/Leaderboard.tsx`
- Follow pattern of existing components (client directive, hooks, motion)

**New API Route:**
- Create: `app/api/[resource]/route.ts`
- Export async functions: `GET`, `POST`, `PUT`, `DELETE`
- Import utilities from `lib/supabase.ts`

**New Page:**
- Create: `app/[route]/page.tsx`
- Add `'use client'` directive if using hooks
- Protect with middleware if auth required

**Utilities:**
- Shared helpers: `lib/[name].ts`
- Types: Add to relevant `lib/*.ts` file or `types/` directory (create if needed)

**New Math Problems:**
- Add to array in `lib/sampleProblems.ts`
- Follow `MathProblem` interface structure

## Special Directories

**`.planning/codebase/`:**
- Purpose: Architecture analysis documents (this file)
- Generated: Partially (by analysis tools)
- Committed: Yes (for reference)

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in .gitignore)

**`.vercel/`:**
- Purpose: Vercel deployment config
- Generated: Yes (by Vercel CLI)
- Committed: No (in .gitignore)

**`supabase/`:**
- Purpose: Supabase local config
- Generated: Partially
- Committed: Varies (check contents)

---

*Structure analysis: 2026-01-26*
