'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser, useAuth } from '@/components/SupabaseProvider'

// =============================================================================
// PHASE 5: ADMIN DASHBOARD - SCREENSHOT-WORTHY ANALYTICS
// =============================================================================

interface SchoolStats {
  totalTeachers: number
  totalStudents: number
  totalClasses: number
  totalXpEarned: number
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  activeStudentsToday: number
  activeStudentsWeek: number
  topTopics: { topic: string; count: number }[]
  accuracy: number
  teacherBreakdown: TeacherStats[]
  dailyActivity: DailyActivity[]
}

interface TeacherStats {
  id: string
  name: string
  email: string
  studentCount: number
  totalXp: number
  avgAccuracy: number
}

interface DailyActivity {
  date: string
  questionsAnswered: number
  activeStudents: number
}

// Mini bar chart component
function MiniBarChart({ data, maxValue, color }: { data: number[]; maxValue: number; color: string }) {
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 rounded-t transition-all hover:opacity-80"
          style={{
            height: `${(value / maxValue) * 100}%`,
            backgroundColor: color,
            minHeight: value > 0 ? '4px' : '0'
          }}
        />
      ))}
    </div>
  )
}

// Donut chart component
function DonutChart({ value, total, color, label }: { value: number; total: number; color: string; label: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle cx="48" cy="48" r="40" fill="none" stroke="#1E293B" strokeWidth="8" />
        <motion.circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{Math.round(percentage)}%</span>
        <span className="text-xs" style={{ color: '#64748B' }}>{label}</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useUser()
  const { signOut } = useAuth()
  const [stats, setStats] = useState<SchoolStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [schoolName, setSchoolName] = useState('Your School')

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'x-admin-email': user?.email || '' }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        // Demo mode with sample data
        setStats(getDemoStats())
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
      setStats(getDemoStats())
    } finally {
      setIsLoading(false)
    }
  }

  // Demo stats for when school not set up
  const getDemoStats = (): SchoolStats => ({
    totalTeachers: 8,
    totalStudents: 156,
    totalClasses: 12,
    totalXpEarned: 45230,
    totalQuestionsAnswered: 3420,
    totalCorrectAnswers: 2736,
    activeStudentsToday: 42,
    activeStudentsWeek: 128,
    accuracy: 80,
    topTopics: [
      { topic: 'addition', count: 1026 },
      { topic: 'subtraction', count: 855 },
      { topic: 'multiplication', count: 855 },
      { topic: 'division', count: 684 }
    ],
    teacherBreakdown: [
      { id: '1', name: 'Ms. Johnson', email: 'johnson@school.com', studentCount: 24, totalXp: 8500, avgAccuracy: 85 },
      { id: '2', name: 'Mr. Smith', email: 'smith@school.com', studentCount: 22, totalXp: 7200, avgAccuracy: 78 },
      { id: '3', name: 'Ms. Davis', email: 'davis@school.com', studentCount: 20, totalXp: 6800, avgAccuracy: 82 },
      { id: '4', name: 'Mr. Wilson', email: 'wilson@school.com', studentCount: 18, totalXp: 5900, avgAccuracy: 75 }
    ],
    dailyActivity: [
      { date: '2024-01-01', questionsAnswered: 420, activeStudents: 35 },
      { date: '2024-01-02', questionsAnswered: 380, activeStudents: 32 },
      { date: '2024-01-03', questionsAnswered: 510, activeStudents: 41 },
      { date: '2024-01-04', questionsAnswered: 490, activeStudents: 38 },
      { date: '2024-01-05', questionsAnswered: 560, activeStudents: 45 },
      { date: '2024-01-06', questionsAnswered: 320, activeStudents: 28 },
      { date: '2024-01-07', questionsAnswered: 480, activeStudents: 42 }
    ]
  })

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const handleExportPDF = async () => {
    // Dynamic import for PDF generation
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const element = document.getElementById('dashboard-content')
    if (!element) return

    const canvas = await html2canvas(element, {
      backgroundColor: '#020617',
      scale: 2
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('l', 'mm', 'a4')
    const imgWidth = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`${schoolName.replace(/\s+/g, '-')}-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#020617' }}>
        <div className="text-center">
          <motion.div
            className="w-16 h-16 rounded-full mx-auto mb-4"
            style={{ backgroundColor: '#BB8CFC' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="text-lg" style={{ color: '#94A3B8' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#020617' }}>
        <div className="text-center">
          <p className="text-xl" style={{ color: '#FB7185' }}>Failed to load dashboard</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#38BDF8', color: '#020617' }}
          >
            Retry
          </button>
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
          background: 'linear-gradient(to right, #1A1A1A, #0F172A)',
          borderColor: '#1E293B'
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #BB8CFC 0%, #C3FE4C 100%)' }}
            >
              <svg className="w-7 h-7" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>
                <span style={{ color: '#BB8CFC' }}>Valid</span> Admin Dashboard
              </h1>
              <p className="text-sm" style={{ color: '#94A3B8' }}>
                {schoolName} • Real-time Analytics
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center gap-2"
              style={{ backgroundColor: '#C3FE4C', color: '#1A1A1A' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
            <Link
              href="/teacher"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{ backgroundColor: '#38BDF8', color: '#020617' }}
            >
              Teacher View
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

      {/* Dashboard Content */}
      <div id="dashboard-content" className="max-w-7xl mx-auto p-6">
        {/* Hero Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0.05) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute top-2 right-2 text-3xl opacity-20">👨‍🏫</div>
            <p className="text-sm font-medium" style={{ color: '#38BDF8' }}>Teachers</p>
            <p className="text-4xl font-bold mt-1" style={{ color: '#F9FAFB' }}>{stats.totalTeachers}</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>Active educators</p>
          </motion.div>

          <motion.div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(195, 254, 76, 0.2) 0%, rgba(195, 254, 76, 0.05) 100%)',
              border: '1px solid rgba(195, 254, 76, 0.3)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute top-2 right-2 text-3xl opacity-20">👨‍🎓</div>
            <p className="text-sm font-medium" style={{ color: '#C3FE4C' }}>Students</p>
            <p className="text-4xl font-bold mt-1" style={{ color: '#F9FAFB' }}>{stats.totalStudents}</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>{stats.activeStudentsWeek} active this week</p>
          </motion.div>

          <motion.div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(250, 204, 21, 0.05) 100%)',
              border: '1px solid rgba(250, 204, 21, 0.3)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute top-2 right-2 text-3xl opacity-20">⭐</div>
            <p className="text-sm font-medium" style={{ color: '#FACC15' }}>Total XP</p>
            <p className="text-4xl font-bold mt-1" style={{ color: '#F9FAFB' }}>
              {stats.totalXpEarned.toLocaleString()}
            </p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>School-wide achievement</p>
          </motion.div>

          <motion.div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute top-2 right-2 text-3xl opacity-20">🎯</div>
            <p className="text-sm font-medium" style={{ color: '#22C55E' }}>Accuracy</p>
            <p className="text-4xl font-bold mt-1" style={{ color: '#F9FAFB' }}>{stats.accuracy}%</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>{stats.totalCorrectAnswers} correct answers</p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Weekly Activity */}
          <motion.div
            className="md:col-span-2 rounded-2xl p-6"
            style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg" style={{ color: '#F9FAFB' }}>Weekly Activity</h3>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#1E293B', color: '#94A3B8' }}>
                Last 7 days
              </span>
            </div>
            <div className="h-32 flex items-end gap-2">
              {stats.dailyActivity.map((day, i) => {
                const maxStudents = Math.max(...stats.dailyActivity.map(d => d.activeStudents))
                const height = maxStudents > 0 ? (day.activeStudents / maxStudents) * 100 : 0
                const dayName = new Date(day.date).toLocaleDateString('en', { weekday: 'short' })
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      className="w-full rounded-t-lg transition-all hover:opacity-80"
                      style={{ backgroundColor: '#BB8CFC' }}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    />
                    <span className="text-xs" style={{ color: '#64748B' }}>{dayName}</span>
                    <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{day.activeStudents}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Topic Distribution */}
          <motion.div
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-bold text-lg mb-4" style={{ color: '#F9FAFB' }}>Topics Practiced</h3>
            <div className="space-y-3">
              {stats.topTopics.map((topic, i) => {
                const maxCount = Math.max(...stats.topTopics.map(t => t.count))
                const colors = ['#38BDF8', '#C3FE4C', '#BB8CFC', '#FB7185']
                return (
                  <div key={topic.topic}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize" style={{ color: '#94A3B8' }}>{topic.topic}</span>
                      <span style={{ color: colors[i] }}>{topic.count}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: '#1E293B' }}>
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: colors[i] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(topic.count / maxCount) * 100}%` }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Teacher Leaderboard */}
        <motion.div
          className="rounded-2xl p-6"
          style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg" style={{ color: '#F9FAFB' }}>Teacher Leaderboard</h3>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#BB8CFC', color: '#1A1A1A' }}>
              Top Performers
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1E293B' }}>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: '#64748B' }}>Rank</th>
                  <th className="text-left py-3 px-2 text-sm font-medium" style={{ color: '#64748B' }}>Teacher</th>
                  <th className="text-center py-3 px-2 text-sm font-medium" style={{ color: '#64748B' }}>Students</th>
                  <th className="text-center py-3 px-2 text-sm font-medium" style={{ color: '#64748B' }}>Total XP</th>
                  <th className="text-center py-3 px-2 text-sm font-medium" style={{ color: '#64748B' }}>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {stats.teacherBreakdown.map((teacher, i) => (
                  <motion.tr
                    key={teacher.id}
                    className="transition-all hover:bg-slate-800/50"
                    style={{ borderBottom: '1px solid #1E293B' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    <td className="py-3 px-2">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                        style={{
                          backgroundColor: i === 0 ? '#FACC15' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#1E293B',
                          color: i < 3 ? '#1A1A1A' : '#94A3B8'
                        }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <p className="font-medium" style={{ color: '#F9FAFB' }}>{teacher.name}</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>{teacher.email}</p>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-medium" style={{ color: '#38BDF8' }}>{teacher.studentCount}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-bold" style={{ color: '#FACC15' }}>{teacher.totalXp.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className="px-2 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: teacher.avgAccuracy >= 80 ? 'rgba(34, 197, 94, 0.2)' : teacher.avgAccuracy >= 60 ? 'rgba(250, 204, 21, 0.2)' : 'rgba(251, 113, 133, 0.2)',
                          color: teacher.avgAccuracy >= 80 ? '#22C55E' : teacher.avgAccuracy >= 60 ? '#FACC15' : '#FB7185'
                        }}
                      >
                        {teacher.avgAccuracy}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#1E293B' }}>
            <p className="text-2xl font-bold" style={{ color: '#38BDF8' }}>{stats.totalClasses}</p>
            <p className="text-xs" style={{ color: '#64748B' }}>Active Classes</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#1E293B' }}>
            <p className="text-2xl font-bold" style={{ color: '#C3FE4C' }}>{stats.activeStudentsToday}</p>
            <p className="text-xs" style={{ color: '#64748B' }}>Active Today</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#1E293B' }}>
            <p className="text-2xl font-bold" style={{ color: '#BB8CFC' }}>{stats.totalQuestionsAnswered.toLocaleString()}</p>
            <p className="text-xs" style={{ color: '#64748B' }}>Questions Answered</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#1E293B' }}>
            <p className="text-2xl font-bold" style={{ color: '#FACC15' }}>
              {stats.totalStudents > 0 ? Math.round(stats.totalXpEarned / stats.totalStudents) : 0}
            </p>
            <p className="text-xs" style={{ color: '#64748B' }}>Avg XP per Student</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="py-8 border-t mt-8"
        style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-lg font-semibold" style={{ color: '#BB8CFC' }}>
            peaklight.ai (PLAI)
          </span>
          <p className="text-sm" style={{ color: '#64748B' }}>
            Empowering Education with AI
          </p>
        </div>
      </div>
    </div>
  )
}
