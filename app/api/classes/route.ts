import { NextRequest, NextResponse } from 'next/server'
import { getClassesByTeacher, createClass } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const teacherId = request.headers.get('x-teacher-id')
  console.log('[GET /api/classes] teacherId:', teacherId)
  if (!teacherId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const classes = await getClassesByTeacher(teacherId)
  console.log('[GET /api/classes] found:', classes.length, 'classes')
  return NextResponse.json({ classes })
}

export async function POST(request: NextRequest) {
  const { teacherId, name, grade } = await request.json()
  console.log('[POST /api/classes] creating:', { teacherId, name, grade })

  if (!teacherId || !name) {
    return NextResponse.json({ error: 'Teacher ID and name required' }, { status: 400 })
  }

  const newClass = await createClass(teacherId, name, grade)
  console.log('[POST /api/classes] result:', newClass)
  if (!newClass) {
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }

  return NextResponse.json({ class: newClass })
}
