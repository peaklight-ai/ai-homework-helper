'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { HomeworkUpload } from '@/components/HomeworkUpload'
import { Conversation } from '@/components/Conversation'
import { Avatar } from '@/components/Avatar'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import type { MathDomain } from '@/lib/db'

// =============================================================================
// UPLOAD PAGE - Homework Photo Upload & Solve
// =============================================================================
// Students can take/upload photos of homework problems
// OCR extracts the problem, then they solve it with AI guidance
// =============================================================================

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

type PageView = 'upload' | 'solve'

export default function UploadPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [student, setStudent] = useState<StudentData | null>(null)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [view, setView] = useState<PageView>('upload')
  const [xpGoal, setXpGoal] = useState(100)
  const [showXpGain, setShowXpGain] = useState(false)
  const [xpTotal, setXpTotal] = useState(0)

  // Custom problem from OCR
  const [customProblem, setCustomProblem] = useState<{
    id: string
    question: string
    answer: string
    hints: string[]
    domain: MathDomain
    difficulty: 1 | 2 | 3 | 4 | 5
    gradeRange: [number, number]
    topic: string
  } | null>(null)

  // Check for logged-in student on mount
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true)
      try {
        const savedStudentId = localStorage.getItem('studentId')
        const savedStudentData = localStorage.getItem('studentData')

        if (!savedStudentId || !savedStudentData) {
          // Not logged in, redirect to main page
          router.push('/')
          return
        }

        const studentData = JSON.parse(savedStudentData)
        setStudent(studentData)

        // Fetch progress
        const response = await fetch(`/api/progress?studentId=${savedStudentId}`)
        if (response.ok) {
          const data = await response.json()
          setProgress(data.progress)
          setXpTotal(data.progress.totalXp)
        }

        // Load XP goal
        const savedGoal = localStorage.getItem('xpGoal')
        if (savedGoal) {
          setXpGoal(parseInt(savedGoal, 10))
        }
      } catch (error) {
        console.error('Error loading session:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [router])

  const handleProblemExtracted = (question: string, expectedAnswer?: number) => {
    // Create a custom problem from the extracted text
    setCustomProblem({
      id: `ocr-${Date.now()}`,
      question,
      answer: expectedAnswer?.toString() || '',
      hints: ['Try breaking the problem into smaller steps.', 'What numbers do you see in the problem?'],
      domain: 'number-operations',
      difficulty: 2,
      gradeRange: [1, 6],
      topic: 'homework'
    })
    setView('solve')
  }

  const handleComplete = async (xpEarned: number) => {
    setXpTotal(prev => prev + xpEarned)
    setShowXpGain(true)
    setTimeout(() => setShowXpGain(false), 2000)

    if (student?.id) {
      try {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.id,
            action: 'recordAnswer',
            isCorrect: true
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.progress) {
            setProgress(data.progress)
          }
        }
      } catch (error) {
        console.error('Error updating progress:', error)
      }
    }
  }

  const handleNewProblem = () => {
    // Go back to upload for another problem
    setCustomProblem(null)
    setView('upload')
  }

  const handleCancel = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-6xl animate-bounce mb-4">📚</div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (!student) {
    return null // Will redirect in useEffect
  }

  // Upload View
  if (view === 'upload') {
    return (
      <HomeworkUpload
        onProblemExtracted={handleProblemExtracted}
        onCancel={handleCancel}
      />
    )
  }

  // Solve View - Similar to main page but with custom problem
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl px-4 py-2 shadow-xl flex items-center gap-3"
          >
            <Avatar seed={student.avatarSeed} size={40} />
            <div>
              <p className="font-bold text-gray-800">{student.name}</p>
              <p className="text-sm text-gray-600">Grade {student.grade}</p>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          {/* XP Progress */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl px-4 py-2 shadow-xl flex items-center gap-3"
          >
            <div className="w-12 h-12">
              <CircularProgressbar
                value={Math.min((xpTotal / xpGoal) * 100, 100)}
                text={`${Math.round((xpTotal / xpGoal) * 100)}%`}
                styles={buildStyles({
                  textSize: '28px',
                  pathColor: xpTotal >= xpGoal ? '#22c55e' : '#8b5cf6',
                  textColor: '#374151',
                  trailColor: '#e5e7eb'
                })}
              />
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{xpTotal} XP</p>
              <p className="text-xs text-gray-600">Goal: {xpGoal}</p>
            </div>
          </motion.div>

          {/* Upload Another Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewProblem}
            className="bg-white/90 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-xl text-gray-800 font-semibold"
          >
            📸 New Photo
          </motion.button>

          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancel}
            className="bg-white/90 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-xl text-gray-800 font-semibold"
          >
            ← Home
          </motion.button>
        </div>
      </header>

      {/* XP Gain Animation */}
      <AnimatePresence>
        {showXpGain && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-xl z-50"
          >
            +50 XP! 🌟
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation Area */}
      <main className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          {/* Problem Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <h2 className="font-bold">Your Homework Problem</h2>
                <p className="text-sm text-white/80">Uploaded from photo</p>
              </div>
            </div>
          </div>

          {customProblem && (
            <Conversation
              problem={customProblem}
              studentName={student.name}
              studentGrade={student.grade}
              onComplete={handleComplete}
              key={customProblem.question}
            />
          )}
        </div>
      </main>
    </div>
  )
}
