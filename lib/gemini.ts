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

export async function getSocraticResponse(
  userMessage: string,
  context: ConversationContext,
  onStream?: (text: string) => void
): Promise<SocraticResponse> {
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

  // Build messages for OpenAI-compatible format (CometAPI standard)
  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory,
    { role: 'user', content: userMessage }
  ]

  try {
    // Call CometAPI (OpenAI-compatible endpoint)
    const response = await fetch('https://api.cometapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.COMET_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash-preview-09-2025', // Using Gemini 2.5 Flash via CometAPI
        messages,
        temperature: 0.7,
        max_tokens: 200,
        stream: true
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('CometAPI error:', error)
      throw new Error(`CometAPI error: ${error.error?.message || 'Unknown error'}`)
    }

    // Handle streaming response
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let aiResponse = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                aiResponse += content
                onStream?.(content) // Call streaming callback
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    }

    console.log('Full AI Response:', aiResponse)

    // Check if the user's answer is correct
    const isCorrect = checkAnswer(userMessage, context.problemAnswer)

    return {
      response: aiResponse,
      isCorrect,
      confidence: 1.0,
    }
  } catch (error) {
    console.error('AI API error:', error)
    return {
      response: "Hmm, I'm having trouble right now. Can you try explaining your thinking again?",
      isCorrect: false,
      confidence: 0.5,
    }
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
