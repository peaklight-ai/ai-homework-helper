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
  const systemPrompt = `You are a math tutor for a 10-year-old.

RULES:
1. Never give the answer directly
2. Ask guiding questions to help them think
3. Keep responses to 2-3 sentences max
4. Use simple language

CORRECT ANSWER RULE (ABSOLUTE PRIORITY):
If the student says "${context.problemAnswer}" or equivalent, respond ONLY with "🎉 Great job!" and NOTHING ELSE. No follow-up. No questions. No explanation requests. Just celebrate and stop.

PROBLEM: ${context.problemQuestion}
ANSWER: ${context.problemAnswer}`

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
