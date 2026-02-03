-- Phase 6: Parent Connection
-- Weekly reports and milestone notifications for parents

-- Add parent email to students
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS report_frequency TEXT DEFAULT 'weekly' CHECK (report_frequency IN ('daily', 'weekly', 'monthly', 'never'));

-- Parent reports log
CREATE TABLE IF NOT EXISTS parent_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'milestone', 'achievement')),
  report_data JSONB NOT NULL DEFAULT '{}',
  sent_to TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0
);

-- Student achievements for milestone notifications
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB DEFAULT '{}',
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  notified_parent BOOLEAN DEFAULT FALSE
);

-- Shareable profile tokens (for public viewing)
CREATE TABLE IF NOT EXISTS profile_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_parent_reports_student ON parent_reports(student_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_student ON student_achievements(student_id, achieved_at DESC);
CREATE INDEX IF NOT EXISTS idx_share_tokens ON profile_share_tokens(token);

-- RLS policies
ALTER TABLE parent_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_share_tokens ENABLE ROW LEVEL SECURITY;

-- Teachers can view reports for their students
CREATE POLICY "Teachers view student reports"
  ON parent_reports FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid()::uuid));

-- Teachers can view achievements for their students
CREATE POLICY "Teachers view student achievements"
  ON student_achievements FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid()::uuid));
