import { NextRequest } from 'next/server'
import { getSocraticResponseStream, StudentTargetContext } from '@/lib/gemini'
import { getActiveStudentTargets } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userMessage, problem, conversationHistory, studentGrade, hints, strategies, studentId } = await request.json()

    if (!userMessage || !problem) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Convert conversation history to OpenAI format for CometAPI
    const formattedHistory = (conversationHistory || []).map((msg: any) => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts
    }))

    // Calculate hints already given based on conversation length
    const hintsGiven = Math.floor(formattedHistory.length / 4) // Give hint every 4 exchanges

    // AI-01: Fetch student targets if studentId is provided
    let studentTargets: StudentTargetContext[] = []
    if (studentId) {
      try {
        const targets = await getActiveStudentTargets(studentId)
        studentTargets = targets.map(t => ({
          targetText: t.target_text,
          targetType: t.target_type
        }))
      } catch (e) {
        console.error('Failed to fetch student targets:', e)
        // Continue without targets - non-blocking
      }
    }

    // Get streaming response from Gemini via CometAPI
    // AI-02: Passing targets to AI for adapted teaching
    const { stream, isCorrect } = await getSocraticResponseStream(userMessage, {
      problemQuestion: problem.question,
      problemAnswer: problem.answer,
      conversationHistory: formattedHistory,
      hintsGiven,
      studentGrade: studentGrade || problem.gradeRange?.[0] || 3,
      hints: hints || problem.hints || [],
      strategies: strategies || undefined,
      studentTargets: studentTargets.length > 0 ? studentTargets : undefined
    })

    // Create a transform stream to parse SSE and send JSON chunks
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk)
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()

            if (data === '[DONE]') {
              // Send final message with isCorrect flag
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({ done: true, isCorrect }) + '\n'
                )
              )
              continue
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content

              if (content) {
                // Send content chunk
                controller.enqueue(
                  new TextEncoder().encode(
                    JSON.stringify({ content }) + '\n'
                  )
                )
              }
            } catch (e) {
              // Skip invalid JSON
              console.error('Failed to parse SSE chunk:', e)
            }
          }
        }
      }
    })

    // Pipe the stream through our transform
    const outputStream = stream.pipeThrough(transformStream)

    return new Response(outputStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
