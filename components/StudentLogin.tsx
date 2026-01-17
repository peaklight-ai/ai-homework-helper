'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface StudentData {
  id: string
  name: string
  grade: number
  avatarSeed: string
  loginCode: string
}

interface ProgressData {
  totalXp: number
  level: number
  currentStreak: number
  longestStreak: number
  totalQuestions: number
  correctAnswers: number
}

interface SettingsData {
  allowedTopics: string[]
  difficultyLevel: number
}

interface StudentLoginProps {
  onLogin: (student: StudentData, progress: ProgressData, settings: SettingsData) => void
}

export function StudentLogin({ onLogin }: StudentLoginProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (code.length !== 6) {
      setError('Please enter your 6-character code')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginCode: code.toUpperCase() })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      // Call the onLogin callback with student data
      onLogin(data.student, data.progress, data.settings)
    } catch {
      setError('Could not connect. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric characters, uppercase
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length <= 6) {
      setCode(value)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #F3E8FF 50%, #E0E7FF 100%)' }}>
      {/* Teacher Access - subtle */}
      <div className="absolute top-4 right-4">
        <Link
          href="/auth/login"
          className="text-sm px-3 py-1 rounded-full transition-all hover:scale-105"
          style={{ backgroundColor: 'rgba(187, 140, 252, 0.2)', color: '#7C3AED' }}
        >
          Teacher →
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-block mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-6xl">🚀</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#1F2937' }}>
              Welcome to <span style={{ color: '#BB8CFC' }}>Valid</span>!
            </h1>
            <p className="text-xl" style={{ color: '#6B7280' }}>
              Enter your student code
            </p>
          </div>

          {/* Login Card */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {error && (
              <motion.div
                className="mb-6 p-4 rounded-xl text-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p style={{ color: '#DC2626' }}>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-center" style={{ color: '#6B7280' }}>
                  Your teacher gave you a code. Type it here:
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="ABC123"
                  className="w-full text-center text-3xl font-bold tracking-widest px-4 py-4 rounded-xl focus:outline-none focus:ring-4"
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: '#1F2937',
                    letterSpacing: '0.5em'
                  }}
                  autoComplete="off"
                  autoCapitalize="characters"
                />
                <p className="text-center mt-2 text-sm" style={{ color: '#9CA3AF' }}>
                  6 characters (letters and numbers)
                </p>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full font-bold py-4 px-6 rounded-xl text-lg shadow-lg text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(to right, #BB8CFC, #A855F7)' }}
                whileHover={{ scale: code.length === 6 ? 1.02 : 1 }}
                whileTap={{ scale: code.length === 6 ? 0.98 : 1 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⏳
                    </motion.span>
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Let's Go!</span>
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                      🚀
                    </motion.span>
                  </span>
                )}
              </motion.button>
            </form>

            <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #E5E7EB' }}>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                Don't have a code?<br />
                Ask your teacher to add you to their class!
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Fun floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['⭐', '🌟', '✨', '💫'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-30"
            style={{
              left: `${20 + i * 20}%`,
              top: `${10 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
