'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/SupabaseProvider'

export default function TeacherLoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        router.push('/teacher')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#020617' }}>
      {/* Header */}
      <nav className="p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#BB8CFC' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="#1A1A1A" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold" style={{ color: '#BB8CFC' }}>Valid</span>
          </Link>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="rounded-2xl p-8 border"
            style={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>
                Teacher Login
              </h1>
              <p className="mt-2" style={{ color: '#94A3B8' }}>
                Sign in to manage your students
              </p>
            </div>

            {error && (
              <motion.div
                className="mb-6 p-4 rounded-lg text-center"
                style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid #FB7185' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p style={{ color: '#FB7185' }}>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #1E293B',
                    color: '#F9FAFB'
                  }}
                  placeholder="teacher@school.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #1E293B',
                    color: '#F9FAFB'
                  }}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                style={{ backgroundColor: '#38BDF8', color: '#020617' }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p style={{ color: '#94A3B8' }}>
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="font-medium hover:underline"
                  style={{ color: '#38BDF8' }}
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6" style={{ borderTop: '1px solid #1E293B' }}>
              <p className="text-center text-sm" style={{ color: '#64748B' }}>
                Are you a student?{' '}
                <Link
                  href="/"
                  className="font-medium hover:underline"
                  style={{ color: '#BB8CFC' }}
                >
                  Go to Student Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
