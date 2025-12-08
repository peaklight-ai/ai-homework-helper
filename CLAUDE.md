# AI Homework Helper - Claude Code Instructions

## Project Overview

AI Homework Helper is a gamified, Socratic math tutoring app for primary school children (grades 1-6). The AI guides students through problems with questions rather than giving direct answers.

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **UI:** Chakra UI, Framer Motion, Tailwind CSS
- **AI:** CometAPI → Gemini 2.5 Flash
- **Math Rendering:** KaTeX
- **Storage:** Dexie.js (IndexedDB) for profiles/questions
- **Avatars:** DiceBear API
- **Deployment:** Vercel

## Key Files

| File | Purpose |
|------|---------|
| `app/api/chat/route.ts` | Chat API endpoint, handles AI streaming |
| `app/page.tsx` | Main learning interface |
| `components/Conversation.tsx` | Core chat UI, message handling, XP |
| `lib/gemini.ts` | Socratic AI logic, system prompt |
| `lib/sampleProblems.ts` | Sample math problems |
| `lib/db.ts` | Dexie.js database setup (V2) |
| `CHANGELOG.md` | Version history and roadmap |
| `docs/plans/` | Design documents |

## Critical Rules

1. **ALWAYS read `CHANGELOG.md` at the start of every session** to understand current progress and pending tasks.

2. **ALWAYS update `CHANGELOG.md`** when you:
   - Complete a bug fix (check the box)
   - Complete a feature (check the box)
   - Add new planned features
   - Make significant technical decisions

3. **Socratic Method:** The AI tutor must NEVER give direct answers. It guides with questions.

4. **Age-Appropriate:** All content and language should be suitable for grades 1-6 (ages 6-12).

5. **Minimalist Design:** Don't over-engineer. Keep solutions simple and focused.

## Current Version Status

Read `CHANGELOG.md` for the authoritative list of:
- What's been completed
- What's in progress
- What's planned for future versions

## Development Workflow

1. Read `CHANGELOG.md` first
2. Check `docs/plans/` for design documents
3. Implement changes
4. Update `CHANGELOG.md` with progress
5. Test changes work correctly

## Environment Variables

```
COMET_API_KEY=<API key from api.cometapi.com>
DATABASE_URL=<PostgreSQL connection string (future)>
```

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Design Philosophy

- **Minimalist** - Simple, focused UI
- **Easy to manipulate** - Students can use independently
- **Fun like ClassDojo** - Gamified experience with XP, avatars, celebrations
