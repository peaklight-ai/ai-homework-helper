'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Insight {
  id: string
  student_id: string
  insight_type: 'struggling' | 'improving' | 'inactive' | 'milestone'
  insight_data: {
    message: string
    detail: string
    metric?: number
    trend?: 'up' | 'down' | 'stable'
  }
  read_at: string | null
}

interface TeacherInsightsProps {
  teacherId: string
  onStudentClick?: (studentId: string) => void
}

const insightConfig = {
  struggling: {
    icon: '😟',
    color: '#FB7185',
    bgColor: 'rgba(251, 113, 133, 0.1)',
    borderColor: 'rgba(251, 113, 133, 0.3)',
    label: 'Needs Help'
  },
  inactive: {
    icon: '😴',
    color: '#94A3B8',
    bgColor: 'rgba(148, 163, 184, 0.1)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
    label: 'Inactive'
  },
  improving: {
    icon: '🚀',
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    label: 'On Fire'
  },
  milestone: {
    icon: '🏆',
    color: '#FACC15',
    bgColor: 'rgba(250, 204, 21, 0.1)',
    borderColor: 'rgba(250, 204, 21, 0.3)',
    label: 'Milestone'
  }
}

export function TeacherInsights({ teacherId, onStudentClick }: TeacherInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchInsights = async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const response = await fetch(`/api/insights?teacherId=${teacherId}${refresh ? '&refresh=true' : ''}`)
      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInsights(true) // Generate fresh insights on mount
  }, [teacherId])

  const handleDismiss = async (insightId: string) => {
    try {
      await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId, action: 'dismiss' })
      })
      setInsights(prev => prev.filter(i => i.id !== insightId))
    } catch (error) {
      console.error('Error dismissing insight:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl p-6" style={{ backgroundColor: '#0F172A' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎯</span>
          <h3 className="font-bold" style={{ color: '#F9FAFB' }}>Today's Focus</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <motion.div
            className="text-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            ⭐
          </motion.div>
        </div>
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-xl p-6" style={{ backgroundColor: '#0F172A' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-bold" style={{ color: '#F9FAFB' }}>Today's Focus</h3>
          </div>
          <button
            onClick={() => fetchInsights(true)}
            disabled={isRefreshing}
            className="text-xs px-2 py-1 rounded-lg transition-all hover:scale-105"
            style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8' }}
          >
            {isRefreshing ? '...' : 'Refresh'}
          </button>
        </div>
        <div className="text-center py-6">
          <span className="text-4xl mb-3 block">✨</span>
          <p style={{ color: '#94A3B8' }}>All students are on track!</p>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>No insights to show right now</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: '#0F172A' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h3 className="font-bold" style={{ color: '#F9FAFB' }}>Today's Focus</h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(187, 140, 252, 0.2)', color: '#BB8CFC' }}
          >
            {insights.length}
          </span>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={isRefreshing}
          className="text-xs px-2 py-1 rounded-lg transition-all hover:scale-105"
          style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8' }}
        >
          {isRefreshing ? '...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {insights.map((insight, index) => {
            const config = insightConfig[insight.insight_type]
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: config.bgColor,
                  border: `1px solid ${config.borderColor}`
                }}
                onClick={() => onStudentClick?.(insight.student_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium" style={{ color: '#F9FAFB' }}>
                          {insight.insight_data.message}
                        </p>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: config.bgColor, color: config.color }}
                        >
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                        {insight.insight_data.detail}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDismiss(insight.id)
                    }}
                    className="text-lg opacity-50 hover:opacity-100 transition-opacity"
                    title="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
