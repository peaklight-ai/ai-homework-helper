'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/SupabaseProvider'

export default function TeacherSignupPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signUpError } = await signUp(email, password, name)

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Create teacher record in database via API (uses service role to bypass RLS)
      if (data.user) {
        try {
          const response = await fetch('/api/teachers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.user.id,
              email: email,
              name: name
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error('Error creating teacher record:', errorData)
            // Don't show error to user - auth succeeded, this is secondary
          }
        } catch (err) {
          console.error('Error calling teachers API:', err)
        }
      }

      setShowSuccess(true)

      // Redirect after showing success message
      setTimeout(() => {
        router.push('/teacher')
      }, 2000)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#020617' }}>
        <motion.div
          className="text-center p-8 rounded-2xl"
          style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            🎉
          </motion.div>
          <h1 className="text-2xl font-bold" style={{ color: '#22C55E' }}>
            Account Created!
          </h1>
          <p className="mt-2" style={{ color: '#94A3B8' }}>
            Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    )
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

      {/* Signup Form */}
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
                Create Teacher Account
              </h1>
              <p className="mt-2" style={{ color: '#94A3B8' }}>
                Start managing your students with Valid
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
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #1E293B',
                    color: '#F9FAFB'
                  }}
                  placeholder="Ms. Johnson"
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                style={{ backgroundColor: '#22C55E', color: '#020617' }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p style={{ color: '#94A3B8' }}>
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium hover:underline"
                  style={{ color: '#38BDF8' }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
