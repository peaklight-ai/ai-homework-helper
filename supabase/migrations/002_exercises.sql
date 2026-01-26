-- Exercises table (teacher-created problems)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5) DEFAULT 3,
  domain TEXT,
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exercises_teacher ON exercises(teacher_id);

-- Exercise assignments (to class or student)
CREATE TABLE IF NOT EXISTS exercise_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  -- Must have either class_id or student_id
  CONSTRAINT target_required CHECK (class_id IS NOT NULL OR student_id IS NOT NULL)
);

CREATE INDEX idx_assignments_exercise ON exercise_assignments(exercise_id);
CREATE INDEX idx_assignments_class ON exercise_assignments(class_id);
CREATE INDEX idx_assignments_student ON exercise_assignments(student_id);

-- RLS Policies
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own exercises" ON exercises
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Service role bypass exercises" ON exercises
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Teachers manage exercise assignments" ON exercise_assignments
  FOR ALL USING (
    exercise_id IN (SELECT id FROM exercises WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Service role bypass assignments" ON exercise_assignments
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
