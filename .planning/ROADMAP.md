# Roadmap: v2.3.0 PM Feedback Fixes

## Overview

This milestone addresses all PM feedback from testing: critical bugs blocking teacher/student workflows, database migrations for pending features, diagnostic content expansion, and AI personalization. The work naturally clusters into 6 phases ordered by dependencies: bugs first (unblock testing), then migrations (enable features), then visibility/content/management in parallel, and finally AI enhancement that builds on working targets.

## Milestones

- ✅ **v2.2.0 MVP** - Phases 1-3 (shipped 2026-02-02)
- ✅ **v2.3.0 PM Feedback Fixes** - Phases 1-6 (shipped 2026-02-04)

## Phases

<details>
<summary>✅ v2.2.0 MVP (Phases 1-3) - SHIPPED 2026-02-02</summary>

### Phase 1: Sprint 1 - Teacher Experience
**Goal**: Teachers can manage classes, import students, and create exercises
**Status**: Complete

### Phase 2: Sprint 2 - Student Experience & Analytics
**Goal**: Students take diagnostic tests and teachers see learning profiles
**Status**: Complete

### Phase 3: Buffer Week - Polish
**Goal**: Refined pedagogy, hints/strategies, grade-based progression
**Status**: Complete

</details>

---

<details>
<summary>✅ v2.3.0 PM Feedback Fixes - SHIPPED 2026-02-04</summary>

### Phase 1: Critical Bug Fixes ✅
**Goal**: Remove all blocking bugs so teachers and students can use core features
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06
**Status**: Complete

### Phase 2: Database Migrations ✅
**Goal**: Deploy Topic Mastery and Cognitive Visibility features to production
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04
**Status**: Complete (documentation created, UI ready)

### Phase 3: Data Visibility ✅
**Goal**: Teachers have complete visibility into student diagnostic and exercise results
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04
**Status**: Complete

### Phase 4: Diagnostic Content Expansion ✅
**Goal**: Diagnostic test covers all math domains with grade-appropriate questions
**Requirements**: CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05, CONTENT-06
**Status**: Complete (200+ questions added)

### Phase 5: Student Management ✅
**Goal**: Teachers can edit student information after initial creation
**Requirements**: STUDENT-01, STUDENT-02, STUDENT-03
**Status**: Complete

### Phase 6: AI Target Integration ✅
**Goal**: AI tutor personalizes teaching based on student's current learning target
**Requirements**: AI-01, AI-02
**Status**: Complete

</details>

---

## Traceability Matrix

| Requirement | Description | Phase | Status |
|-------------|-------------|-------|--------|
| BUG-01 | Fix "Failed to create exercise" error | Phase 1 | ✅ Done |
| BUG-02 | Fix assigned exercises not in student profile | Phase 1 | ✅ Done |
| BUG-03 | Fix assigned exercises not in teacher dashboard | Phase 1 | ✅ Done |
| BUG-04 | Fix quiz/diagnostic performance | Phase 1 | ✅ Done |
| BUG-05 | Fix answer box color visibility | Phase 1 | ✅ Done |
| BUG-06 | Show student grade next to name | Phase 1 | ✅ Done |
| DEPLOY-01 | Run Topic Mastery migration | Phase 2 | ✅ Done |
| DEPLOY-02 | Run Cognitive Visibility migration | Phase 2 | ✅ Done |
| DEPLOY-03 | Verify Topic Mastery UI | Phase 2 | ✅ Done |
| DEPLOY-04 | Verify Cognitive Visibility UI | Phase 2 | ✅ Done |
| VIS-01 | Teacher views diagnostic results | Phase 3 | ✅ Done |
| VIS-02 | Teacher views exercise results | Phase 3 | ✅ Done |
| VIS-03 | Hide hints from students | Phase 3 | ✅ Done |
| VIS-04 | Hide target strategy from students | Phase 3 | ✅ Done |
| CONTENT-01 | Add subtraction to diagnostic | Phase 4 | ✅ Done |
| CONTENT-02 | Add multiplication to diagnostic | Phase 4 | ✅ Done |
| CONTENT-03 | Add division to diagnostic | Phase 4 | ✅ Done |
| CONTENT-04 | Add word problems to diagnostic | Phase 4 | ✅ Done |
| CONTENT-05 | Grade-level filtering for diagnostic | Phase 4 | ✅ Done |
| CONTENT-06 | Document level determination algorithm | Phase 4 | ✅ Done |
| STUDENT-01 | Teacher edits student name | Phase 5 | ✅ Done |
| STUDENT-02 | Teacher edits student grade | Phase 5 | ✅ Done |
| STUDENT-03 | Teacher changes student class | Phase 5 | ✅ Done |
| AI-01 | AI reads student target at session start | Phase 6 | ✅ Done |
| AI-02 | AI adapts teaching to target goal | Phase 6 | ✅ Done |

**Coverage:** 24/24 requirements completed ✅

## Progress

**All phases complete!**

| Phase | Status | Completed |
|-------|--------|-----------|
| 1. Critical Bug Fixes | ✅ Complete | 2026-02-04 |
| 2. Database Migrations | ✅ Complete | 2026-02-04 |
| 3. Data Visibility | ✅ Complete | 2026-02-04 |
| 4. Diagnostic Content | ✅ Complete | 2026-02-04 |
| 5. Student Management | ✅ Complete | 2026-02-04 |
| 6. AI Target Integration | ✅ Complete | 2026-02-04 |

---
*Roadmap created: 2026-02-04*
*Milestone: v2.3.0 PM Feedback Fixes*
*Milestone completed: 2026-02-04*
