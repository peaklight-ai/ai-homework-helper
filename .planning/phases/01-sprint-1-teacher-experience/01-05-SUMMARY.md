---
phase: 01-sprint-1-teacher-experience
plan: 05
subsystem: api, database
tags: [supabase, exercises, assignments, postgresql, rest-api]

# Dependency graph
requires:
  - phase: 01-02
    provides: Class management API, Supabase client patterns
provides:
  - Exercise and ExerciseAssignment database tables
  - Exercise types (Exercise, ExerciseAssignment interfaces)
  - Exercise CRUD functions (create, list by teacher)
  - Assignment functions (to class, to students, for student)
  - GET/POST /api/exercises endpoint
  - POST /api/exercises/assign endpoint
affects: [01-06-teacher-ui, 02-student-experience]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Exercise assignment polymorphism (class_id OR student_id)"
    - "CHECK constraint for required target"

key-files:
  created:
    - supabase/migrations/002_exercises.sql
    - app/api/exercises/route.ts
    - app/api/exercises/assign/route.ts
  modified:
    - lib/supabase.ts

key-decisions:
  - "Minimal schema: only essential columns per user cost constraint"
  - "Single assignments table with class_id OR student_id (polymorphic)"
  - "CHECK constraint ensures assignment has target"

patterns-established:
  - "Assignment response includes success/assigned/failed counts for batch ops"

# Metrics
duration: 6min
completed: 2026-01-27
---

# Phase 01 Plan 05: Exercise System Summary

**Exercises and assignments API with Supabase: teachers can create exercises and assign to classes or individual students**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-26T22:09:57Z
- **Completed:** 2026-01-26T22:15:54Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Created exercises and exercise_assignments database schema with proper constraints
- Added Exercise/ExerciseAssignment types and 5 CRUD/query functions to lib/supabase.ts
- Built exercise listing, creation, and assignment API endpoints
- Fixed pre-existing type annotation issue blocking build

## Task Commits

Each task was committed atomically:

1. **Task 1: Create exercises database schema** - `bbdb0c6` (feat)
2. **Task 2: Add Exercise types and functions** - `dc0967d` (feat)
3. **Task 3: Create exercise API routes** - `e7a7a86` (feat)

## Files Created/Modified

- `supabase/migrations/002_exercises.sql` - Exercises and assignments tables with RLS
- `lib/supabase.ts` - Exercise/ExerciseAssignment types, 5 new functions
- `app/api/exercises/route.ts` - GET (list) and POST (create) exercises
- `app/api/exercises/assign/route.ts` - POST assignment to class or students

## Decisions Made

- Minimal schema with only essential columns (question, answer, difficulty, domain, grade)
- Single exercise_assignments table with polymorphic target (class_id OR student_id)
- CHECK constraint ensures at least one target is provided
- Assignment response includes success/failed counts for batch operations

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed type annotation in teacher dashboard**
- **Found during:** Task 3 (build verification)
- **Issue:** `filteredStudents` variable had implicit union type preventing progress access
- **Fix:** Added explicit `Student[]` type annotation
- **Files modified:** app/teacher/page.tsx
- **Verification:** Build passes successfully
- **Committed in:** e7a7a86 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix was necessary for build to pass. No scope creep.

## Issues Encountered

None - plan executed as specified.

## User Setup Required

**Database migration required.** Run in Supabase Dashboard > SQL Editor:
1. Open `supabase/migrations/002_exercises.sql`
2. Copy contents and run in SQL Editor
3. Verify tables exist: `exercises`, `exercise_assignments`

## Next Phase Readiness

- Exercise backend complete, ready for teacher UI (01-06)
- Student-side exercise retrieval function available for Sprint 2
- No blockers

---
*Phase: 01-sprint-1-teacher-experience*
*Completed: 2026-01-27*
