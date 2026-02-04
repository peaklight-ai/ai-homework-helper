import { NextRequest, NextResponse } from 'next/server'
import { getAssignmentsForStudent } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get('studentId')
  const isTeacher = request.nextUrl.searchParams.get('teacher') === 'true'

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  try {
    const exercises = await getAssignmentsForStudent(studentId)

    // Strip sensitive teacher-only data from student view
    // VIS-03: Hide hints from students
    // VIS-04: Hide strategies from students
    if (!isTeacher) {
      const sanitizedExercises = exercises.map(ex => ({
        id: ex.id,
        question: ex.question,
        // Don't expose answer to students
        difficulty: ex.difficulty,
        domain: ex.domain,
        grade: ex.grade
        // hints and strategies are NOT included
      }))
      return NextResponse.json({ exercises: sanitizedExercises })
    }

    // Teachers get full data including hints, strategies, answers
    return NextResponse.json({ exercises })
  } catch (error) {
    console.error('Error fetching assigned exercises:', error)
    return NextResponse.json({ exercises: [] })
  }
}
