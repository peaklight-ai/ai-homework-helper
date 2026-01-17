import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

// =============================================================================
// SUPABASE CLIENT CONFIGURATION
// =============================================================================
// This file provides Supabase clients for both browser and server contexts.
// - Browser client: For client-side React components
// - Server client: For API routes and server components
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

export async function addXpToStudent(studentId: string, xp: number): Promise<boolean> {
  const progress = await getStudentProgress(studentId)
  if (!progress) return false

  const newXp = progress.total_xp + xp
  const newLevel = Math.floor(newXp / 500) + 1

  return updateStudentProgress(studentId, {
    total_xp: newXp,
    level: newLevel
  })
}

export async function recordStudentAnswer(studentId: string, isCorrect: boolean): Promise<boolean> {
  const progress = await getStudentProgress(studentId)
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
