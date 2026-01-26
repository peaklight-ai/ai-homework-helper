'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface CreateClassModalProps {
  teacherId: string
  onClose: () => void
  onClassCreated: () => void
}

export function CreateClassModal({
  teacherId,
  onClose,
  onClassCreated
}: CreateClassModalProps) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState<number | ''>('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) return

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          name: name.trim(),
          grade: grade || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create class')
      }

      onClassCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        className="w-full max-w-md mx-4 rounded-xl p-6"
        style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: '#F9FAFB' }}>
          Create New Class
        </h2>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid #FB7185' }}
          >
            <p style={{ color: '#FB7185' }}>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              Class Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Math 3A, Grade 4 Blue"
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
              style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #64748B' }}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              Grade Level (optional)
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #64748B' }}
            >
              <option value="">Select grade...</option>
              {[1, 2, 3, 4, 5, 6].map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg font-medium"
            style={{ backgroundColor: '#1E293B', color: '#94A3B8' }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="flex-1 py-2 rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#38BDF8', color: '#020617' }}
          >
            {isCreating ? 'Creating...' : 'Create Class'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
