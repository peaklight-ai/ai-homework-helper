import { NextRequest, NextResponse } from 'next/server'
import { assignExerciseToClass, assignExerciseToStudents } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { exerciseId, classId, studentIds, dueDate } = await request.json()

  if (!exerciseId) {
    return NextResponse.json({ error: 'Exercise ID required' }, { status: 400 })
  }

  if (!classId && (!studentIds || studentIds.length === 0)) {
    return NextResponse.json(
      { error: 'Must provide classId or studentIds' },
      { status: 400 }
    )
  }

  // Assign to class
  if (classId) {
    const success = await assignExerciseToClass(exerciseId, classId, dueDate)
    if (!success) {
      return NextResponse.json({ error: 'Failed to assign to class' }, { status: 500 })
    }
    return NextResponse.json({ success: true, assignedTo: 'class' })
  }

  // Assign to specific students
  if (studentIds && studentIds.length > 0) {
    const result = await assignExerciseToStudents(exerciseId, studentIds, dueDate)
    return NextResponse.json({
      success: result.failed === 0,
      assignedTo: 'students',
      assigned: result.success,
      failed: result.failed
    })
  }

  return NextResponse.json({ error: 'No assignment target' }, { status: 400 })
}
