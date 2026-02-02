import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, StudentTarget } from '@/lib/supabase'

// =============================================================================
// STUDENT TARGETS API
// =============================================================================

// GET /api/targets?studentId=xxx - Get student's targets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const { data: targets, error } = await supabase
    .from('student_targets')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[targets] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ targets: targets || [] })
}

// POST /api/targets - Create a new target for student
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { studentId, teacherId, targetText, targetType, targetValue, dueDate } = body

  if (!studentId || !teacherId || !targetText) {
    return NextResponse.json({ error: 'Student ID, teacher ID, and target text required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const { data: target, error } = await supabase
    .from('student_targets')
    .insert({
      student_id: studentId,
      teacher_id: teacherId,
      target_text: targetText,
      target_type: targetType || 'skill',
      target_value: targetValue || null,
      due_date: dueDate || null
    })
    .select()
    .single()

  if (error) {
    console.error('[targets] Create error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ target })
}

// PATCH /api/targets - Update a target (mark complete, etc.)
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { targetId, completed } = body

  if (!targetId) {
    return NextResponse.json({ error: 'Target ID required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const updates: Partial<StudentTarget> = {}
  if (completed !== undefined) {
    updates.completed = completed
    if (completed) {
      updates.completed_at = new Date().toISOString()
    }
  }

  const { data: target, error } = await supabase
    .from('student_targets')
    .update(updates)
    .eq('id', targetId)
    .select()
    .single()

  if (error) {
    console.error('[targets] Update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ target })
}

// DELETE /api/targets - Delete a target
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const targetId = searchParams.get('targetId')

  if (!targetId) {
    return NextResponse.json({ error: 'Target ID required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from('student_targets')
    .delete()
    .eq('id', targetId)

  if (error) {
    console.error('[targets] Delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
