import { NextRequest, NextResponse } from 'next/server'
import { generateInsightsForTeacher, getTeacherInsights, saveInsights, markInsightRead, dismissInsight } from '@/lib/insightGenerator'

// GET /api/insights?teacherId=xxx - Get insights for a teacher
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const teacherId = searchParams.get('teacherId')
  const refresh = searchParams.get('refresh') === 'true'

  if (!teacherId) {
    return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 })
  }

  try {
    // If refresh requested, generate new insights
    if (refresh) {
      const newInsights = await generateInsightsForTeacher(teacherId)
      await saveInsights(newInsights)
    }

    // Get current insights
    const insights = await getTeacherInsights(teacherId)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}

// POST /api/insights - Mark as read or dismiss
export async function POST(request: NextRequest) {
  try {
    const { insightId, action } = await request.json()

    if (!insightId || !action) {
      return NextResponse.json({ error: 'Insight ID and action required' }, { status: 400 })
    }

    let success = false

    if (action === 'read') {
      success = await markInsightRead(insightId)
    } else if (action === 'dismiss') {
      success = await dismissInsight(insightId)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error updating insight:', error)
    return NextResponse.json({ error: 'Failed to update insight' }, { status: 500 })
  }
}
