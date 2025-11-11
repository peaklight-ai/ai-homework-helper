'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Conversation } from '@/components/Conversation'
import { getRandomProblem } from '@/lib/sampleProblems'

export default function Home() {
  const [started, setStarted] = useState(false)
  const [problem, setProblem] = useState(() => getRandomProblem(1))
  const [xpTotal, setXpTotal] = useState(0)
  const [previousXp, setPreviousXp] = useState(0)
  const [showXpGain, setShowXpGain] = useState(false)

  const handleComplete = (xpEarned: number) => {
    setPreviousXp(xpTotal)
    setXpTotal(prev => prev + xpEarned)
    setShowXpGain(true)
    setTimeout(() => setShowXpGain(false), 2000)
  }

  // Animate XP counter
  useEffect(() => {
    if (previousXp === xpTotal) return

    const duration = 800
    const steps = 20
    const increment = (xpTotal - previousXp) / steps
    let current = 0

    const timer = setInterval(() => {
      current++
      if (current === steps) {
        clearInterval(timer)
        setPreviousXp(xpTotal)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [xpTotal])

  const handleNewProblem = () => {
    setProblem(getRandomProblem(1))
    setStarted(true)
  }

  if (started) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <motion.h1
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              🎓 AI Homework Helper
            </motion.h1>
            <div className="flex gap-4 items-center relative">
              {/* XP Score with fun animations */}
              <motion.div
                className="relative bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl border-2 border-white/40 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex items-center gap-2">
                  <motion.span
                    className="text-3xl"
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.2, 1.2, 1.2, 1]
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    ⭐
                  </motion.span>
                  <div className="flex flex-col">
                    <span className="text-white/80 text-xs font-medium uppercase tracking-wide">XP</span>
                    <motion.span
                      className="text-white font-bold text-2xl"
                      key={xpTotal}
                      initial={{ scale: 1.5, color: '#fbbf24' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      transition={{ duration: 0.3 }}
                    >
                      {xpTotal}
                    </motion.span>
                  </div>
                </div>

                {/* XP Gain Popup */}
                <AnimatePresence>
                  {showXpGain && (
                    <motion.div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold text-sm shadow-lg"
                      initial={{ opacity: 0, y: 0, scale: 0.5 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      +50 XP! 🎉
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.button
                onClick={() => setStarted(false)}
                className="bg-white/30 hover:bg-white/40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Exit
              </motion.button>
            </div>
          </div>

          {/* Floating particles effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, -40],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        <Conversation
          key={problem.id}
          problem={problem}
          childName="Alex"
          onComplete={handleComplete}
        />

        <div className="max-w-3xl mx-auto px-4 pb-8 relative z-10">
          <motion.button
            onClick={handleNewProblem}
            type="button"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span className="flex items-center justify-center gap-2 pointer-events-none">
              <span>Try Another Problem</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold mb-4">🎓 AI Homework Helper</h1>
          <p className="text-xl text-gray-600">
            Learn math with your friendly Socratic AI tutor!
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-lg font-bold text-blue-700 mb-2">
              ✨ Gamified Learning
            </p>
            <p className="text-gray-700">
              Earn XP, badges, and unlock achievements as you learn!
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <p className="text-lg font-bold text-green-700 mb-2">
              🤔 Socratic Method
            </p>
            <p className="text-gray-700">
              AI guides you with questions, never gives direct answers
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <p className="text-lg font-bold text-purple-700 mb-2">
              📊 Parent Dashboard
            </p>
            <p className="text-gray-700">
              Parents see real-time progress and learning insights
            </p>
          </div>
        </div>

        <button
          onClick={() => setStarted(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-lg text-xl"
        >
          Start Learning Now →
        </button>

        <p className="text-sm text-gray-500">
          Perfect for 10-year-olds learning math • $9.99/month
        </p>
      </div>
    </div>
  )
}
