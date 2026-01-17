import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createStudent, deleteStudent } from '@/lib/supabase'

// =============================================================================
// STUDENTS API
// =============================================================================
// GET: List all students for the logged-in teacher
// POST: Create a new student
// DELETE: Delete a student
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get teacher ID from the auth header or session
    const authHeader = request.headers.get('x-teacher-id')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all students for this teacher with their progress
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        progress (*),
        student_settings (*)
      `)
      .eq('teacher_id', authHeader)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    // Transform data for frontend
    const transformedStudents = students?.map(student => ({
      id: student.id,
      name: student.name,
      grade: student.grade,
      avatarSeed: student.avatar_seed,
      loginCode: student.login_code,
      createdAt: student.created_at,
      progress: student.progress?.[0] ? {
        totalXp: student.progress[0].total_xp,
        level: student.progress[0].level,
        currentStreak: student.progress[0].current_streak,
        longestStreak: student.progress[0].longest_streak,
        totalQuestions: student.progress[0].total_questions,
        correctAnswers: student.progress[0].correct_answers
      } : {
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalQuestions: 0,
        correctAnswers: 0
      },
      settings: student.student_settings?.[0] ? {
        allowedTopics: student.student_settings[0].allowed_topics,
        difficultyLevel: student.student_settings[0].difficulty_level
      } : {
        allowedTopics: ['addition', 'subtraction', 'multiplication', 'division'],
        difficultyLevel: 1
      }
    }))

    return NextResponse.json({ students: transformedStudents || [] })
  } catch (error) {
    console.error('Students API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { teacherId, name, grade } = await request.json()

    if (!teacherId || !name || !grade) {
      return NextResponse.json(
        { error: 'Teacher ID, name, and grade are required' },
        { status: 400 }
      )
    }

    const student = await createStudent(teacherId, name, grade)

    if (!student) {
      return NextResponse.json(
        { error: 'Failed to create student' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        grade: student.grade,
        avatarSeed: student.avatar_seed,
        loginCode: student.login_code,
        createdAt: student.created_at
      }
    })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('id')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const success = await deleteStudent(studentId)

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
