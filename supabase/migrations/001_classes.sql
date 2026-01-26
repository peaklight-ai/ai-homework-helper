-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_teacher ON classes(teacher_id);

-- Class-student junction table (allows students in multiple classes)
CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE INDEX idx_class_students_class ON class_students(class_id);
CREATE INDEX idx_class_students_student ON class_students(student_id);

-- RLS Policies
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own classes" ON classes
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Service role bypass classes" ON classes
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Teachers manage class enrollments" ON class_students
  FOR ALL USING (
    class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Service role bypass class_students" ON class_students
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
