'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { QuestionForm } from '@/components/QuestionForm'
import { db, CustomProblem, MathDomain } from '@/lib/db'
import Link from 'next/link'

const DOMAIN_LABELS: Record<MathDomain, string> = {
  'number-operations': 'Number & Operations',
  'algebraic-thinking': 'Algebraic Thinking',
  'geometry': 'Geometry',
  'measurement': 'Measurement',
  'data-handling': 'Data Handling',
  'problem-solving': 'Problem Solving',
}

export default function UploadPage() {
  const [showForm, setShowForm] = useState(true)

  // Get all custom problems
  const problems = useLiveQuery(() => db.customProblems.toArray())

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this problem?')) {
      await db.customProblems.delete(id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Custom Problems</h1>
          <div className="flex gap-3">
            <Link
              href="/teacher"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Teacher Dashboard
            </Link>
            <Link
              href="/"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div>
            {showForm ? (
              <QuestionForm onComplete={() => {}} />
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-8 border-2 border-dashed border-purple-300 rounded-2xl text-purple-500 hover:border-purple-500 hover:text-purple-600 transition-colors"
              >
                + Add New Problem
              </button>
            )}
          </div>

          {/* Right: Problem List */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Your Problems ({problems?.length || 0})
            </h2>

            {!problems || problems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">No custom problems yet</p>
                <p className="text-sm">Add your first problem using the form</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {problems.map((problem) => (
                  <motion.div
                    key={problem.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium truncate">
                          {problem.question}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {DOMAIN_LABELS[problem.domain]}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Grades {problem.gradeRange[0]}-{problem.gradeRange[1]}
                          </span>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            {'*'.repeat(problem.difficulty)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(problem.id!)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete"
                      >
                        X
                      </button>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Answer: <span className="font-medium text-green-600">{problem.answer}</span>
                      </p>
                      {problem.hint && (
                        <p className="text-sm text-gray-500 mt-1">
                          Hint: {problem.hint}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Export/Import Section */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Backup Problems</h3>
          <p className="text-sm text-gray-500 mb-4">
            Export your problems to a file for safekeeping, or import problems from a backup.
          </p>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                const probs = await db.customProblems.toArray()
                const blob = new Blob([JSON.stringify(probs, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `custom-problems-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Export Problems
            </button>
            <label className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
              Import Problems
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  const reader = new FileReader()
                  reader.onload = async (event) => {
                    try {
                      const probs = JSON.parse(event.target?.result as string) as CustomProblem[]
                      // Remove IDs so they get new ones
                      const newProbs = probs.map(({ id, ...rest }) => ({
                        ...rest,
                        createdAt: new Date(rest.createdAt)
                      }))
                      await db.customProblems.bulkAdd(newProbs as CustomProblem[])
                      alert(`Imported ${newProbs.length} problems!`)
                    } catch (error) {
                      console.error('Import failed:', error)
                      alert('Failed to import. Check file format.')
                    }
                  }
                  reader.readAsText(file)
                  e.target.value = '' // Reset input
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
