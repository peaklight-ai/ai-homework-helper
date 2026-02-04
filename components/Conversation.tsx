'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { MathProblem } from '@/lib/sampleProblems'

interface Message {
  role: 'user' | 'model'
  parts: string
  isCorrect?: boolean
}

interface ConversationProps {
  problem: MathProblem
  childName?: string
  studentGrade?: number
  hints?: string[]
  strategies?: string
  onComplete?: (xpEarned: number) => void
  onNewProblem?: () => void
}

export function Conversation({ problem, childName = 'Student', studentGrade = 3, hints = [], strategies, onComplete, onNewProblem }: ConversationProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      parts: `Hi ${childName}! I'm your AI tutor. Let's solve this problem together! What do you think the first step is?`
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [limitReached, setLimitReached] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showUnlockSuccess, setShowUnlockSuccess] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const MESSAGE_LIMIT = 5

  // Load message count and unlock status from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('messageCount')
    const count = stored ? parseInt(stored, 10) : 0
    setMessageCount(count)

    // Check if unlimited access is unlocked
    const unlocked = localStorage.getItem('unlimitedAccess') === 'true'
    setIsUnlocked(unlocked)

    if (count >= MESSAGE_LIMIT && !unlocked) {
      setLimitReached(true)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || limitReached) return

    // Check message limit (bypass if unlocked)
    if (messageCount >= MESSAGE_LIMIT && !isUnlocked) {
      setLimitReached(true)
      return
    }

    // Increment and store message count (only if not unlocked)
    if (!isUnlocked) {
      const newCount = messageCount + 1
      setMessageCount(newCount)
      localStorage.setItem('messageCount', newCount.toString())

      if (newCount >= MESSAGE_LIMIT) {
        setLimitReached(true)
      }
    }

    const userMessage: Message = { role: 'user', parts: input }
    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userInput,
          problem,
          conversationHistory: messages,
          studentGrade,
          hints,
          strategies
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      // Add empty AI message that we'll update as stream comes in
      const aiMessageIndex = messages.length + 1
      setMessages(prev => [...prev, { role: 'model', parts: '' }])

      // Read the stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''
      let streamIsCorrect = false

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(line => line.trim())

          for (const line of lines) {
            try {
              const data = JSON.parse(line)

              if (data.content) {
                // Append content to accumulated text
                accumulatedText += data.content
                // Update the AI message in place
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[aiMessageIndex] = {
                    role: 'model',
                    parts: accumulatedText
                  }
                  return newMessages
                })
              }

              if (data.done) {
                // Stream finished
                streamIsCorrect = data.isCorrect
                // Update final message with isCorrect flag
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[aiMessageIndex] = {
                    role: 'model',
                    parts: accumulatedText,
                    isCorrect: streamIsCorrect
                  }
                  return newMessages
                })

                if (streamIsCorrect) {
                  setIsComplete(true)
                  setShowConfetti(true)

                  // Fire real confetti!
                  const fireConfetti = () => {
                    confetti({
                      particleCount: 100,
                      spread: 70,
                      origin: { y: 0.6 }
                    })
                  }
                  fireConfetti()
                  setTimeout(fireConfetti, 250)
                  setTimeout(fireConfetti, 500)

                  setTimeout(() => {
                    setShowConfetti(false)
                    onComplete?.(50)
                  }, 5000)
                }
              }
            } catch (e) {
              console.error('Failed to parse stream chunk:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [...prev, {
        role: 'model',
        parts: 'Oops! Something went wrong. Let\'s try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordInput.trim() === 'cynthia') {
      // Correct password - unlock unlimited access
      localStorage.setItem('unlimitedAccess', 'true')
      setIsUnlocked(true)
      setLimitReached(false)
      setPasswordInput('')
      setShowUnlockSuccess(true)
      // Hide success message after 3 seconds
      setTimeout(() => setShowUnlockSuccess(false), 3000)
    } else {
      // Incorrect password - shake animation handled by CSS
      setPasswordInput('')
    }
  }

  return (
    <div className="relative">
      {/* Enhanced Success Celebration */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Confetti Emojis */}
            <div className="relative">
              {['🎉', '🎊', '⭐', '🌟', '✨', '🎈', '🏆', '💯'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-6xl"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.5, 1.5, 0],
                    rotate: (Math.random() - 0.5) * 360
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>

            {/* Success Message */}
            <motion.div
              className="mt-20 bg-gradient-to-r from-green-400 to-blue-500 px-8 py-6 rounded-2xl shadow-2xl"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
            >
              <motion.p
                className="text-white font-bold text-3xl text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                🏆 Awesome Work! 🏆
              </motion.p>
              <motion.p
                className="text-white/90 text-lg text-center mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                +50 XP Earned!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="space-y-6">
          {/* Problem Display */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h3 className="text-sm font-bold text-blue-700 mb-2">Problem:</h3>
            <p className="text-lg text-gray-800">{problem.question}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>Difficulty: {'*'.repeat(problem.difficulty)}</span>
            </div>
          </div>

          {/* Dev Mode Indicator */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded text-xs text-center">
              DEV MODE - Using Ollama (llama3.1) | V2 Code Active
            </div>
          )}

          {/* Messages */}
          <div className="bg-white rounded-lg border border-gray-200 h-96 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white mr-2">
                      🤖
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm md:text-base">{message.parts}</p>
                    {message.isCorrect && (
                      <p className="text-sm mt-1 font-bold text-green-600">
                        🎉 Correct!
                      </p>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white ml-2">
                      👤
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={limitReached ? "Message limit reached" : "Type your answer or ask a question..."}
                disabled={isLoading || isComplete || limitReached}
                className="flex-1 px-4 py-3 border-2 border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-400 text-base bg-white"
                style={{ color: '#1F2937' }}
              />
              <button
                type="submit"
                disabled={isLoading || isComplete || limitReached}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>

            {/* Message Counter */}
            {!limitReached && (
              <div className="mt-2 text-sm text-gray-600 text-center">
                {MESSAGE_LIMIT - messageCount} {MESSAGE_LIMIT - messageCount === 1 ? 'message' : 'messages'} remaining in free trial
              </div>
            )}
          </div>

          {/* Unlock Success Message */}
          <AnimatePresence>
            {showUnlockSuccess && (
              <motion.div
                className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-300 shadow-lg text-center mb-4"
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <p className="text-xl font-bold text-purple-700">
                  ✨ Unlimited Access Activated ✨
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {limitReached && (
            <motion.div
              className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-300 shadow-lg text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-2xl font-bold text-orange-700 mb-2">
                🚀 Free Trial Complete!
              </p>
              <p className="text-gray-700 text-lg">
                You've used all 5 free messages. Subscribe to continue learning with unlimited AI tutoring!
              </p>
              <button className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all">
                Subscribe for $9.99/month
              </button>

              {/* Exclusive Password Unlock */}
              <div className="mt-6 pt-6 border-t border-orange-200">
                <form onSubmit={handlePasswordSubmit} className="max-w-sm mx-auto">
                  <label className="block text-sm font-medium text-gray-600 mb-2 tracking-wide">
                    Exclusive Access Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter access code"
                      className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 placeholder-gray-400 shadow-sm"
                      style={{
                        background: 'linear-gradient(to right, #faf5ff, #fdf4ff)',
                      }}
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all hover:shadow-lg"
                    >
                      Unlock
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Have a special access code? Enter it here for unlimited messages.
                  </p>
                </form>
              </div>
            </motion.div>
          )}

          {isComplete && !limitReached && (
            <motion.div
              className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200 shadow-lg text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.p
                className="text-2xl font-bold text-green-700"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                🎉 Amazing work! You earned 50 XP!
              </motion.p>
              <motion.p
                className="text-gray-600 mt-3 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Ready for another problem?
              </motion.p>
              <motion.button
                className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={() => onNewProblem?.()}
              >
                Try Another Problem
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
