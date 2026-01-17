import { NextRequest, NextResponse } from 'next/server'
import { updateStudentSettings, getStudentSettings } from '@/lib/supabase'
import type { MathTopic } from '@/lib/supabase'

// =============================================================================
// STUDENT SETTINGS API
// =============================================================================
// GET: Get settings for a student
// PUT: Update settings (topics, difficulty)
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const settings = await getStudentSettings(studentId)

    if (!settings) {
      return NextResponse.json({
        settings: {
          allowedTopics: ['addition', 'subtraction', 'multiplication', 'division'],
          difficultyLevel: 1
        }
      })
    }

    return NextResponse.json({
      settings: {
        allowedTopics: settings.allowed_topics,
        difficultyLevel: settings.difficulty_level
      }
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { studentId, allowedTopics, difficultyLevel } = await request.json()

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    // Validate topics
    const validTopics: MathTopic[] = ['addition', 'subtraction', 'multiplication', 'division']
    const topics = (allowedTopics || validTopics).filter((t: string) =>
      validTopics.includes(t as MathTopic)
    ) as MathTopic[]

    // Validate difficulty
    const difficulty = Math.min(5, Math.max(1, difficultyLevel || 1)) as 1 | 2 | 3 | 4 | 5

    const success = await updateStudentSettings(studentId, topics, difficulty)

    if (!success) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      settings: {
        allowedTopics: topics,
        difficultyLevel: difficulty
      }
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
