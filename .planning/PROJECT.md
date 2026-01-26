# Valid - AI Homework Helper

## What This Is

A gamified, Socratic math tutoring app for primary school children (grades 1-6). Teachers create classes, assign exercises, and track student progress. Students log in with codes, take diagnostic tests, and receive AI-guided tutoring that adapts to their level. The AI guides with questions rather than giving direct answers.

## Core Value

**Students receive personalized math tutoring that adapts to their actual competency level, with teachers having full visibility and control over the learning journey.**

## Requirements

### Validated

<!-- Existing functionality from codebase -->

- ✓ Teacher can sign up and log in with email/password — existing
- ✓ Teacher can add individual students with login codes — existing
- ✓ Student can log in with 6-character code — existing
- ✓ Student receives AI-guided Socratic tutoring — existing
- ✓ AI streams responses in real-time — existing
- ✓ Student can upload homework photos for OCR extraction — existing
- ✓ XP points system tracks student progress — existing
- ✓ Teacher can view student list and basic progress — existing
- ✓ Topic/domain selection available (partial) — existing
- ✓ 30+ sample math problems across domains — existing

### Active

<!-- Sprint 1: Teacher Experience -->

- [ ] Fix app blocking interaction after correct answer (bug)
- [ ] Fix email configuration (emails going to junk)
- [ ] Teacher can upload class list (bulk import)
- [ ] Students organized by class (not mixed lists)
- [ ] Teacher settings: topic, difficulty level, hints/strategies
- [ ] Teacher can upload homework by grade/class/student
- [ ] Teacher can assign exercises to specific students

<!-- Sprint 2: Student Experience & Analytics -->

- [ ] Diagnostic test administered on student's first login
- [ ] Diagnostic sets student's initial level automatically
- [ ] Diagnostic results sent to teacher
- [ ] Student can see their targets/objectives (set by teacher)
- [ ] Dynamic strengths/weaknesses profile per student
- [ ] Teacher can view how student reasons and functions cognitively

<!-- Buffer Week: Polish -->

- [ ] Teacher can upload hints/strategies linked to exercises
- [ ] Progression logic refinement (Yusef's review pack reference)

### Out of Scope

- Student uploads own exercises — deferred to future phase (teacher-only for MVP)
- Real-time chat between teacher and student — not in MVP scope
- Arabic reading comprehension — long-term goal, not MVP
- French version — long-term goal, not MVP
- ClassDojo integration — long-term goal, not MVP
- Visual learning (diagrams, maps) — long-term goal, not MVP

## Context

**Stakeholders:**
- Product Owner: Cynthia El Kik (weekly sprint meetings)
- Target Users: Primary school teachers and students (grades 1-6)

**Current State:**
- Functional prototype with basic tutoring flow
- Supabase backend with teacher auth and student data
- AI integration via CometAPI (Gemini 2.5 Flash)
- Known bugs: app blocking after correct answer, emails to junk

**Technical Debt (from codebase audit):**
- Dual data storage (Dexie + Supabase) needs consolidation
- Unused Prisma installation
- Hardcoded password bypass ("cynthia") in Conversation.tsx
- No test coverage
- Large component files (800+ lines)

**Reference Material:**
- Yusef's review pack for progression logic
- Meeting notes from 20 January 2026 with Cynthia

## Constraints

- **Timeline**: MVP due end of February 2026 (~3 weeks)
- **Sprint Cadence**: 1-week sprints
- **Tech Stack**: Next.js 16, React 19, Supabase, CometAPI (locked in)
- **Age Appropriateness**: All content suitable for ages 6-12

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 2 sprints + buffer week | Aggressive timeline, focus on essentials | — Pending |
| Teacher-only exercise upload for MVP | Reduce complexity, students upload later | — Pending |
| Class-based organization | Cynthia requirement, no mixed student lists | — Pending |
| Diagnostic test on first login | Sets proper starting level | — Pending |

---
*Last updated: 2026-01-26 after initialization*
