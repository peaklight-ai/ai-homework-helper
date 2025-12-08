'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { Avatar } from './Avatar'
import { db, StudentProfile, getActiveProfile, setActiveProfile, exportAllData, importAllData } from '@/lib/db'

interface ProfileCardProps {
  onProfileChange?: () => void
}

export function ProfileCard({ onProfileChange }: ProfileCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null)
  const [showExportImport, setShowExportImport] = useState(false)

  // Get all profiles for switcher
  const profiles = useLiveQuery(() => db.profiles.toArray())

  // Get class settings for XP goal (reactive)
  const settings = useLiveQuery(() => db.settings.toCollection().first())
  const xpGoal = settings?.xpGoal || 100

  // Get active profile reactively
  const activeProfile = useLiveQuery(
    () => activeProfileId ? db.profiles.get(activeProfileId) : undefined,
    [activeProfileId]
  )

  // Get progress reactively - this will auto-update when XP changes!
  const progress = useLiveQuery(
    () => activeProfileId ? db.progress.where('profileId').equals(activeProfileId).first() : undefined,
    [activeProfileId]
  )

  // Load active profile ID on mount
  useEffect(() => {
    loadActiveProfileId()
  }, [])

  const loadActiveProfileId = async () => {
    const profile = await getActiveProfile()
    if (profile) {
      setActiveProfileId(profile.id!)
    }
  }

  const handleSwitchProfile = async (profileId: number) => {
    await setActiveProfile(profileId)
    setActiveProfileId(profileId)
    setIsOpen(false)
    onProfileChange?.()
  }

  const handleExport = async () => {
    const data = await exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `homework-helper-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const jsonString = event.target?.result as string
        await importAllData(jsonString)
        await loadActiveProfileId()
        alert('Data imported successfully!')
      } catch (error) {
        console.error('Import failed:', error)
        alert('Failed to import data. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  if (!activeProfile) return null

  return (
    <div className="relative">
      {/* Profile Button with XP Progress Ring */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white rounded-full pl-1 pr-4 py-1 shadow-md hover:shadow-lg transition-shadow"
      >
        <div className="relative" style={{ width: 44, height: 44 }}>
          <CircularProgressbar
            value={Math.min(100, ((progress?.totalXp || 0) / xpGoal) * 100)}
            strokeWidth={8}
            styles={buildStyles({
              pathColor: (progress?.totalXp || 0) >= xpGoal ? '#22c55e' : '#8b5cf6',
              trailColor: '#e5e7eb',
            })}
          />
          <div className="absolute inset-1">
            <Avatar seed={activeProfile.avatarSeed} size={36} />
          </div>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-800">{activeProfile.name}</p>
          <p className="text-xs text-gray-500">Level {progress?.level || 1}</p>
        </div>
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl p-4 z-50"
          >
            {/* Current Profile Stats */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <Avatar seed={activeProfile.avatarSeed} size={56} />
              <div>
                <p className="font-bold text-gray-800">{activeProfile.name}</p>
                <p className="text-sm text-gray-500">Grade {activeProfile.grade}</p>
              </div>
            </div>

            {/* Stats */}
            {progress && (
              <div className="py-4 border-b border-gray-100">
                {/* XP Goal Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {settings?.xpDeadline
                        ? `Goal by ${new Date(settings.xpDeadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
                        : 'XP Goal'
                      }
                    </span>
                    <span className={progress.totalXp >= xpGoal ? 'text-green-600 font-bold' : 'text-gray-600'}>
                      {progress.totalXp} / {xpGoal} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${progress.totalXp >= xpGoal ? 'bg-green-500' : 'bg-purple-500'}`}
                      style={{ width: `${Math.min(100, (progress.totalXp / xpGoal) * 100)}%` }}
                    />
                  </div>
                  {progress.totalXp >= xpGoal && (
                    <p className="text-xs text-green-600 mt-1 text-center">Goal reached!</p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{progress.totalXp}</p>
                    <p className="text-xs text-gray-500">Total XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{progress.correctAnswers}</p>
                    <p className="text-xs text-gray-500">Correct</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-600">{progress.longestStreak}</p>
                    <p className="text-xs text-gray-500">Best Streak</p>
                  </div>
                </div>
              </div>
            )}

            {/* Switch Profile */}
            {profiles && profiles.length > 1 && (
              <div className="py-4 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Switch Profile</p>
                <div className="flex gap-2 flex-wrap">
                  {profiles
                    .filter((p) => p.id !== activeProfile.id)
                    .map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => handleSwitchProfile(profile.id!)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Avatar seed={profile.avatarSeed} size={24} />
                        <span className="text-sm text-gray-700">{profile.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Export/Import */}
            <div className="pt-4">
              <button
                onClick={() => setShowExportImport(!showExportImport)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Backup & Restore
              </button>

              {showExportImport && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleExport}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100"
                  >
                    Export
                  </button>
                  <label className="flex-1 px-3 py-2 bg-green-50 text-green-600 text-sm rounded-lg hover:bg-green-100 text-center cursor-pointer">
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Add New Profile */}
            <button
              onClick={() => {
                localStorage.removeItem('activeProfileId')
                window.location.reload()
              }}
              className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl hover:border-purple-400 hover:text-purple-500 transition-colors text-sm"
            >
              + Add New Profile
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
