import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, DiagnosticTest, DiagnosticQuestion } from '@/lib/supabase'
import { diagnosticQuestions, getQuestionsByGrade, calculateRecommendedLevel, getDomainsForGrade } from '@/lib/diagnosticQuestions'

// =============================================================================
// DIAGNOSTIC API
// =============================================================================

// GET /api/diagnostic?studentId=xxx - Get or check diagnostic status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Check if student has completed diagnostic
  const { data: student } = await supabase
    .from('students')
    .select('id, grade, has_diagnostic, diagnostic_completed_at')
    .eq('id', studentId)
    .single()

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  // Get existing diagnostic test if any
  const { data: test } = await supabase
    .from('diagnostic_tests')
    .select('*')
    .eq('student_id', studentId)
    .single()

  return NextResponse.json({
    hasDiagnostic: student.has_diagnostic,
    completedAt: student.diagnostic_completed_at,
    test: test || null,
    grade: student.grade
  })
}

// POST /api/diagnostic - Start or continue diagnostic test
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { studentId, action, questionId, answer, timeSeconds } = body

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  // Get student info
  const { data: student } = await supabase
    .from('students')
    .select('id, grade, has_diagnostic')
    .eq('id', studentId)
    .single()

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  // Handle different actions
  switch (action) {
    case 'start': {
      // Check if test already exists
      const { data: existingTest } = await supabase
        .from('diagnostic_tests')
        .select('*')
        .eq('student_id', studentId)
        .single()

      if (existingTest) {
        // Return existing test with next question
        return NextResponse.json({
          test: existingTest,
          nextQuestion: await getNextQuestion(supabase, existingTest.id, student.grade)
        })
      }

      // Create new test
      const { data: newTest, error } = await supabase
        .from('diagnostic_tests')
        .insert({
          student_id: studentId,
          status: 'in_progress',
          results: {},
          recommended_levels: {}
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Get first question (medium difficulty for the grade)
      const domains = getDomainsForGrade(student.grade)
      const firstDomain = domains[0] || 'addition'
      const questions = getQuestionsByGrade(student.grade).filter(
        q => q.domain === firstDomain && q.difficulty === 3
      )
      const firstQuestion = questions[0] || getQuestionsByGrade(student.grade)[0]

      return NextResponse.json({
        test: newTest,
        nextQuestion: firstQuestion,
        totalDomains: domains.length,
        currentDomain: firstDomain
      })
    }

    case 'answer': {
      if (!questionId || answer === undefined) {
        return NextResponse.json({ error: 'Question ID and answer required' }, { status: 400 })
      }

      // Get the test
      const { data: test } = await supabase
        .from('diagnostic_tests')
        .select('*')
        .eq('student_id', studentId)
        .single()

      if (!test || test.status !== 'in_progress') {
        return NextResponse.json({ error: 'No active test' }, { status: 400 })
      }

      // Find the question from our seed data
      const question = diagnosticQuestions.find(q =>
        q.question === questionId || q.answer === questionId
      ) || diagnosticQuestions.find(q => q.question.includes(questionId))

      // For now, find by matching question text in our local data
      const matchedQuestion = diagnosticQuestions.find(q => q.question === questionId)

      if (!matchedQuestion) {
        // Question not found in our data - record response anyway to advance test
        const isCorrect = false // Mark as incorrect since we can't verify

        // Record response to advance the count
        await supabase
          .from('diagnostic_responses')
          .insert({
            test_id: test.id,
            question_id: test.id,
            student_answer: answer.toString(),
            is_correct: isCorrect,
            time_seconds: timeSeconds || null
          })

        return NextResponse.json({
          isCorrect,
          correctAnswer: 'Unknown',
          nextQuestion: await getNextQuestion(supabase, test.id, student.grade)
        })
      }

      // Check answer
      const isCorrect = answer.toString().toLowerCase().trim() === matchedQuestion.answer.toLowerCase().trim()

      // Record response (we'll use a simplified approach without DB questions table for now)
      const { error: responseError } = await supabase
        .from('diagnostic_responses')
        .insert({
          test_id: test.id,
          question_id: test.id, // Using test ID as placeholder since we don't have questions in DB yet
          student_answer: answer.toString(),
          is_correct: isCorrect,
          time_seconds: timeSeconds || null
        })

      // Update test results
      const results = test.results || {}
      const domain = matchedQuestion.domain
      if (!results[domain]) {
        results[domain] = { correct: 0, total: 0, avgTime: 0 }
      }
      results[domain].total++
      if (isCorrect) results[domain].correct++
      if (timeSeconds) {
        results[domain].avgTime = (results[domain].avgTime * (results[domain].total - 1) + timeSeconds) / results[domain].total
      }

      await supabase
        .from('diagnostic_tests')
        .update({ results })
        .eq('id', test.id)

      // Get next question
      const nextQuestion = await getNextQuestion(supabase, test.id, student.grade, matchedQuestion.domain, matchedQuestion.difficulty, isCorrect)

      return NextResponse.json({
        isCorrect,
        correctAnswer: matchedQuestion.answer,
        nextQuestion
      })
    }

    case 'complete': {
      // Get the test
      const { data: test } = await supabase
        .from('diagnostic_tests')
        .select('*')
        .eq('student_id', studentId)
        .single()

      if (!test) {
        return NextResponse.json({ error: 'No test found' }, { status: 400 })
      }

      // Calculate recommended levels per domain
      const results = test.results || {}
      const recommendedLevels: Record<string, number> = {}

      for (const [domain, stats] of Object.entries(results as Record<string, { correct: number; total: number }>)) {
        const accuracy = stats.total > 0 ? stats.correct / stats.total : 0
        // Map accuracy to difficulty level
        if (accuracy >= 0.8) recommendedLevels[domain] = 5
        else if (accuracy >= 0.6) recommendedLevels[domain] = 4
        else if (accuracy >= 0.4) recommendedLevels[domain] = 3
        else if (accuracy >= 0.2) recommendedLevels[domain] = 2
        else recommendedLevels[domain] = 1
      }

      // Update test as completed
      await supabase
        .from('diagnostic_tests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          recommended_levels: recommendedLevels
        })
        .eq('id', test.id)

      // Update student as having completed diagnostic
      const overallLevel = Object.values(recommendedLevels).length > 0
        ? Math.round(Object.values(recommendedLevels).reduce((a, b) => a + b, 0) / Object.values(recommendedLevels).length)
        : 3

      await supabase
        .from('students')
        .update({
          has_diagnostic: true,
          diagnostic_completed_at: new Date().toISOString()
        })
        .eq('id', studentId)

      // Update student settings with recommended level
      await supabase
        .from('student_settings')
        .update({ difficulty_level: overallLevel })
        .eq('student_id', studentId)

      return NextResponse.json({
        completed: true,
        results,
        recommendedLevels,
        overallLevel
      })
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}

// Helper to get next question
async function getNextQuestion(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  testId: string,
  grade: number,
  currentDomain?: string,
  currentDifficulty?: number,
  wasCorrect?: boolean
) {
  // Get responses count per domain
  const { data: responses } = await supabase
    .from('diagnostic_responses')
    .select('*')
    .eq('test_id', testId)

  const responseCount = responses?.length || 0
  const domains = getDomainsForGrade(grade)
  const questionsPerDomain = 3 // Ask 3 questions per domain
  const maxQuestions = domains.length * questionsPerDomain

  // HARD LIMIT: Stop after max questions regardless
  if (responseCount >= maxQuestions) {
    return null
  }

  // Calculate which domain we're on
  const currentDomainIndex = Math.floor(responseCount / questionsPerDomain)

  if (currentDomainIndex >= domains.length) {
    // All domains covered, test is complete
    return null
  }

  const targetDomain = domains[currentDomainIndex]

  // Determine difficulty
  let difficulty = 3 // Start at medium
  if (currentDomain === targetDomain && currentDifficulty !== undefined && wasCorrect !== undefined) {
    difficulty = wasCorrect ? Math.min(5, currentDifficulty + 1) : Math.max(1, currentDifficulty - 1)
  }

  // Get questions for this grade/domain/difficulty
  let candidates = diagnosticQuestions.filter(
    q => q.grade === grade && q.domain === targetDomain && q.difficulty === difficulty
  )

  // Fallback if no questions at exact difficulty
  if (candidates.length === 0) {
    candidates = diagnosticQuestions.filter(
      q => q.grade === grade && q.domain === targetDomain
    )
  }

  if (candidates.length === 0) {
    return null
  }

  // Return random question from candidates
  return candidates[Math.floor(Math.random() * candidates.length)]
}
