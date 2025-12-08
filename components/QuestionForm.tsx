'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { db, MathDomain, CustomProblem } from '@/lib/db'

interface QuestionFormProps {
  onComplete?: () => void
  onCancel?: () => void
}

const DOMAINS: { value: MathDomain; label: string }[] = [
  { value: 'number-operations', label: 'Number & Operations' },
  { value: 'algebraic-thinking', label: 'Algebraic Thinking' },
  { value: 'geometry', label: 'Geometry' },
  { value: 'measurement', label: 'Measurement' },
  { value: 'data-handling', label: 'Data Handling' },
  { value: 'problem-solving', label: 'Problem Solving' },
]

const GRADES = [1, 2, 3, 4, 5, 6] as const

export function QuestionForm({ onComplete, onCancel }: QuestionFormProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(2)
  const [domain, setDomain] = useState<MathDomain>('number-operations')
  const [gradeMin, setGradeMin] = useState<number>(1)
  const [gradeMax, setGradeMax] = useState<number>(6)
  const [hint, setHint] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) return

    setIsSubmitting(true)
    try {
      const problem: CustomProblem = {
        question: question.trim(),
        answer: isNaN(Number(answer)) ? answer.trim() : Number(answer),
        difficulty,
        domain,
        gradeRange: [gradeMin, gradeMax],
        hint: hint.trim() || undefined,
        createdAt: new Date()
      }

      await db.customProblems.add(problem)

      // Reset form
      setQuestion('')
      setAnswer('')
      setHint('')
      setDifficulty(2)
      setSuccessMessage('Problem added successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)

      onComplete?.()
    } catch (error) {
      console.error('Failed to add problem:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Add Custom Problem</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            X
          </button>
        )}
      </div>

      {successMessage && (
        <motion.div
          className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {successMessage}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Question */}
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            Question *
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What is 24 + 38?"
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 resize-none"
            required
          />
        </div>

        {/* Answer */}
        <div>
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
            Correct Answer *
          </label>
          <input
            type="text"
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="e.g., 62"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            required
          />
        </div>

        {/* Domain */}
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
            Math Domain
          </label>
          <select
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value as MathDomain)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
          >
            {DOMAINS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  difficulty === d
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {'*'.repeat(d)}
              </button>
            ))}
          </div>
        </div>

        {/* Grade Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grade Range
          </label>
          <div className="flex items-center gap-3">
            <select
              value={gradeMin}
              onChange={(e) => setGradeMin(Number(e.target.value))}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
            >
              {GRADES.map((g) => (
                <option key={g} value={g} disabled={g > gradeMax}>
                  Grade {g}
                </option>
              ))}
            </select>
            <span className="text-gray-500">to</span>
            <select
              value={gradeMax}
              onChange={(e) => setGradeMax(Number(e.target.value))}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
            >
              {GRADES.map((g) => (
                <option key={g} value={g} disabled={g < gradeMin}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hint (optional) */}
        <div>
          <label htmlFor="hint" className="block text-sm font-medium text-gray-700 mb-2">
            Hint (optional)
          </label>
          <input
            type="text"
            id="hint"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="e.g., Try breaking it into smaller parts"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!question.trim() || !answer.trim() || isSubmitting}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-xl text-lg shadow-lg transition-all"
        >
          {isSubmitting ? 'Adding...' : 'Add Problem'}
        </button>
      </form>
    </motion.div>
  )
}
