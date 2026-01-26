import { NextRequest, NextResponse } from 'next/server'
import { getExercisesByTeacher, createExercise } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const teacherId = request.headers.get('x-teacher-id')
  if (!teacherId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const exercises = await getExercisesByTeacher(teacherId)
  return NextResponse.json({ exercises })
}

export async function POST(request: NextRequest) {
  const { teacherId, question, answer, difficulty, domain, grade } = await request.json()

  if (!teacherId || !question || !answer) {
    return NextResponse.json(
      { error: 'Teacher ID, question, and answer required' },
      { status: 400 }
    )
  }

  const exercise = await createExercise(
    teacherId,
    question,
    answer,
    difficulty || 3,
    domain,
    grade
  )

  if (!exercise) {
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 })
  }

  return NextResponse.json({ exercise })
}
