// Teacher Intelligence: Insight Generator
// Analyzes student activity and generates actionable insights for teachers

import { createServerSupabaseClient } from './supabase'

export interface TeacherInsight {
  id?: string
  teacher_id: string
  student_id: string
  insight_type: 'struggling' | 'improving' | 'inactive' | 'milestone'
  insight_data: {
    message: string
    detail: string
    metric?: number
    trend?: 'up' | 'down' | 'stable'
  }
  created_at?: string
}

interface StudentWithProgress {
  id: string
  name: string
  grade: number
  last_activity_at: string | null
  progress: {
    total_xp: number
    level: number
    current_streak: number
    total_questions: number
    correct_answers: number
    consecutive_correct?: number
    consecutive_wrong?: number
  } | null
}

// Generate insights for all students of a teacher
export async function generateInsightsForTeacher(teacherId: string): Promise<TeacherInsight[]> {
  const supabase = createServerSupabaseClient()
  const insights: TeacherInsight[] = []
  const now = new Date()

  // Get all students for this teacher with their progress
  const { data: students, error } = await supabase
    .from('students')
    .select(`
      id,
      name,
      grade,
      last_activity_at,
      progress (
        total_xp,
        level,
        current_streak,
        total_questions,
        correct_answers,
        consecutive_correct,
        consecutive_wrong
      )
    `)
    .eq('teacher_id', teacherId)

  if (error || !students) {
    console.error('Error fetching students for insights:', error)
    return []
  }

  for (const student of students as unknown as StudentWithProgress[]) {
    const progress = Array.isArray(student.progress) ? student.progress[0] : student.progress

    // Check for INACTIVE (no activity in 3+ days)
    if (student.last_activity_at) {
      const lastActivity = new Date(student.last_activity_at)
      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceActivity >= 3) {
        insights.push({
          teacher_id: teacherId,
          student_id: student.id,
          insight_type: 'inactive',
          insight_data: {
            message: `${student.name} hasn't practiced in ${daysSinceActivity} days`,
            detail: 'A gentle reminder might help get them back on track',
            metric: daysSinceActivity,
            trend: 'down'
          }
        })
        continue // Skip other checks for inactive students
      }
    }

    if (!progress) continue

    // Check for STRUGGLING (3+ consecutive wrong answers)
    const consecutiveWrong = progress.consecutive_wrong || 0
    if (consecutiveWrong >= 3) {
      insights.push({
        teacher_id: teacherId,
        student_id: student.id,
        insight_type: 'struggling',
        insight_data: {
          message: `${student.name} is having difficulty`,
          detail: `${consecutiveWrong} incorrect answers in a row. Consider reviewing their recent work.`,
          metric: consecutiveWrong,
          trend: 'down'
        }
      })
      continue
    }

    // Check for IMPROVING (5+ streak or accuracy improved significantly)
    if (progress.current_streak >= 5) {
      insights.push({
        teacher_id: teacherId,
        student_id: student.id,
        insight_type: 'improving',
        insight_data: {
          message: `${student.name} is on fire!`,
          detail: `${progress.current_streak}-answer streak! They're really getting it.`,
          metric: progress.current_streak,
          trend: 'up'
        }
      })
      continue
    }

    // Check for MILESTONE (level up, XP milestone)
    const xpMilestones = [100, 250, 500, 1000, 2500, 5000]
    for (const milestone of xpMilestones) {
      if (progress.total_xp >= milestone && progress.total_xp < milestone + 50) {
        insights.push({
          teacher_id: teacherId,
          student_id: student.id,
          insight_type: 'milestone',
          insight_data: {
            message: `${student.name} hit ${milestone} XP!`,
            detail: `A great moment to celebrate their progress.`,
            metric: milestone,
            trend: 'up'
          }
        })
        break
      }
    }
  }

  // Sort: struggling first, then inactive, then improving, then milestones
  const typeOrder = { struggling: 0, inactive: 1, improving: 2, milestone: 3 }
  insights.sort((a, b) => typeOrder[a.insight_type] - typeOrder[b.insight_type])

  // Limit to top 5 insights
  return insights.slice(0, 5)
}

// Save insights to database
export async function saveInsights(insights: TeacherInsight[]): Promise<boolean> {
  if (insights.length === 0) return true

  const supabase = createServerSupabaseClient()

  // Clear old unread insights for this teacher (older than 24 hours)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  await supabase
    .from('teacher_insights')
    .delete()
    .eq('teacher_id', insights[0].teacher_id)
    .lt('created_at', yesterday)
    .is('read_at', null)

  // Insert new insights
  const { error } = await supabase
    .from('teacher_insights')
    .insert(insights)

  if (error) {
    console.error('Error saving insights:', error)
    return false
  }

  return true
}

// Get current insights for a teacher
export async function getTeacherInsights(teacherId: string): Promise<TeacherInsight[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('teacher_insights')
    .select('*')
    .eq('teacher_id', teacherId)
    .is('dismissed_at', null)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching insights:', error)
    return []
  }

  return data || []
}

// Mark insight as read
export async function markInsightRead(insightId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from('teacher_insights')
    .update({ read_at: new Date().toISOString() })
    .eq('id', insightId)

  return !error
}

// Dismiss insight
export async function dismissInsight(insightId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from('teacher_insights')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', insightId)

  return !error
}
