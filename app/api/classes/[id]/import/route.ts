import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, generateLoginCode, enrollStudent } from '@/lib/supabase'

interface ImportStudent {
  name: string
  grade: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: classId } = await params
  const { students } = await request.json() as { students: ImportStudent[] }

  if (!students || !Array.isArray(students) || students.length === 0) {
    return NextResponse.json({ error: 'No students to import' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Get class to find teacher_id
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('teacher_id')
    .eq('id', classId)
    .single()

  if (classError || !classData) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }

  const results = {
    imported: 0,
    failed: 0,
    errors: [] as Array<{ name: string; error: string }>
  }

  // Import each student
  for (const student of students) {
    const loginCode = generateLoginCode()
    const avatarSeed = `${student.name}-${Date.now()}-${Math.random()}`

    // Create student
    const { data: newStudent, error: studentError } = await supabase
      .from('students')
      .insert({
        teacher_id: classData.teacher_id,
        name: student.name,
        grade: student.grade,
        avatar_seed: avatarSeed,
        login_code: loginCode
      })
      .select()
      .single()

    if (studentError) {
      results.failed++
      results.errors.push({ name: student.name, error: studentError.message })
      continue
    }

    // Create progress record
    await supabase.from('progress').insert({
      student_id: newStudent.id,
      total_xp: 0,
      level: 1,
      current_streak: 0,
      longest_streak: 0,
      total_questions: 0,
      correct_answers: 0
    })

    // Create settings record
    await supabase.from('student_settings').insert({
      student_id: newStudent.id,
      allowed_topics: ['addition', 'subtraction', 'multiplication', 'division'],
      difficulty_level: Math.min(student.grade, 5)
    })

    // Enroll in class
    await enrollStudent(classId, newStudent.id)

    results.imported++
  }

  return NextResponse.json(results)
}
