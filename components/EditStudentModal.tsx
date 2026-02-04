'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClassWithStudents } from '@/lib/supabase'

// =============================================================================
// EDIT STUDENT MODAL (Phase 5 - Student Management)
// =============================================================================
// STUDENT-01: Teacher can edit student name
// STUDENT-02: Teacher can edit student grade
// STUDENT-03: Teacher can change student's class
// =============================================================================

interface Student {
  id: string
  name: string
  grade: number
}

interface EditStudentModalProps {
  student: Student
  classes: ClassWithStudents[]
  currentClassId: string | null
  onClose: () => void
  onSaved: () => void
}

export function EditStudentModal({
  student,
  classes,
  currentClassId,
  onClose,
  onSaved
}: EditStudentModalProps) {
  const [name, setName] = useState(student.name)
  const [grade, setGrade] = useState<1 | 2 | 3 | 4 | 5 | 6>(student.grade as 1 | 2 | 3 | 4 | 5 | 6)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(currentClassId)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Reset form when student changes
    setName(student.name)
    setGrade(student.grade as 1 | 2 | 3 | 4 | 5 | 6)
    setSelectedClassId(currentClassId)
    setError('')
  }, [student, currentClassId])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          name: name.trim(),
          grade,
          newClassId: selectedClassId,
          oldClassId: currentClassId
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save changes')
      }

      onSaved()
    } catch (err) {
      console.error('Error saving student:', err)
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges =
    name !== student.name ||
    grade !== student.grade ||
    selectedClassId !== currentClassId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        className="w-full max-w-md mx-4 rounded-xl p-6"
        style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-xl font-bold mb-6" style={{ color: '#F9FAFB' }}>
          Edit Student
        </h2>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid #FB7185', color: '#FB7185' }}
          >
            {error}
          </div>
        )}

        {/* Name Field (STUDENT-01) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: '#1E293B',
              color: '#F9FAFB',
              border: '1px solid #38BDF8'
            }}
            placeholder="Student name"
          />
        </div>

        {/* Grade Field (STUDENT-02) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
            Grade
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6)}
            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: '#1E293B',
              color: '#F9FAFB',
              border: '1px solid #38BDF8'
            }}
          >
            {[1, 2, 3, 4, 5, 6].map(g => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>

        {/* Class Field (STUDENT-03) */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
            Class
          </label>
          <select
            value={selectedClassId || ''}
            onChange={(e) => setSelectedClassId(e.target.value || null)}
            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: '#1E293B',
              color: '#F9FAFB',
              border: '1px solid #38BDF8'
            }}
          >
            <option value="">No class (unassigned)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.grade ? `(Grade ${c.grade})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-105"
            style={{ backgroundColor: '#1E293B', color: '#94A3B8' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex-1 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{
              backgroundColor: hasChanges ? '#22C55E' : '#1E293B',
              color: hasChanges ? '#020617' : '#64748B'
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
