'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StudentTarget } from '@/lib/supabase'

interface StudentTargetsProps {
  studentId: string
  showAddButton?: boolean
  teacherId?: string
  compact?: boolean
}

export function StudentTargets({ studentId, showAddButton = false, teacherId, compact = false }: StudentTargetsProps) {
  const [targets, setTargets] = useState<StudentTarget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTargetText, setNewTargetText] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const fetchTargets = useCallback(async () => {
    try {
      const response = await fetch(`/api/targets?studentId=${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setTargets(data.targets || [])
      }
    } catch (error) {
      console.error('Error fetching targets:', error)
    } finally {
      setIsLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchTargets()
  }, [fetchTargets])

  const addTarget = async () => {
    if (!newTargetText.trim() || !teacherId) return

    setIsAdding(true)
    try {
      const response = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          teacherId,
          targetText: newTargetText.trim()
        })
      })

      if (response.ok) {
        setNewTargetText('')
        setShowAddForm(false)
        fetchTargets()
      }
    } catch (error) {
      console.error('Error adding target:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const toggleComplete = async (target: StudentTarget) => {
    try {
      await fetch('/api/targets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: target.id,
          completed: !target.completed
        })
      })
      fetchTargets()
    } catch (error) {
      console.error('Error updating target:', error)
    }
  }

  const deleteTarget = async (targetId: string) => {
    try {
      await fetch(`/api/targets?targetId=${targetId}`, { method: 'DELETE' })
      fetchTargets()
    } catch (error) {
      console.error('Error deleting target:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <span className="text-sm" style={{ color: '#94A3B8' }}>Loading targets...</span>
      </div>
    )
  }

  const activeTargets = targets.filter(t => !t.completed)
  const completedTargets = targets.filter(t => t.completed)

  // Compact view for student home
  if (compact) {
    if (activeTargets.length === 0) return null

    return (
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#7C3AED' }}>
          <span>🎯</span> Your Goals
        </h3>
        <ul className="space-y-2">
          {activeTargets.slice(0, 3).map(target => (
            <li key={target.id} className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">•</span>
              <span style={{ color: '#4B5563' }}>{target.target_text}</span>
            </li>
          ))}
        </ul>
        {activeTargets.length > 3 && (
          <p className="text-sm mt-2" style={{ color: '#9CA3AF' }}>
            +{activeTargets.length - 3} more goals
          </p>
        )}
      </motion.div>
    )
  }

  // Full view for teacher dashboard
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold" style={{ color: '#F9FAFB' }}>
          Targets ({activeTargets.length} active)
        </h3>
        {showAddButton && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-sm px-3 py-1 rounded-lg transition-all"
            style={{ backgroundColor: '#38BDF8', color: '#020617' }}
          >
            + Add Target
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#1E293B' }}>
              <input
                type="text"
                value={newTargetText}
                onChange={(e) => setNewTargetText(e.target.value)}
                placeholder="e.g., Master 2-digit addition"
                className="w-full px-3 py-2 rounded-lg mb-2 focus:outline-none"
                style={{ backgroundColor: '#0F172A', color: '#F9FAFB', border: '1px solid #64748B' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={addTarget}
                  disabled={!newTargetText.trim() || isAdding}
                  className="flex-1 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#22C55E', color: '#020617' }}
                >
                  {isAdding ? 'Adding...' : 'Add'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: '#64748B', color: '#F9FAFB' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active targets */}
      <div className="space-y-2">
        {activeTargets.map(target => (
          <motion.div
            key={target.id}
            className="p-3 rounded-lg flex items-start gap-3"
            style={{ backgroundColor: '#1E293B' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => toggleComplete(target)}
              className="w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ borderColor: '#64748B' }}
            />
            <div className="flex-1 min-w-0">
              <p style={{ color: '#F9FAFB' }}>{target.target_text}</p>
              {target.due_date && (
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                  Due: {new Date(target.due_date).toLocaleDateString()}
                </p>
              )}
            </div>
            {showAddButton && (
              <button
                onClick={() => deleteTarget(target.id)}
                className="text-sm px-2 py-1 rounded opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: '#FB7185' }}
              >
                ×
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Completed targets */}
      {completedTargets.length > 0 && (
        <div className="pt-2 border-t" style={{ borderColor: '#1E293B' }}>
          <p className="text-xs mb-2" style={{ color: '#64748B' }}>Completed</p>
          <div className="space-y-2">
            {completedTargets.slice(0, 3).map(target => (
              <div
                key={target.id}
                className="p-2 rounded-lg flex items-center gap-2 opacity-60"
                style={{ backgroundColor: '#1E293B' }}
              >
                <span className="text-green-500">✓</span>
                <span className="line-through text-sm" style={{ color: '#94A3B8' }}>
                  {target.target_text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {targets.length === 0 && (
        <p className="text-center py-4 text-sm" style={{ color: '#64748B' }}>
          No targets set yet
        </p>
      )}
    </div>
  )
}
