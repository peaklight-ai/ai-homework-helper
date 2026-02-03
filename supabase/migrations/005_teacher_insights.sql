-- Phase 4: Teacher Intelligence
-- Auto-generated insights for teachers about student performance

-- Teacher insights table
CREATE TABLE IF NOT EXISTS teacher_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('struggling', 'improving', 'inactive', 'milestone')),
  insight_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

-- Index for fast teacher lookup
CREATE INDEX IF NOT EXISTS idx_insights_teacher ON teacher_insights(teacher_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_student ON teacher_insights(student_id);
CREATE INDEX IF NOT EXISTS idx_insights_unread ON teacher_insights(teacher_id) WHERE read_at IS NULL;

-- RLS policies
ALTER TABLE teacher_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own insights"
  ON teacher_insights FOR SELECT
  USING (teacher_id = auth.uid()::uuid);

CREATE POLICY "Teachers can update their own insights"
  ON teacher_insights FOR UPDATE
  USING (teacher_id = auth.uid()::uuid);

-- Add last_activity_at to students for inactive detection
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Add consecutive tracking to progress for streak detection
ALTER TABLE progress ADD COLUMN IF NOT EXISTS last_correct_streak INTEGER DEFAULT 0;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS last_wrong_streak INTEGER DEFAULT 0;
