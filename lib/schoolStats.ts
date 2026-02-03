// Phase 5: Admin Dashboard
// School-level statistics generator

import { createServerSupabaseClient } from './supabase'

export interface SchoolStats {
  totalTeachers: number
  totalStudents: number
  totalClasses: number
  totalXpEarned: number
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  activeStudentsToday: number
  activeStudentsWeek: number
  topTopics: { topic: string; count: number }[]
  accuracy: number
  teacherBreakdown: TeacherStats[]
  dailyActivity: DailyActivity[]
}

export interface TeacherStats {
  id: string
  name: string
  email: string
  studentCount: number
  totalXp: number
  avgAccuracy: number
}

export interface DailyActivity {
  date: string
  questionsAnswered: number
  activeStudents: number
}

// Generate comprehensive stats for a school
export async function generateSchoolStats(schoolId: string): Promise<SchoolStats | null> {
  const supabase = createServerSupabaseClient()
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Get teachers in this school
  const { data: teachers, error: teacherError } = await supabase
    .from('teachers')
    .select('id, email')
    .eq('school_id', schoolId)

  if (teacherError || !teachers) {
    console.error('Error fetching teachers:', teacherError)
    return null
  }

  const teacherIds = teachers.map(t => t.id)

  // Get all students for these teachers
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select(`
      id,
      name,
      teacher_id,
      last_activity_at,
      progress (
        total_xp,
        total_questions,
        correct_answers
      )
    `)
    .in('teacher_id', teacherIds)

  if (studentError) {
    console.error('Error fetching students:', studentError)
    return null
  }

  // Get classes for these teachers
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('id')
    .in('teacher_id', teacherIds)

  if (classError) {
    console.error('Error fetching classes:', classError)
    return null
  }

  // Calculate aggregated stats
  let totalXp = 0
  let totalQuestions = 0
  let totalCorrect = 0
  let activeToday = 0
  let activeWeek = 0
  const topicCounts: Record<string, number> = {}

  for (const student of students || []) {
    const progress = Array.isArray(student.progress) ? student.progress[0] : student.progress
    if (progress) {
      totalXp += progress.total_xp || 0
      totalQuestions += progress.total_questions || 0
      totalCorrect += progress.correct_answers || 0
    }

    // Check activity
    if (student.last_activity_at) {
      const lastActivity = new Date(student.last_activity_at)
      if (lastActivity.toISOString().split('T')[0] === today) {
        activeToday++
      }
      if (lastActivity.toISOString() >= weekAgo) {
        activeWeek++
      }
    }
  }

  // Teacher breakdown
  const teacherBreakdown: TeacherStats[] = teachers.map(teacher => {
    const teacherStudents = (students || []).filter(s => s.teacher_id === teacher.id)
    let teacherXp = 0
    let teacherQuestions = 0
    let teacherCorrect = 0

    for (const student of teacherStudents) {
      const progress = Array.isArray(student.progress) ? student.progress[0] : student.progress
      if (progress) {
        teacherXp += progress.total_xp || 0
        teacherQuestions += progress.total_questions || 0
        teacherCorrect += progress.correct_answers || 0
      }
    }

    return {
      id: teacher.id,
      name: teacher.email.split('@')[0],
      email: teacher.email,
      studentCount: teacherStudents.length,
      totalXp: teacherXp,
      avgAccuracy: teacherQuestions > 0 ? Math.round((teacherCorrect / teacherQuestions) * 100) : 0
    }
  })

  // Sort teachers by total XP
  teacherBreakdown.sort((a, b) => b.totalXp - a.totalXp)

  // Generate daily activity (last 7 days)
  const dailyActivity: DailyActivity[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]

    // Count students active on this day
    const activeOnDay = (students || []).filter(s => {
      if (!s.last_activity_at) return false
      return s.last_activity_at.split('T')[0] === dateStr
    }).length

    dailyActivity.push({
      date: dateStr,
      questionsAnswered: 0, // Would need answer_history table for accurate data
      activeStudents: activeOnDay
    })
  }

  // Top topics (placeholder - would need topic tracking)
  const topTopics = [
    { topic: 'addition', count: Math.floor(totalQuestions * 0.3) },
    { topic: 'subtraction', count: Math.floor(totalQuestions * 0.25) },
    { topic: 'multiplication', count: Math.floor(totalQuestions * 0.25) },
    { topic: 'division', count: Math.floor(totalQuestions * 0.2) }
  ].filter(t => t.count > 0)

  return {
    totalTeachers: teachers.length,
    totalStudents: (students || []).length,
    totalClasses: (classes || []).length,
    totalXpEarned: totalXp,
    totalQuestionsAnswered: totalQuestions,
    totalCorrectAnswers: totalCorrect,
    activeStudentsToday: activeToday,
    activeStudentsWeek: activeWeek,
    topTopics,
    accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    teacherBreakdown,
    dailyActivity
  }
}

// Get or create school for an admin
export async function getAdminSchool(adminEmail: string) {
  const supabase = createServerSupabaseClient()

  // Check if admin exists
  const { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('*, schools(*)')
    .eq('email', adminEmail)
    .single()

  if (admin?.schools) {
    return admin.schools
  }

  return null
}

// Create a new school with admin
export async function createSchool(name: string, adminEmail: string, adminName: string) {
  const supabase = createServerSupabaseClient()

  // Create school
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .insert({ name, admin_email: adminEmail })
    .select()
    .single()

  if (schoolError) {
    console.error('Error creating school:', schoolError)
    return null
  }

  // Create admin record
  const { error: adminError } = await supabase
    .from('admins')
    .insert({
      school_id: school.id,
      email: adminEmail,
      name: adminName,
      role: 'admin'
    })

  if (adminError) {
    console.error('Error creating admin:', adminError)
    // Rollback school creation
    await supabase.from('schools').delete().eq('id', school.id)
    return null
  }

  return school
}

// Link teacher to school
export async function linkTeacherToSchool(teacherId: string, schoolId: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from('teachers')
    .update({ school_id: schoolId })
    .eq('id', teacherId)

  return !error
}
