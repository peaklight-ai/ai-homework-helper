import { NextRequest, NextResponse } from 'next/server'
import { generateSchoolStats, getAdminSchool } from '@/lib/schoolStats'

// GET /api/admin/stats - Get school statistics
export async function GET(request: NextRequest) {
  const adminEmail = request.headers.get('x-admin-email')
  const schoolIdParam = request.nextUrl.searchParams.get('schoolId')

  if (!adminEmail && !schoolIdParam) {
    return NextResponse.json({ error: 'Admin email or school ID required' }, { status: 400 })
  }

  try {
    let schoolId = schoolIdParam

    // If no school ID, get from admin record
    if (!schoolId && adminEmail) {
      const school = await getAdminSchool(adminEmail)
      if (!school) {
        return NextResponse.json({ error: 'School not found for admin' }, { status: 404 })
      }
      schoolId = school.id
    }

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 400 })
    }

    const stats = await generateSchoolStats(schoolId)

    if (!stats) {
      return NextResponse.json({ error: 'Failed to generate stats' }, { status: 500 })
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
