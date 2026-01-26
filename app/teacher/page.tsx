'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser, useAuth, useSupabase } from '@/components/SupabaseProvider'
import { Avatar } from '@/components/Avatar'
import { ClassSelector } from '@/components/ClassSelector'
import { CreateClassModal } from '@/components/CreateClassModal'
import { CSVImportModal } from '@/components/CSVImportModal'
import { ClassWithStudents } from '@/lib/supabase'

// =============================================================================
// V3 TEACHER DASHBOARD - SUPABASE INTEGRATED
// =============================================================================

interface StudentProgress {
  totalXp: number
  level: number
  currentStreak: number
  longestStreak: number
  totalQuestions: number
  correctAnswers: number
}

interface StudentSettings {
  allowedTopics: string[]
  difficultyLevel: number
}

interface Student {
  id: string
  name: string
  grade: number
  avatarSeed: string
  loginCode: string
  createdAt: string
  progress: StudentProgress
  settings: StudentSettings
}

export default function TeacherDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useUser()
  const { signOut } = useAuth()
  const { supabase } = useSupabase()

  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // XP Goal settings (stored in localStorage for now, will be per-teacher later)
  const [xpGoal, setXpGoal] = useState(100)
  const [showGoalSaved, setShowGoalSaved] = useState(false)

  // Add Student form
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentGrade, setNewStudentGrade] = useState<1 | 2 | 3 | 4 | 5 | 6>(3)
  const [isAdding, setIsAdding] = useState(false)

  // Settings panel
  const [showSettings, setShowSettings] = useState(false)
  const [editingSettings, setEditingSettings] = useState<StudentSettings | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Class management
  const [classes, setClasses] = useState<ClassWithStudents[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showImportCSV, setShowImportCSV] = useState(false)

  // Fetch students
  const fetchStudents = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/students', {
        headers: { 'x-teacher-id': user.id }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const data = await response.json()
      setStudents(data.students || [])
    } catch (err) {
      console.error('Error fetching students:', err)
      setError('Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const fetchClasses = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/classes', {
        headers: { 'x-teacher-id': user.id }
      })

      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchStudents()
      fetchClasses()
    }
  }, [user, fetchStudents, fetchClasses])

  // Load XP goal from localStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem('xpGoal')
    if (savedGoal) {
      setXpGoal(parseInt(savedGoal, 10))
    }
  }, [])

  const handleSaveGoal = () => {
    localStorage.setItem('xpGoal', xpGoal.toString())
    setShowGoalSaved(true)
    setTimeout(() => setShowGoalSaved(false), 2000)
  }

  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !user) return

    setIsAdding(true)
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user.id,
          name: newStudentName.trim(),
          grade: newStudentGrade
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create student')
      }

      // Refresh student list
      await fetchStudents()
      setNewStudentName('')
      setShowAddStudent(false)
    } catch (err) {
      console.error('Error adding student:', err)
      setError('Failed to add student')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student? This will remove all their progress.')) {
      return
    }

    try {
      const response = await fetch(`/api/students?id=${studentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete student')
      }

      // Refresh student list
      await fetchStudents()
      if (selectedStudent === studentId) {
        setSelectedStudent(null)
      }
    } catch (err) {
      console.error('Error deleting student:', err)
      setError('Failed to delete student')
    }
  }

  const handleSaveSettings = async () => {
    if (!selectedStudent || !editingSettings) return

    setIsSavingSettings(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          allowedTopics: editingSettings.allowedTopics,
          difficultyLevel: editingSettings.difficultyLevel
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      // Refresh student list to get updated settings
      await fetchStudents()
      setShowSettings(false)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save settings')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const selectedStudentData = students.find(s => s.id === selectedStudent)

  // Filter students by selected class
  const selectedClass = classes.find(c => c.id === selectedClassId)
  const classStudentIds = selectedClass?.students?.map(s => s.id) || []
  const filteredStudents = selectedClassId
    ? students.filter(s => classStudentIds.includes(s.id))
    : students

  // Calculate class stats based on filtered view
  const totalStudents = filteredStudents.length
  const totalXP = filteredStudents.reduce((sum, s) => sum + s.progress.totalXp, 0)
  const totalCorrect = filteredStudents.reduce((sum, s) => sum + s.progress.correctAnswers, 0)
  const totalQuestions = filteredStudents.reduce((sum, s) => sum + s.progress.totalQuestions, 0)
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  const studentsAtGoal = filteredStudents.filter(s => s.progress.totalXp >= xpGoal).length

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#020617' }}>
        <div className="text-center">
          <motion.div
            className="w-12 h-12 rounded-full mx-auto mb-4"
            style={{ backgroundColor: '#38BDF8' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <p style={{ color: '#94A3B8' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#020617' }}>
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{
          background: 'linear-gradient(to right, #0F172A, #1E293B)',
          borderColor: '#1E293B'
        }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#BB8CFC' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#F9FAFB' }}>
                <span style={{ color: '#BB8CFC' }}>Valid</span> Teacher Dashboard
              </h1>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {user?.email || 'Loading...'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{ backgroundColor: '#38BDF8', color: '#020617' }}
            >
              Student View
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{ backgroundColor: '#1E293B', color: '#FB7185', border: '1px solid #FB7185' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 rounded-lg"
            style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid #FB7185' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p style={{ color: '#FB7185' }}>{error}</p>
          </motion.div>
        )}

        {/* Class Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            className="rounded-xl p-4 border"
            style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm" style={{ color: '#94A3B8' }}>Total Students</p>
            <p className="text-3xl font-bold" style={{ color: '#38BDF8' }}>{totalStudents}</p>
          </motion.div>
          <motion.div
            className="rounded-xl p-4 border"
            style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-sm" style={{ color: '#94A3B8' }}>Total XP Earned</p>
            <p className="text-3xl font-bold" style={{ color: '#FACC15' }}>{totalXP}</p>
          </motion.div>
          <motion.div
            className="rounded-xl p-4 border"
            style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm" style={{ color: '#94A3B8' }}>Class Accuracy</p>
            <p className="text-3xl font-bold" style={{ color: avgAccuracy >= 70 ? '#22C55E' : avgAccuracy >= 50 ? '#FACC15' : '#FB7185' }}>
              {avgAccuracy}%
            </p>
          </motion.div>
          <motion.div
            className="rounded-xl p-4 border"
            style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm" style={{ color: '#94A3B8' }}>At Goal</p>
            <p className="text-3xl font-bold" style={{ color: '#22C55E' }}>
              {studentsAtGoal}/{totalStudents}
            </p>
          </motion.div>
        </div>

        {/* XP Goal Setting */}
        <motion.div
          className="rounded-xl p-5 border mb-6"
          style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg" style={{ color: '#F9FAFB' }}>Class XP Goal</h3>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Set an XP target for your students</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={xpGoal}
                onChange={(e) => setXpGoal(Math.max(50, parseInt(e.target.value) || 50))}
                min={50}
                step={50}
                className="w-24 px-3 py-2 rounded-lg text-center font-bold text-lg"
                style={{ backgroundColor: '#1E293B', color: '#FACC15', border: '1px solid #38BDF8' }}
              />
              <span style={{ color: '#94A3B8' }}>XP</span>
              <button
                onClick={handleSaveGoal}
                className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                style={{ backgroundColor: showGoalSaved ? '#22C55E' : '#38BDF8', color: '#020617' }}
              >
                {showGoalSaved ? '✓ Saved!' : 'Save'}
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {[100, 150, 200, 300, 500].map((preset) => (
              <button
                key={preset}
                onClick={() => setXpGoal(preset)}
                className="px-3 py-1 rounded-full text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: xpGoal === preset ? '#FACC15' : '#1E293B',
                  color: xpGoal === preset ? '#020617' : '#94A3B8',
                  fontWeight: xpGoal === preset ? 600 : 400
                }}
              >
                {preset} XP
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Student List */}
          <div
            className="md:col-span-1 rounded-xl p-4 border"
            style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
          >
            {/* Class Selector */}
            <ClassSelector
              classes={classes}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              onCreateClass={() => setShowCreateClass(true)}
            />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: '#F9FAFB' }}>
                {selectedClassId ? selectedClass?.name : 'All Students'}
              </h2>
              <div className="flex gap-2">
                {selectedClassId && (
                  <button
                    onClick={() => setShowImportCSV(true)}
                    className="px-3 py-1 rounded-lg text-sm font-medium transition-all hover:scale-105"
                    style={{ backgroundColor: '#22C55E', color: '#020617' }}
                  >
                    Import CSV
                  </button>
                )}
                <button
                  onClick={() => setShowAddStudent(!showAddStudent)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: '#38BDF8', color: '#020617' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAddStudent ? "M6 18L18 6M6 6l12 12" : "M12 6v12M6 12h12"} />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add Student Form */}
            {showAddStudent && (
              <motion.div
                className="mb-4 p-3 rounded-lg border"
                style={{ backgroundColor: '#1E293B', borderColor: '#38BDF8' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <input
                  type="text"
                  placeholder={selectedClassId ? `Student name (adding to ${selectedClass?.name})` : "Student name"}
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg mb-2 focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#0F172A', color: '#F9FAFB', border: '1px solid #1E293B' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                />
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs" style={{ color: '#94A3B8' }}>Grade:</label>
                  <select
                    value={newStudentGrade}
                    onChange={(e) => setNewStudentGrade(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6)}
                    className="flex-1 px-2 py-1 rounded-lg focus:outline-none"
                    style={{ backgroundColor: '#0F172A', color: '#F9FAFB', border: '1px solid #1E293B' }}
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddStudent}
                  disabled={!newStudentName.trim() || isAdding}
                  className="w-full py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#22C55E', color: '#020617' }}
                >
                  {isAdding ? 'Adding...' : 'Add Student'}
                </button>
              </motion.div>
            )}

            {isLoading ? (
              <div className="text-center py-8" style={{ color: '#94A3B8' }}>
                <motion.div
                  className="w-8 h-8 rounded-full mx-auto mb-2"
                  style={{ border: '2px solid #38BDF8', borderTopColor: 'transparent' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#94A3B8' }}>
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: '#1E293B' }}
                >
                  <svg className="w-8 h-8" style={{ color: '#38BDF8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p>{selectedClassId ? 'No students in this class' : 'No students yet'}</p>
                <p className="text-sm mt-1">{selectedClassId ? 'Add students or import CSV' : 'Click + to add your first student'}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {filteredStudents.map((student) => {
                  const goalReached = student.progress.totalXp >= xpGoal
                  const progressPercent = Math.min(100, (student.progress.totalXp / xpGoal) * 100)
                  return (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left hover:scale-[1.02]"
                      style={{
                        backgroundColor: selectedStudent === student.id ? 'rgba(56, 189, 248, 0.15)' : '#1E293B',
                        border: selectedStudent === student.id ? '2px solid #38BDF8' : goalReached ? '2px solid #22C55E' : '2px solid transparent'
                      }}
                    >
                      <div className="relative">
                        <Avatar seed={student.avatarSeed} size={40} />
                        {goalReached && (
                          <div
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                            style={{ backgroundColor: '#22C55E', color: '#020617' }}
                          >
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: '#F9FAFB' }}>{student.name}</p>
                        <div className="w-full rounded-full h-1.5 mt-1" style={{ backgroundColor: '#020617' }}>
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${progressPercent}%`,
                              backgroundColor: goalReached ? '#22C55E' : '#FACC15'
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: goalReached ? '#22C55E' : '#FACC15' }}>
                          {student.progress.totalXp}/{xpGoal}
                        </p>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>
                          {goalReached ? 'Done!' : 'XP'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Student Details */}
          <div
            className="md:col-span-2 rounded-xl p-6 border"
            style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
          >
            {!selectedStudent || !selectedStudentData ? (
              <div className="text-center py-16" style={{ color: '#94A3B8' }}>
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: '#1E293B' }}
                >
                  <svg className="w-10 h-10" style={{ color: '#38BDF8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-lg">Select a student to view details</p>
              </div>
            ) : (
              <motion.div
                key={selectedStudent}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {/* Student Header */}
                <div
                  className="flex items-center justify-between mb-6 pb-6"
                  style={{ borderBottom: '1px solid #1E293B' }}
                >
                  <div className="flex items-center gap-4">
                    <Avatar seed={selectedStudentData.avatarSeed} size={64} />
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>{selectedStudentData.name}</h2>
                      <p style={{ color: '#94A3B8' }}>Grade {selectedStudentData.grade}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSettings({ ...selectedStudentData.settings })
                        setShowSettings(true)
                      }}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                      style={{ backgroundColor: '#1E293B', color: '#38BDF8', border: '1px solid #38BDF8' }}
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(selectedStudent)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                      style={{ backgroundColor: '#1E293B', color: '#FB7185', border: '1px solid #FB7185' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Login Code */}
                <div
                  className="mb-6 p-4 rounded-lg"
                  style={{ backgroundColor: 'rgba(187, 140, 252, 0.1)', border: '1px solid #BB8CFC' }}
                >
                  <p className="text-sm mb-1" style={{ color: '#94A3B8' }}>Student Login Code</p>
                  <p className="text-3xl font-bold tracking-widest" style={{ color: '#BB8CFC', letterSpacing: '0.3em' }}>
                    {selectedStudentData.loginCode}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                    Share this code with the student to log in
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)' }}
                  >
                    <p className="text-2xl font-bold" style={{ color: '#FACC15' }}>{selectedStudentData.progress.totalXp}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Total XP</p>
                  </div>
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)' }}
                  >
                    <p className="text-2xl font-bold" style={{ color: '#38BDF8' }}>{selectedStudentData.progress.level}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Level</p>
                  </div>
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                  >
                    <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>{selectedStudentData.progress.correctAnswers}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Correct</p>
                  </div>
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.3)' }}
                  >
                    <p className="text-2xl font-bold" style={{ color: '#FB7185' }}>{selectedStudentData.progress.longestStreak}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Best Streak</p>
                  </div>
                </div>

                {/* Current Settings */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3" style={{ color: '#F9FAFB' }}>Learning Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#1E293B' }}>
                      <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>Topics</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedStudentData.settings.allowedTopics.map(topic => (
                          <span
                            key={topic}
                            className="px-2 py-0.5 rounded text-xs capitalize"
                            style={{ backgroundColor: '#0F172A', color: '#38BDF8' }}
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#1E293B' }}>
                      <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>Difficulty Level</p>
                      <p className="text-lg font-bold" style={{ color: '#FACC15' }}>
                        {'⭐'.repeat(selectedStudentData.settings.difficultyLevel)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="rounded-lg p-4" style={{ backgroundColor: '#1E293B' }}>
                  <div className="flex justify-between mb-3">
                    <span style={{ color: '#94A3B8' }}>Questions Attempted</span>
                    <span className="font-medium" style={{ color: '#F9FAFB' }}>{selectedStudentData.progress.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span style={{ color: '#94A3B8' }}>Correct Answers</span>
                    <span className="font-medium" style={{ color: '#22C55E' }}>{selectedStudentData.progress.correctAnswers}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span style={{ color: '#94A3B8' }}>Accuracy</span>
                    <span className="font-medium" style={{
                      color: selectedStudentData.progress.totalQuestions > 0
                        ? Math.round((selectedStudentData.progress.correctAnswers / selectedStudentData.progress.totalQuestions) * 100) >= 70 ? '#22C55E' : '#FACC15'
                        : '#94A3B8'
                    }}>
                      {selectedStudentData.progress.totalQuestions > 0
                        ? Math.round((selectedStudentData.progress.correctAnswers / selectedStudentData.progress.totalQuestions) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#94A3B8' }}>Current Streak</span>
                    <span className="font-medium" style={{ color: '#FB7185' }}>{selectedStudentData.progress.currentStreak}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && editingSettings && selectedStudentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            className="w-full max-w-md mx-4 rounded-xl p-6"
            style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: '#F9FAFB' }}>
              Settings for {selectedStudentData.name}
            </h2>

            {/* Topics */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                Allowed Topics
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['addition', 'subtraction', 'multiplication', 'division'].map(topic => (
                  <button
                    key={topic}
                    onClick={() => {
                      const topics = editingSettings.allowedTopics.includes(topic)
                        ? editingSettings.allowedTopics.filter(t => t !== topic)
                        : [...editingSettings.allowedTopics, topic]
                      setEditingSettings({ ...editingSettings, allowedTopics: topics.length > 0 ? topics : [topic] })
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                    style={{
                      backgroundColor: editingSettings.allowedTopics.includes(topic) ? '#38BDF8' : '#1E293B',
                      color: editingSettings.allowedTopics.includes(topic) ? '#020617' : '#94A3B8'
                    }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                Difficulty Level: {editingSettings.difficultyLevel}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={editingSettings.difficultyLevel}
                onChange={(e) => setEditingSettings({ ...editingSettings, difficultyLevel: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#64748B' }}>
                <span>Easy</span>
                <span>Hard</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 rounded-lg font-medium"
                style={{ backgroundColor: '#1E293B', color: '#94A3B8' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="flex-1 py-2 rounded-lg font-medium disabled:opacity-50"
                style={{ backgroundColor: '#22C55E', color: '#020617' }}
              >
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateClass && user && (
        <CreateClassModal
          teacherId={user.id}
          onClose={() => setShowCreateClass(false)}
          onClassCreated={() => {
            fetchClasses()
            fetchStudents()
          }}
        />
      )}

      {/* CSV Import Modal */}
      {showImportCSV && selectedClass && (
        <CSVImportModal
          classId={selectedClass.id}
          className={selectedClass.name}
          onClose={() => setShowImportCSV(false)}
          onImportComplete={() => {
            fetchClasses()
            fetchStudents()
          }}
        />
      )}

      {/* PLAI Footer */}
      <div
        className="py-10 border-t"
        style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <a
            href="https://www.peaklight.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform flex flex-col items-center gap-3"
          >
            <span className="text-lg font-semibold" style={{ color: '#BB8CFC' }}>
              peaklight.ai (PLAI)
            </span>
          </a>
          <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
            Your AI Supercharger
          </p>
        </div>
      </div>

      {/* Dev Mode Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="fixed bottom-4 right-4 px-3 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: '#1E293B', color: '#BB8CFC', border: '1px solid #BB8CFC' }}
        >
          V3 SUPABASE
        </div>
      )}
    </div>
  )
}
