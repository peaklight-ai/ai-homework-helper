'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DiagnosticQuestionData } from '@/lib/diagnosticQuestions'

interface DiagnosticTestProps {
  studentId: string
  studentName: string
  grade: number
  onComplete: (results: DiagnosticResults) => void
}

interface DiagnosticResults {
  results: Record<string, { correct: number; total: number; avgTime: number }>
  recommendedLevels: Record<string, number>
  overallLevel: number
}

export function DiagnosticTest({ studentId, studentName, grade, onComplete }: DiagnosticTestProps) {
  const [stage, setStage] = useState<'intro' | 'test' | 'complete'>('intro')
  const [currentQuestion, setCurrentQuestion] = useState<DiagnosticQuestionData | null>(null)
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(12) // 4 domains × 3 questions
  const [startTime, setStartTime] = useState<number>(0)
  const [results, setResults] = useState<DiagnosticResults | null>(null)

  // Start the diagnostic test
  const startTest = useCallback(async () => {
    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action: 'start' })
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentQuestion(data.nextQuestion)
        setTotalQuestions((data.totalDomains || 4) * 3)
        setStage('test')
        setStartTime(Date.now())
      }
    } catch (error) {
      console.error('Error starting diagnostic:', error)
    }
  }, [studentId])

  // Submit answer
  const submitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) return

    setIsSubmitting(true)
    const timeSeconds = Math.round((Date.now() - startTime) / 1000)

    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          action: 'answer',
          questionId: currentQuestion.question,
          answer: answer.trim(),
          timeSeconds
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFeedback({ isCorrect: data.isCorrect, correctAnswer: data.correctAnswer })

        // Wait for feedback animation
        setTimeout(async () => {
          setFeedback(null)
          setAnswer('')
          const nextNum = questionNumber + 1
          setQuestionNumber(nextNum)

          // Hard limit: complete after totalQuestions regardless of API response
          if (!data.nextQuestion || nextNum >= totalQuestions) {
            // Complete the test
            await completeTest()
          } else {
            setCurrentQuestion(data.nextQuestion)
            setStartTime(Date.now())
          }
        }, 1500)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Complete the test
  const completeTest = async () => {
    try {
      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action: 'complete' })
      })

      if (response.ok) {
        const data = await response.json()
        setResults({
          results: data.results,
          recommendedLevels: data.recommendedLevels,
          overallLevel: data.overallLevel
        })
        setStage('complete')
      }
    } catch (error) {
      console.error('Error completing diagnostic:', error)
    }
  }

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && answer.trim()) {
      submitAnswer()
    }
  }

  // Intro screen
  if (stage === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #F3E8FF 50%, #E0E7FF 100%)' }}>
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎯
          </motion.div>

          <h1 className="text-3xl font-bold mb-4" style={{ color: '#1F2937' }}>
            Hi {studentName}!
          </h1>

          <p className="text-lg mb-6" style={{ color: '#6B7280' }}>
            Let&apos;s see what you know! This quick quiz will help us find the perfect problems for you.
          </p>

          <div className="bg-white/80 rounded-2xl p-6 mb-6 shadow-lg">
            <h2 className="font-bold mb-3" style={{ color: '#7C3AED' }}>What to expect:</h2>
            <ul className="text-left space-y-2" style={{ color: '#4B5563' }}>
              <li className="flex items-center gap-2">
                <span>📝</span> About 12 quick questions
              </li>
              <li className="flex items-center gap-2">
                <span>⏱️</span> Takes 5-10 minutes
              </li>
              <li className="flex items-center gap-2">
                <span>🎮</span> No pressure - just do your best!
              </li>
              <li className="flex items-center gap-2">
                <span>⭐</span> This helps find the right level for you
              </li>
            </ul>
          </div>

          <motion.button
            onClick={startTest}
            className="w-full font-bold py-4 px-8 rounded-2xl text-xl shadow-xl text-white"
            style={{ background: 'linear-gradient(to right, #BB8CFC, #A855F7)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Let&apos;s Go! 🚀
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // Test screen
  if (stage === 'test' && currentQuestion) {
    const progress = (questionNumber / totalQuestions) * 100

    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #F3E8FF 50%, #E0E7FF 100%)' }}>
        {/* Header */}
        <div className="p-4" style={{ background: 'linear-gradient(to right, #BB8CFC, #A855F7)' }}>
          <div className="max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Diagnostic Quiz</span>
              <span className="text-white/80 text-sm">
                Question {questionNumber + 1} of {totalQuestions}
              </span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            className="max-w-xl w-full"
            key={currentQuestion.question}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            {/* Domain badge */}
            <div className="text-center mb-4">
              <span
                className="inline-block px-4 py-1 rounded-full text-sm font-medium capitalize"
                style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED' }}
              >
                {currentQuestion.domain}
              </span>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl mb-6">
              <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#1F2937' }}>
                {currentQuestion.question}
              </h2>

              <div className="relative">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  disabled={isSubmitting || !!feedback}
                  className="w-full text-2xl text-center py-4 px-6 rounded-2xl border-2 focus:outline-none focus:border-purple-500 transition-colors"
                  style={{
                    borderColor: feedback
                      ? feedback.isCorrect ? '#22C55E' : '#EF4444'
                      : '#E5E7EB',
                    backgroundColor: feedback
                      ? feedback.isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                      : 'white'
                  }}
                  autoFocus
                />

                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className={`text-6xl ${feedback.isCorrect ? '' : 'opacity-80'}`}>
                        {feedback.isCorrect ? '✅' : '❌'}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {feedback && !feedback.isCorrect && (
                <motion.p
                  className="text-center mt-4 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ color: '#6B7280' }}
                >
                  The answer was: <strong style={{ color: '#22C55E' }}>{feedback.correctAnswer}</strong>
                </motion.p>
              )}
            </div>

            {!feedback && (
              <motion.button
                onClick={submitAnswer}
                disabled={!answer.trim() || isSubmitting}
                className="w-full font-bold py-4 px-8 rounded-2xl text-xl shadow-lg text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(to right, #BB8CFC, #A855F7)' }}
                whileHover={{ scale: answer.trim() ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'Checking...' : 'Submit Answer'}
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  // Complete screen
  if (stage === 'complete' && results) {
    const domains = Object.entries(results.recommendedLevels)

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #F3E8FF 50%, #E0E7FF 100%)' }}>
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="text-7xl mb-6"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1 }}
          >
            🎉
          </motion.div>

          <h1 className="text-3xl font-bold mb-4" style={{ color: '#1F2937' }}>
            Great job, {studentName}!
          </h1>

          <p className="text-lg mb-6" style={{ color: '#6B7280' }}>
            We&apos;ve found the perfect level for you!
          </p>

          {/* Results card */}
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
            <h2 className="font-bold mb-4" style={{ color: '#7C3AED' }}>Your Results</h2>

            <div className="space-y-3">
              {domains.map(([domain, level]) => (
                <div key={domain} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <span className="capitalize font-medium" style={{ color: '#4B5563' }}>{domain}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`text-lg ${star <= level ? '' : 'opacity-20'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Starting level: <strong style={{ color: '#7C3AED' }}>Level {results.overallLevel}</strong>
              </p>
            </div>
          </div>

          <motion.button
            onClick={() => onComplete(results)}
            className="w-full font-bold py-4 px-8 rounded-2xl text-xl shadow-xl text-white"
            style={{ background: 'linear-gradient(to right, #BB8CFC, #A855F7)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Learning! 🚀
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #F3E8FF 50%, #E0E7FF 100%)' }}>
      <motion.div
        className="text-4xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        ⭐
      </motion.div>
    </div>
  )
}
