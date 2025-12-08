'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import { Conversation } from '@/components/Conversation'
import { Avatar } from '@/components/Avatar'
import { getRandomProblem } from '@/lib/sampleProblems'
import { db, getActiveProfile, setActiveProfile, addXp, recordAnswer, StudentProfile, getProfileProgress, StudentProgress } from '@/lib/db'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

// ============================================================================
// ADVENTURE HUB PALETTE - Kid-Friendly Theme
// ============================================================================
// Background:     Warm cream to soft purple gradient
// Primary:        #BB8CFC (Vapor Violet - PLAI)
// XP/Rewards:     #FACC15 (Golden Yellow)
// Success:        #22C55E (Bright Green)
// Accent:         #C3FE4C (Cyber Lime - PLAI)
// Text:           #1F2937 (warm dark gray)
// ============================================================================

export default function Home() {
  const [started, setStarted] = useState(false)
  const [problem, setProblem] = useState(() => getRandomProblem(1))
  const [xpTotal, setXpTotal] = useState(0)
  const [previousXp, setPreviousXp] = useState(0)
  const [showXpGain, setShowXpGain] = useState(false)
  const [activeProfile, setActiveProfileState] = useState<StudentProfile | null>(null)
  const [activeProgress, setActiveProgress] = useState<StudentProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get all student profiles (teacher-managed)
  const allProfiles = useLiveQuery(() => db.profiles.toArray())

  // Get class settings for XP goal
  const settings = useLiveQuery(() => db.settings.toCollection().first())
  const xpGoal = settings?.xpGoal || 100

  // Check for active profile on mount
  useEffect(() => {
    checkProfile()
  }, [])

  const checkProfile = async () => {
    setIsLoading(true)
    try {
      const profile = await getActiveProfile()
      if (profile) {
        setActiveProfileState(profile)
        const progress = await getProfileProgress(profile.id!)
        if (progress) {
          setActiveProgress(progress)
          setXpTotal(progress.totalXp)
          setPreviousXp(progress.totalXp)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectStudent = async (profile: StudentProfile) => {
    await setActiveProfile(profile.id!)
    setActiveProfileState(profile)
    const progress = await getProfileProgress(profile.id!)
    if (progress) {
      setActiveProgress(progress)
      setXpTotal(progress.totalXp)
      setPreviousXp(progress.totalXp)
    }
  }

  const handleSwitchStudent = () => {
    setActiveProfileState(null)
    setActiveProgress(null)
    localStorage.removeItem('activeProfileId')
  }

  const handleComplete = async (xpEarned: number) => {
    setPreviousXp(xpTotal)
    setXpTotal(prev => prev + xpEarned)
    setShowXpGain(true)
    setTimeout(() => setShowXpGain(false), 2000)

    if (activeProfile?.id) {
      await addXp(activeProfile.id, xpEarned)
      await recordAnswer(activeProfile.id, true)
      // Refresh progress
      const progress = await getProfileProgress(activeProfile.id)
      if (progress) setActiveProgress(progress)
    }
  }

  const handleNewProblem = () => {
    const difficulty = activeProfile?.grade ? Math.min(activeProfile.grade, 5) as 1 | 2 : 1
    setProblem(getRandomProblem(difficulty))
    setStarted(true)
  }

  // Loading state with fun animation
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

  // ========================================
  // STUDENT PICKER - "Who's Playing Today?"
  // ========================================
  if (!activeProfile) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #FEF3E2 0%, #F3E8FF 50%, #E0E7FF 100%)' }}>
        {/* Teacher Access - subtle */}
        <div className="absolute top-4 right-4">
          <Link
            href="/teacher"
            className="text-sm px-3 py-1 rounded-full transition-all hover:scale-105"
            style={{ backgroundColor: 'rgba(187, 140, 252, 0.2)', color: '#7C3AED' }}
          >
            Teacher →
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            className="w-full max-w-lg"
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
                Who's playing today?
              </p>
            </div>

            {/* Student Cards */}
            {!allProfiles || allProfiles.length === 0 ? (
              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#1F2937' }}>
                  No students yet!
                </h2>
                <p className="mb-4" style={{ color: '#6B7280' }}>
                  Ask your teacher to add you to the class.
                </p>
                <Link
                  href="/teacher"
                  className="inline-block px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                  style={{ backgroundColor: '#BB8CFC', color: 'white' }}
                >
                  Go to Teacher Dashboard
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {allProfiles.map((profile, index) => (
                  <motion.button
                    key={profile.id}
                    onClick={() => handleSelectStudent(profile)}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative inline-block mb-3">
                      <Avatar seed={profile.avatarSeed} size={80} />
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: '#FACC15', color: '#1F2937' }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {profile.grade}
                      </motion.div>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: '#1F2937' }}>
                      {profile.name}
                    </h3>
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      Grade {profile.grade}
                    </p>
                  </motion.button>
                ))}
              </div>
            )}
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

  // ========================================
  // GAME MODE - Learning Session
  // ========================================
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

              {/* Mini Avatar */}
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                <Avatar seed={activeProfile.avatarSeed} size={32} />
                <span className="text-white font-medium text-sm">{activeProfile.name}</span>
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
          childName={activeProfile.name}
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

  // ========================================
  // ADVENTURE HUB - Home Screen
  // ========================================
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
              onClick={handleSwitchStudent}
              className="text-sm px-3 py-1 rounded-full transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(187, 140, 252, 0.2)', color: '#7C3AED' }}
            >
              Switch Student
            </button>
            <Link
              href="/teacher"
              className="text-sm px-3 py-1 rounded-full transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(187, 140, 252, 0.2)', color: '#7C3AED' }}
            >
              Teacher →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Avatar as Star */}
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
                <Avatar seed={activeProfile.avatarSeed} size={130} />
              </div>
            </div>

            {/* Level Badge */}
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-bold shadow-lg"
              style={{ backgroundColor: '#FACC15', color: '#1F2937' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Level {activeProgress?.level || 1}
            </motion.div>
          </motion.div>

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>
              Hey, {activeProfile.name}! 👋
            </h1>
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
              <span className="font-bold" style={{ color: '#F97316' }}>{activeProgress?.currentStreak || 0}</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-medium" style={{ color: '#6B7280' }}>✅ Correct: </span>
              <span className="font-bold" style={{ color: '#22C55E' }}>{activeProgress?.correctAnswers || 0}</span>
            </div>
          </motion.div>

          <p className="text-sm mt-4" style={{ color: '#9CA3AF' }}>
            Grade {activeProfile.grade} math problems
          </p>
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
