import { NextRequest } from 'next/server'
import { getSocraticResponse } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { userMessage, problem, conversationHistory } = await request.json()

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

    // Create a streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Get Socratic response from Gemini via CometAPI with streaming
          const result = await getSocraticResponse(
            userMessage,
            {
              problemQuestion: problem.question,
              problemAnswer: problem.answer,
              conversationHistory: formattedHistory,
              hintsGiven: 0
            },
            (chunk: string) => {
              // Stream each chunk to the client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
            }
          )

          // Send final metadata
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              done: true,
              isCorrect: result.isCorrect,
              confidence: result.confidence
            })}\n\n`)
          )
          controller.close()
        } catch (error) {
          console.error('Chat API error:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              error: 'Failed to process message',
              chunk: "Hmm, I'm having trouble right now. Can you try explaining your thinking again?"
            })}\n\n`)
          )
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
