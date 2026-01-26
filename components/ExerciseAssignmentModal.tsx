'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Exercise, ClassWithStudents, Student } from '@/lib/supabase'

interface ExerciseAssignmentModalProps {
  exercise: Exercise
  classes: ClassWithStudents[]
  allStudents: Student[]
  onClose: () => void
  onAssigned: () => void
}

export function ExerciseAssignmentModal({
  exercise,
  classes,
  allStudents,
  onClose,
  onAssigned
}: ExerciseAssignmentModalProps) {
  const [assignTo, setAssignTo] = useState<'class' | 'students'>('class')
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAssign = async () => {
    if (assignTo === 'class' && !selectedClassId) {
      setError('Please select a class')
      return
    }
    if (assignTo === 'students' && selectedStudentIds.length === 0) {
      setError('Please select at least one student')
      return
    }

    setIsAssigning(true)
    setError(null)

    try {
      const response = await fetch('/api/exercises/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: exercise.id,
          classId: assignTo === 'class' ? selectedClassId : null,
          studentIds: assignTo === 'students' ? selectedStudentIds : null,
          dueDate: dueDate || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to assign exercise')
      }

      onAssigned()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign')
    } finally {
      setIsAssigning(false)
    }
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        className="w-full max-w-md mx-4 rounded-xl p-6 max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-xl font-bold mb-2" style={{ color: '#F9FAFB' }}>
          Assign Exercise
        </h2>
        <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
          {exercise.question}
        </p>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid #FB7185' }}
          >
            <p style={{ color: '#FB7185' }}>{error}</p>
          </div>
        )}

        {/* Assignment type toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAssignTo('class')}
            className="flex-1 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: assignTo === 'class' ? '#38BDF8' : '#1E293B',
              color: assignTo === 'class' ? '#020617' : '#94A3B8'
            }}
          >
            Assign to Class
          </button>
          <button
            onClick={() => setAssignTo('students')}
            className="flex-1 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: assignTo === 'students' ? '#38BDF8' : '#1E293B',
              color: assignTo === 'students' ? '#020617' : '#94A3B8'
            }}
          >
            Assign to Students
          </button>
        </div>

        {/* Class selection */}
        {assignTo === 'class' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #64748B' }}
            >
              <option value="">Choose a class...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.studentCount} students)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Student selection */}
        {assignTo === 'students' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
              Select Students ({selectedStudentIds.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1 p-2 rounded-lg" style={{ backgroundColor: '#1E293B' }}>
              {allStudents.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: '#64748B' }}>
                  No students available
                </p>
              ) : (
                allStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className="w-full flex items-center gap-2 p-2 rounded transition-all text-left"
                    style={{
                      backgroundColor: selectedStudentIds.includes(student.id)
                        ? 'rgba(56, 189, 248, 0.2)'
                        : 'transparent'
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded border flex items-center justify-center"
                      style={{
                        borderColor: selectedStudentIds.includes(student.id) ? '#38BDF8' : '#64748B',
                        backgroundColor: selectedStudentIds.includes(student.id) ? '#38BDF8' : 'transparent'
                      }}
                    >
                      {selectedStudentIds.includes(student.id) && (
                        <svg className="w-3 h-3" fill="#020617" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                    <span style={{ color: '#F9FAFB' }}>{student.name}</span>
                    <span className="text-xs ml-auto" style={{ color: '#64748B' }}>
                      Grade {student.grade}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Due date */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
            Due Date (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg focus:outline-none"
            style={{ backgroundColor: '#1E293B', color: '#F9FAFB', border: '1px solid #64748B' }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg font-medium"
            style={{ backgroundColor: '#1E293B', color: '#94A3B8' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={isAssigning}
            className="flex-1 py-2 rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#22C55E', color: '#020617' }}
          >
            {isAssigning ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
