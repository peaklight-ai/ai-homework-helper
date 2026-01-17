-- =============================================================================
-- VALID (AI HOMEWORK HELPER) - DATABASE SCHEMA
-- =============================================================================
-- Run this in Supabase SQL Editor to create all tables
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TEACHERS TABLE
-- =============================================================================
-- Teachers sign up with email/password via Supabase Auth
-- This table stores additional teacher profile data
-- =============================================================================

CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STUDENTS TABLE
-- =============================================================================
-- Students are created by teachers and log in with a simple 6-digit code
-- No email required for students (kid-friendly)
-- =============================================================================

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  avatar_seed TEXT,
  login_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast login code lookups
CREATE INDEX IF NOT EXISTS idx_students_login_code ON students(login_code);

-- =============================================================================
-- PROGRESS TABLE
-- =============================================================================
-- Tracks XP, level, streaks, and accuracy per student
-- One-to-one with students (each student has exactly one progress record)
-- =============================================================================

CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STUDENT SETTINGS TABLE
-- =============================================================================
-- Per-student configuration for topics and difficulty
-- Set by teachers to customize each student's learning experience
-- =============================================================================

CREATE TABLE IF NOT EXISTS student_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  allowed_topics TEXT[] DEFAULT ARRAY['addition', 'subtraction', 'multiplication', 'division'],
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CUSTOM PROBLEMS TABLE
-- =============================================================================
-- Teacher-created math problems
-- Supplements the built-in sample problems
-- =============================================================================

CREATE TABLE IF NOT EXISTS custom_problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  hint TEXT,
  domain TEXT,
  grade_range INTEGER[] DEFAULT ARRAY[1, 6],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- HOMEWORK UPLOADS TABLE
-- =============================================================================
-- Stores homework photo uploads and OCR results
-- Status tracks the processing pipeline
-- =============================================================================

CREATE TABLE IF NOT EXISTS homework_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  extracted_text TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
-- These policies control who can access what data
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_uploads ENABLE ROW LEVEL SECURITY;

-- Teachers can only see/manage their own data
CREATE POLICY "Teachers see own data" ON teachers
  FOR ALL USING (auth.uid() = id);

-- Teachers can only manage their own students
CREATE POLICY "Teachers manage own students" ON students
  FOR ALL USING (teacher_id = auth.uid());

-- Teachers can see progress for their students
CREATE POLICY "Teachers see student progress" ON progress
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );

-- Teachers can update progress for their students
CREATE POLICY "Teachers update student progress" ON progress
  FOR UPDATE USING (
    student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );

-- Teachers can manage settings for their students
CREATE POLICY "Teachers manage student settings" ON student_settings
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );

-- Teachers can only manage their own custom problems
CREATE POLICY "Teachers manage own problems" ON custom_problems
  FOR ALL USING (teacher_id = auth.uid());

-- Teachers can see homework uploads for their students
CREATE POLICY "Teachers see student uploads" ON homework_uploads
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE teacher_id = auth.uid())
  );

-- =============================================================================
-- SERVICE ROLE BYPASS
-- =============================================================================
-- Allow service role to bypass RLS (for server-side operations)
-- =============================================================================

CREATE POLICY "Service role bypass teachers" ON teachers
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass students" ON students
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass progress" ON progress
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass settings" ON student_settings
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass problems" ON custom_problems
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role bypass uploads" ON homework_uploads
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =============================================================================
-- DONE!
-- =============================================================================
-- After running this script, your database is ready for Valid V3
-- =============================================================================
