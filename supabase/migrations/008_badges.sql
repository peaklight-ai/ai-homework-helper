-- Phase 7: Student Celebration Engine
-- Badges, achievements, and celebration system

-- Badge definitions
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('streak', 'accuracy', 'xp', 'problems', 'special')),
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student badges (earned)
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  seen_at TIMESTAMPTZ,
  UNIQUE(student_id, badge_id)
);

-- Celebration history (for replay and stats)
CREATE TABLE IF NOT EXISTS celebrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  celebration_type TEXT NOT NULL,
  celebration_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning wrapped data (end of year summaries)
CREATE TABLE IF NOT EXISTS learning_wrapped (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  wrapped_data JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  shared_count INTEGER DEFAULT 0,
  UNIQUE(student_id, year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_celebrations_student ON celebrations(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wrapped_student_year ON learning_wrapped(student_id, year);

-- RLS policies
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_wrapped ENABLE ROW LEVEL SECURITY;

-- Everyone can view badge definitions
CREATE POLICY "Anyone can view badges"
  ON badge_definitions FOR SELECT
  USING (true);

-- Students can view their own badges
CREATE POLICY "Students view own badges"
  ON student_badges FOR SELECT
  USING (student_id = auth.uid()::uuid);

-- Teachers can view student badges
CREATE POLICY "Teachers view student badges"
  ON student_badges FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid()::uuid));

-- Insert default badges
INSERT INTO badge_definitions (slug, name, description, icon, category, requirement_type, requirement_value, rarity, xp_reward)
VALUES
  -- Streak badges
  ('streak-3', 'Getting Started', '3-day learning streak', '🔥', 'streak', 'current_streak', 3, 'common', 10),
  ('streak-7', 'Week Warrior', '7-day learning streak', '🔥', 'streak', 'current_streak', 7, 'uncommon', 25),
  ('streak-14', 'Fortnight Fighter', '14-day learning streak', '🔥', 'streak', 'current_streak', 14, 'rare', 50),
  ('streak-30', 'Monthly Master', '30-day learning streak', '🔥', 'streak', 'current_streak', 30, 'epic', 100),
  ('streak-100', 'Century Champion', '100-day learning streak', '🔥', 'streak', 'current_streak', 100, 'legendary', 500),

  -- Accuracy badges
  ('accuracy-5', 'Sharp Shooter', '5 correct answers in a row', '🎯', 'accuracy', 'consecutive_correct', 5, 'common', 10),
  ('accuracy-10', 'Perfect Ten', '10 correct answers in a row', '🎯', 'accuracy', 'consecutive_correct', 10, 'uncommon', 25),
  ('accuracy-25', 'Precision Pro', '25 correct answers in a row', '🎯', 'accuracy', 'consecutive_correct', 25, 'rare', 50),
  ('accuracy-50', 'Flawless Fifty', '50 correct answers in a row', '🎯', 'accuracy', 'consecutive_correct', 50, 'epic', 100),

  -- XP badges
  ('xp-100', 'Century Club', 'Earn 100 XP', '⭐', 'xp', 'total_xp', 100, 'common', 10),
  ('xp-500', 'Rising Star', 'Earn 500 XP', '⭐', 'xp', 'total_xp', 500, 'uncommon', 25),
  ('xp-1000', 'XP Master', 'Earn 1000 XP', '⭐', 'xp', 'total_xp', 1000, 'rare', 50),
  ('xp-5000', 'XP Legend', 'Earn 5000 XP', '⭐', 'xp', 'total_xp', 5000, 'epic', 100),
  ('xp-10000', 'XP Titan', 'Earn 10000 XP', '⭐', 'xp', 'total_xp', 10000, 'legendary', 250),

  -- Problems solved badges
  ('problems-10', 'Problem Solver', 'Solve 10 problems', '🧠', 'problems', 'total_questions', 10, 'common', 10),
  ('problems-50', 'Math Explorer', 'Solve 50 problems', '🧠', 'problems', 'total_questions', 50, 'uncommon', 25),
  ('problems-100', 'Century Solver', 'Solve 100 problems', '🧠', 'problems', 'total_questions', 100, 'rare', 50),
  ('problems-500', 'Math Champion', 'Solve 500 problems', '🧠', 'problems', 'total_questions', 500, 'epic', 100),
  ('problems-1000', 'Problem Titan', 'Solve 1000 problems', '🧠', 'problems', 'total_questions', 1000, 'legendary', 250),

  -- Special badges
  ('first-problem', 'First Steps', 'Complete your first problem', '🌟', 'special', 'total_questions', 1, 'common', 5),
  ('level-5', 'Level 5 Hero', 'Reach level 5', '🏆', 'special', 'level', 5, 'uncommon', 25),
  ('level-10', 'Level 10 Champion', 'Reach level 10', '🏆', 'special', 'level', 10, 'rare', 50),
  ('early-bird', 'Early Bird', 'Practice before 8 AM', '🌅', 'special', 'early_practice', 1, 'uncommon', 15),
  ('night-owl', 'Night Owl', 'Practice after 8 PM', '🦉', 'special', 'night_practice', 1, 'uncommon', 15)
ON CONFLICT (slug) DO NOTHING;
