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
  // Phase 3: Enhanced context
  studentGrade?: number
  hints?: string[]
  strategies?: string
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

// =============================================================================
// PEDAGOGY REFERENCE - Grade-based teaching styles
// =============================================================================
// Grade 1 (ages 6-7): Concrete story problems → Solve together (VERY guided)
// Grade 2 (ages 7-8): One-step problems → Teach steps and language
// Grade 3 (ages 8-9): Multi-step strategies → Model and scaffold
// Grades 4-5 (ages 9-11): Independent reasoning → Coach and extend
// =============================================================================

function getGuidanceStyle(grade?: number): {
  style: 'guided' | 'scaffold' | 'coach'
  instructions: string
} {
  if (!grade || grade <= 2) {
    return {
      style: 'guided',
      instructions: `TEACHING STYLE (Grades 1-2 - Very Guided):
- Solve together step-by-step, like a friend helping
- Use concrete examples: "If you have 3 apples and get 2 more..."
- Keep sentences SHORT and SIMPLE (max 10 words per sentence)
- Use encouraging words: "Let's try!", "You're doing great!"
- If they struggle, give the next small step directly
- Make it feel like play, not testing`
    }
  } else if (grade === 3) {
    return {
      style: 'scaffold',
      instructions: `TEACHING STYLE (Grade 3 - Scaffold):
- Model the strategy first, then let them try
- Break problems into clear steps: "First... Then... Finally..."
- Ask ONE question at a time
- Teach math vocabulary: "That's called 'borrowing' or 'regrouping'"
- If stuck, demonstrate a similar simpler problem
- Celebrate each small step forward`
    }
  } else {
    return {
      style: 'coach',
      instructions: `TEACHING STYLE (Grades 4-6 - Coach):
- Ask questions to guide their thinking
- Encourage them to explain their reasoning
- Let them struggle a bit before helping
- Say things like: "What strategy could work here?"
- Connect to what they already know
- Challenge them to find patterns`
    }
  }
}

export async function getSocraticResponseStream(
  userMessage: string,
  context: ConversationContext
): Promise<{ stream: ReadableStream; isCorrect: boolean }> {

  const { style, instructions } = getGuidanceStyle(context.studentGrade)

  // Build hints section if available
  let hintsSection = ''
  if (context.hints && context.hints.length > 0) {
    const availableHints = context.hints.slice(context.hintsGiven)
    if (availableHints.length > 0) {
      hintsSection = `
AVAILABLE HINTS (use these progressively if student struggles):
${availableHints.map((h, i) => `${i + 1}. ${h}`).join('\n')}
`
    }
  }

  // Build strategies section if available
  let strategiesSection = ''
  if (context.strategies) {
    strategiesSection = `
TEACHING STRATEGY (from teacher):
${context.strategies}
`
  }

  const systemPrompt = `You are a friendly math tutor helping a Grade ${context.studentGrade || 3} student.

${instructions}

CORE RULES:
1. NEVER give the answer directly
2. Keep responses SHORT (2-3 sentences max)
3. Use simple, age-appropriate language
4. Be warm and encouraging

CORRECT ANSWER RULE (ABSOLUTE PRIORITY):
If the student says "${context.problemAnswer}" or equivalent, respond ONLY with "🎉 Great job!" and NOTHING ELSE. No follow-up. No questions. No explanation requests. Just celebrate and stop.
${hintsSection}${strategiesSection}
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

// =============================================================================
// PROGRESSION LOGIC
// =============================================================================
// Determines when to level up or down based on performance

export interface ProgressionResult {
  shouldLevelUp: boolean
  shouldLevelDown: boolean
  newDifficulty: number
  message?: string
}

export function calculateProgression(
  currentDifficulty: number,
  consecutiveCorrect: number,
  consecutiveWrong: number,
  grade: number
): ProgressionResult {
  // Grade-based thresholds
  const thresholds = {
    1: { upStreak: 4, downStreak: 1 },   // Grade 1: Very patient
    2: { upStreak: 3, downStreak: 2 },   // Grade 2: Patient
    3: { upStreak: 3, downStreak: 2 },   // Grade 3: Balanced
    4: { upStreak: 2, downStreak: 2 },   // Grade 4: Standard
    5: { upStreak: 2, downStreak: 3 },   // Grade 5: Challenging
    6: { upStreak: 2, downStreak: 3 },   // Grade 6: Most challenging
  }

  const { upStreak, downStreak } = thresholds[grade as keyof typeof thresholds] || thresholds[3]

  let newDifficulty = currentDifficulty
  let shouldLevelUp = false
  let shouldLevelDown = false
  let message: string | undefined

  if (consecutiveCorrect >= upStreak && currentDifficulty < 5) {
    shouldLevelUp = true
    newDifficulty = Math.min(5, currentDifficulty + 1)
    message = "You're doing great! Let's try something a bit harder."
  } else if (consecutiveWrong >= downStreak && currentDifficulty > 1) {
    shouldLevelDown = true
    newDifficulty = Math.max(1, currentDifficulty - 1)
    message = "Let's practice with some easier problems first."
  }

  return {
    shouldLevelUp,
    shouldLevelDown,
    newDifficulty,
    message
  }
}
