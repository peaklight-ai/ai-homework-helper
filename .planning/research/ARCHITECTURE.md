# Architecture Patterns: Diagnostic Assessments, Student Profiling & Class Management

**Domain:** EdTech / Adaptive Learning Platform (K-6 Math Tutoring)
**Researched:** 2026-01-26
**Confidence:** HIGH (based on existing codebase + established EdTech patterns)

## Executive Summary

This document provides the architecture for extending Valid's Supabase backend with three new capabilities: diagnostic assessments, student profiling/analytics, and class management. The design builds on the existing schema (teachers, students, progress, student_settings, custom_problems, homework_uploads) and follows established patterns from learning analytics research and adaptive learning systems.

**Key Insight:** The existing schema tracks *what* students answer but not *how* they reason. The new architecture captures reasoning patterns, misconceptions, and strategy effectiveness to enable true adaptive learning.

---

## Recommended Architecture

### High-Level System View

```
+------------------+     +------------------+     +------------------+
|   Teacher UI     |     |   Student UI     |     |   AI Tutor       |
|   (Dashboard)    |     |   (Learning)     |     |   (Gemini)       |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         v                        v                        v
+-----------------------------------------------------------------------+
|                         Next.js API Layer                              |
|   /api/classes  /api/diagnostics  /api/profiles  /api/exercises       |
+-----------------------------------------------------------------------+
         |                        |                        |
         v                        v                        v
+-----------------------------------------------------------------------+
|                     Supabase PostgreSQL                                |
|                                                                        |
|  +-------------+  +----------------+  +------------------+             |
|  | classes     |  | diagnostic_    |  | student_         |             |
|  | class_      |  |   results      |  |   profiles       |             |
|  |   students  |  | diagnostic_    |  | skill_mastery    |             |
|  |             |  |   attempts     |  | reasoning_logs   |             |
|  +-------------+  +----------------+  +------------------+             |
|                                                                        |
|  +----------------+  +------------------+                              |
|  | exercises      |  | exercise_        |                              |
|  | exercise_hints |  |   assignments    |                              |
|  +----------------+  +------------------+                              |
+-----------------------------------------------------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `classes` | Class roster management, grouping students | teachers, students |
| `diagnostic_results` | Stores completed diagnostic outcomes | students, student_profiles |
| `diagnostic_attempts` | Individual question attempts during diagnostic | diagnostic_results, exercises |
| `student_profiles` | Computed strengths, weaknesses, learning style | students, skill_mastery |
| `skill_mastery` | Per-skill mastery levels (0.0-1.0) | students, exercises |
| `reasoning_logs` | How student approached problems (strategies, time, hints) | students, exercises |
| `exercises` | Teacher-uploaded problems (extends custom_problems) | teachers, classes |
| `exercise_hints` | Strategies linked to exercises | exercises |
| `exercise_assignments` | Which exercises assigned to which students/classes | exercises, classes, students |

---

## Database Schema Additions

### Phase 1: Class Management (Build First)

Classes are foundational - everything else depends on organizing students into classes.

```sql
-- =============================================================================
-- CLASSES TABLE
-- =============================================================================
-- Organizes students into classes (e.g., "Grade 3 - Section A")
-- Teachers can have multiple classes
-- =============================================================================

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  description TEXT,
  school_year TEXT, -- e.g., "2025-2026"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_teacher ON classes(teacher_id);

-- =============================================================================
-- CLASS_STUDENTS (Junction Table)
-- =============================================================================
-- Many-to-many: students can be in multiple classes (rare but possible)
-- Enables class-based organization required by Cynthia
-- =============================================================================

CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
  UNIQUE(class_id, student_id)
);

CREATE INDEX idx_class_students_class ON class_students(class_id);
CREATE INDEX idx_class_students_student ON class_students(student_id);
```

**RLS Policies for Classes:**

```sql
-- Teachers manage their own classes
CREATE POLICY "Teachers manage own classes" ON classes
  FOR ALL USING (teacher_id = auth.uid());

-- Teachers see students in their classes
CREATE POLICY "Teachers manage class enrollments" ON class_students
  FOR ALL USING (
    class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
  );
```

### Phase 2: Exercises & Assignments (Build Second)

Extends the existing `custom_problems` concept with assignment capabilities.

```sql
-- =============================================================================
-- EXERCISES TABLE
-- =============================================================================
-- Teacher-uploaded exercises with richer metadata than custom_problems
-- Supports assignment to classes/students
-- =============================================================================

CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,

  -- Problem content
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT, -- How to solve (shown after completion)

  -- Classification
  domain TEXT NOT NULL, -- 'number-operations', 'algebraic-thinking', etc.
  topic TEXT[], -- ['addition', 'carrying'] for more granular tagging
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5) NOT NULL,
  grade_range INTEGER[] DEFAULT ARRAY[1, 6],

  -- Skill mapping (for adaptive learning)
  skill_ids TEXT[], -- References skills in skill taxonomy

  -- Metadata
  source TEXT, -- 'manual', 'imported', 'homework_ocr'
  is_diagnostic BOOLEAN DEFAULT FALSE, -- Can be used in diagnostic tests

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exercises_teacher ON exercises(teacher_id);
CREATE INDEX idx_exercises_domain ON exercises(domain);
CREATE INDEX idx_exercises_diagnostic ON exercises(is_diagnostic) WHERE is_diagnostic = TRUE;

-- =============================================================================
-- EXERCISE_HINTS TABLE
-- =============================================================================
-- Multiple hints/strategies per exercise (ordered)
-- Teacher-defined scaffolding
-- =============================================================================

CREATE TABLE IF NOT EXISTS exercise_hints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  hint_order INTEGER NOT NULL, -- 1, 2, 3... sequence
  hint_text TEXT NOT NULL,
  hint_type TEXT DEFAULT 'hint' CHECK (hint_type IN ('hint', 'strategy', 'visual', 'example')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exercise_hints_exercise ON exercise_hints(exercise_id);

-- =============================================================================
-- EXERCISE_ASSIGNMENTS TABLE
-- =============================================================================
-- Assigns exercises to students or entire classes
-- Supports due dates and completion tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS exercise_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,

  -- Assignment target (one of these must be set)
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,

  -- Assignment metadata
  assigned_by UUID REFERENCES teachers(id) NOT NULL,
  due_date TIMESTAMPTZ,
  is_required BOOLEAN DEFAULT TRUE,

  -- Tracking
  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT target_required CHECK (class_id IS NOT NULL OR student_id IS NOT NULL)
);

CREATE INDEX idx_assignments_class ON exercise_assignments(class_id);
CREATE INDEX idx_assignments_student ON exercise_assignments(student_id);
CREATE INDEX idx_assignments_due ON exercise_assignments(due_date);
```

### Phase 3: Diagnostic System (Build Third)

Diagnostic tests assess initial skill levels across domains.

```sql
-- =============================================================================
-- DIAGNOSTIC_RESULTS TABLE
-- =============================================================================
-- Completed diagnostic test results
-- Sets initial student profile
-- =============================================================================

CREATE TABLE IF NOT EXISTS diagnostic_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,

  -- Test metadata
  test_type TEXT NOT NULL DEFAULT 'initial', -- 'initial', 'periodic', 'topic-specific'
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Overall results
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  time_spent_seconds INTEGER,

  -- Computed grade level (algorithm determines this)
  computed_grade_level NUMERIC(2,1), -- e.g., 2.5 for mid-Grade 2
  recommended_difficulty INTEGER CHECK (recommended_difficulty BETWEEN 1 AND 5),

  -- Domain-specific scores (JSONB for flexibility)
  domain_scores JSONB, -- {"number-operations": 0.75, "geometry": 0.45, ...}

  -- Teacher notification
  teacher_notified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diagnostic_student ON diagnostic_results(student_id);
CREATE INDEX idx_diagnostic_type ON diagnostic_results(test_type);

-- =============================================================================
-- DIAGNOSTIC_ATTEMPTS TABLE
-- =============================================================================
-- Individual question attempts during diagnostic
-- Rich data for understanding reasoning patterns
-- =============================================================================

CREATE TABLE IF NOT EXISTS diagnostic_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagnostic_id UUID REFERENCES diagnostic_results(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,

  -- Question snapshot (in case exercise is later deleted)
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  domain TEXT NOT NULL,
  difficulty INTEGER NOT NULL,

  -- Student response
  student_answer TEXT,
  is_correct BOOLEAN NOT NULL,

  -- Timing and behavior
  time_spent_seconds INTEGER,
  hints_requested INTEGER DEFAULT 0,
  attempt_number INTEGER DEFAULT 1, -- For retries

  -- Cognitive indicators (captured from AI interaction)
  strategy_used TEXT, -- 'counting', 'grouping', 'formula', 'guess', etc.
  error_type TEXT, -- 'calculation', 'conceptual', 'careless', 'blank'

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attempts_diagnostic ON diagnostic_attempts(diagnostic_id);
CREATE INDEX idx_attempts_exercise ON diagnostic_attempts(exercise_id);
CREATE INDEX idx_attempts_domain ON diagnostic_attempts(domain);
```

### Phase 4: Student Profiling & Analytics (Build Fourth)

Dynamic profiles that evolve based on learning interactions.

```sql
-- =============================================================================
-- SKILL_TAXONOMY TABLE
-- =============================================================================
-- Hierarchical skill definitions for K-6 math
-- Enables precise mastery tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS skill_taxonomy (
  id TEXT PRIMARY KEY, -- 'add-single-digit', 'add-with-carrying', etc.
  name TEXT NOT NULL,
  description TEXT,
  domain TEXT NOT NULL,
  grade_level INTEGER,

  -- Skill dependencies (prerequisite skills)
  prerequisite_skill_ids TEXT[],

  -- For ordering
  sort_order INTEGER DEFAULT 0
);

-- Pre-populate with K-6 math skills
-- Example skills would be inserted via a seed script

-- =============================================================================
-- SKILL_MASTERY TABLE
-- =============================================================================
-- Per-student, per-skill mastery tracking
-- Updated after each relevant interaction
-- =============================================================================

CREATE TABLE IF NOT EXISTS skill_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  skill_id TEXT REFERENCES skill_taxonomy(id) NOT NULL,

  -- Mastery level (0.0 = no exposure, 1.0 = fully mastered)
  mastery_level NUMERIC(3,2) DEFAULT 0.0 CHECK (mastery_level BETWEEN 0 AND 1),

  -- Confidence in this mastery estimate
  confidence NUMERIC(3,2) DEFAULT 0.0 CHECK (confidence BETWEEN 0 AND 1),

  -- Tracking
  attempts_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,

  -- Decay tracking (skills fade if not practiced)
  days_since_practice INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM NOW() - last_practiced_at)
  ) STORED,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(student_id, skill_id)
);

CREATE INDEX idx_mastery_student ON skill_mastery(student_id);
CREATE INDEX idx_mastery_skill ON skill_mastery(skill_id);
CREATE INDEX idx_mastery_level ON skill_mastery(mastery_level);

-- =============================================================================
-- STUDENT_PROFILES TABLE
-- =============================================================================
-- Computed/aggregated view of student learning characteristics
-- Updated periodically (not real-time)
-- =============================================================================

CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID UNIQUE REFERENCES students(id) ON DELETE CASCADE NOT NULL,

  -- Strengths and weaknesses (top/bottom domains)
  strength_domains TEXT[], -- e.g., ['geometry', 'patterns']
  weakness_domains TEXT[], -- e.g., ['fractions', 'word-problems']

  -- Learning style indicators (from AI interaction analysis)
  preferred_hint_type TEXT, -- 'visual', 'step-by-step', 'example', 'none'
  avg_time_per_problem INTEGER, -- seconds
  hints_dependency TEXT CHECK (hints_dependency IN ('low', 'medium', 'high')),

  -- Cognitive patterns (aggregated from reasoning_logs)
  common_strategies TEXT[], -- e.g., ['counting-up', 'drawing']
  common_error_types TEXT[], -- e.g., ['place-value', 'borrowing']

  -- Performance metrics
  overall_accuracy NUMERIC(3,2), -- 0.0-1.0
  growth_rate NUMERIC(4,2), -- Improvement over time (can be negative)
  consistency_score NUMERIC(3,2), -- How consistent is performance

  -- Engagement
  avg_session_length_minutes INTEGER,
  problems_per_session NUMERIC(4,1),

  -- Timestamps
  profile_generated_at TIMESTAMPTZ DEFAULT NOW(),
  data_from_date TIMESTAMPTZ, -- Oldest data included
  data_to_date TIMESTAMPTZ, -- Most recent data included

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_student ON student_profiles(student_id);

-- =============================================================================
-- REASONING_LOGS TABLE
-- =============================================================================
-- Captures HOW students reason during tutoring sessions
-- Fed by AI analysis of conversation
-- =============================================================================

CREATE TABLE IF NOT EXISTS reasoning_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,

  -- Session context
  session_started_at TIMESTAMPTZ NOT NULL,
  problem_question TEXT NOT NULL,

  -- Interaction metrics
  total_messages INTEGER DEFAULT 0,
  hints_given INTEGER DEFAULT 0,
  time_to_correct_answer_seconds INTEGER,

  -- AI-analyzed reasoning (from conversation)
  strategies_attempted TEXT[], -- ['trial-error', 'counting', 'mental-math']
  misconceptions_detected TEXT[], -- ['add-instead-of-multiply', 'forgot-carry']
  breakthrough_moment TEXT, -- What finally clicked

  -- Outcome
  final_outcome TEXT CHECK (final_outcome IN ('solved', 'gave-up', 'timed-out', 'interrupted')),
  is_correct BOOLEAN,

  -- Raw data (for reanalysis)
  conversation_summary TEXT, -- AI-generated summary

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reasoning_student ON reasoning_logs(student_id);
CREATE INDEX idx_reasoning_exercise ON reasoning_logs(exercise_id);
CREATE INDEX idx_reasoning_outcome ON reasoning_logs(final_outcome);
```

---

## Data Flow Diagrams

### Diagnostic Test Flow

```
Student First Login
       |
       v
+------------------+
| Check for        |
| existing         |
| diagnostic       |
+--------+---------+
         |
    No diagnostic exists
         |
         v
+------------------+
| Generate         |
| diagnostic test  |
| (select exercises|
| by grade/domain) |
+--------+---------+
         |
         v
+------------------+
| Student answers  |
| each question    |
| (capture timing, |
| attempts)        |
+--------+---------+
         |
         v
+------------------+     +------------------+
| Insert           |---->| diagnostic_      |
| diagnostic_      |     | attempts         |
| result           |     +------------------+
+--------+---------+
         |
         v
+------------------+
| Compute          |
| domain_scores,   |
| grade_level,     |
| difficulty       |
+--------+---------+
         |
         v
+------------------+     +------------------+
| Initialize       |---->| skill_mastery    |
| skill_mastery    |     | (per skill)      |
| records          |     +------------------+
         |
         v
+------------------+     +------------------+
| Generate         |---->| student_profiles |
| initial profile  |     +------------------+
         |
         v
+------------------+
| Notify teacher   |
| (email/dashboard)|
+------------------+
```

### Adaptive Exercise Selection Flow

```
Student requests next problem
              |
              v
+---------------------------+
| Load student profile      |
| - weakness_domains        |
| - current mastery levels  |
+-------------+-------------+
              |
              v
+---------------------------+
| Apply selection algorithm:|
| 1. Prioritize weak areas  |
| 2. Match difficulty to    |
|    current mastery        |
| 3. Consider assigned      |
|    exercises (due dates)  |
| 4. Avoid recent repeats   |
+-------------+-------------+
              |
              v
+---------------------------+
| Select exercise from pool |
| (exercises + assigned)    |
+-------------+-------------+
              |
              v
+---------------------------+
| Return exercise with      |
| relevant hints            |
+---------------------------+
```

### Reasoning Log Capture Flow

```
AI Conversation in Progress
              |
              v
+---------------------------+
| Track interaction:        |
| - Message count           |
| - Time spent              |
| - Hints requested         |
+-------------+-------------+
              |
     Student gets correct answer
              |
              v
+---------------------------+
| AI analyzes conversation: |
| - What strategies used?   |
| - What misconceptions?    |
| - What was the "aha"?     |
+-------------+-------------+
              |
              v
+---------------------------+     +------------------+
| Insert reasoning_log      |---->| reasoning_logs   |
+-------------+-------------+     +------------------+
              |
              v
+---------------------------+     +------------------+
| Update skill_mastery      |---->| skill_mastery    |
| for relevant skills       |     +------------------+
              |
              v
+---------------------------+
| Queue profile refresh     |
| (async job)               |
+---------------------------+
```

---

## Suggested Build Order

Based on dependency analysis and value delivery:

| Phase | Tables | Rationale | Effort |
|-------|--------|-----------|--------|
| **1. Classes** | `classes`, `class_students` | Foundation for organizing students. Required by Cynthia. Unblocks bulk import. | 1-2 days |
| **2. Exercises** | `exercises`, `exercise_hints`, `exercise_assignments` | Teacher needs to upload exercises before diagnostics. Extends existing `custom_problems` pattern. | 2-3 days |
| **3. Diagnostics** | `diagnostic_results`, `diagnostic_attempts` | Captures initial assessment. Requires exercises to exist. | 2-3 days |
| **4. Profiling** | `skill_taxonomy`, `skill_mastery`, `student_profiles`, `reasoning_logs` | Builds on diagnostic data. Enables adaptive recommendations. | 3-4 days |

### Dependencies Graph

```
classes
   |
   +---> class_students
   |           |
   |           +---> exercise_assignments (can assign to class)
   |
exercises
   |
   +---> exercise_hints
   |
   +---> exercise_assignments (can assign to student)
   |
   +---> diagnostic_attempts (questions come from exercises)
   |
   +---> reasoning_logs (tracks exercise interactions)

diagnostic_results
   |
   +---> diagnostic_attempts
   |
   +---> skill_mastery (initialized from diagnostic)
   |
   +---> student_profiles (generated from diagnostic)

skill_taxonomy (reference data)
   |
   +---> skill_mastery
   |
   +---> exercises.skill_ids (optional tagging)
```

---

## Patterns to Follow

### Pattern 1: Denormalized Profile Aggregation

**What:** `student_profiles` stores computed/aggregated values, not real-time data.

**When:** For analytics that are expensive to compute on every request.

**Why:** Avoids complex JOINs on every dashboard load. Profile regeneration can be async.

**Implementation:**

```typescript
// Regenerate profile (call periodically or after significant events)
async function regenerateStudentProfile(studentId: string) {
  const mastery = await supabase
    .from('skill_mastery')
    .select('*')
    .eq('student_id', studentId);

  const logs = await supabase
    .from('reasoning_logs')
    .select('*')
    .eq('student_id', studentId)
    .gte('created_at', thirtyDaysAgo);

  // Compute aggregates
  const strengthDomains = computeStrengths(mastery.data);
  const weaknessDomains = computeWeaknesses(mastery.data);
  const commonStrategies = extractStrategies(logs.data);

  await supabase
    .from('student_profiles')
    .upsert({
      student_id: studentId,
      strength_domains: strengthDomains,
      weakness_domains: weaknessDomains,
      common_strategies: commonStrategies,
      profile_generated_at: new Date().toISOString()
    });
}
```

### Pattern 2: Mastery Level Calculation (IRT-Inspired)

**What:** Update mastery using Item Response Theory principles (simplified).

**When:** After each student attempt on a skill.

**Implementation:**

```typescript
// Simplified mastery update (not full IRT, but captures the principle)
function updateMastery(
  currentMastery: number,
  isCorrect: boolean,
  exerciseDifficulty: number
): number {
  // Weight by difficulty: harder exercises have more impact
  const difficultyWeight = exerciseDifficulty / 5; // 0.2 to 1.0

  // Base change (smaller as mastery approaches extremes)
  const changeRate = 0.1 * difficultyWeight;

  if (isCorrect) {
    // Increase mastery (diminishing returns near 1.0)
    return Math.min(1.0, currentMastery + changeRate * (1 - currentMastery));
  } else {
    // Decrease mastery (less harsh at low levels)
    return Math.max(0.0, currentMastery - changeRate * currentMastery);
  }
}
```

### Pattern 3: Skill Decay Over Time

**What:** Skills "fade" if not practiced, tracked via `days_since_practice`.

**When:** For exercise selection and mastery display.

**Implementation:**

```sql
-- View that applies decay to mastery levels
CREATE VIEW skill_mastery_with_decay AS
SELECT
  *,
  CASE
    WHEN days_since_practice IS NULL THEN mastery_level
    WHEN days_since_practice <= 7 THEN mastery_level
    WHEN days_since_practice <= 30 THEN mastery_level * 0.9
    WHEN days_since_practice <= 90 THEN mastery_level * 0.75
    ELSE mastery_level * 0.5
  END AS effective_mastery
FROM skill_mastery;
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Real-Time Profile Computation

**What:** Computing student profiles on every request via complex JOINs.

**Why bad:**
- Slow dashboard loads
- Database bottleneck as student count grows
- Inconsistent results if data changes mid-request

**Instead:** Use denormalized `student_profiles` table with periodic refresh.

### Anti-Pattern 2: Storing Raw Conversation History in Reasoning Logs

**What:** Putting full message arrays in `reasoning_logs`.

**Why bad:**
- Bloats database storage
- Privacy concerns with raw data
- Hard to query

**Instead:** Store AI-generated summary + structured metadata (strategies, errors).

### Anti-Pattern 3: Class-Level RLS Without Junction Table

**What:** Adding `class_id` directly to `students` table.

**Why bad:**
- Can't support students in multiple classes (edge cases exist)
- Harder to track enrollment history
- Can't capture enrollment date/status

**Instead:** Use `class_students` junction table with enrollment metadata.

### Anti-Pattern 4: Soft-Deletes Everywhere

**What:** Using `deleted_at` columns instead of actual deletes.

**Why bad:**
- Complicates every query with `WHERE deleted_at IS NULL`
- RLS policies get complex
- Storage bloat

**Instead:** Use actual deletes with `ON DELETE CASCADE`. Archive to separate table if needed for compliance.

---

## Scalability Considerations

| Concern | At 100 students | At 1,000 students | At 10,000 students |
|---------|-----------------|-------------------|---------------------|
| **Profile queries** | Direct queries fine | Add indexes on student_id | Consider read replicas |
| **Mastery updates** | Synchronous updates | Synchronous updates | Queue updates, batch process |
| **Reasoning logs** | Keep all data | Keep all data | Archive logs > 1 year |
| **Diagnostic generation** | On-demand | On-demand | Pre-generate test pools |
| **Profile regeneration** | On each significant event | Daily cron job | Weekly cron job |

---

## RLS Policy Summary

All new tables need RLS policies following the existing pattern:

```sql
-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reasoning_logs ENABLE ROW LEVEL SECURITY;

-- Teacher access patterns:
-- 1. Teachers see their own classes
-- 2. Teachers see students in their classes
-- 3. Teachers see all data for students in their classes

-- Student access patterns:
-- 1. Students see their own progress/profile
-- 2. Students see exercises assigned to them
-- 3. Students cannot see other students' data
```

---

## API Route Structure

Recommended new routes (following existing patterns):

```
/api/classes
  GET    - List teacher's classes
  POST   - Create new class

/api/classes/[id]
  GET    - Get class details with enrolled students
  PUT    - Update class
  DELETE - Delete class

/api/classes/[id]/students
  POST   - Enroll student(s) in class
  DELETE - Remove student from class

/api/classes/[id]/import
  POST   - Bulk import students from CSV

/api/exercises
  GET    - List teacher's exercises
  POST   - Create exercise

/api/exercises/[id]
  GET    - Get exercise with hints
  PUT    - Update exercise
  DELETE - Delete exercise

/api/exercises/[id]/hints
  POST   - Add hint to exercise
  PUT    - Update hints order

/api/exercises/assign
  POST   - Assign exercise to class/students

/api/diagnostics
  POST   - Start diagnostic test for student

/api/diagnostics/[id]
  GET    - Get diagnostic result
  PUT    - Submit answer, update result

/api/diagnostics/[id]/complete
  POST   - Finalize diagnostic, compute scores

/api/students/[id]/profile
  GET    - Get student profile (strengths, weaknesses)
  POST   - Regenerate profile

/api/students/[id]/mastery
  GET    - Get skill mastery breakdown

/api/students/[id]/reasoning
  GET    - Get reasoning logs (for teacher view)
```

---

## TypeScript Types (New)

```typescript
// lib/supabase.ts additions

export interface Class {
  id: string
  teacher_id: string
  name: string
  grade: 1 | 2 | 3 | 4 | 5 | 6 | null
  description: string | null
  school_year: string | null
  created_at: string
  updated_at: string
}

export interface ClassStudent {
  id: string
  class_id: string
  student_id: string
  enrolled_at: string
  status: 'active' | 'inactive' | 'transferred'
}

export interface Exercise {
  id: string
  teacher_id: string
  question: string
  answer: string
  explanation: string | null
  domain: MathDomain
  topic: string[]
  difficulty: 1 | 2 | 3 | 4 | 5
  grade_range: number[]
  skill_ids: string[]
  source: 'manual' | 'imported' | 'homework_ocr'
  is_diagnostic: boolean
  created_at: string
  updated_at: string
}

export interface ExerciseHint {
  id: string
  exercise_id: string
  hint_order: number
  hint_text: string
  hint_type: 'hint' | 'strategy' | 'visual' | 'example'
  created_at: string
}

export interface DiagnosticResult {
  id: string
  student_id: string
  test_type: 'initial' | 'periodic' | 'topic-specific'
  started_at: string
  completed_at: string | null
  total_questions: number
  correct_answers: number
  time_spent_seconds: number | null
  computed_grade_level: number | null
  recommended_difficulty: 1 | 2 | 3 | 4 | 5 | null
  domain_scores: Record<MathDomain, number> | null
  teacher_notified_at: string | null
  created_at: string
}

export interface SkillMastery {
  id: string
  student_id: string
  skill_id: string
  mastery_level: number // 0.0 - 1.0
  confidence: number // 0.0 - 1.0
  attempts_count: number
  correct_count: number
  last_practiced_at: string | null
  updated_at: string
}

export interface StudentProfile {
  id: string
  student_id: string
  strength_domains: MathDomain[]
  weakness_domains: MathDomain[]
  preferred_hint_type: 'visual' | 'step-by-step' | 'example' | 'none' | null
  avg_time_per_problem: number | null
  hints_dependency: 'low' | 'medium' | 'high' | null
  common_strategies: string[]
  common_error_types: string[]
  overall_accuracy: number | null
  growth_rate: number | null
  consistency_score: number | null
  avg_session_length_minutes: number | null
  problems_per_session: number | null
  profile_generated_at: string
  updated_at: string
}

export interface ReasoningLog {
  id: string
  student_id: string
  exercise_id: string | null
  session_started_at: string
  problem_question: string
  total_messages: number
  hints_given: number
  time_to_correct_answer_seconds: number | null
  strategies_attempted: string[]
  misconceptions_detected: string[]
  breakthrough_moment: string | null
  final_outcome: 'solved' | 'gave-up' | 'timed-out' | 'interrupted'
  is_correct: boolean
  conversation_summary: string | null
  created_at: string
}
```

---

## Sources

Research informing this architecture:

- [Deep Knowledge Tracing and Cognitive Load Estimation](https://www.nature.com/articles/s41598-025-10497-x) - Neural network architectures for knowledge state tracking
- [A Learning Analytics Methodology for Student Profiling](https://link.springer.com/chapter/10.1007/978-3-319-07064-3_24) - LMS schema patterns
- [How to Design a Database for LMS](https://www.geeksforgeeks.org/sql/how-to-design-a-database-for-learning-management-system-lms/) - Core LMS database entities
- [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS best practices
- [Multi-Tenant Applications with RLS on Supabase](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/) - Multi-tenant patterns
- [Deep-IRT: Knowledge Tracing with Item Response Theory](https://arxiv.org/pdf/1904.11738) - Mastery estimation algorithms
- [Adaptive Learning Using AI in e-Learning](https://www.mdpi.com/2227-7102/13/12/1216) - Adaptive learning architecture patterns
- [Knowledge Graph Construction in Education](https://pmc.ncbi.nlm.nih.gov/articles/PMC10847940/) - Skill taxonomy patterns
- [Structuring Competency-Based Courses Through Skill Trees](https://arxiv.org/html/2504.16966) - Skill dependency modeling

---

*Architecture research: 2026-01-26*
