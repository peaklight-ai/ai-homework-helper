'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ExerciseUploadFormProps {
  teacherId: string
  onExerciseCreated: () => void
}

export function ExerciseUploadForm({ teacherId, onExerciseCreated }: ExerciseUploadFormProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [difficulty, setDifficulty] = useState<number>(3)
  const [domain, setDomain] = useState('')
  const [grade, setGrade] = useState<number | ''>('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) return

    setIsCreating(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          question: question.trim(),
          answer: answer.trim(),
          difficulty,
          domain: domain.trim() || null,
          grade: grade || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create exercise')
      }

      // Reset form
      setQuestion('')
      setAnswer('')
      setDifficulty(3)
      setDomain('')
      setGrade('')
      setSuccess(true)
      onExerciseCreated()

      // Clear success after 2 seconds
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exercise')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <motion.div
      className="rounded-xl p-5 border"
      style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-bold text-lg mb-4" style={{ color: '#F9FAFB' }}>
        Create New Exercise
      </h3>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg"
          style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid #FB7185' }}
        >
          <p style={{ color: '#FB7185' }}>{error}</p>
        </div>
      )}

      {success && (
        <div
          className="mb-4 p-3 rounded-lg"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22C55E' }}
        >
          <p style={{ color: '#22C55E' }}>Exercise created successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
            Question *
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What is 24 + 18?"
            rows={2}
            className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #64748B' }}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
            Answer *
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="e.g., 42"
            className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #64748B' }}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #64748B' }}
            >
              {[1, 2, 3, 4, 5].map(d => (
                <option key={d} value={d}>{'*'.repeat(d)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #64748B' }}
            >
              <option value="">Any</option>
              <option value="addition">Addition</option>
              <option value="subtraction">Subtraction</option>
              <option value="multiplication">Multiplication</option>
              <option value="division">Division</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
              Grade
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #64748B' }}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5, 6].map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!question.trim() || !answer.trim() || isCreating}
          className="w-full py-2 rounded-lg font-medium transition-all disabled:opacity-50"
          style={{ backgroundColor: '#38BDF8', color: '#020617' }}
        >
          {isCreating ? 'Creating...' : 'Create Exercise'}
        </button>
      </form>
    </motion.div>
  )
}
