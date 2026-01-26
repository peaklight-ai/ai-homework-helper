import { NextRequest, NextResponse } from 'next/server'
import { enrollStudent, unenrollStudent, getStudentsByClass } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: classId } = await params

  const students = await getStudentsByClass(classId)
  return NextResponse.json({ students })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: classId } = await params
  const { studentId } = await request.json()

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  const success = await enrollStudent(classId, studentId)
  if (!success) {
    return NextResponse.json({ error: 'Failed to enroll student' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: classId } = await params
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  const success = await unenrollStudent(classId, studentId)
  if (!success) {
    return NextResponse.json({ error: 'Failed to unenroll student' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
