'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface TopicMasteryData {
  id: string
  topic: string
  attempts: number
  correct: number
  mastery_percent: number
  avg_time_seconds: number | null
  last_attempt: string | null
}

interface DiagnosticData {
  hasDiagnostic: boolean
  completedAt: string | null
  test: {
    results: Record<string, { correct: number; total: number; avgTime: number }>
    recommended_levels: Record<string, number>
  } | null
}

interface StudentProfileProps {
  studentId: string
  compact?: boolean
}

export function StudentProfile({ studentId, compact = false }: StudentProfileProps) {
  const [mastery, setMastery] = useState<TopicMasteryData[]>([])
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [masteryRes, diagnosticRes] = await Promise.all([
        fetch(`/api/mastery?studentId=${studentId}`),
        fetch(`/api/diagnostic?studentId=${studentId}`)
      ])

      if (masteryRes.ok) {
        const data = await masteryRes.json()
        setMastery(data.mastery || [])
      }

      if (diagnosticRes.ok) {
        const data = await diagnosticRes.json()
        setDiagnostic(data)
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <span className="text-sm" style={{ color: '#94A3B8' }}>Loading profile...</span>
      </div>
    )
  }

  // Sort by mastery - strengths first, then weaknesses
  const sortedMastery = [...mastery].sort((a, b) => b.mastery_percent - a.mastery_percent)
  const strengths = sortedMastery.filter(m => m.mastery_percent >= 70)
  const weaknesses = sortedMastery.filter(m => m.mastery_percent < 70 && m.attempts >= 3)

  // Get diagnostic levels if available
  const diagnosticLevels = diagnostic?.test?.recommended_levels || {}

  // Compact view for student home
  if (compact) {
    if (mastery.length === 0 && !diagnostic?.hasDiagnostic) return null

    return (
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#7C3AED' }}>
          <span>📊</span> Your Progress
        </h3>

        {/* Mastery bars */}
        <div className="space-y-2">
          {sortedMastery.slice(0, 4).map(m => (
            <div key={m.topic} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize" style={{ color: '#4B5563' }}>{m.topic}</span>
                <span style={{ color: getMasteryColor(m.mastery_percent) }}>{m.mastery_percent}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: getMasteryColor(m.mastery_percent) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.mastery_percent}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>

        {mastery.length === 0 && (
          <p className="text-sm text-center" style={{ color: '#9CA3AF' }}>
            Complete problems to track your progress!
          </p>
        )}
      </motion.div>
    )
  }

  // Full view for teacher dashboard
  return (
    <div className="space-y-4">
      {/* Diagnostic Results */}
      {diagnostic?.hasDiagnostic && diagnostic.test && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#1E293B' }}>
          <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#F9FAFB' }}>
            <span>🎯</span> Diagnostic Results
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(diagnosticLevels).map(([domain, level]) => (
              <div key={domain} className="p-2 rounded-lg" style={{ backgroundColor: '#0F172A' }}>
                <span className="text-xs capitalize" style={{ color: '#94A3B8' }}>{domain}</span>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`text-xs ${star <= (level as number) ? '' : 'opacity-20'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {diagnostic.completedAt && (
            <p className="text-xs mt-2" style={{ color: '#64748B' }}>
              Completed: {new Date(diagnostic.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#1E293B' }}>
          <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#22C55E' }}>
            <span>💪</span> Strengths
          </h4>
          <div className="space-y-2">
            {strengths.map(m => (
              <MasteryBar key={m.topic} data={m} />
            ))}
          </div>
        </div>
      )}

      {/* Areas to Improve */}
      {weaknesses.length > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#1E293B' }}>
          <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#FACC15' }}>
            <span>🎯</span> Areas to Improve
          </h4>
          <div className="space-y-2">
            {weaknesses.map(m => (
              <MasteryBar key={m.topic} data={m} />
            ))}
          </div>
        </div>
      )}

      {/* All Topics */}
      {mastery.length > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#1E293B' }}>
          <h4 className="font-bold mb-3" style={{ color: '#F9FAFB' }}>
            All Topics ({mastery.length})
          </h4>
          <div className="space-y-2">
            {sortedMastery.map(m => (
              <MasteryBar key={m.topic} data={m} showDetails />
            ))}
          </div>
        </div>
      )}

      {mastery.length === 0 && !diagnostic?.hasDiagnostic && (
        <div className="text-center py-8" style={{ color: '#64748B' }}>
          <p>No learning data yet.</p>
          <p className="text-sm mt-1">Student needs to complete problems to track progress.</p>
        </div>
      )}
    </div>
  )
}

// Helper component for mastery bar
function MasteryBar({ data, showDetails = false }: { data: TopicMasteryData; showDetails?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="capitalize text-sm" style={{ color: '#F9FAFB' }}>{data.topic}</span>
        <div className="flex items-center gap-2">
          {showDetails && (
            <span className="text-xs" style={{ color: '#64748B' }}>
              {data.correct}/{data.attempts}
            </span>
          )}
          <span
            className="text-sm font-medium"
            style={{ color: getMasteryColor(data.mastery_percent) }}
          >
            {data.mastery_percent}%
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0F172A' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: getMasteryColor(data.mastery_percent) }}
          initial={{ width: 0 }}
          animate={{ width: `${data.mastery_percent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )
}

// Helper to get color based on mastery percentage
function getMasteryColor(percent: number): string {
  if (percent >= 80) return '#22C55E' // Green
  if (percent >= 60) return '#FACC15' // Yellow
  if (percent >= 40) return '#F97316' // Orange
  return '#EF4444' // Red
}
