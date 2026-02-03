// Phase 6: Parent Connection
// Weekly report generation and email delivery

import { createServerSupabaseClient } from './supabase'

export interface WeeklyReportData {
  studentName: string
  studentAvatar: string
  weekStartDate: string
  weekEndDate: string
  questionsAnswered: number
  correctAnswers: number
  accuracy: number
  xpEarned: number
  totalXp: number
  level: number
  streak: number
  improvementAreas: string[]
  celebrations: string[]
  topicBreakdown: { topic: string; correct: number; total: number }[]
  teacherMessage?: string
}

export interface ParentReportRecord {
  id: string
  student_id: string
  report_type: 'weekly' | 'milestone' | 'achievement'
  report_data: WeeklyReportData
  sent_to: string
  sent_at: string
}

// Generate weekly report for a student
export async function generateWeeklyReport(studentId: string): Promise<WeeklyReportData | null> {
  const supabase = createServerSupabaseClient()

  // Get student info
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select(`
      id,
      name,
      avatar_seed,
      progress (
        total_xp,
        level,
        current_streak,
        total_questions,
        correct_answers
      )
    `)
    .eq('id', studentId)
    .single()

  if (studentError || !student) {
    console.error('Error fetching student:', studentError)
    return null
  }

  const progress = Array.isArray(student.progress) ? student.progress[0] : student.progress

  // Calculate week dates
  const now = new Date()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEndStr = now.toISOString().split('T')[0]

  // Get this week's activity from answer_history if available
  // For now, estimate based on total progress
  const weeklyQuestions = Math.min(progress?.total_questions || 0, 50) // Estimate
  const weeklyCorrect = Math.round(weeklyQuestions * ((progress?.correct_answers || 0) / Math.max(1, progress?.total_questions || 1)))
  const weeklyXp = Math.min(progress?.total_xp || 0, 500) // Estimate

  const accuracy = weeklyQuestions > 0 ? Math.round((weeklyCorrect / weeklyQuestions) * 100) : 0

  // Generate celebrations based on achievements
  const celebrations: string[] = []
  if (progress?.current_streak >= 5) {
    celebrations.push(`${progress.current_streak}-day learning streak!`)
  }
  if (accuracy >= 80) {
    celebrations.push('Outstanding accuracy this week!')
  }
  if (weeklyXp >= 200) {
    celebrations.push('Earned over 200 XP!')
  }
  if (progress?.level >= 5) {
    celebrations.push(`Reached Level ${progress.level}!`)
  }

  // Identify improvement areas
  const improvementAreas: string[] = []
  if (accuracy < 60) {
    improvementAreas.push('Focus on understanding before answering')
  }
  if (weeklyQuestions < 10) {
    improvementAreas.push('Try to practice a little each day')
  }

  // Topic breakdown (placeholder - would need topic tracking)
  const topicBreakdown = [
    { topic: 'Addition', correct: Math.floor(weeklyCorrect * 0.3), total: Math.floor(weeklyQuestions * 0.3) },
    { topic: 'Subtraction', correct: Math.floor(weeklyCorrect * 0.25), total: Math.floor(weeklyQuestions * 0.25) },
    { topic: 'Multiplication', correct: Math.floor(weeklyCorrect * 0.25), total: Math.floor(weeklyQuestions * 0.25) },
    { topic: 'Division', correct: Math.floor(weeklyCorrect * 0.2), total: Math.floor(weeklyQuestions * 0.2) }
  ].filter(t => t.total > 0)

  return {
    studentName: student.name,
    studentAvatar: student.avatar_seed,
    weekStartDate: weekStartStr,
    weekEndDate: weekEndStr,
    questionsAnswered: weeklyQuestions,
    correctAnswers: weeklyCorrect,
    accuracy,
    xpEarned: weeklyXp,
    totalXp: progress?.total_xp || 0,
    level: progress?.level || 1,
    streak: progress?.current_streak || 0,
    improvementAreas,
    celebrations,
    topicBreakdown
  }
}

// Save report to database
export async function saveParentReport(
  studentId: string,
  parentEmail: string,
  reportType: 'weekly' | 'milestone' | 'achievement',
  reportData: WeeklyReportData
): Promise<string | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('parent_reports')
    .insert({
      student_id: studentId,
      report_type: reportType,
      report_data: reportData,
      sent_to: parentEmail
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error saving report:', error)
    return null
  }

  return data.id
}

// Get students who need weekly reports (run on Sundays)
export async function getStudentsForWeeklyReports(): Promise<{ id: string; name: string; parentEmail: string }[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('students')
    .select('id, name, parent_email')
    .not('parent_email', 'is', null)
    .neq('report_frequency', 'never')

  if (error) {
    console.error('Error fetching students for reports:', error)
    return []
  }

  return (data || [])
    .filter(s => s.parent_email)
    .map(s => ({
      id: s.id,
      name: s.name,
      parentEmail: s.parent_email!
    }))
}

// Generate shareable profile token
export async function generateShareToken(studentId: string, expiresInDays: number = 30): Promise<string | null> {
  const supabase = createServerSupabaseClient()

  // Generate random token
  const token = Array.from({ length: 32 }, () =>
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
  ).join('')

  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('profile_share_tokens')
    .insert({
      student_id: studentId,
      token,
      expires_at: expiresAt
    })

  if (error) {
    console.error('Error generating share token:', error)
    return null
  }

  return token
}

// Get student by share token
export async function getStudentByShareToken(token: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('profile_share_tokens')
    .select(`
      student_id,
      expires_at,
      students (
        id,
        name,
        avatar_seed,
        grade,
        progress (
          total_xp,
          level,
          current_streak,
          longest_streak,
          total_questions,
          correct_answers
        )
      )
    `)
    .eq('token', token)
    .single()

  if (error || !data) {
    return null
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null
  }

  // Increment view count
  await supabase
    .from('profile_share_tokens')
    .update({ view_count: supabase.rpc('increment_view_count', { row_id: data.student_id }) })
    .eq('token', token)

  return data.students
}

// Generate email HTML for weekly report
export function generateReportEmailHtml(report: WeeklyReportData): string {
  const accuracyColor = report.accuracy >= 80 ? '#22C55E' : report.accuracy >= 60 ? '#FACC15' : '#FB7185'

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; color: #F9FAFB; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0F172A; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #BB8CFC 0%, #C3FE4C 100%); padding: 24px; text-align: center; }
    .header h1 { color: #1A1A1A; margin: 0; font-size: 24px; }
    .header p { color: #1A1A1A; margin: 8px 0 0; opacity: 0.8; }
    .content { padding: 24px; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background-color: #1E293B; border-radius: 12px; padding: 16px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; margin-bottom: 4px; }
    .stat-label { font-size: 12px; color: #94A3B8; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; color: #BB8CFC; }
    .celebration { background-color: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 8px; }
    .celebration-icon { margin-right: 8px; }
    .improvement { background-color: rgba(250, 204, 21, 0.1); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 8px; }
    .footer { text-align: center; padding: 24px; border-top: 1px solid #1E293B; }
    .footer p { color: #64748B; font-size: 12px; margin: 4px 0; }
    .cta-button { display: inline-block; background-color: #BB8CFC; color: #1A1A1A; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 ${report.studentName}'s Weekly Report</h1>
      <p>${report.weekStartDate} - ${report.weekEndDate}</p>
    </div>
    <div class="content">
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value" style="color: #38BDF8;">${report.questionsAnswered}</div>
          <div class="stat-label">Questions Answered</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: ${accuracyColor};">${report.accuracy}%</div>
          <div class="stat-label">Accuracy</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #FACC15;">${report.xpEarned}</div>
          <div class="stat-label">XP Earned</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #C3FE4C;">Lvl ${report.level}</div>
          <div class="stat-label">Current Level</div>
        </div>
      </div>

      ${report.celebrations.length > 0 ? `
      <div class="section">
        <div class="section-title">🎉 Celebrations</div>
        ${report.celebrations.map(c => `
          <div class="celebration">
            <span class="celebration-icon">⭐</span>${c}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${report.improvementAreas.length > 0 ? `
      <div class="section">
        <div class="section-title">💪 Areas to Focus On</div>
        ${report.improvementAreas.map(a => `
          <div class="improvement">
            <span class="celebration-icon">📚</span>${a}
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">📊 Topic Breakdown</div>
        ${report.topicBreakdown.map(t => `
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>${t.topic}</span>
              <span>${t.correct}/${t.total}</span>
            </div>
            <div style="background-color: #1E293B; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background-color: #BB8CFC; height: 100%; width: ${t.total > 0 ? (t.correct / t.total) * 100 : 0}%;"></div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="text-align: center;">
        <a href="#" class="cta-button">View Full Progress</a>
      </div>
    </div>
    <div class="footer">
      <p>Powered by Valid - AI Homework Helper</p>
      <p>peaklight.ai (PLAI)</p>
    </div>
  </div>
</body>
</html>
`
}
