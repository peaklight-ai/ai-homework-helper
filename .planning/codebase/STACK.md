# Technology Stack

**Analysis Date:** 2026-01-26

## Languages

**Primary:**
- TypeScript 5.x - All application code (components, API routes, utilities)
- TSX - React components with JSX syntax

**Secondary:**
- CSS - Global styles via Tailwind CSS
- SQL - Prisma schema definitions

## Runtime

**Environment:**
- Node.js 22.20.0
- Next.js 16.0.7 (App Router)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.0.7 - Full-stack React framework with App Router
- React 19.2.0 - UI component library
- React DOM 19.2.0 - DOM rendering

**UI:**
- Chakra UI 3.29.0 - Component library (minimal usage, mainly `ChakraProvider`)
- Tailwind CSS 4.x - Utility-first CSS framework
- Framer Motion 12.23.24 - Animation library (heavily used throughout)

**Data:**
- Dexie.js 4.2.1 - IndexedDB wrapper for client-side storage
- Prisma 6.19.0 - ORM for PostgreSQL (schema defined, not actively used)
- Supabase JS 2.90.1 - Backend-as-a-service client

**Build/Dev:**
- ESLint 9.x - Code linting with Next.js config
- PostCSS with @tailwindcss/postcss - CSS processing

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.90.1 - Primary database and auth
- `@supabase/ssr` 0.8.0 - Server-side Supabase client for SSR/middleware
- `framer-motion` 12.23.24 - All UI animations and transitions
- `dexie` 4.2.1 - Client-side IndexedDB storage for offline data
- `dexie-react-hooks` 4.2.0 - React hooks for Dexie queries

**AI/ML:**
- `tesseract.js` 7.0.0 - OCR for extracting math problems from images

**Math Rendering:**
- `katex` 0.16.25 - LaTeX math rendering (listed in dependencies)
- `react-katex` 3.1.0 - React wrapper for KaTeX

**Visual Effects:**
- `canvas-confetti` 1.9.4 - Celebration confetti on correct answers
- `react-confetti` 6.4.0 - Alternative confetti component
- `react-circular-progressbar` 2.2.0 - XP/level progress display
- `lottie-react` 2.4.1 - Lottie animations (listed but not detected in use)

**Infrastructure:**
- `@prisma/client` 6.19.0 - Prisma ORM client (schema exists but not actively used)
- `dotenv` 17.2.3 - Environment variable loading

## Configuration

**Environment:**
- `.env.local` - Local environment variables
- `.env.local.example` - Template showing required variables

**Required Environment Variables:**
```
# LLM Configuration (choose one)
USE_OLLAMA=true|false
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
COMET_API_KEY=<api-key>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-key>

# Database (Prisma - not actively used)
DATABASE_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Build:**
- `next.config.ts` - Next.js configuration (minimal, default settings)
- `tsconfig.json` - TypeScript configuration (ES2017 target, strict mode, `@/*` path alias)
- `eslint.config.mjs` - ESLint flat config with Next.js core-web-vitals + TypeScript
- `postcss.config.mjs` - PostCSS with Tailwind plugin
- `prisma.config.ts` - Prisma configuration (classic engine)

## Platform Requirements

**Development:**
- Node.js 22+ recommended
- npm for package management
- Local Ollama instance OR CometAPI key for AI features
- Supabase project for auth/database

**Production:**
- Vercel (primary deployment target)
- Supabase hosted database
- CometAPI for LLM access (Gemini 2.5 Flash)

## TypeScript Configuration

**Key Settings:**
- Target: ES2017
- Module: ESNext with bundler resolution
- Strict mode: enabled
- JSX: react-jsx (automatic runtime)
- Incremental compilation: enabled
- Path alias: `@/*` maps to project root

**Included:**
- All `.ts`, `.tsx`, `.mts` files
- Next.js type definitions

---

*Stack analysis: 2026-01-26*
