'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarPicker } from './Avatar'
import { createProfile, setActiveProfile } from '@/lib/db'

interface ProfileFormProps {
  onComplete: () => void
}

export function ProfileForm({ onComplete }: ProfileFormProps) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState<1 | 2 | 3 | 4 | 5 | 6>(3)
  const [avatarSeed, setAvatarSeed] = useState(`new-user-${Date.now()}`)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      const profileId = await createProfile(name.trim(), grade)
      await setActiveProfile(profileId)
      onComplete()
    } catch (error) {
      console.error('Failed to create profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Create Your Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Selection */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="relative group"
          >
            <Avatar seed={avatarSeed} size={96} className="ring-4 ring-purple-200" />
            <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">Change</span>
            </div>
          </button>
          <p className="text-sm text-gray-500 mt-2">Click to change avatar</p>
        </div>

        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gray-50 rounded-xl p-4"
          >
            <AvatarPicker
              currentSeed={avatarSeed}
              onSelect={(seed) => {
                setAvatarSeed(seed)
                setShowAvatarPicker(false)
              }}
            />
          </motion.div>
        )}

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            What's your name?
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            required
          />
        </div>

        {/* Grade Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What grade are you in?
          </label>
          <div className="grid grid-cols-6 gap-2">
            {([1, 2, 3, 4, 5, 6] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g)}
                className={`py-3 rounded-xl font-bold transition-all ${
                  grade === g
                    ? 'bg-purple-500 text-white scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!name.trim() || isSubmitting}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all"
        >
          {isSubmitting ? 'Creating...' : "Let's Start Learning!"}
        </button>
      </form>
    </motion.div>
  )
}
