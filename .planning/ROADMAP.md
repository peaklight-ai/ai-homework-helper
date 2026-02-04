# Roadmap: v2.3.0 PM Feedback Fixes

## Overview

This milestone addresses all PM feedback from testing: critical bugs blocking teacher/student workflows, database migrations for pending features, diagnostic content expansion, and AI personalization. The work naturally clusters into 6 phases ordered by dependencies: bugs first (unblock testing), then migrations (enable features), then visibility/content/management in parallel, and finally AI enhancement that builds on working targets.

## Milestones

- ✅ **v2.2.0 MVP** - Phases 1-3 (shipped 2026-02-02)
- 🚧 **v2.3.0 PM Feedback Fixes** - Phases 1-6 (in progress)

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

### 🚧 v2.3.0 PM Feedback Fixes (Current)

**Milestone Goal:** Fix all blocking bugs, deploy pending features, expand diagnostic content, and enable AI-target integration.

---

### Phase 1: Critical Bug Fixes
**Goal**: Remove all blocking bugs so teachers and students can use core features
**Depends on**: Nothing (first priority)
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06
**Success Criteria** (what must be TRUE):
  1. Teacher can successfully create an exercise without errors
  2. Student sees assigned exercises on their home screen
  3. Teacher sees assigned exercises in their dashboard
  4. Quiz/diagnostic loads within 3 seconds (no perceivable lag)
  5. Answer box text is clearly visible (proper contrast)
  6. Student grade appears next to name in UI header
**Plans**: TBD

Plans:
- [ ] 01-01: Fix exercise creation and assignment visibility bugs
- [ ] 01-02: Fix UI/UX issues (performance, contrast, grade display)

---

### Phase 2: Database Migrations
**Goal**: Deploy Topic Mastery and Cognitive Visibility features to production
**Depends on**: Phase 1 (bugs fixed first to ensure stable testing)
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04
**Success Criteria** (what must be TRUE):
  1. Topic Mastery migration runs successfully in Supabase
  2. Cognitive Visibility migration runs successfully in Supabase
  3. Topic Mastery UI displays real student data (not placeholder)
  4. Cognitive Visibility UI shows actual diagnostic results
**Plans**: TBD

Plans:
- [ ] 02-01: Run database migrations and verify UI rendering

---

### Phase 3: Data Visibility
**Goal**: Teachers have complete visibility into student diagnostic and exercise results
**Depends on**: Phase 2 (migrations must be complete)
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04
**Success Criteria** (what must be TRUE):
  1. Teacher can view diagnostic test scores for any student
  2. Teacher can view exercise completion status and results per student
  3. Students cannot see exercise hints (teacher-only information)
  4. Students cannot see target strategy details (teacher-only information)
**Plans**: TBD

Plans:
- [ ] 03-01: Add teacher diagnostic and exercise result views
- [ ] 03-02: Hide teacher-only fields from student view

---

### Phase 4: Diagnostic Content Expansion
**Goal**: Diagnostic test covers all math domains with grade-appropriate questions
**Depends on**: Nothing (can run parallel to Phases 2-3)
**Requirements**: CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05, CONTENT-06
**Success Criteria** (what must be TRUE):
  1. Diagnostic includes subtraction questions across difficulty levels
  2. Diagnostic includes multiplication questions across difficulty levels
  3. Diagnostic includes division questions across difficulty levels
  4. Diagnostic includes word problems testing problem-solving skills
  5. Questions filter appropriately for student's grade level
  6. Code comments explain how student level is determined from results
**Plans**: TBD

Plans:
- [ ] 04-01: Add subtraction, multiplication, division questions
- [ ] 04-02: Add word problems and implement grade filtering
- [ ] 04-03: Document level determination algorithm

---

### Phase 5: Student Management
**Goal**: Teachers can edit student information after initial creation
**Depends on**: Nothing (can run parallel to Phases 2-4)
**Requirements**: STUDENT-01, STUDENT-02, STUDENT-03
**Success Criteria** (what must be TRUE):
  1. Teacher can change a student's name from the dashboard
  2. Teacher can change a student's grade level from the dashboard
  3. Teacher can move a student to a different class
**Plans**: TBD

Plans:
- [ ] 05-01: Add student edit modal with name, grade, class fields

---

### Phase 6: AI Target Integration
**Goal**: AI tutor personalizes teaching based on student's current learning target
**Depends on**: Phases 1-3 (targets system must be working and visible)
**Requirements**: AI-01, AI-02
**Success Criteria** (what must be TRUE):
  1. AI tutor reads student's current target at the start of each session
  2. AI adapts its teaching approach to align with the target goal
**Plans**: TBD

Plans:
- [ ] 06-01: Integrate target context into AI system prompt

---

## Traceability Matrix

| Requirement | Description | Phase | Status |
|-------------|-------------|-------|--------|
| BUG-01 | Fix "Failed to create exercise" error | Phase 1 | Pending |
| BUG-02 | Fix assigned exercises not in student profile | Phase 1 | Pending |
| BUG-03 | Fix assigned exercises not in teacher dashboard | Phase 1 | Pending |
| BUG-04 | Fix quiz/diagnostic performance | Phase 1 | Pending |
| BUG-05 | Fix answer box color visibility | Phase 1 | Pending |
| BUG-06 | Show student grade next to name | Phase 1 | Pending |
| DEPLOY-01 | Run Topic Mastery migration | Phase 2 | Pending |
| DEPLOY-02 | Run Cognitive Visibility migration | Phase 2 | Pending |
| DEPLOY-03 | Verify Topic Mastery UI | Phase 2 | Pending |
| DEPLOY-04 | Verify Cognitive Visibility UI | Phase 2 | Pending |
| VIS-01 | Teacher views diagnostic results | Phase 3 | Pending |
| VIS-02 | Teacher views exercise results | Phase 3 | Pending |
| VIS-03 | Hide hints from students | Phase 3 | Pending |
| VIS-04 | Hide target strategy from students | Phase 3 | Pending |
| CONTENT-01 | Add subtraction to diagnostic | Phase 4 | Pending |
| CONTENT-02 | Add multiplication to diagnostic | Phase 4 | Pending |
| CONTENT-03 | Add division to diagnostic | Phase 4 | Pending |
| CONTENT-04 | Add word problems to diagnostic | Phase 4 | Pending |
| CONTENT-05 | Grade-level filtering for diagnostic | Phase 4 | Pending |
| CONTENT-06 | Document level determination algorithm | Phase 4 | Pending |
| STUDENT-01 | Teacher edits student name | Phase 5 | Pending |
| STUDENT-02 | Teacher edits student grade | Phase 5 | Pending |
| STUDENT-03 | Teacher changes student class | Phase 5 | Pending |
| AI-01 | AI reads student target at session start | Phase 6 | Pending |
| AI-02 | AI adapts teaching to target goal | Phase 6 | Pending |

**Coverage:** 24/24 requirements mapped

## Progress

**Execution Order:** Phase 1 → Phase 2 → Phases 3, 4, 5 (parallel) → Phase 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Critical Bug Fixes | 0/2 | Not started | - |
| 2. Database Migrations | 0/1 | Not started | - |
| 3. Data Visibility | 0/2 | Not started | - |
| 4. Diagnostic Content | 0/3 | Not started | - |
| 5. Student Management | 0/1 | Not started | - |
| 6. AI Target Integration | 0/1 | Not started | - |

---
*Roadmap created: 2026-02-04*
*Milestone: v2.3.0 PM Feedback Fixes*
