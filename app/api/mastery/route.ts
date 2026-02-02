import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, TopicMastery } from '@/lib/supabase'

// =============================================================================
// TOPIC MASTERY API
// =============================================================================

// GET /api/mastery?studentId=xxx - Get student's topic mastery
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const { data: mastery, error } = await supabase
    .from('topic_mastery')
    .select('*')
    .eq('student_id', studentId)
    .order('last_attempt', { ascending: false })

  if (error) {
    console.error('[mastery] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculate mastery percentages
  const masteryWithPercent = (mastery || []).map(m => ({
    ...m,
    mastery_percent: m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0
  }))

  return NextResponse.json({ mastery: masteryWithPercent })
}

// POST /api/mastery - Record a problem attempt (updates mastery)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { studentId, topic, isCorrect, timeSeconds } = body

  if (!studentId || !topic) {
    return NextResponse.json({ error: 'Student ID and topic required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Check if mastery record exists
  const { data: existing } = await supabase
    .from('topic_mastery')
    .select('*')
    .eq('student_id', studentId)
    .eq('topic', topic)
    .single()

  if (existing) {
    // Update existing record
    const newAttempts = existing.attempts + 1
    const newCorrect = existing.correct + (isCorrect ? 1 : 0)
    const newAvgTime = timeSeconds
      ? (existing.avg_time_seconds * existing.attempts + timeSeconds) / newAttempts
      : existing.avg_time_seconds

    const { data: updated, error } = await supabase
      .from('topic_mastery')
      .update({
        attempts: newAttempts,
        correct: newCorrect,
        avg_time_seconds: newAvgTime,
        last_attempt: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('[mastery] Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      mastery: {
        ...updated,
        mastery_percent: Math.round((newCorrect / newAttempts) * 100)
      }
    })
  } else {
    // Create new record
    const { data: created, error } = await supabase
      .from('topic_mastery')
      .insert({
        student_id: studentId,
        topic,
        attempts: 1,
        correct: isCorrect ? 1 : 0,
        avg_time_seconds: timeSeconds || null,
        last_attempt: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[mastery] Create error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      mastery: {
        ...created,
        mastery_percent: isCorrect ? 100 : 0
      }
    })
  }
}
