// LLM integration with support for:
// - CometAPI (production): Gemini, GPT-4, Claude
// - Ollama (local development): llama3.1, mistral, etc.

export interface ConversationContext {
  problemQuestion: string
  problemAnswer: string
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  hintsGiven: number
}

export interface SocraticResponse {
  response: string
  isCorrect: boolean
  confidence: number
}

// Check if we should use Ollama (local) or CometAPI (production)
const USE_OLLAMA = process.env.USE_OLLAMA === 'true'
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1'

export async function getSocraticResponseStream(
  userMessage: string,
  context: ConversationContext
): Promise<{ stream: ReadableStream; isCorrect: boolean }> {
  const systemPrompt = `You are a Socratic tutor for a 10-year-old learning math.

CRITICAL RULES:
1. NEVER give the answer directly
2. Guide them to think through each step using chain-of-thought reasoning
3. Ask guiding questions that break down the problem into smaller parts
4. If they're stuck, give a small hint about the NEXT STEP only
5. ONLY praise when the student shows CORRECT reasoning
6. For WRONG answers, do NOT praise. Say something neutral like "Let's think about this differently" or "Hmm, let's check that"
7. Use simple language (4th-5th grade level)
8. Keep responses to 2-3 sentences maximum
9. COMPLETION RULE (HIGHEST PRIORITY): When the student gives the CORRECT final answer (${context.problemAnswer}), respond with ONLY a celebration like "Well done!" or "Great job!". NO follow-up questions. NO asking them to explain. Just celebrate briefly and STOP.

PROBLEM: ${context.problemQuestion}
CORRECT ANSWER: ${context.problemAnswer}

Guide them to discover the answer through questions.`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory,
    { role: 'user', content: userMessage }
  ]

  // Check if user's answer is correct
  const isCorrect = checkAnswer(userMessage, context.problemAnswer)

  if (USE_OLLAMA) {
    // Use Ollama for local development
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: true
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`)
    }

    // Transform Ollama's NDJSON stream to match our expected format
    const transformedStream = transformOllamaStream(response.body!)

    return {
      stream: transformedStream,
      isCorrect
    }
  } else {
    // Use CometAPI for production
    const response = await fetch('https://api.cometapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.COMET_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash-preview-09-2025',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true
      })
    })

    if (!response.ok) {
      throw new Error(`CometAPI error: ${response.statusText}`)
    }

    return {
      stream: response.body!,
      isCorrect
    }
  }
}

// Transform Ollama's streaming format to OpenAI-compatible SSE format
function transformOllamaStream(ollamaStream: ReadableStream): ReadableStream {
  const reader = ollamaStream.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()

      if (done) {
        controller.close()
        return
      }

      const text = decoder.decode(value, { stream: true })
      const lines = text.split('\n').filter(line => line.trim())

      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          // Ollama format: { message: { content: "..." }, done: boolean }
          if (data.message?.content) {
            // Convert to OpenAI SSE format
            const sseData = `data: ${JSON.stringify({
              choices: [{
                delta: { content: data.message.content }
              }]
            })}\n\n`
            controller.enqueue(new TextEncoder().encode(sseData))
          }
          if (data.done) {
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          }
        } catch (e) {
          // Skip malformed JSON
        }
      }
    }
  })
}

function checkAnswer(userMessage: string, correctAnswer: string): boolean {
  // Extract numbers from both user message and correct answer
  const userNumbers = extractNumbers(userMessage)
  const correctNumbers = extractNumbers(correctAnswer)

  // Check if user message contains the correct final answer
  return userNumbers.some(num => correctNumbers.includes(num))
}

function extractNumbers(text: string): number[] {
  const matches = text.match(/\d+(\.\d+)?/g)
  return matches ? matches.map(Number) : []
}
