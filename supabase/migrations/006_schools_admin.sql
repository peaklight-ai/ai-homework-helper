-- Phase 5: Admin Dashboard
-- School-level analytics and administration

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_email TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link teachers to schools
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE SET NULL;

-- School stats cache (updated daily)
CREATE TABLE IF NOT EXISTS school_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_teachers INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  total_classes INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  active_students_today INTEGER DEFAULT 0,
  active_students_week INTEGER DEFAULT 0,
  top_topics JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, stat_date)
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_school_stats_date ON school_stats(school_id, stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_admins_school ON admins(school_id);

-- RLS policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins can view their school
CREATE POLICY "Admins view own school"
  ON schools FOR SELECT
  USING (id IN (SELECT school_id FROM admins WHERE email = auth.jwt()->>'email'));

-- Admins can view school stats
CREATE POLICY "Admins view school stats"
  ON school_stats FOR SELECT
  USING (school_id IN (SELECT school_id FROM admins WHERE email = auth.jwt()->>'email'));

-- Admins can view their admin record
CREATE POLICY "Admins view own record"
  ON admins FOR SELECT
  USING (email = auth.jwt()->>'email');
