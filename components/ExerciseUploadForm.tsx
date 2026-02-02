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
  const [hints, setHints] = useState<string[]>([''])
  const [strategies, setStrategies] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) return

    setIsCreating(true)
    setError(null)
    setSuccess(false)

    // Filter out empty hints
    const validHints = hints.filter(h => h.trim())

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
          grade: grade || null,
          hints: validHints,
          strategies: strategies.trim() || null
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
      setHints([''])
      setStrategies('')
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

  const addHint = () => {
    if (hints.length < 5) {
      setHints([...hints, ''])
    }
  }

  const updateHint = (index: number, value: string) => {
    const newHints = [...hints]
    newHints[index] = value
    setHints(newHints)
  }

  const removeHint = (index: number) => {
    if (hints.length > 1) {
      setHints(hints.filter((_, i) => i !== index))
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

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm flex items-center gap-2 transition-colors"
          style={{ color: '#38BDF8' }}
        >
          <span>{showAdvanced ? '▼' : '▶'}</span>
          Hints & Strategies (optional)
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 pt-2"
          >
            {/* Hints */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                Hints (shown progressively to students)
              </label>
              <div className="space-y-2">
                {hints.map((hint, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={hint}
                      onChange={(e) => updateHint(index, e.target.value)}
                      placeholder={`Hint ${index + 1}: e.g., "Try breaking down 24 into 20 + 4"`}
                      className="flex-1 px-3 py-2 rounded-lg focus:outline-none text-sm"
                      style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #64748B' }}
                    />
                    {hints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHint(index)}
                        className="px-3 py-2 rounded-lg text-sm"
                        style={{ backgroundColor: '#1E293B', color: '#FB7185' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {hints.length < 5 && (
                <button
                  type="button"
                  onClick={addHint}
                  className="mt-2 text-sm px-3 py-1 rounded-lg"
                  style={{ backgroundColor: '#1E293B', color: '#38BDF8' }}
                >
                  + Add Hint
                </button>
              )}
            </div>

            {/* Teaching Strategies */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
                Teaching Strategy (for AI tutor)
              </label>
              <textarea
                value={strategies}
                onChange={(e) => setStrategies(e.target.value)}
                placeholder="e.g., For this problem, encourage the student to use place value thinking. Break the numbers into tens and ones."
                rows={2}
                className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #64748B' }}
              />
              <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                This guides how the AI helps the student solve this problem.
              </p>
            </div>
          </motion.div>
        )}

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
