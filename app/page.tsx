'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Conversation } from '@/components/Conversation'
import { Avatar } from '@/components/Avatar'
import { StudentLogin } from '@/components/StudentLogin'
import { DiagnosticTest } from '@/components/DiagnosticTest'
import { StudentTargets } from '@/components/StudentTargets'
import { StudentProfile } from '@/components/StudentProfile'
import { AssignedExercises } from '@/components/AssignedExercises'
import { getRandomProblem, getProblemsByGrade, sampleProblems, MathProblem } from '@/lib/sampleProblems'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

// =============================================================================
// V3 MAIN PAGE - SUPABASE INTEGRATED
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

interface SettingsData {
  allowedTopics: string[]
  difficultyLevel: number
}

export default function Home() {
  const [started, setStarted] = useState(false)
  const [problem, setProblem] = useState<MathProblem>(() => getRandomProblem(1))
  const [xpTotal, setXpTotal] = useState(0)
  const [showXpGain, setShowXpGain] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Student session (from Supabase via login code)
  const [student, setStudent] = useState<StudentData | null>(null)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [settings, setSettings] = useState<SettingsData | null>(null)

  // XP Goal (from localStorage, synced with teacher dashboard)
  const [xpGoal, setXpGoal] = useState(100)

  // Diagnostic state
  const [needsDiagnostic, setNeedsDiagnostic] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true)
      try {
        const savedStudentId = localStorage.getItem('studentId')
        const savedStudentName = localStorage.getItem('studentName')

        if (savedStudentId && savedStudentName) {
          // Fetch fresh data from API
          const response = await fetch(`/api/progress?studentId=${savedStudentId}`)
          if (response.ok) {
            const data = await response.json()

            // Restore student data from localStorage
            const savedStudent = localStorage.getItem('studentData')
            if (savedStudent) {
              const studentData = JSON.parse(savedStudent)
              setStudent(studentData)
              setProgress(data.progress)
              setXpTotal(data.progress.totalXp)

              // Fetch settings
              const settingsResponse = await fetch(`/api/settings?studentId=${savedStudentId}`)
              if (settingsResponse.ok) {
                const settingsData = await settingsResponse.json()
                setSettings(settingsData.settings)
              }
            }
          } else {
            // Session invalid, clear it
            localStorage.removeItem('studentId')
            localStorage.removeItem('studentName')
            localStorage.removeItem('studentData')
          }
        }

        // Load XP goal
        const savedGoal = localStorage.getItem('xpGoal')
        if (savedGoal) {
          setXpGoal(parseInt(savedGoal, 10))
        }
      } catch (error) {
        console.error('Error loading session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  const handleLogin = async (studentData: StudentData, progressData: ProgressData, settingsData: SettingsData) => {
    setStudent(studentData)
    setProgress(progressData)
    setSettings(settingsData)
    setXpTotal(progressData.totalXp)

    // Save to localStorage for persistence
    localStorage.setItem('studentId', studentData.id)
    localStorage.setItem('studentName', studentData.name)
    localStorage.setItem('studentData', JSON.stringify(studentData))

    // Check if student needs diagnostic test
    try {
      const response = await fetch(`/api/diagnostic?studentId=${studentData.id}`)
      if (response.ok) {
        const data = await response.json()
        if (!data.hasDiagnostic) {
          setNeedsDiagnostic(true)
        }
      }
    } catch (error) {
      console.error('Error checking diagnostic status:', error)
    }
  }

  const handleDiagnosticComplete = (results: { overallLevel: number }) => {
    setNeedsDiagnostic(false)
    // Update settings with new difficulty level
    if (settings) {
      setSettings({ ...settings, difficultyLevel: results.overallLevel })
    }
  }

  const handleLogout = () => {
    setStudent(null)
    setProgress(null)
    setSettings(null)
    setXpTotal(0)
    setStarted(false)
    localStorage.removeItem('studentId')
    localStorage.removeItem('studentName')
    localStorage.removeItem('studentData')
  }

  const handleComplete = async (xpEarned: number) => {
    setXpTotal(prev => prev + xpEarned)
    setShowXpGain(true)
    setTimeout(() => setShowXpGain(false), 2000)

    if (student?.id) {
      try {
        // Update progress in Supabase
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
    if (!student || !settings) {
      setProblem(getRandomProblem(1))
      setStarted(true)
      return
    }

    // Filter problems by student's settings
    const { allowedTopics, difficultyLevel } = settings
    const grade = student.grade

    // Filter problems by grade, difficulty, and allowed topics
    let filtered = sampleProblems.filter(p => {
      // Check grade range
      if (grade < p.gradeRange[0] || grade > p.gradeRange[1]) return false
      // Check difficulty
      if (p.difficulty > difficultyLevel) return false
      // Check topic (map problem topic to our topic categories)
      const topicMap: Record<string, string> = {
        'addition': 'addition',
        'subtraction': 'subtraction',
        'multiplication': 'multiplication',
        'division': 'division',
        'patterns': 'addition', // algebraic thinking uses addition
        'equations': 'multiplication', // equations can use any
        'shapes': 'multiplication', // geometry often uses multiplication
        'perimeter': 'addition',
        'area': 'multiplication',
        'time': 'subtraction',
        'length': 'division',
        'weight': 'multiplication',
        'data-interpretation': 'addition',
        'graphs': 'addition',
        'multi-step': 'addition',
        'reasoning': 'division',
        'fractions': 'division'
      }
      const mappedTopic = topicMap[p.topic] || 'addition'
      return allowedTopics.includes(mappedTopic)
    })

    if (filtered.length === 0) {
      // Fallback to grade-appropriate problems
      filtered = getProblemsByGrade(grade).filter(p => p.difficulty <= difficultyLevel)
    }

    if (filtered.length === 0) {
      // Ultimate fallback
      filtered = sampleProblems
    }

    const randomIndex = Math.floor(Math.random() * filtered.length)
    setProblem(filtered[randomIndex])
    setStarted(true)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #F3E8FF 50%, #E0E7FF 100%)' }}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
            style={{ backgroundColor: '#BB8CFC' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            ⭐
          </motion.div>
          <p className="text-xl font-medium" style={{ color: '#6B21A8' }}>Loading your adventure...</p>
        </motion.div>
      </div>
    )
  }

  // Not logged in - show student login
  if (!student) {
    return <StudentLogin onLogin={handleLogin} />
  }

  // Needs diagnostic test - show diagnostic
  if (needsDiagnostic) {
    return (
      <DiagnosticTest
        studentId={student.id}
        studentName={student.name}
        grade={student.grade}
        onComplete={handleDiagnosticComplete}
      />
    )
  }

  // Game mode - solving problems
  if (started) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #F3E8FF 50%, #E0E7FF 100%)' }}>
        {/* Game Header */}
        <div className="p-4 relative overflow-hidden" style={{ background: 'linear-gradient(to right, #BB8CFC, #A855F7)' }}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <motion.h1
              className="text-2xl font-bold text-white flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span>🚀</span> Valid
            </motion.h1>

            <div className="flex gap-4 items-center">
              {/* XP Display */}
              <motion.div
                className="relative bg-white/30 backdrop-blur-sm px-5 py-2 rounded-xl border-2 border-white/40 shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2">
                  <motion.span
                    className="text-2xl"
                    animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1.2, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                  >
                    ⭐
                  </motion.span>
                  <div className="flex flex-col">
                    <span className="text-white/80 text-xs font-medium uppercase">XP</span>
                    <motion.span
                      className="text-white font-bold text-xl"
                      key={xpTotal}
                      initial={{ scale: 1.5, color: '#FACC15' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                    >
                      {xpTotal}
                    </motion.span>
                  </div>
                </div>

                <AnimatePresence>
                  {showXpGain && (
                    <motion.div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full font-bold text-sm shadow-lg"
                      style={{ backgroundColor: '#FACC15', color: '#1F2937' }}
                      initial={{ opacity: 0, y: 0, scale: 0.5 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      +50 XP! 🎉
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Mini Avatar with Grade */}
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                <Avatar seed={student.avatarSeed} size={32} />
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">{student.name}</span>
                  <span className="text-white/70 text-xs">Grade {student.grade}</span>
                </div>
              </div>

              <motion.button
                onClick={() => setStarted(false)}
                className="bg-white/30 hover:bg-white/40 text-white px-4 py-2 rounded-xl text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Exit
              </motion.button>
            </div>
          </div>
        </div>

        <Conversation
          key={problem.id}
          problem={problem}
          childName={student.name}
          studentGrade={student.grade}
          studentId={student.id}
          onComplete={handleComplete}
          onNewProblem={handleNewProblem}
        />

        <div className="max-w-3xl mx-auto px-4 pb-8">
          <motion.button
            onClick={handleNewProblem}
            className="w-full font-bold py-4 px-6 rounded-2xl text-lg shadow-lg text-white"
            style={{ background: 'linear-gradient(to right, #BB8CFC, #A855F7)' }}
            whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(187, 140, 252, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center justify-center gap-2">
              <span>Try Another Problem</span>
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                🚀
              </motion.span>
            </span>
          </motion.button>
        </div>
      </div>
    )
  }

  // Adventure Hub - Home Screen
  const progressPercent = Math.min(100, (xpTotal / xpGoal) * 100)
  const goalReached = xpTotal >= xpGoal

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #F3E8FF 50%, #E0E7FF 100%)' }}>
      {/* Header */}
      <nav className="p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold" style={{ color: '#BB8CFC' }}>
            🚀 Valid
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1 rounded-full transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(187, 140, 252, 0.2)', color: '#7C3AED' }}
            >
              Switch Student
            </button>
            <Link
              href="/auth/login"
              className="text-sm px-3 py-1 rounded-full transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(187, 140, 252, 0.2)', color: '#7C3AED' }}
            >
              Teacher →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Large Avatar with XP Ring */}
          <motion.div
            className="relative inline-block mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="w-40 h-40 relative">
              <CircularProgressbar
                value={progressPercent}
                styles={buildStyles({
                  pathColor: goalReached ? '#22C55E' : '#FACC15',
                  trailColor: 'rgba(255,255,255,0.5)',
                  strokeLinecap: 'round',
                })}
                strokeWidth={8}
              />
              <div className="absolute inset-3 rounded-full overflow-hidden bg-white shadow-lg">
                <Avatar seed={student.avatarSeed} size={130} />
              </div>
            </div>

            {/* Level Badge */}
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-bold shadow-lg"
              style={{ backgroundColor: '#FACC15', color: '#1F2937' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Level {progress?.level || 1}
            </motion.div>
          </motion.div>

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-1" style={{ color: '#1F2937' }}>
              Hey, {student.name}! 👋
            </h1>
            <p className="text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              Grade {student.grade}
            </p>
            <p className="text-lg mb-2" style={{ color: '#6B7280' }}>
              Ready for an adventure?
            </p>
          </motion.div>

          {/* XP Progress */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium" style={{ color: '#6B7280' }}>Today's Goal</span>
              <span className="font-bold" style={{ color: goalReached ? '#22C55E' : '#FACC15' }}>
                {xpTotal} / {xpGoal} XP
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(250, 204, 21, 0.2)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: goalReached ? '#22C55E' : '#FACC15' }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            {goalReached && (
              <motion.p
                className="text-center mt-2 font-bold"
                style={{ color: '#22C55E' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                🎉 Goal reached! You're amazing!
              </motion.p>
            )}
          </motion.div>

          {/* Targets, Assignments, and Profile */}
          <div className="space-y-4 mb-6">
            <StudentTargets studentId={student.id} compact />
            <AssignedExercises studentId={student.id} compact />
            <StudentProfile studentId={student.id} compact />
          </div>

          {/* Big CTA Button */}
          <motion.button
            onClick={handleNewProblem}
            className="w-full font-bold py-5 px-8 rounded-2xl text-xl shadow-xl text-white"
            style={{ background: 'linear-gradient(to right, #BB8CFC, #A855F7)' }}
            whileHover={{ scale: 1.03, boxShadow: '0 15px 50px rgba(187, 140, 252, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="flex items-center justify-center gap-3">
              <span>Let's Go!</span>
              <motion.span
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl"
              >
                🚀
              </motion.span>
            </span>
          </motion.button>

          {/* Stats Pills */}
          <motion.div
            className="flex justify-center gap-3 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-medium" style={{ color: '#6B7280' }}>🔥 Streak: </span>
              <span className="font-bold" style={{ color: '#F97316' }}>{progress?.currentStreak || 0}</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-medium" style={{ color: '#6B7280' }}>✅ Correct: </span>
              <span className="font-bold" style={{ color: '#22C55E' }}>{progress?.correctAnswers || 0}</span>
            </div>
          </motion.div>

          {/* Current Settings Info */}
          {settings && (
            <p className="text-sm mt-4" style={{ color: '#9CA3AF' }}>
              Grade {student.grade} • {settings.allowedTopics.join(', ')} • Level {settings.difficultyLevel}
            </p>
          )}
        </motion.div>
      </div>

      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['⭐', '🌟', '✨', '💫', '🎯'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-20"
            style={{
              left: `${10 + i * 18}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.7,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
