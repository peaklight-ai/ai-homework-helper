-- ============================================================================
-- Phase 2: Diagnostic System & Analytics
-- ============================================================================

-- Diagnostic tests (one per student)
CREATE TABLE IF NOT EXISTS diagnostic_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  results JSONB DEFAULT '{}',
  recommended_levels JSONB DEFAULT '{}',
  UNIQUE(student_id)
);

-- Diagnostic questions pool
CREATE TABLE IF NOT EXISTS diagnostic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 6),
  domain TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  hints JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student responses to diagnostic questions
CREATE TABLE IF NOT EXISTS diagnostic_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES diagnostic_tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES diagnostic_questions(id),
  student_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session logs for cognitive pattern analysis
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  problem_question TEXT NOT NULL,
  problem_domain TEXT,
  conversation JSONB NOT NULL DEFAULT '[]',
  outcome TEXT CHECK (outcome IN ('correct', 'incorrect', 'abandoned', 'helped')),
  duration_seconds INTEGER,
  hints_used INTEGER DEFAULT 0,
  ai_observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topic mastery tracking (aggregated stats per topic)
CREATE TABLE IF NOT EXISTS topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  avg_time_seconds NUMERIC(8,2),
  last_attempt TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, topic)
);

-- Student targets (teacher-set objectives)
CREATE TABLE IF NOT EXISTS student_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  target_text TEXT NOT NULL,
  target_type TEXT DEFAULT 'skill' CHECK (target_type IN ('skill', 'xp', 'streak', 'mastery')),
  target_value JSONB,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add diagnostic flag to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS has_diagnostic BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS diagnostic_completed_at TIMESTAMPTZ;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_student ON diagnostic_tests(student_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_responses_test ON diagnostic_responses(test_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_student ON session_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_created ON session_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_student ON topic_mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_student_targets_student ON student_targets(student_id);

-- Enable RLS
ALTER TABLE diagnostic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for MVP, tighten later)
CREATE POLICY "Allow all diagnostic_tests" ON diagnostic_tests FOR ALL USING (true);
CREATE POLICY "Allow all diagnostic_questions" ON diagnostic_questions FOR ALL USING (true);
CREATE POLICY "Allow all diagnostic_responses" ON diagnostic_responses FOR ALL USING (true);
CREATE POLICY "Allow all session_logs" ON session_logs FOR ALL USING (true);
CREATE POLICY "Allow all topic_mastery" ON topic_mastery FOR ALL USING (true);
CREATE POLICY "Allow all student_targets" ON student_targets FOR ALL USING (true);
