# Valid - AI Homework Helper

## What This Is

A gamified, Socratic math tutoring app for primary school children (grades 1-6). Teachers create classes, assign exercises, and track student progress. Students log in with codes, take diagnostic tests, and receive AI-guided tutoring that adapts to their level. The AI guides with questions rather than giving direct answers.

## Core Value

**Students receive personalized math tutoring that adapts to their actual competency level, with teachers having full visibility and control over the learning journey.**

## Current Milestone: v2.3.0 PM Feedback Fixes

**Goal:** Fix all bugs from PM testing, deploy pending features, improve quiz content quality, and ensure teacher-student data synchronization.

**Target features:**
- Fix exercise upload bug ("Failed to create exercise")
- Fix assigned exercises visibility (student + teacher views)
- Deploy Topic Mastery and Cognitive Visibility (run migrations)
- Improve quiz/diagnostic content (all grades, all domains, problem-solving)
- Enable teacher to see all results (diagnostic + exercises)
- Add student info editing capability
- Integrate AI with student targets for personalized teaching
- Fix UI issues (answer box color, grade display, performance)

---

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

<!-- v2.3.0: PM Feedback Fixes -->

**Bug Fixes:**
- [ ] Fix "Failed to create exercise" bug in exercise upload
- [ ] Fix assigned exercises not showing in student profile
- [ ] Fix assigned exercises not showing in teacher profile
- [ ] Fix quiz/diagnostic performance (too slow)
- [ ] Fix answer box color visibility issue
- [ ] Show student grade next to name in UI

**Data Visibility & Sync:**
- [ ] Teacher can see diagnostic test results
- [ ] Teacher can see exercise completion results
- [ ] Hide hints/targets from student view (teacher-only)
- [ ] Sync teacher and student profile data

**Content Quality:**
- [ ] Expand quiz questions beyond addition (all 4 operations)
- [ ] Add problem-solving questions (not just equations)
- [ ] Ensure questions are grade-appropriate (grades 1-6)
- [ ] Document how student level is determined

**Missing Features:**
- [ ] Teacher can update student info after creation
- [ ] Deploy Topic Mastery feature (run migration)
- [ ] Deploy Cognitive Visibility feature (run migration)

**AI Enhancement:**
- [ ] AI tutor uses student targets to customize teaching approach

### Out of Scope

- Student uploads own exercises — deferred to future phase (teacher-only for MVP)
- Real-time chat between teacher and student — not in MVP scope
- Arabic reading comprehension — long-term goal, not MVP
- French version — long-term goal, not MVP
- ClassDojo integration — long-term goal, not MVP
- Visual learning (diagrams, maps) — long-term goal, not MVP

## Context

**Stakeholders:**
- Product Owners: Cynthia El Kik, Chadi Abi Fadel (weekly sprint meetings)
- dev: Chadi Abi Fadel (peaklight.ai)
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
*Last updated: 2026-02-03 after v2.3.0 milestone initialization*
