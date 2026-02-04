import { NextRequest, NextResponse } from 'next/server'
import { getAssignmentsForStudent } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get('studentId')

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  try {
    const exercises = await getAssignmentsForStudent(studentId)
    return NextResponse.json({ exercises })
  } catch (error) {
    console.error('Error fetching assigned exercises:', error)
    return NextResponse.json({ exercises: [] })
  }
}
