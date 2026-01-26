import { NextRequest, NextResponse } from 'next/server'
import { updateClass, deleteClass } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { name, grade } = await request.json()

  const success = await updateClass(id, { name, grade })
  if (!success) {
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const success = await deleteClass(id)
  if (!success) {
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
