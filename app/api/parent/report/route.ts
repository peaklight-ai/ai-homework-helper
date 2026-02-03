import { NextRequest, NextResponse } from 'next/server'
import { generateWeeklyReport, saveParentReport, generateReportEmailHtml, generateShareToken } from '@/lib/parentReports'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/parent/report?studentId=xxx - Generate weekly report preview
export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get('studentId')

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  try {
    const report = await generateWeeklyReport(studentId)

    if (!report) {
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

// POST /api/parent/report - Send report email
export async function POST(request: NextRequest) {
  try {
    const { studentId, parentEmail, sendEmail } = await request.json()

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    // Generate report
    const report = await generateWeeklyReport(studentId)
    if (!report) {
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }

    // Get or use provided parent email
    let email = parentEmail
    if (!email) {
      const supabase = createServerSupabaseClient()
      const { data: student } = await supabase
        .from('students')
        .select('parent_email')
        .eq('id', studentId)
        .single()

      email = student?.parent_email
    }

    if (!email) {
      return NextResponse.json({ error: 'No parent email configured' }, { status: 400 })
    }

    // Save report to database
    const reportId = await saveParentReport(studentId, email, 'weekly', report)

    // Send email if requested (requires Resend API key)
    if (sendEmail && process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const html = generateReportEmailHtml(report)

      await resend.emails.send({
        from: 'Valid <reports@peaklight.ai>',
        to: email,
        subject: `📚 ${report.studentName}'s Weekly Learning Report`,
        html
      })
    }

    return NextResponse.json({
      success: true,
      reportId,
      emailSent: sendEmail && !!process.env.RESEND_API_KEY
    })
  } catch (error) {
    console.error('Error sending report:', error)
    return NextResponse.json({ error: 'Failed to send report' }, { status: 500 })
  }
}

// PUT /api/parent/report - Update parent email for student
export async function PUT(request: NextRequest) {
  try {
    const { studentId, parentEmail, parentName, reportFrequency } = await request.json()

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const updates: Record<string, string> = {}
    if (parentEmail !== undefined) updates.parent_email = parentEmail
    if (parentName !== undefined) updates.parent_name = parentName
    if (reportFrequency !== undefined) updates.report_frequency = reportFrequency

    const { error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', studentId)

    if (error) {
      console.error('Error updating parent info:', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating parent info:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
