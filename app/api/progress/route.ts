import { NextRequest, NextResponse } from 'next/server'
import { addXpToStudent, recordStudentAnswer, getStudentProgress } from '@/lib/supabase'

// =============================================================================
// PROGRESS API
// =============================================================================
// GET: Get progress for a student
// POST: Update progress (add XP, record answer)
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const progress = await getStudentProgress(studentId)

    if (!progress) {
      return NextResponse.json({
        progress: {
          totalXp: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          totalQuestions: 0,
          correctAnswers: 0
        }
      })
    }

    return NextResponse.json({
      progress: {
        totalXp: progress.total_xp,
        level: progress.level,
        currentStreak: progress.current_streak,
        longestStreak: progress.longest_streak,
        totalQuestions: progress.total_questions,
        correctAnswers: progress.correct_answers
      }
    })
  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { studentId, action, xp, isCorrect } = await request.json()

    if (!studentId || !action) {
      return NextResponse.json(
        { error: 'Student ID and action are required' },
        { status: 400 }
      )
    }

    let success = false

    if (action === 'addXp' && typeof xp === 'number') {
      success = await addXpToStudent(studentId, xp)
    } else if (action === 'recordAnswer' && typeof isCorrect === 'boolean') {
      success = await recordStudentAnswer(studentId, isCorrect)
      // Also add XP if correct
      if (isCorrect) {
        await addXpToStudent(studentId, 50)
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing parameters' },
        { status: 400 }
      )
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      )
    }

    // Return updated progress
    const progress = await getStudentProgress(studentId)

    return NextResponse.json({
      success: true,
      progress: progress ? {
        totalXp: progress.total_xp,
        level: progress.level,
        currentStreak: progress.current_streak,
        longestStreak: progress.longest_streak,
        totalQuestions: progress.total_questions,
        correctAnswers: progress.correct_answers
      } : null
    })
  } catch (error) {
    console.error('Update progress error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
