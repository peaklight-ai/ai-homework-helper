// Using CometAPI for unified LLM access (supports Gemini, GPT-4, Claude, etc.)
// CometAPI provides: caching, rate limiting, automatic fallback, and cost optimization

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

export async function getSocraticResponseStream(
  userMessage: string,
  context: ConversationContext
): Promise<{ stream: ReadableStream; isCorrect: boolean }> {
  const systemPrompt = `You are a Socratic tutor for a 10-year-old learning math.

CRITICAL RULES:
1. NEVER give the answer directly
2. Guide them to think through each step using chain-of-thought reasoning
3. Help them verbalize their thinking: "Let me think step by step..."
4. Ask guiding questions that break down the problem into smaller parts
5. If they're stuck, give a small hint about the NEXT STEP, not the answer
6. Celebrate their thinking process, not just correct answers
7. Use simple language (4th-5th grade level)
8. Be encouraging and patient
9. If they get the answer, ask them to explain HOW they got it step-by-step
10. Model good problem-solving: "First we need to..., then we can..."
11. Keep responses to 2-3 sentences maximum

PROBLEM: ${context.problemQuestion}
CORRECT ANSWER: ${context.problemAnswer}

Your role is to guide them to discover the answer through questions and help them build strong reasoning skills by thinking through each step out loud.`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory,
    { role: 'user', content: userMessage }
  ]

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

  // Check if user's answer is correct
  const isCorrect = checkAnswer(userMessage, context.problemAnswer)

  // Return the raw stream from CometAPI
  return {
    stream: response.body!,
    isCorrect
  }
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
