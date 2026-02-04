import { NextRequest, NextResponse } from 'next/server'
import { checkAndUnlockBadges, getStudentBadges, markBadgesSeen, getAllBadges } from '@/lib/badges'

// GET /api/badges?studentId=xxx - Get badges for a student
// GET /api/badges - Get all available badges
export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get('studentId')
  const checkNew = request.nextUrl.searchParams.get('checkNew') === 'true'

  try {
    // If no student ID, return all badge definitions
    if (!studentId) {
      const badges = await getAllBadges()
      return NextResponse.json({ badges })
    }

    // Check for new unlocks if requested
    let newUnlocks: Awaited<ReturnType<typeof checkAndUnlockBadges>> = []
    if (checkNew) {
      newUnlocks = await checkAndUnlockBadges(studentId)
    }

    // Get student's badges
    const badges = await getStudentBadges(studentId)

    return NextResponse.json({
      badges,
      newUnlocks: newUnlocks.length > 0 ? newUnlocks : undefined
    })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 })
  }
}

// POST /api/badges - Mark badges as seen
export async function POST(request: NextRequest) {
  try {
    const { studentId, badgeIds } = await request.json()

    if (!studentId || !badgeIds || !Array.isArray(badgeIds)) {
      return NextResponse.json({ error: 'Student ID and badge IDs required' }, { status: 400 })
    }

    await markBadgesSeen(studentId, badgeIds)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking badges seen:', error)
    return NextResponse.json({ error: 'Failed to update badges' }, { status: 500 })
  }
}
