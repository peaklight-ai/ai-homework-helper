'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import Link from 'next/link'
import { db, StudentProfile, StudentProgress, getClassSettings, updateClassSettings, createProfile } from '@/lib/db'
import { Avatar } from '@/components/Avatar'

// ============================================================================
// CHALKBOARD NIGHT PALETTE - Teacher Dashboard Theme
// ============================================================================
// Background:     #020617 (deep navy, almost black)
// Surface/cards:  #0F172A
// Primary:        #38BDF8 (sky blue, "chalk highlight")
// Primary hover:  #0EA5E9
// Secondary:      #22C55E (green for success/mastery)
// Accent 1:       #FACC15 (school-bus yellow - XP ring, active)
// Accent 2:       #FB7185 (soft red-pink - warnings)
// Text primary:   #F9FAFB
// Text secondary: #94A3B8
// Borders:        #1E293B
// ============================================================================

// Helper to format date for input
const formatDateForInput = (date: Date | null): string => {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// Helper to get day name
const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

// Helper to get days remaining
const getDaysRemaining = (deadline: Date | null): number | null => {
  if (!deadline) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(deadline)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Helper to format time for display
const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export default function TeacherDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [xpGoalInput, setXpGoalInput] = useState<number>(100)
  const [deadlineInput, setDeadlineInput] = useState<string>('')
  const [dayEndTimeInput, setDayEndTimeInput] = useState<string>('15:30')
  const [showGoalSaved, setShowGoalSaved] = useState(false)

  // Add Student form state
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentGrade, setNewStudentGrade] = useState<1 | 2 | 3 | 4 | 5 | 6>(3)

  // Get class settings
  const settings = useLiveQuery(() => db.settings.toCollection().first())

  // Sync input with settings
  useEffect(() => {
    if (settings?.xpGoal) {
      setXpGoalInput(settings.xpGoal)
    }
    if (settings?.xpDeadline) {
      setDeadlineInput(formatDateForInput(settings.xpDeadline))
    }
    if (settings?.dayEndTime) {
      setDayEndTimeInput(settings.dayEndTime)
    }
  }, [settings?.xpGoal, settings?.xpDeadline, settings?.dayEndTime])

  const handleSaveGoal = async () => {
    const deadline = deadlineInput ? new Date(deadlineInput) : null
    await updateClassSettings(xpGoalInput, deadline, dayEndTimeInput)
    setShowGoalSaved(true)
    setTimeout(() => setShowGoalSaved(false), 2000)
  }

  // Quick deadline shortcuts
  const setQuickDeadline = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    setDeadlineInput(formatDateForInput(date))
  }

  const daysRemaining = settings?.xpDeadline ? getDaysRemaining(settings.xpDeadline) : null

  // Add new student handler
  const handleAddStudent = async () => {
    if (!newStudentName.trim()) return
    await createProfile(newStudentName.trim(), newStudentGrade)
    setNewStudentName('')
    setShowAddStudent(false)
  }

  // Delete student handler
  const handleDeleteStudent = async (profileId: number) => {
    if (!confirm('Are you sure you want to delete this student? This will remove all their progress.')) return
    // Delete progress first, then profile
    await db.progress.where('profileId').equals(profileId).delete()
    await db.profiles.delete(profileId)
    if (selectedStudent === profileId) {
      setSelectedStudent(null)
    }
  }

  // Get all student profiles
  const profiles = useLiveQuery(() => db.profiles.toArray())

  // Get all progress records
  const allProgress = useLiveQuery(() => db.progress.toArray())

  // Get custom problems count
  const customProblemsCount = useLiveQuery(() => db.customProblems.count())

  // Get progress for selected student
  const selectedProgress = useLiveQuery(
    () => selectedStudent ? db.progress.where('profileId').equals(selectedStudent).first() : undefined,
    [selectedStudent]
  )

  const selectedProfile = profiles?.find(p => p.id === selectedStudent)

  // Calculate class stats
  const totalStudents = profiles?.length || 0
  const totalXP = allProgress?.reduce((sum, p) => sum + p.totalXp, 0) || 0
  const totalCorrect = allProgress?.reduce((sum, p) => sum + p.correctAnswers, 0) || 0
  const totalQuestions = allProgress?.reduce((sum, p) => sum + p.totalQuestions, 0) || 0
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  // Calculate students who reached goal
  const xpGoal = settings?.xpGoal || 100
  const studentsAtGoal = allProgress?.filter(p => p.totalXp >= xpGoal).length || 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#020617' }}>
      {/* Header - Gradient with chalk blue accent */}
      <div
        className="p-4 border-b"
        style={{
          background: 'linear-gradient(to right, #0F172A, #1E293B)',
          borderColor: '#1E293B'
        }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Valid Logo with PLAI Vapor Violet */}
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
              <p className="text-xs" style={{ color: '#94A3B8' }}>Student Progress Tracker</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/upload"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: '#1E293B',
                color: '#38BDF8',
                border: '1px solid #38BDF8'
              }}
            >
              Manage Problems
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: '#38BDF8',
                color: '#020617'
              }}
            >
              Back to App
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
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
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className="font-bold text-lg" style={{ color: '#F9FAFB' }}>Class XP Goal</h3>
              <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
                Set an XP target and deadline for your students
              </p>

              {/* Current Goal Display */}
              {settings?.xpGoal && settings?.xpDeadline && (
                <div
                  className="mt-4 p-4 rounded-lg border"
                  style={{
                    backgroundColor: daysRemaining !== null && daysRemaining < 0
                      ? 'rgba(251, 113, 133, 0.1)'
                      : daysRemaining !== null && daysRemaining <= 1
                        ? 'rgba(250, 204, 21, 0.1)'
                        : 'rgba(56, 189, 248, 0.1)',
                    borderColor: daysRemaining !== null && daysRemaining < 0
                      ? '#FB7185'
                      : daysRemaining !== null && daysRemaining <= 1
                        ? '#FACC15'
                        : '#38BDF8'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{
                        backgroundColor: '#FACC15',
                        color: '#020617'
                      }}
                    >
                      {settings.xpGoal}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#F9FAFB' }}>
                        {settings.xpGoal} XP by {getDayName(new Date(settings.xpDeadline))}
                        {settings.dayEndTime && (
                          <span style={{ color: '#94A3B8' }}> at {formatTimeForDisplay(settings.dayEndTime)}</span>
                        )}
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{
                          color: daysRemaining !== null && daysRemaining < 0
                            ? '#FB7185'
                            : daysRemaining !== null && daysRemaining <= 1
                              ? '#FACC15'
                              : '#38BDF8'
                        }}
                      >
                        {daysRemaining !== null && daysRemaining < 0
                          ? `${Math.abs(daysRemaining)} day(s) overdue`
                          : daysRemaining === 0
                            ? 'Due today!'
                            : daysRemaining === 1
                              ? 'Due tomorrow'
                              : `${daysRemaining} days remaining`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {/* XP Input */}
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#94A3B8' }}>XP Target</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={xpGoalInput}
                    onChange={(e) => setXpGoalInput(Math.max(50, parseInt(e.target.value) || 50))}
                    min={50}
                    step={50}
                    className="w-24 px-3 py-2 rounded-lg text-center font-bold text-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#1E293B',
                      borderColor: '#38BDF8',
                      color: '#FACC15',
                      border: '1px solid #38BDF8'
                    }}
                  />
                  <span style={{ color: '#94A3B8' }}>XP</span>
                </div>
              </div>

              {/* Deadline Input */}
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#94A3B8' }}>Due Date</label>
                <input
                  type="date"
                  value={deadlineInput}
                  onChange={(e) => setDeadlineInput(e.target.value)}
                  min={formatDateForInput(new Date())}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #1E293B',
                    color: '#F9FAFB',
                    colorScheme: 'dark'
                  }}
                />
              </div>

              {/* Day End Time Input */}
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#94A3B8' }}>School Day Ends At</label>
                <input
                  type="time"
                  value={dayEndTimeInput}
                  onChange={(e) => setDayEndTimeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #1E293B',
                    color: '#F9FAFB',
                    colorScheme: 'dark'
                  }}
                />
              </div>

              <button
                onClick={handleSaveGoal}
                className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: showGoalSaved ? '#22C55E' : '#38BDF8',
                  color: '#020617'
                }}
              >
                {showGoalSaved ? '✓ Saved!' : 'Save Goal'}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #1E293B' }}>
            <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>Quick presets:</p>
            <div className="flex flex-wrap gap-2">
              {[100, 150, 200, 300, 400, 500].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setXpGoalInput(preset)}
                  className="px-3 py-1 rounded-full text-sm transition-all hover:scale-105"
                  style={{
                    backgroundColor: xpGoalInput === preset ? '#FACC15' : '#1E293B',
                    color: xpGoalInput === preset ? '#020617' : '#94A3B8',
                    fontWeight: xpGoalInput === preset ? 600 : 400
                  }}
                >
                  {preset} XP
                </button>
              ))}
              <span style={{ color: '#1E293B' }} className="mx-1">|</span>
              <button
                onClick={() => setQuickDeadline(1)}
                className="px-3 py-1 rounded-full text-sm transition-all hover:scale-105"
                style={{ backgroundColor: '#1E293B', color: '#38BDF8' }}
              >
                Tomorrow
              </button>
              <button
                onClick={() => setQuickDeadline(5 - new Date().getDay())}
                className="px-3 py-1 rounded-full text-sm transition-all hover:scale-105"
                style={{ backgroundColor: '#1E293B', color: '#38BDF8' }}
              >
                Friday
              </button>
              <button
                onClick={() => setQuickDeadline(7)}
                className="px-3 py-1 rounded-full text-sm transition-all hover:scale-105"
                style={{ backgroundColor: '#1E293B', color: '#38BDF8' }}
              >
                Next Week
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Student List */}
          <div
            className="md:col-span-1 rounded-xl p-4 border"
            style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: '#F9FAFB' }}>Students</h2>
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
                  placeholder="Student name"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg mb-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#0F172A',
                    color: '#F9FAFB',
                    border: '1px solid #1E293B'
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                />
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs" style={{ color: '#94A3B8' }}>Grade:</label>
                  <select
                    value={newStudentGrade}
                    onChange={(e) => setNewStudentGrade(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6)}
                    className="flex-1 px-2 py-1 rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: '#0F172A',
                      color: '#F9FAFB',
                      border: '1px solid #1E293B'
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddStudent}
                  disabled={!newStudentName.trim()}
                  className="w-full py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#22C55E', color: '#020617' }}
                >
                  Add Student
                </button>
              </motion.div>
            )}

            {!profiles || profiles.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#94A3B8' }}>
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: '#1E293B' }}
                >
                  <svg className="w-8 h-8" style={{ color: '#38BDF8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p>No students yet</p>
                <p className="text-sm mt-1">Click + to add your first student</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {profiles.map((profile) => {
                  const progress = allProgress?.find(p => p.profileId === profile.id)
                  const goalReached = (progress?.totalXp || 0) >= xpGoal
                  const progressPercent = Math.min(100, ((progress?.totalXp || 0) / xpGoal) * 100)
                  return (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedStudent(profile.id!)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left hover:scale-[1.02]"
                      style={{
                        backgroundColor: selectedStudent === profile.id
                          ? 'rgba(56, 189, 248, 0.15)'
                          : '#1E293B',
                        border: selectedStudent === profile.id
                          ? '2px solid #38BDF8'
                          : goalReached
                            ? '2px solid #22C55E'
                            : '2px solid transparent'
                      }}
                    >
                      <div className="relative">
                        <Avatar seed={profile.avatarSeed} size={40} />
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
                        <p className="font-medium truncate" style={{ color: '#F9FAFB' }}>{profile.name}</p>
                        <div
                          className="w-full rounded-full h-1.5 mt-1"
                          style={{ backgroundColor: '#020617' }}
                        >
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
                        <p
                          className="text-sm font-bold"
                          style={{ color: goalReached ? '#22C55E' : '#FACC15' }}
                        >
                          {progress?.totalXp || 0}/{xpGoal}
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
            {!selectedStudent || !selectedProfile ? (
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
                  className="flex items-center gap-4 mb-6 pb-6"
                  style={{ borderBottom: '1px solid #1E293B' }}
                >
                  <div className="relative">
                    <Avatar seed={selectedProfile.avatarSeed} size={64} />
                    {(selectedProgress?.totalXp || 0) >= xpGoal && (
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-sm"
                        style={{ backgroundColor: '#22C55E', color: '#020617' }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>{selectedProfile.name}</h2>
                    <p style={{ color: '#94A3B8' }}>Grade {selectedProfile.grade}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)' }}
                  >
                    <p className="text-2xl font-bold" style={{ color: '#FACC15' }}>{selectedProgress?.totalXp || 0}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Total XP</p>
                  </div>
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)' }}
                  >
                    <p className="text-2xl font-bold" style={{ color: '#38BDF8' }}>{selectedProgress?.level || 1}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Level</p>
                  </div>
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                  >
                    <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>{selectedProgress?.correctAnswers || 0}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Correct</p>
                  </div>
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.3)' }}
                  >
                    <p className="text-2xl font-bold" style={{ color: '#FB7185' }}>{selectedProgress?.longestStreak || 0}</p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Best Streak</p>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="space-y-4">
                  <h3 className="font-bold" style={{ color: '#F9FAFB' }}>Progress Details</h3>

                  <div
                    className="rounded-lg p-4"
                    style={{ backgroundColor: '#1E293B' }}
                  >
                    <div className="flex justify-between mb-3">
                      <span style={{ color: '#94A3B8' }}>Questions Attempted</span>
                      <span className="font-medium" style={{ color: '#F9FAFB' }}>{selectedProgress?.totalQuestions || 0}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                      <span style={{ color: '#94A3B8' }}>Correct Answers</span>
                      <span className="font-medium" style={{ color: '#22C55E' }}>{selectedProgress?.correctAnswers || 0}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                      <span style={{ color: '#94A3B8' }}>Accuracy</span>
                      <span
                        className="font-medium"
                        style={{
                          color: (selectedProgress?.totalQuestions || 0) > 0
                            ? Math.round((selectedProgress?.correctAnswers || 0) / (selectedProgress?.totalQuestions || 1) * 100) >= 70
                              ? '#22C55E'
                              : '#FACC15'
                            : '#94A3B8'
                        }}
                      >
                        {selectedProgress?.totalQuestions
                          ? Math.round((selectedProgress.correctAnswers / selectedProgress.totalQuestions) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#94A3B8' }}>Current Streak</span>
                      <span className="font-medium" style={{ color: '#FB7185' }}>{selectedProgress?.currentStreak || 0}</span>
                    </div>
                  </div>

                  {/* XP Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: '#94A3B8' }}>Goal Progress</span>
                      <span style={{ color: '#FACC15' }}>
                        {selectedProgress?.totalXp || 0} / {xpGoal} XP
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full h-3"
                      style={{ backgroundColor: '#020617' }}
                    >
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((selectedProgress?.totalXp || 0) / xpGoal) * 100)}%`,
                          background: (selectedProgress?.totalXp || 0) >= xpGoal
                            ? '#22C55E'
                            : 'linear-gradient(to right, #FACC15, #38BDF8)'
                        }}
                      />
                    </div>
                    {(selectedProgress?.totalXp || 0) >= xpGoal && (
                      <p className="text-center text-sm mt-2" style={{ color: '#22C55E' }}>
                        ✓ Goal Achieved!
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* PLAI Signature - Teacher Only */}
      <div
        className="py-10 border-t"
        style={{
          backgroundColor: '#0F172A',
          borderColor: '#1E293B',
          fontFamily: 'var(--font-montserrat), Montserrat, Arial, sans-serif'
        }}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <a
            href="https://www.peaklight.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform flex flex-col items-center gap-3"
          >
            <img
              src="/plai-logo.svg"
              alt="PLAI - peaklight.ai"
              style={{ height: '56px' }}
            />
            <span
              className="text-lg font-semibold"
              style={{ color: '#BB8CFC' }}
            >
              peaklight.ai (PLAI)
            </span>
          </a>
          <p
            className="text-sm font-medium"
            style={{ color: '#94A3B8' }}
          >
            Your AI Supercharger
          </p>
        </div>
      </div>

      {/* Dev Mode Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="fixed bottom-4 right-4 px-3 py-1 rounded text-xs font-medium"
          style={{
            backgroundColor: '#1E293B',
            color: '#BB8CFC',
            border: '1px solid #BB8CFC'
          }}
        >
          VALID DEV MODE
        </div>
      )}
    </div>
  )
}
