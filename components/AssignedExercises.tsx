'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Exercise {
  id: string
  question: string
  answer: string
  difficulty: number
  domain: string | null
  grade: number | null
}

interface AssignedExercisesProps {
  studentId: string
  compact?: boolean
  onSelectExercise?: (exercise: Exercise) => void
  // For teacher view - don't show hints/strategies to students
  isTeacherView?: boolean
}

export function AssignedExercises({ studentId, compact = false, onSelectExercise, isTeacherView = false }: AssignedExercisesProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // Pass teacher flag to get full data including hints/strategies/answers
        const url = isTeacherView
          ? `/api/exercises/assigned?studentId=${studentId}&teacher=true`
          : `/api/exercises/assigned?studentId=${studentId}`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setExercises(data.exercises || [])
        }
      } catch (error) {
        console.error('Error fetching assigned exercises:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssignments()
  }, [studentId, isTeacherView])

  if (isLoading) {
    return (
      <div className="text-center py-4" style={{ color: '#94A3B8' }}>
        Loading assignments...
      </div>
    )
  }

  if (exercises.length === 0) {
    if (compact) return null
    return (
      <div className="text-center py-4" style={{ color: '#94A3B8' }}>
        No assigned exercises yet
      </div>
    )
  }

  if (compact) {
    return (
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#7C3AED' }}>
          <span>📚</span> Your Assignments ({exercises.length})
        </h3>
        <div className="space-y-2">
          {exercises.slice(0, 3).map((ex) => (
            <button
              key={ex.id}
              onClick={() => onSelectExercise?.(ex)}
              className="w-full text-left p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <p className="font-medium text-sm truncate" style={{ color: '#1F2937' }}>
                {ex.question}
              </p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs" style={{ color: '#FACC15' }}>
                  {'⭐'.repeat(ex.difficulty)}
                </span>
                {ex.domain && (
                  <span className="text-xs capitalize" style={{ color: '#7C3AED' }}>
                    {ex.domain}
                  </span>
                )}
              </div>
            </button>
          ))}
          {exercises.length > 3 && (
            <p className="text-sm text-center" style={{ color: '#7C3AED' }}>
              +{exercises.length - 3} more
            </p>
          )}
        </div>
      </motion.div>
    )
  }

  // Full view (for teacher dashboard)
  return (
    <div className="space-y-3">
      <h3 className="font-bold mb-3" style={{ color: '#F9FAFB' }}>
        Assigned Exercises ({exercises.length})
      </h3>
      {exercises.map((ex) => (
        <div
          key={ex.id}
          className="p-3 rounded-lg"
          style={{ backgroundColor: '#1E293B' }}
        >
          <p className="font-medium mb-1" style={{ color: '#F9FAFB' }}>
            {ex.question}
          </p>
          {isTeacherView && (
            <p className="text-sm mb-2" style={{ color: '#22C55E' }}>
              Answer: {ex.answer}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: '#FACC15' }}>{'⭐'.repeat(ex.difficulty)}</span>
            {ex.domain && (
              <span
                className="px-2 py-0.5 rounded capitalize"
                style={{ backgroundColor: '#0F172A', color: '#38BDF8' }}
              >
                {ex.domain}
              </span>
            )}
            {ex.grade && (
              <span style={{ color: '#94A3B8' }}>Grade {ex.grade}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
