# Phase 2 Research: Student Experience & Analytics

## Requirements Analysis

### DIAG-01: Diagnostic Test on First Login
- Detect if student has completed diagnostic (new field: `has_diagnostic`)
- Show diagnostic flow before regular tutoring
- 5-10 grade-appropriate questions per domain
- Adaptive: start medium, adjust based on responses

### DIAG-02: Auto-Set Difficulty Level
- Map diagnostic scores to difficulty levels 1-5
- By domain: student may be L3 in addition, L2 in division
- No teacher intervention needed (automatic)

### DIAG-03: Diagnostic Results to Teacher
- Store detailed results (per-question, time taken, attempts)
- Show summary in teacher dashboard
- Flag students who need attention (very low scores)

### STUDENT-01: Targets/Objectives Display
- Teacher sets targets per student (already have settings)
- Show targets on student home screen
- Simple: "Your goal: Master 2-digit addition"

### STUDENT-02: Strengths/Weaknesses Profile
- Track performance by topic over time
- Calculate mastery percentage per domain
- Visual display (radar chart or simple bars)

### STUDENT-03: Cognitive Reasoning Patterns
- Log AI conversation for analysis
- Extract patterns: "tries guess-and-check", "struggles with word problems"
- Display to teacher (not just right/wrong, but HOW they think)

## Technical Approach

### Database Changes

```sql
-- Diagnostic system
CREATE TABLE diagnostic_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

CREATE TABLE diagnostic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 6),
  domain TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  hints JSONB DEFAULT '[]'
);

CREATE TABLE diagnostic_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES diagnostic_tests(id) ON DELETE CASCADE,
  question_id UUID REFERENCES diagnostic_questions(id),
  student_answer TEXT,
  is_correct BOOLEAN,
  time_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session logging for cognitive patterns
CREATE TABLE session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  problem_question TEXT,
  conversation JSONB, -- Full message history
  outcome TEXT CHECK (outcome IN ('correct', 'incorrect', 'abandoned')),
  duration_seconds INTEGER,
  ai_observations TEXT, -- AI-generated observations about reasoning
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topic mastery tracking
CREATE TABLE topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  mastery_percent NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN attempts > 0 THEN (correct::NUMERIC / attempts * 100) ELSE 0 END
  ) STORED,
  last_attempt TIMESTAMPTZ,
  UNIQUE(student_id, topic)
);

-- Student targets (teacher-set objectives)
CREATE TABLE student_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  target_text TEXT NOT NULL,
  target_type TEXT DEFAULT 'skill' CHECK (target_type IN ('skill', 'xp', 'streak')),
  target_value JSONB, -- e.g., {"topic": "division", "mastery": 80}
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add diagnostic flag to students
ALTER TABLE students ADD COLUMN IF NOT EXISTS has_diagnostic BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS diagnostic_completed_at TIMESTAMPTZ;
```

### Key Components to Build

1. **DiagnosticTest.tsx** - Full-screen diagnostic flow
2. **StudentProfile.tsx** - Strengths/weaknesses display
3. **TargetsDisplay.tsx** - Show teacher-set objectives
4. **CognitiveInsights.tsx** - Teacher view of reasoning patterns

### API Endpoints

- `POST /api/diagnostic/start` - Begin diagnostic test
- `POST /api/diagnostic/submit` - Submit answer, get next question
- `POST /api/diagnostic/complete` - Finish test, calculate levels
- `GET /api/diagnostic/results?studentId=` - Get results for teacher
- `GET /api/students/:id/profile` - Get mastery profile
- `POST /api/sessions/log` - Log completed session with conversation
- `GET /api/students/:id/cognitive` - Get cognitive patterns analysis
- `POST /api/students/:id/targets` - Teacher sets targets
- `GET /api/students/:id/targets` - Student views targets

### AI Integration

Update `lib/gemini.ts` system prompt to:
1. Generate observations about student reasoning
2. Note patterns (visual learner, procedural thinker, etc.)
3. Return structured metadata alongside responses

## Plan Structure

### 02-01-PLAN: Database Schema & Types
- Migration SQL for all new tables
- TypeScript types
- Seed diagnostic questions

### 02-02-PLAN: Diagnostic System API
- Start/submit/complete endpoints
- Scoring algorithm
- Difficulty mapping

### 02-03-PLAN: Diagnostic UI
- DiagnosticTest component
- Integration with student login flow
- Results display

### 02-04-PLAN: Session Logging & Mastery Tracking
- Update Conversation to log sessions
- Track topic mastery
- API for profile data

### 02-05-PLAN: Student Profile & Targets UI
- StudentProfile component
- TargetsDisplay component
- Home screen integration

### 02-06-PLAN: Teacher Cognitive Insights
- CognitiveInsights component
- Teacher dashboard integration
- AI observation display

## Pedagogy Reference

From user-provided reference (see `.planning/research/pedagogy-reference.md`):

| Grade | AI Role |
|-------|---------|
| Grade 1 | Solve together (VERY guided) |
| Grade 2 | Teach steps and language |
| Grade 3 | Model and scaffold |
| Grades 4-5 | Coach and extend |

Diagnostic should assess:
- For Grade 1: Can they count? Recognize quantities?
- For Grade 2: Can they solve one-step problems?
- For Grade 3: Can they use multi-step strategies?
- For Grades 4-5: Can they reason independently?

---
*Research completed: 2026-02-02*
