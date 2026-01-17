import { NextRequest, NextResponse } from 'next/server'
import { getStudentByLoginCode, getStudentProgress, getStudentSettings } from '@/lib/supabase'

// =============================================================================
// STUDENT LOGIN API
// =============================================================================
// Students log in with a 6-digit code (no email/password needed)
// Returns student data, progress, and settings
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const { loginCode } = await request.json()

    if (!loginCode || loginCode.length !== 6) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-character code' },
        { status: 400 }
      )
    }

    // Look up student by login code
    const student = await getStudentByLoginCode(loginCode)

    if (!student) {
      return NextResponse.json(
        { error: 'Code not found. Please check with your teacher.' },
        { status: 404 }
      )
    }

    // Get student's progress
    const progress = await getStudentProgress(student.id)

    // Get student's settings
    const settings = await getStudentSettings(student.id)

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        avatarSeed: student.avatar_seed,
        loginCode: student.login_code
      },
      progress: progress ? {
        totalXp: progress.total_xp,
        level: progress.level,
        currentStreak: progress.current_streak,
        longestStreak: progress.longest_streak,
        totalQuestions: progress.total_questions,
        correctAnswers: progress.correct_answers
      } : {
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalQuestions: 0,
        correctAnswers: 0
      },
      settings: settings ? {
        allowedTopics: settings.allowed_topics,
        difficultyLevel: settings.difficulty_level
      } : {
        allowedTopics: ['addition', 'subtraction', 'multiplication', 'division'],
        difficultyLevel: 1
      }
    })
  } catch (error) {
    console.error('Student login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
