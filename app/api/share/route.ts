import { NextRequest, NextResponse } from 'next/server'
import { generateShareToken, getStudentByShareToken } from '@/lib/parentReports'

// POST /api/share - Generate shareable link for student
export async function POST(request: NextRequest) {
  try {
    const { studentId, expiresInDays } = await request.json()

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    const token = await generateShareToken(studentId, expiresInDays || 30)

    if (!token) {
      return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 })
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${token}`

    return NextResponse.json({ token, shareUrl })
  } catch (error) {
    console.error('Error generating share link:', error)
    return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 })
  }
}

// GET /api/share?token=xxx - Get student profile by share token
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  try {
    const student = await getStudentByShareToken(token)

    if (!student) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error('Error fetching shared profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
