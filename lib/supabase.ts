import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

// =============================================================================
// SUPABASE CLIENT CONFIGURATION
// =============================================================================
// This file provides Supabase clients for both browser and server contexts.
// - Browser client: For client-side React components
// - Server client: For API routes and server components
// =============================================================================

// Use fallbacks during build time to prevent static generation errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

// Check if we have real credentials (not placeholders)
export const hasSupabaseCredentials =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// =============================================================================
// DATABASE TYPES
// =============================================================================

export type MathTopic = 'addition' | 'subtraction' | 'multiplication' | 'division'

export interface Teacher {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Student {
  id: string
  teacher_id: string
  name: string
  grade: 1 | 2 | 3 | 4 | 5 | 6
  avatar_seed: string
  login_code: string
  created_at: string
}

export interface Progress {
  id: string
  student_id: string
  total_xp: number
  level: number
  current_streak: number
  longest_streak: number
  total_questions: number
  correct_answers: number
  updated_at: string
}

export interface StudentSettings {
  id: string
  student_id: string
  allowed_topics: MathTopic[]
  difficulty_level: 1 | 2 | 3 | 4 | 5
  updated_at: string
}

export interface CustomProblem {
  id: string
  teacher_id: string
  question: string
  answer: string
  difficulty: 1 | 2 | 3 | 4 | 5
  hint: string | null
  domain: string | null
  grade_range: number[]
  created_at: string
}

export interface HomeworkUpload {
  id: string
  student_id: string
  image_url: string
  extracted_text: string | null
  status: 'pending' | 'processed' | 'failed'
  created_at: string
}

export interface Class {
  id: string
  teacher_id: string
  name: string
  grade: 1 | 2 | 3 | 4 | 5 | 6 | null
  created_at: string
}

export interface ClassStudent {
  id: string
  class_id: string
  student_id: string
  enrolled_at: string
}

export interface ClassWithStudents extends Class {
  studentCount: number
  students: Student[]
}

export interface Exercise {
  id: string
  teacher_id: string
  question: string
  answer: string
  difficulty: 1 | 2 | 3 | 4 | 5
  domain: string | null
  grade: 1 | 2 | 3 | 4 | 5 | 6 | null
  hints: string[]
  strategies: string | null
  created_at: string
}

export interface ProgressionRule {
  id: string
  teacher_id: string | null
  correct_streak_for_up: number
  wrong_streak_for_down: number
  min_difficulty: number
  max_difficulty: number
  grade: 1 | 2 | 3 | 4 | 5 | 6 | null
  guidance_style: 'guided' | 'scaffold' | 'coach'
  created_at: string
}

export interface ExerciseAssignment {
  id: string
  exercise_id: string
  class_id: string | null
  student_id: string | null
  due_date: string | null
  assigned_at: string
}

// =============================================================================
// PHASE 2: DIAGNOSTIC & ANALYTICS TYPES
// =============================================================================

export interface DiagnosticTest {
  id: string
  student_id: string
  started_at: string
  completed_at: string | null
  status: 'in_progress' | 'completed' | 'abandoned'
  results: Record<string, { correct: number; total: number; avgTime: number }>
  recommended_levels: Record<string, number>
}

export interface DiagnosticQuestion {
  id: string
  grade: 1 | 2 | 3 | 4 | 5 | 6
  domain: string
  difficulty: 1 | 2 | 3 | 4 | 5
  question: string
  answer: string
  hints: string[]
  created_at: string
}

export interface DiagnosticResponse {
  id: string
  test_id: string
  question_id: string
  student_answer: string | null
  is_correct: boolean
  time_seconds: number | null
  created_at: string
}

export interface SessionLog {
  id: string
  student_id: string
  problem_question: string
  problem_domain: string | null
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>
  outcome: 'correct' | 'incorrect' | 'abandoned' | 'helped'
  duration_seconds: number | null
  hints_used: number
  ai_observations: string | null
  created_at: string
}

export interface TopicMastery {
  id: string
  student_id: string
  topic: string
  attempts: number
  correct: number
  avg_time_seconds: number | null
  last_attempt: string | null
}

export interface StudentTarget {
  id: string
  student_id: string
  teacher_id: string
  target_text: string
  target_type: 'skill' | 'xp' | 'streak' | 'mastery'
  target_value: Record<string, unknown> | null
  due_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
}

// Extended Student type with diagnostic info
export interface StudentWithDiagnostic extends Student {
  has_diagnostic: boolean
  diagnostic_completed_at: string | null
}

// =============================================================================
// BROWSER CLIENT (for client-side components)
// =============================================================================

export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Singleton for client-side usage
let browserClient: ReturnType<typeof createBrowserSupabaseClient> | null = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient()
  }
  return browserClient
}

// =============================================================================
// SERVER CLIENT (for API routes and server components)
// =============================================================================

export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Generate a unique 6-character login code for students
export function generateLoginCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing chars (0, O, 1, I)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// =============================================================================
// TEACHER FUNCTIONS
// =============================================================================

export async function getTeacherByEmail(email: string): Promise<Teacher | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('email', email)
    .single()

  if (error) return null
  return data
}

export async function createTeacher(id: string, email: string, name: string): Promise<Teacher | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('teachers')
    .insert({ id, email, name })
    .select()
    .single()

  if (error) {
    console.error('Error creating teacher:', error)
    return null
  }
  return data
}

// =============================================================================
// STUDENT FUNCTIONS
// =============================================================================

export async function getStudentsByTeacher(teacherId: string): Promise<Student[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching students:', error)
    return []
  }
  return data || []
}

export async function getStudentByLoginCode(loginCode: string): Promise<Student | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('login_code', loginCode.toUpperCase())
    .single()

  if (error) return null
  return data
}

export async function createStudent(
  teacherId: string,
  name: string,
  grade: 1 | 2 | 3 | 4 | 5 | 6
): Promise<Student | null> {
  const supabase = createServerSupabaseClient()
  const loginCode = generateLoginCode()
  const avatarSeed = `${name}-${Date.now()}`

  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      teacher_id: teacherId,
      name,
      grade,
      avatar_seed: avatarSeed,
      login_code: loginCode
    })
    .select()
    .single()

  if (studentError) {
    console.error('Error creating student:', studentError)
    return null
  }

  // Create initial progress record
  await supabase.from('progress').insert({
    student_id: student.id,
    total_xp: 0,
    level: 1,
    current_streak: 0,
    longest_streak: 0,
    total_questions: 0,
    correct_answers: 0
  })

  // Create initial settings record
  await supabase.from('student_settings').insert({
    student_id: student.id,
    allowed_topics: ['addition', 'subtraction', 'multiplication', 'division'],
    difficulty_level: Math.min(grade, 5) as 1 | 2 | 3 | 4 | 5
  })

  return student
}

export async function deleteStudent(studentId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId)

  if (error) {
    console.error('Error deleting student:', error)
    return false
  }
  return true
}

// =============================================================================
// PROGRESS FUNCTIONS
// =============================================================================

export async function getStudentProgress(studentId: string): Promise<Progress | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', studentId)
    .single()

  if (error) return null
  return data
}

export async function updateStudentProgress(
  studentId: string,
  updates: Partial<Omit<Progress, 'id' | 'student_id'>>
): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('progress')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('student_id', studentId)

  if (error) {
    console.error('Error updating progress:', error)
    return false
  }
  return true
}

// Helper to ensure progress record exists
async function ensureProgressRecord(studentId: string): Promise<Progress | null> {
  console.log('[ensureProgressRecord] Checking for student:', studentId)
  let progress = await getStudentProgress(studentId)

  if (!progress) {
    console.log('[ensureProgressRecord] No progress found, creating new record')
    // Create progress record if it doesn't exist
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('progress')
      .insert({
        student_id: studentId,
        total_xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        total_questions: 0,
        correct_answers: 0
      })
      .select()
      .single()

    if (error) {
      console.error('[ensureProgressRecord] Error creating progress record:', error)
      return null
    }
    console.log('[ensureProgressRecord] Created progress record:', data)
    progress = data
  } else {
    console.log('[ensureProgressRecord] Found existing progress:', progress)
  }

  return progress
}

export async function addXpToStudent(studentId: string, xp: number): Promise<boolean> {
  const progress = await ensureProgressRecord(studentId)
  if (!progress) return false

  const newXp = progress.total_xp + xp
  const newLevel = Math.floor(newXp / 500) + 1

  return updateStudentProgress(studentId, {
    total_xp: newXp,
    level: newLevel
  })
}

export async function recordStudentAnswer(studentId: string, isCorrect: boolean): Promise<boolean> {
  const progress = await ensureProgressRecord(studentId)
  if (!progress) return false

  const newStreak = isCorrect ? progress.current_streak + 1 : 0

  return updateStudentProgress(studentId, {
    total_questions: progress.total_questions + 1,
    correct_answers: progress.correct_answers + (isCorrect ? 1 : 0),
    current_streak: newStreak,
    longest_streak: Math.max(progress.longest_streak, newStreak)
  })
}

// =============================================================================
// STUDENT SETTINGS FUNCTIONS
// =============================================================================

export async function getStudentSettings(studentId: string): Promise<StudentSettings | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('student_settings')
    .select('*')
    .eq('student_id', studentId)
    .single()

  if (error) return null
  return data
}

export async function updateStudentSettings(
  studentId: string,
  allowedTopics: MathTopic[],
  difficultyLevel: 1 | 2 | 3 | 4 | 5
): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('student_settings')
    .update({
      allowed_topics: allowedTopics,
      difficulty_level: difficultyLevel,
      updated_at: new Date().toISOString()
    })
    .eq('student_id', studentId)

  if (error) {
    console.error('Error updating settings:', error)
    return false
  }
  return true
}

// =============================================================================
// HOMEWORK UPLOAD FUNCTIONS
// =============================================================================

export async function createHomeworkUpload(
  studentId: string,
  imageUrl: string
): Promise<HomeworkUpload | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('homework_uploads')
    .insert({
      student_id: studentId,
      image_url: imageUrl,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating upload:', error)
    return null
  }
  return data
}

export async function updateHomeworkUpload(
  uploadId: string,
  extractedText: string,
  status: 'processed' | 'failed'
): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('homework_uploads')
    .update({ extracted_text: extractedText, status })
    .eq('id', uploadId)

  if (error) {
    console.error('Error updating upload:', error)
    return false
  }
  return true
}

// =============================================================================
// CLASS FUNCTIONS
// =============================================================================

export async function getClassesByTeacher(teacherId: string): Promise<ClassWithStudents[]> {
  const supabase = createServerSupabaseClient()

  // First get classes
  const { data: classesData, error: classesError } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (classesError) {
    console.error('Error fetching classes:', classesError)
    return []
  }

  console.log('[getClassesByTeacher] found classes:', classesData?.length)

  // Then get enrollments for each class
  const classesWithStudents = await Promise.all(
    (classesData || []).map(async (c) => {
      const { data: enrollments } = await supabase
        .from('class_students')
        .select('student_id, students(*)')
        .eq('class_id', c.id)

      const students = enrollments?.map((e: { students: Student | Student[] }) =>
        Array.isArray(e.students) ? e.students[0] : e.students
      ).filter(Boolean) || []

      return {
        ...c,
        studentCount: students.length,
        students
      }
    })
  )

  return classesWithStudents
}

export async function createClass(
  teacherId: string,
  name: string,
  grade?: 1 | 2 | 3 | 4 | 5 | 6
): Promise<Class | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('classes')
    .insert({ teacher_id: teacherId, name, grade })
    .select()
    .single()

  if (error) {
    console.error('Error creating class:', error)
    return null
  }
  return data
}

export async function updateClass(
  classId: string,
  updates: { name?: string; grade?: 1 | 2 | 3 | 4 | 5 | 6 }
): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('classes')
    .update(updates)
    .eq('id', classId)

  if (error) {
    console.error('Error updating class:', error)
    return false
  }
  return true
}

export async function deleteClass(classId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId)

  if (error) {
    console.error('Error deleting class:', error)
    return false
  }
  return true
}

export async function enrollStudent(classId: string, studentId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('class_students')
    .insert({ class_id: classId, student_id: studentId })

  if (error) {
    console.error('Error enrolling student:', error)
    return false
  }
  return true
}

export async function unenrollStudent(classId: string, studentId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('class_students')
    .delete()
    .eq('class_id', classId)
    .eq('student_id', studentId)

  if (error) {
    console.error('Error unenrolling student:', error)
    return false
  }
  return true
}

export async function getStudentsByClass(classId: string): Promise<Student[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('class_students')
    .select('students (*)')
    .eq('class_id', classId)

  if (error) {
    console.error('Error fetching class students:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((cs: any) => cs.students).filter(Boolean)
}

// =============================================================================
// EXERCISE FUNCTIONS
// =============================================================================

export async function getExercisesByTeacher(teacherId: string): Promise<Exercise[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching exercises:', error)
    return []
  }
  return data || []
}

export async function createExercise(
  teacherId: string,
  question: string,
  answer: string,
  difficulty: 1 | 2 | 3 | 4 | 5 = 3,
  domain?: string,
  grade?: 1 | 2 | 3 | 4 | 5 | 6,
  hints: string[] = [],
  strategies?: string | null
): Promise<Exercise | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      teacher_id: teacherId,
      question,
      answer,
      difficulty,
      domain: domain || null,
      grade: grade || null,
      hints: hints || [],
      strategies: strategies || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating exercise:', error)
    return null
  }
  return data
}

export async function assignExerciseToClass(
  exerciseId: string,
  classId: string,
  dueDate?: string
): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('exercise_assignments')
    .insert({
      exercise_id: exerciseId,
      class_id: classId,
      due_date: dueDate || null
    })

  if (error) {
    console.error('Error assigning to class:', error)
    return false
  }
  return true
}

export async function assignExerciseToStudents(
  exerciseId: string,
  studentIds: string[],
  dueDate?: string
): Promise<{ success: number; failed: number }> {
  const supabase = createServerSupabaseClient()
  let success = 0
  let failed = 0

  for (const studentId of studentIds) {
    const { error } = await supabase
      .from('exercise_assignments')
      .insert({
        exercise_id: exerciseId,
        student_id: studentId,
        due_date: dueDate || null
      })

    if (error) {
      console.error('Error assigning to student:', error)
      failed++
    } else {
      success++
    }
  }

  return { success, failed }
}

export async function getAssignmentsForStudent(studentId: string): Promise<Exercise[]> {
  const supabase = createServerSupabaseClient()

  // Get student's class IDs
  const { data: enrollments } = await supabase
    .from('class_students')
    .select('class_id')
    .eq('student_id', studentId)

  const classIds = enrollments?.map(e => e.class_id) || []

  // Get assignments for student directly or via class
  const { data: assignments, error } = await supabase
    .from('exercise_assignments')
    .select('exercise_id, exercises (*)')
    .or(`student_id.eq.${studentId},class_id.in.(${classIds.join(',')})`)

  if (error) {
    console.error('Error fetching assignments:', error)
    return []
  }

  // Extract unique exercises
  const exerciseMap = new Map<string, Exercise>()
  assignments?.forEach(a => {
    const ex = a.exercises as unknown as Exercise
    if (ex && !exerciseMap.has(ex.id)) {
      exerciseMap.set(ex.id, ex)
    }
  })

  return Array.from(exerciseMap.values())
}
