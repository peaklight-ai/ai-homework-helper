-- ============================================================================
-- Phase 3: Hints/Strategies & Progression Logic
-- ============================================================================

-- Add hints column to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS hints JSONB DEFAULT '[]';

-- Add strategies column for teaching approaches
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS strategies TEXT;

-- Add progression tracking to students
ALTER TABLE students ADD COLUMN IF NOT EXISTS consecutive_correct INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS consecutive_wrong INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_difficulty_change TIMESTAMPTZ;

-- Progression rules table (configurable by teacher)
CREATE TABLE IF NOT EXISTS progression_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  -- When to level up
  correct_streak_for_up INTEGER DEFAULT 3,
  -- When to level down
  wrong_streak_for_down INTEGER DEFAULT 2,
  -- Min/max difficulty
  min_difficulty INTEGER DEFAULT 1,
  max_difficulty INTEGER DEFAULT 5,
  -- Grade-specific adjustments
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  -- AI guidance style
  guidance_style TEXT DEFAULT 'scaffold' CHECK (guidance_style IN ('guided', 'scaffold', 'coach')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, grade)
);

-- Default progression rules per grade (based on pedagogy reference)
INSERT INTO progression_rules (teacher_id, grade, correct_streak_for_up, wrong_streak_for_down, guidance_style)
VALUES
  (NULL, 1, 4, 1, 'guided'),    -- Grade 1: Very guided, slower progression
  (NULL, 2, 3, 2, 'guided'),    -- Grade 2: Guided, teach steps
  (NULL, 3, 3, 2, 'scaffold'),  -- Grade 3: Model and scaffold
  (NULL, 4, 2, 2, 'coach'),     -- Grade 4: Coach and extend
  (NULL, 5, 2, 3, 'coach'),     -- Grade 5: More independent
  (NULL, 6, 2, 3, 'coach')      -- Grade 6: Most independent
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE progression_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all progression_rules" ON progression_rules FOR ALL USING (true);

-- Index for hints search
CREATE INDEX IF NOT EXISTS idx_exercises_hints ON exercises USING GIN (hints);
