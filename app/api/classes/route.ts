import { NextRequest, NextResponse } from 'next/server'
import { getClassesByTeacher, createClass } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const teacherId = request.headers.get('x-teacher-id')
  if (!teacherId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const classes = await getClassesByTeacher(teacherId)
  return NextResponse.json({ classes })
}

export async function POST(request: NextRequest) {
  const { teacherId, name, grade } = await request.json()

  if (!teacherId || !name) {
    return NextResponse.json({ error: 'Teacher ID and name required' }, { status: 400 })
  }

  const newClass = await createClass(teacherId, name, grade)
  if (!newClass) {
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }

  return NextResponse.json({ class: newClass })
}
