import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// =============================================================================
// TEACHERS API
// =============================================================================
// POST: Create a new teacher record (called after auth signup)
// Uses service role to bypass RLS
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const { id, email, name } = await request.json()

    if (!id || !email || !name) {
      return NextResponse.json(
        { error: 'ID, email, and name are required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Insert teacher record using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('teachers')
      .insert({
        id,
        email,
        name
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating teacher:', error)

      // Check if it's a duplicate key error (teacher already exists)
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Teacher already exists' })
      }

      return NextResponse.json(
        { error: 'Failed to create teacher record', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, teacher: data })
  } catch (error) {
    console.error('Teachers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
