'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Avatar } from '@/components/Avatar'

// =============================================================================
// PHASE 6: SHAREABLE STUDENT PROFILE
// Public-facing achievement showcase for parents
// =============================================================================

interface StudentProfile {
  id: string
  name: string
  avatar_seed: string
  grade: number
  progress: {
    total_xp: number
    level: number
    current_streak: number
    longest_streak: number
    total_questions: number
    correct_answers: number
  }
}

export default function ShareProfilePage() {
  const params = useParams()
  const token = params.token as string

  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      fetchProfile()
    }
  }, [token])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/share?token=${token}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('This link has expired or is invalid')
        } else {
          setError('Failed to load profile')
        }
        return
      }

      const data = await response.json()
      setStudent(data.student)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#020617' }}>
        <motion.div
          className="w-16 h-16 rounded-full"
          style={{ backgroundColor: '#BB8CFC' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#020617' }}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#F9FAFB' }}>
            {error || 'Profile Not Found'}
          </h1>
          <p style={{ color: '#94A3B8' }}>
            The link you followed may have expired or is invalid.
          </p>
        </div>
      </div>
    )
  }

  const progress = Array.isArray(student.progress) ? student.progress[0] : student.progress
  const accuracy = progress.total_questions > 0
    ? Math.round((progress.correct_answers / progress.total_questions) * 100)
    : 0

  // Calculate level progress (XP needed for next level)
  const xpForCurrentLevel = (progress.level - 1) * 100
  const xpForNextLevel = progress.level * 100
  const levelProgress = ((progress.total_xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#020617' }}>
      {/* Decorative Header */}
      <div
        className="relative h-48 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #BB8CFC 0%, #38BDF8 50%, #C3FE4C 100%)'
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#020617] to-transparent" />

        {/* Floating shapes */}
        <motion.div
          className="absolute top-8 left-[10%] w-16 h-16 rounded-full bg-white/20"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-16 right-[15%] w-12 h-12 rounded-full bg-white/10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-4 right-[30%] w-8 h-8 rounded-full bg-white/15"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </div>

      {/* Profile Card */}
      <div className="max-w-md mx-auto px-4 -mt-24 relative z-10">
        <motion.div
          className="rounded-3xl p-6 shadow-2xl"
          style={{ backgroundColor: '#0F172A', border: '2px solid #1E293B' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Avatar & Name */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-[#BB8CFC] mx-auto">
                <Avatar seed={student.avatar_seed} size={112} />
              </div>
              <div
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: '#FACC15', color: '#1A1A1A' }}
              >
                {progress.level}
              </div>
            </div>
            <h1 className="text-3xl font-bold mt-4" style={{ color: '#F9FAFB' }}>{student.name}</h1>
            <p style={{ color: '#94A3B8' }}>Grade {student.grade} Math Champion</p>
          </div>

          {/* Level Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: '#94A3B8' }}>Level {progress.level}</span>
              <span style={{ color: '#FACC15' }}>{progress.total_xp} XP</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#1E293B' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: '#BB8CFC' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, levelProgress)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-3xl font-bold" style={{ color: '#38BDF8' }}>{progress.total_questions}</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Problems Solved</p>
            </motion.div>

            <motion.div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-3xl font-bold" style={{ color: '#22C55E' }}>{accuracy}%</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Accuracy</p>
            </motion.div>

            <motion.div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.3)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-3xl font-bold" style={{ color: '#FB7185' }}>{progress.current_streak}</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Current Streak</p>
            </motion.div>

            <motion.div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-3xl font-bold" style={{ color: '#FACC15' }}>{progress.longest_streak}</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Best Streak</p>
            </motion.div>
          </div>

          {/* Achievement Badges */}
          <div className="text-center">
            <p className="text-sm mb-3" style={{ color: '#64748B' }}>Achievements</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {progress.total_xp >= 100 && (
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'rgba(250, 204, 21, 0.2)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.5 }}
                  title="100 XP Club"
                >
                  ⭐
                </motion.div>
              )}
              {accuracy >= 80 && (
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.6 }}
                  title="Accuracy Master"
                >
                  🎯
                </motion.div>
              )}
              {progress.longest_streak >= 5 && (
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'rgba(251, 113, 133, 0.2)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.7 }}
                  title="Streak Champion"
                >
                  🔥
                </motion.div>
              )}
              {progress.total_questions >= 50 && (
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.8 }}
                  title="Problem Solver"
                >
                  🧠
                </motion.div>
              )}
              {progress.level >= 5 && (
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'rgba(187, 140, 252, 0.2)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.9 }}
                  title="Level 5 Hero"
                >
                  🏆
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: '#64748B' }}>
            Powered by <span style={{ color: '#BB8CFC' }}>Valid</span> • AI Homework Helper
          </p>
          <p className="text-xs mt-1" style={{ color: '#475569' }}>
            peaklight.ai (PLAI)
          </p>
        </div>
      </div>
    </div>
  )
}
